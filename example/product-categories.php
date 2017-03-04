<?php

error_reporting(E_ALL);

try {
    //$db = new PDO('pgsql:host=xxx dbname=xxx', 'xxx', 'xxx');
    $db = new mysqli('xxx', 'xxx', 'xxx', 'xxx', 3306);
    if ($db->connect_errno) {
        throw new Exception('Bad DB connect with error number: ' . $db->connect_errno);
    }
    $db->set_charset('utf8');

} catch (Exception $e) {
    die(json_encode(print_r($e, true), JSON_UNESCAPED_UNICODE));
}

$search = isset($_GET['search']) ? $_GET['search'] : '';
$limit = 20;

if (!$search) {
    $sql = "SELECT id, name, path_name AS pathName FROM product_categories WHERE deleted_at IS NULL AND ns_depth = 0 ORDER BY name LIMIT $limit";
} else {
    // My shit hosting hasen't mb_strtolower() function
    //$search = $db->real_escape_string(mb_strtolower($search)) . '%';
    $search = $db->real_escape_string($search) . '%';
    $sql = "SELECT id, name, path_name AS pathName FROM product_categories WHERE deleted_at IS NULL AND LOWER(name) LIKE '$search' ORDER BY name LIMIT $limit";
}

function errorInfo($db) {
    $result = '';
    foreach ($db->error_list as $err) {
        $result .= ($result ? '; ' : '') .
            'errno: ' . $err['errno'] . ', ' .
            'sqlstate: ' . $err['sqlstate'] . ', ' .
            'error: ' . $err['error'];
    }
    return $result;
}

$result = $db->query($sql, MYSQLI_ASSOC);
if ($result === false) {
    die(json_encode([
        'success' => false,
        'error'   => errorInfo($db),
    ], JSON_UNESCAPED_UNICODE));
}

$result = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'data'    => $result,
], JSON_UNESCAPED_UNICODE);