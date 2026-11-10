<?php
/**
 * FARM FIGHTER IV — Native PHP + SQLite Global Leaderboard API (STF Arcade)
 * Zero-config deployment on standard shared hosting (Apache / LiteSpeed / cPanel).
 * Supports:
 *   - Arcade Mode: Highest Score (category = arcade_score)
 *   - Survival Mode: Longest Streak (category = survival_streak)
 *   - Fastest Arcade Completion: Best Time (category = arcade_time)
 */

error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        'ok' => false,
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function formatTimeMs($ms) {
    if ($ms === null || !is_numeric($ms) || (int)$ms <= 0) {
        return null;
    }
    $totalCentis = (int)round(((int)$ms) / 10);
    $mins = intdiv($totalCentis, 6000);
    $secs = intdiv($totalCentis % 6000, 100);
    $centis = $totalCentis % 100;
    return sprintf('%02d:%02d.%02d', $mins, $secs, $centis);
}

$FIGHTER_NAMES = [
    'cluck_norris'  => 'Cluck Norris',
    'moo_tai'       => 'Moo Tai',
    'ham_solo'      => 'Ham Solo',
    'billy_the_kid' => 'Billy the Kid',
    'woolverine'    => 'Woolverine',
    'quackie_chan'  => 'Quackie Chan',
    'marey_poppins' => 'Marey Poppins',
    'dalai_llama'   => 'Dalai Llama'
];

$ARENA_NAMES = [
    'the_barn'       => 'The Barn',
    'county_fair'    => 'County Fair',
    'tractor_supply' => 'Tractor Supply Parking Lot',
    'corn_maze'      => 'Corn Maze',
    'aquarium'       => 'Two-Story Indoor Aquarium'
];

// -----------------------------------------------------------------------------
// Database Connection & Schema Initialization
// -----------------------------------------------------------------------------
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . '/.htaccess', "Require all denied\n");
}

