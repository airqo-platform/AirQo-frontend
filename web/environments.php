<?php
if(! defined('ENVIRONMENT') ){
    $domain = strtolower($_SERVER['HTTP_HOST']);
    switch($domain) {
        case 'airqo.net':
        case 'www.airqo.net':
        case 'airqo.africa': 
        case 'www.airqo.africa':
        case 'airqo.org':
        case 'www.airqo.org':
        case 'airqo.mak.ac.ug':
        define('ENVIRONMENT', 'production');
        break;

        case 'staging-dot-airqo-frontend.appspot.com':
        //our staging server
        define('ENVIRONMENT', 'staging');
        break;

        default:
        define('ENVIRONMENT', 'development');
        break;
    }
}

?>