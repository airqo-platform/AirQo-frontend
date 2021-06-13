<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
      header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
      header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}"); }
    exit(0);
}

date_default_timezone_set('Africa/Kampala');

$postdata   = file_get_contents("php://input");
$request    = new stdClass();
$request    = json_decode($postdata);

define('HOSTSPEC', NULL);
define('USERNAME', 'root');
define('PASSWORD', 'NDn4Djf4elCA00sB');
define('DATABASE_INSTANCE_NAME','airqo_airqo');
define('PORT', NULL);
define('SOCKET', '/cloudsql/airqo-frontend:us-central1:airqo-frontend-instance');
$mysqli = new mysqli(HOSTSPEC, USERNAME, PASSWORD, DATABASE_INSTANCE_NAME, PORT, SOCKET);

// $DB_USER = "buzentec_root";
// $DB_PASS = "8YVO,FplMLgV";
// $DB_NAME = "buzentec_airqo_db";
// $DB_HOST = "localhost";
// $mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

$mysqli->query("SET NAMES 'utf8'");
?>
