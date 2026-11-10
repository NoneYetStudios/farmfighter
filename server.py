"""
FARM FIGHTER IV — Zero-Dependency Local Development Server
Runs both static game assets and the SQLite leaderboard API locally using built-in Python.

Usage:
    python server.py [port]
"""

import sys
import os
import json
import sqlite3
import time
import datetime
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'leaderboard.sqlite')

FIGHTER_NAMES = {
    'cluck_norris': 'Cluck Norris',
    'moo_tai': 'Moo Tai',
    'ham_solo': 'Ham Solo',
    'billy_the_kid': 'Billy the Kid',
    'woolverine': 'Woolverine',
    'quackie_chan': 'Quackie Chan',
    'marey_poppins': 'Marey Poppins',
    'dalai_llama': 'Dalai Llama'
}

def format_time_ms(ms):
    if ms is None or not isinstance(ms, (int, float)) or ms <= 0:
        return None
    total_centis = round(ms / 10)
    mins = total_centis // 6000
    secs = (total_centis % 6000) // 100
    centis = total_centis % 100
    return f"{mins:02d}:{secs:02d}.{centis:02d}"

class FarmFighterHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.strip('/')

        if path.startswith('api') or 'action=leaderboard' in parsed.query or 'action=health' in parsed.query:
            self.handle_api_get(parsed)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.strip('/')

        if path.startswith('api') or 'action=submit' in parsed.query:
            self.handle_api_post(parsed)
            return

        self.send_error(404, "Endpoint not found")

    def handle_api_get(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        category = qs.get('category', ['arcade_score'])[0].lower()
        fighter = qs.get('fighter', ['all'])[0].lower()
        limit = min(100, max(1, int(qs.get('limit', [50])[0])))

        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            where = []
            params = []

            if category in ('survival_streak', 'survival'):
                real_cat = 'survival_streak'
                where.append("mode = 'survival'")
                order_sql = "ORDER BY longest_streak DESC, knockouts DESC, score DESC, created_epoch ASC"
            elif category in ('arcade_time', 'fastest', 'time'):
                real_cat = 'arcade_time'
                where.append("mode = 'arcade'")
                where.append("arcade_cleared = 1")
                where.append("completion_time_ms IS NOT NULL AND completion_time_ms > 0")
                order_sql = "ORDER BY completion_time_ms ASC, score DESC, created_epoch ASC"
            else:
                real_cat = 'arcade_score'
                where.append("mode = 'arcade'")
                order_sql = "ORDER BY score DESC, wins DESC, COALESCE(completion_time_ms, 999999999) ASC, created_epoch ASC"

            if fighter != 'all' and fighter in FIGHTER_NAMES:
                where.append("fighter_id = ?")
                params.append(fighter)

            where_sql = ("WHERE " + " AND ".join(where)) if where else ""
            cursor.execute(f"SELECT COUNT(*) FROM leaderboard {where_sql}", params)
            total = cursor.fetchone()[0]

            cursor.execute(f"SELECT * FROM leaderboard {where_sql} {order_sql} LIMIT ?", params + [limit])
            rows = cursor.fetchall()

            entries = []
            for idx, r in enumerate(rows):
                t_ms = r['completion_time_ms']
                entries.append({
                    'rank': idx + 1,
                    'id': r['id'],
                    'playerName': r['player_name'],
                    'fighterId': r['fighter_id'],
                    'fighterName': r['fighter_name'],
                    'mode': r['mode'],
                    'score': r['score'],
                    'wins': r['wins'],
                    'knockouts': r['knockouts'],
                    'longestStreak': r['longest_streak'],
                    'arcadeCleared': bool(r['arcade_cleared']),
                    'completionTimeMs': t_ms,
                    'completionTimeFormatted': format_time_ms(t_ms),
                    'redButtonPresses': r['red_button_presses'],
                    'favoriteArena': r['favorite_arena'],
                    'createdAt': r['created_at'],
                    'createdEpoch': r['created_epoch']
                })

            conn.close()
            self.send_json({
                'ok': True,
                'success': True,
                'category': real_cat,
                'fighter': fighter,
                'total': total,
                'count': len(entries),
                'entries': entries
            })
        except Exception as e:
            self.send_json({'ok': False, 'success': False, 'error': str(e)}, 500)

    def handle_api_post(self, parsed):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len)

        try:
            body = json.loads(post_body.decode('utf-8'))
        except Exception:
            self.send_json({'ok': False, 'success': False, 'error': 'Invalid JSON'}, 400)
            return

        raw_name = str(body.get('playerName') or body.get('nickname') or '').strip()
        clean_name = "".join(ch for ch in raw_name if ch.isalnum() or ch in " -_.!?")[:20] or "BarnyardBrawler"

        fighter_id = str(body.get('fighterId') or 'cluck_norris').lower()
        fighter_name = FIGHTER_NAMES.get(fighter_id, 'Cluck Norris')
        mode = str(body.get('mode') or 'arcade').lower()
        if mode not in ('arcade', 'survival'):
            mode = 'arcade'

        score = max(0, min(9999999, int(body.get('score') or 0)))
        wins = max(0, min(9999, int(body.get('wins') or 0)))
        knockouts = max(0, min(9999, int(body.get('knockouts') or (wins * 2))))
        longest_streak = max(0, min(9999, int(body.get('longestStreak') or wins)))
        arcade_cleared = 1 if body.get('arcadeCleared') else 0
        red_buttons = max(0, min(999, int(body.get('redButtonPresses') or 0)))
        favorite_arena = str(body.get('favoriteArena') or 'The Barn')

        completion_time_ms = None
        if mode == 'arcade' and arcade_cleared and body.get('completionTimeMs'):
            completion_time_ms = int(body.get('completionTimeMs'))

        now_epoch = int(time.time() * 1000)
        iso_date = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO leaderboard (
                    player_name, fighter_id, fighter_name, mode, score,
                    wins, knockouts, longest_streak, arcade_cleared,
                    completion_time_ms, red_button_presses, favorite_arena,
                    created_at, created_epoch
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                clean_name, fighter_id, fighter_name, mode, score,
                wins, knockouts, longest_streak, arcade_cleared,
                completion_time_ms, red_buttons, favorite_arena,
                iso_date, now_epoch
            ))
            conn.commit()
            entry_id = cursor.lastrowid

            ranks = {}
            if mode == 'arcade':
                cursor.execute("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'arcade' AND score > ?", (score,))
                ranks['arcade_score'] = cursor.fetchone()[0]
                if arcade_cleared and completion_time_ms:
                    cursor.execute("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'arcade' AND arcade_cleared = 1 AND completion_time_ms < ?", (completion_time_ms,))
                    ranks['arcade_time'] = cursor.fetchone()[0]
            else:
                cursor.execute("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'survival' AND (longest_streak > ? OR (longest_streak = ? AND score > ?))", (longest_streak, longest_streak, score))
                ranks['survival_streak'] = cursor.fetchone()[0]

            conn.close()

            self.send_json({
                'ok': True,
                'success': True,
                'entryId': entry_id,
                'ranks': ranks,
                'entry': {
                    'id': entry_id,
                    'playerName': clean_name,
                    'fighterId': fighter_id,
                    'fighterName': fighter_name,
                    'mode': mode,
                    'score': score,
                    'wins': wins,
                    'knockouts': knockouts,
                    'longestStreak': longest_streak,
                    'arcadeCleared': bool(arcade_cleared),
                    'completionTimeMs': completion_time_ms,
                    'completionTimeFormatted': format_time_ms(completion_time_ms),
                    'redButtonPresses': red_buttons,
                    'favoriteArena': favorite_arena,
                    'createdAt': iso_date,
                    'createdEpoch': now_epoch
                }
            }, 201)
        except Exception as e:
            self.send_json({'ok': False, 'success': False, 'error': str(e)}, 500)

    def send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == '__main__':
    print(f"=================================================")
    print(f"  FARM FIGHTER IV — Local Arcade Server")
    print(f"  Serving Game & SQLite Leaderboard on port {PORT}")
    print(f"  Open: http://localhost:{PORT}")
    print(f"=================================================")
    server = HTTPServer(('127.0.0.1', PORT), FarmFighterHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
