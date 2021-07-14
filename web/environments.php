<?php
if(! defined('ENVIRONMENT') ){
    $domain = strtolower($_SERVER['HTTP_HOST']);
    switch($domain) {
        case (
            'airqo.net' || 
            'www.airqo.net' || 
            'airqo.africa' || 
            'www.airqo.africa' ||
            'airqo.org' ||
            'www.airqo.org'
            ):
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