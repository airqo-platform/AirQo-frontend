<?php
if(! defined('ENVIRONMENT') ){
    $domain = strtolower($_SERVER['HTTP_HOST']);
    switch($domain) {
        case 'airqo.net':
        define('ENVIRONMENT', 'production');
        break;

        case 'www.airqo.net':
            define('ENVIRONMENT', 'production');
            break;

        case 'airqo.africa':
            define('ENVIRONMENT', 'production');
            break;

        case 'www.airqo.africa':
            define('ENVIRONMENT', 'production');
            break;

        case 'staging-dot-airqo-frontend.appspot.com' :
        //our staging server
        define('ENVIRONMENT', 'staging');
        break;

        default :
        define('ENVIRONMENT', 'development');
        break;
    }
}

?>