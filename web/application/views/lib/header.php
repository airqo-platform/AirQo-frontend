<?php 
header('X-XSS-Protection: 1; mode=block');
header("X-Frame-Options: sameorigin");
header('X-Content-Type-Options: nosniff');
header("Strict-Transport-Security: max-age=31536000");
header("Content-Security-Policy: ;");
?>
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="utf-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
     <title><?= $title; ?> - AIRQO</title>
     <!-- Bootstrap -->
     <script src="<?= base_url(); ?>assets/frontend/js/modernizr.js"></script>
     <link href="<?= base_url(); ?>assets/frontend/css/bootstrap.min.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/frontend/css/style.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/frontend/css/backtop.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/frontend/css/animate.min.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/frontend/css/font-awesome.min.css" rel="stylesheet">
     <link rel="icon" href="<?= base_url(); ?>assets/frontend/images/fav.png" type="image/png" sizes="16x16">

     <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
     <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
     <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/res+pond.min.js"></script>
    <![endif]-->
</head>
<body>
     <!--The NAVIGATION BAR -->
     <div class="navbar navbar-default big-nav " id="myNavbar" role="navigation">
          <div class="container">
               <div class="row">
                    <div class="">
                         <div class="navbar-header">
                              <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".navbar-collapse">
                                   <span class="icon-bar"></span>
                                   <span class="icon-bar"></span>
                                   <span class="icon-bar"></span>
                              </button>
                              <a href="<?= site_url('/'); ?>" class="navbar-brand ">
                                   <img src="<?= base_url(); ?>assets/frontend/images/logo.png">
                              </a>
                         </div>

                         <div class="navbar-collapse collapse">
                              <div class="navbar-left">
                                   <ul class="nav navbar-nav" id="myNav">
                                        <li class=""><a href="#buzen-card-section">Current Air</a></li>
                                        <li><a href="<?= site_url('amap'); ?>">Map</a></li>
                                        <li><a href="#buzen-map">Forecasts</a></li>
                                        <li class="buzen-button pull-right"><a class="btn btn-default" href="#contact-us">Get Involved</a></li>
                                   </ul>

                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
     <!-- END OF  NAVIGATION -->