$dbPath = is_writable($dataDir) ? ($dataDir . '/leaderboard.sqlite') : (__DIR__ . '/leaderboard.sqlite');

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec('PRAGMA busy_timeout = 5000;');
    @$pdo->exec('PRAGMA journal_mode = WAL;');

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leaderboard (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name         TEXT    NOT NULL,
            fighter_id          TEXT    NOT NULL,
            fighter_name        TEXT    NOT NULL,
            mode                TEXT    NOT NULL CHECK (mode IN ('arcade', 'survival')),
            score               INTEGER NOT NULL DEFAULT 0,
            wins                INTEGER NOT NULL DEFAULT 0,
            knockouts           INTEGER NOT NULL DEFAULT 0,
            longest_streak      INTEGER NOT NULL DEFAULT 0,
            arcade_cleared      INTEGER NOT NULL DEFAULT 0,
            completion_time_ms  INTEGER DEFAULT NULL,
            red_button_presses  INTEGER NOT NULL DEFAULT 0,
            favorite_arena      TEXT    NOT NULL DEFAULT 'The Barn',
            created_at          TEXT    NOT NULL,
            created_epoch       INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ff4_arcade_score
            ON leaderboard (mode, score DESC, completion_time_ms ASC, created_epoch ASC);

        CREATE INDEX IF NOT EXISTS idx_ff4_survival_streak
            ON leaderboard (mode, longest_streak DESC, knockouts DESC, score DESC, created_epoch ASC);

        CREATE INDEX IF NOT EXISTS idx_ff4_arcade_time
            ON leaderboard (mode, arcade_cleared, completion_time_ms ASC, score DESC, created_epoch ASC);

        CREATE INDEX IF NOT EXISTS idx_ff4_fighter
            ON leaderboard (fighter_id, score DESC);
    ");

    $count = (int)$pdo->query("SELECT COUNT(*) FROM leaderboard")->fetchColumn();
    if ($count === 0) {
        $now = time();
        $seeds = [
            // Arcade Mode: Highest Score & Fastest Completion seeds
            ['GrandmasterBawk', 'cluck_norris', 'Cluck Norris', 'arcade', 148500, 6, 12, 6, 1, 164200, 5, 'Two-Story Indoor Aquarium'],
            ['DairyDestroyer99', 'moo_tai', 'Moo Tai', 'arcade', 136200, 6, 12, 6, 1, 182450, 4, 'The Barn'],
            ['TinCanTerror', 'billy_the_kid', 'Billy the Kid', 'arcade', 129800, 6, 12, 6, 1, 151800, 7, 'Tractor Supply Parking Lot'],
            ['KesselMudRunner', 'ham_solo', 'Ham Solo', 'arcade', 121400, 6, 12, 6, 1, 195300, 6, 'County Fair'],
            ['ShearLunacy', 'woolverine', 'Woolverine', 'arcade', 114900, 6, 12, 6, 1, 173900, 3, 'Corn Maze'],
            ['DrunkenMallard', 'quackie_chan', 'Quackie Chan', 'arcade', 108600, 6, 12, 6, 1, 144600, 4, 'Two-Story Indoor Aquarium'],
            ['KyotoHayloft94', 'cluck_norris', 'Cluck Norris', 'arcade', 96400, 6, 11, 6, 1, 212100, 2, 'The Barn'],
            ['CombinesBeware', 'moo_tai', 'Moo Tai', 'arcade', 84200, 5, 10, 5, 0, null, 5, 'County Fair'],
            ['PressedTheButton', 'ham_solo', 'Ham Solo', 'arcade', 72500, 4, 8, 4, 0, null, 11, 'Tractor Supply Parking Lot'],

            // Survival Mode: Longest Streak seeds
            ['ImmortalRooster', 'cluck_norris', 'Cluck Norris', 'survival', 214500, 19, 19, 19, 0, null, 12, 'The Barn'],
            ['ShirtEaterXL', 'billy_the_kid', 'Billy the Kid', 'survival', 186400, 16, 16, 16, 0, null, 9, 'Tractor Supply Parking Lot'],
            ['MerinoBerserker', 'woolverine', 'Woolverine', 'survival', 162900, 14, 14, 14, 0, null, 8, 'Corn Maze'],
            ['PastureSensei', 'moo_tai', 'Moo Tai', 'survival', 141200, 12, 12, 12, 0, null, 6, 'County Fair'],
            ['PondStuntman', 'quackie_chan', 'Quackie Chan', 'survival', 118800, 10, 10, 10, 0, null, 5, 'Two-Story Indoor Aquarium'],
            ['PorkChopExpress', 'ham_solo', 'Ham Solo', 'survival', 94500, 8, 8, 8, 0, null, 7, 'County Fair'],
            ['Barnstormer97', 'cluck_norris', 'Cluck Norris', 'survival', 68200, 6, 6, 6, 0, null, 4, 'The Barn']
        ];

        $ins = $pdo->prepare("
            INSERT INTO leaderboard (
                player_name, fighter_id, fighter_name, mode, score,
                wins, knockouts, longest_streak, arcade_cleared,
                completion_time_ms, red_button_presses, favorite_arena,
                created_at, created_epoch
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($seeds as $idx => $s) {
            $ts = $now - (($idx + 1) * 5400);
            $ins->execute([
                $s[0], $s[1], $s[2], $s[3], $s[4],
                $s[5], $s[6], $s[7], $s[8],
                $s[9], $s[10], $s[11],
                gmdate('Y-m-d\TH:i:s\Z', $ts),
                $ts * 1000
            ]);
        }
    }
} catch (Exception $e) {
    jsonError('Database connection error: ' . $e->getMessage(), 500);
}

// -----------------------------------------------------------------------------
// Route Request
// -----------------------------------------------------------------------------
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$path = preg_replace('#^.*?/api(?:/index\.php)?/?#i', '', $uriPath);
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = strtolower(trim($_GET['action'] ?? ''));

if ($path === 'health' || $action === 'health') {
    jsonResponse([
        'ok' => true,
        'success' => true,
        'service' => 'FARM FIGHTER IV Global Leaderboard API (PHP + SQLite)',
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z')
    ]);
}

// -----------------------------------------------------------------------------
// GET Leaderboard Entries
// Categories:
//   - arcade_score    : Arcade Mode — Highest Score
//   - survival_streak : Survival Mode — Longest Streak
//   - arcade_time     : Fastest Arcade Completion — Best Time
// -----------------------------------------------------------------------------
if ($method === 'GET' && ($path === '' || $path === 'leaderboard' || $path === 'leaderboards' || $action === 'leaderboard')) {
    $rawCat = strtolower(trim($_GET['category'] ?? 'arcade_score'));
    $fighter = strtolower(trim($_GET['fighter'] ?? 'all'));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 50)));

    $where = [];
    $params = [];

    if ($rawCat === 'survival_streak' || $rawCat === 'survival') {
        $category = 'survival_streak';
        $where[] = "mode = 'survival'";
        $orderSql = "ORDER BY longest_streak DESC, knockouts DESC, score DESC, created_epoch ASC";
    } elseif ($rawCat === 'arcade_time' || $rawCat === 'fastest' || $rawCat === 'time') {
        $category = 'arcade_time';
        $where[] = "mode = 'arcade'";
        $where[] = "arcade_cleared = 1";
        $where[] = "completion_time_ms IS NOT NULL AND completion_time_ms > 0";
        $orderSql = "ORDER BY completion_time_ms ASC, score DESC, created_epoch ASC";
    } else {
        $category = 'arcade_score';
        $where[] = "mode = 'arcade'";
        $orderSql = "ORDER BY score DESC, wins DESC, COALESCE(completion_time_ms, 999999999) ASC, created_epoch ASC";
    }

    if ($fighter !== 'all' && isset($FIGHTER_NAMES[$fighter])) {
        $where[] = "fighter_id = ?";
        $params[] = $fighter;
    }

    $whereSql = count($where) > 0 ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM leaderboard {$whereSql}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "SELECT * FROM leaderboard {$whereSql} {$orderSql} LIMIT {$limit}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $entries = [];
    foreach ($rows as $idx => $r) {
        $timeMs = $r['completion_time_ms'] !== null ? (int)$r['completion_time_ms'] : null;
        $entries[] = [
            'rank'                    => $idx + 1,
            'id'                      => (int)$r['id'],
            'playerName'              => $r['player_name'],
            'fighterId'               => $r['fighter_id'],
            'fighterName'             => $r['fighter_name'],
            'mode'                    => $r['mode'],
            'score'                   => (int)$r['score'],
            'wins'                    => (int)$r['wins'],
            'knockouts'               => (int)$r['knockouts'],
            'longestStreak'           => (int)$r['longest_streak'],
            'arcadeCleared'           => (bool)$r['arcade_cleared'],
            'completionTimeMs'        => $timeMs,
            'completionTimeFormatted' => formatTimeMs($timeMs),
            'redButtonPresses'        => (int)$r['red_button_presses'],
            'favoriteArena'           => $r['favorite_arena'],
            'createdAt'               => $r['created_at'],
            'createdEpoch'            => (int)$r['created_epoch']
        ];
    }

    jsonResponse([
        'ok'       => true,
        'success'  => true,
        'category' => $category,
        'fighter'  => $fighter,
        'total'    => $total,
        'count'    => count($entries),
        'entries'  => $entries
    ]);
}

