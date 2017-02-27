<?php

$db = new PDO('pgsql:host=postgres port=5432 dbname=lara user=dbuser password=password');

$search = $_GET['search'] ?? '';
$limit = 20;

if (!$search) {
    $sql = "SELECT id, name FROM product_categories WHERE deleted_at IS NULL AND ns_depth = 0 ORDER BY name LIMIT $limit";
} else {
    $search = $db->quote(mb_strtolower($search) . '%');
    $sql = "SELECT id, name FROM product_categories WHERE deleted_at IS NULL AND LOWER(name) LIKE $search ORDER BY name LIMIT $limit";
}

$query = $db->query($sql);
if ($query === false) {
    die(json_encode([
        'success' => false,
        'error'   => 'bad_query',
    ]));
}

$items = $query->fetchAll();

echo json_encode([
    'success' => true,
    'data'    => $items,
]);