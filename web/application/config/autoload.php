<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$autoload['packages'] = array();
$autoload['libraries'] = array('form_validation', 'database','upload', 'session', 'SSP');
$autoload['drivers'] = array();
$autoload['helper'] = array('url', 'form', 'text','date', 'security');
$autoload['config'] = array();
$autoload['language'] = array();
$autoload['model'] = array('AirqoModel', 'AdminModel', 'UserModel', 'ApisModel');
