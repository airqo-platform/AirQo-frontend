<?php
defined('BASEPATH') or exit('No direct script access allowed');

$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array(
	'dsn'	   => '',
	'hostname' => getenv('DEV_DB_HOST'),
	'username' => getenv('DEV_MYSQL_USERNAME'),
	'password' => getenv('DEV_MYSQL_ROOT_PASSWORD'),
	'database' => getenv('DEV_MYSQL_DATABASE'),
	'dbdriver' => getenv('DEV_DB_DRIVER'),
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => (ENVIRONMENT !== 'production'),
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt' => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => TRUE
);