// -----------------------------------------------------------------------------
// POST Score Submission
// -----------------------------------------------------------------------------
if ($method === 'POST' && ($path === '' || $path === 'leaderboard' || $path === 'leaderboard/submit' || $path === 'scores' || $action === 'submit')) {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);
    if (!is_array($body)) {
        jsonError('Invalid JSON request payload.', 400);
    }

    $rawName = trim((string)($body['playerName'] ?? $body['nickname'] ?? ''));
    $cleanName = preg_replace('/[^\w\s\-\.\!\?]/u', '', $rawName);
    $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));
    if (mb_strlen($cleanName) < 1) {
        $cleanName = 'BarnyardBrawler' . rand(10, 99);
    }
    if (mb_strlen($cleanName) > 20) {
        $cleanName = mb_substr($cleanName, 0, 20);
    }

    $fighterId = strtolower(trim((string)($body['fighterId'] ?? 'cluck_norris')));
    if (!isset($FIGHTER_NAMES[$fighterId])) {
        $fighterId = 'cluck_norris';
    }
    $fighterName = $FIGHTER_NAMES[$fighterId];

    $rawMode = strtolower(trim((string)($body['mode'] ?? 'arcade')));
    if (!in_array($rawMode, ['arcade', 'survival'], true)) {
        jsonError('Only Arcade Mode and Survival Mode runs can be submitted to global leaderboards.', 422);
    }

    $score          = max(0, min(9999999, (int)($body['score'] ?? 0)));
    $wins           = max(0, min(9999, (int)($body['wins'] ?? 0)));
    $knockouts      = max(0, min(9999, (int)($body['knockouts'] ?? ($wins * 2))));
    $longestStreak  = max(0, min(9999, (int)($body['longestStreak'] ?? $wins)));
    $arcadeCleared  = !empty($body['arcadeCleared']) ? 1 : 0;
    $redButtons     = max(0, min(999, (int)($body['redButtonPresses'] ?? 0)));

    $arenaKey = strtolower(trim((string)($body['favoriteArena'] ?? 'the_barn')));
    $favoriteArena = $ARENA_NAMES[$arenaKey] ?? (in_array($body['favoriteArena'] ?? '', $ARENA_NAMES, true) ? $body['favoriteArena'] : 'The Barn');

    $completionTimeMs = null;
    if ($rawMode === 'arcade' && $arcadeCleared === 1 && isset($body['completionTimeMs']) && is_numeric($body['completionTimeMs'])) {
        $ms = (int)$body['completionTimeMs'];
        if ($ms >= 10000 && $ms <= 7200000) {
            $completionTimeMs = $ms;
        }
    }

    if ($score <= 0 && $wins <= 0 && $longestStreak <= 0) {
        jsonError('Run must record at least one point or victory to qualify.', 422);
    }

    $nowEpoch = (int)round(microtime(true) * 1000);
    $isoDate = gmdate('Y-m-d\TH:i:s\Z');

    // Prevent accidental rapid double-submit within 30 seconds
    $thirtySecAgo = $nowEpoch - 30000;
    $dupStmt = $pdo->prepare("
        SELECT id FROM leaderboard
        WHERE player_name = ? AND fighter_id = ? AND mode = ?
          AND score = ? AND longest_streak = ? AND created_epoch > ?
        LIMIT 1
    ");
    $dupStmt->execute([$cleanName, $fighterId, $rawMode, $score, $longestStreak, $thirtySecAgo]);
    $dupRow = $dupStmt->fetch();

    if (!$dupRow) {
        $insStmt = $pdo->prepare("
            INSERT INTO leaderboard (
                player_name, fighter_id, fighter_name, mode, score,
                wins, knockouts, longest_streak, arcade_cleared,
                completion_time_ms, red_button_presses, favorite_arena,
                created_at, created_epoch
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insStmt->execute([
            $cleanName, $fighterId, $fighterName, $rawMode, $score,
            $wins, $knockouts, $longestStreak, $arcadeCleared,
            $completionTimeMs, $redButtons, $favoriteArena,
            $isoDate, $nowEpoch
        ]);
        $entryId = (int)$pdo->lastInsertId();
    } else {
        $entryId = (int)$dupRow['id'];
    }

    // Compute ranks across applicable leaderboard categories
    $ranks = [];
    if ($rawMode === 'arcade') {
        $rScore = $pdo->prepare("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'arcade' AND score > ?");
        $rScore->execute([$score]);
        $ranks['arcade_score'] = (int)$rScore->fetchColumn();

        if ($arcadeCleared === 1 && $completionTimeMs !== null) {
            $rTime = $pdo->prepare("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'arcade' AND arcade_cleared = 1 AND completion_time_ms IS NOT NULL AND completion_time_ms < ?");
            $rTime->execute([$completionTimeMs]);
            $ranks['arcade_time'] = (int)$rTime->fetchColumn();
        }
    } else {
        $rStreak = $pdo->prepare("SELECT COUNT(*) + 1 FROM leaderboard WHERE mode = 'survival' AND (longest_streak > ? OR (longest_streak = ? AND score > ?))");
        $rStreak->execute([$longestStreak, $longestStreak, $score]);
        $ranks['survival_streak'] = (int)$rStreak->fetchColumn();
    }

    jsonResponse([
        'ok'      => true,
        'success' => true,
        'entryId' => $entryId,
        'ranks'   => $ranks,
        'entry'   => [
            'id'                      => $entryId,
            'playerName'              => $cleanName,
            'fighterId'               => $fighterId,
            'fighterName'             => $fighterName,
            'mode'                    => $rawMode,
            'score'                   => $score,
            'wins'                    => $wins,
            'knockouts'               => $knockouts,
            'longestStreak'           => $longestStreak,
            'arcadeCleared'           => (bool)$arcadeCleared,
            'completionTimeMs'        => $completionTimeMs,
            'completionTimeFormatted' => formatTimeMs($completionTimeMs),
            'redButtonPresses'        => $redButtons,
            'favoriteArena'           => $favoriteArena,
            'createdAt'               => $isoDate,
            'createdEpoch'            => $nowEpoch
        ]
    ], 201);
}

jsonError('Unknown API endpoint', 404);
