<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- to avoid horizontal scroll in mobile devices -->
    <meta name="viewport" content="width=device-width, initial-scale = 1.0, maximum-scale=1.0, user-scalable=no"/>
    <!--responsiveness of the browser-->
    <meta name="description" content="Air Quality Kampala, AirQo">
    <meta name="author" content="Buzen Technologies">
    <meta http-equiv="Cache-control" content="no-cache">
    <meta http-equiv="Expires" content="-1">
    <link rel="icon" href="<?= base_url();?>assets/images/home/logo.png">
    <title> AIRQO | <?= $title; ?> </title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href=" <?= base_url(); ?>assets/bootstrap/css/bootstrap.min.css ">
    <!-- <link rel="stylesheet" type="text/css" href=" <?= base_url(); ?>assets/custom.css"> -->
    <link rel="stylesheet" href=" <?= base_url(); ?>assets/bootstrap/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href=" <?= base_url(); ?>assets/bootstrap/css/album.css">
    <link rel="stylesheet" href=" <?= base_url(); ?>assets/bootstrap/css/animate.min.css">
    <link rel="stylesheet" type="text/css" href=" <?= base_url(); ?>assets/airqo.css">
    <script src="<?= base_url();?>assets/bootstrap/js/jquery-1.11.1.min.js"></script>
    <!-- <!DOCTYPE html> -->
<!-- <html> -->
<!-- <head> -->
    <!-- <meta charset='utf-8' /> -->
    <!-- <title>Airqo Map</title> -->
    <!-- <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' /> -->
    
    <!-- <link href='https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' rel='stylesheet' /> -->
    <!-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous"> -->
    
    
<!-- </head> -->
<!-- <body> -->

  </head>
  <body >
    <!-- START OF THE SMALL CONTACT NAV -->
    <div class="buzen-navbar" id="buzen-navbar">
       <div class="container-dave">
           <div class="row contact">
            <div class="col col-sm-3 col-md-3 col-lg-3"></div>
               <div class="col col-sm-3 col-md-3 col-lg-3 phone-push" style="margin-left:-60px;">
                 <div class="row">
                  <?php
                  foreach ($contact as $row) {
                  ?>
                   <div class="col  colsm-6 col-xs-6 col-md-6 col-lg-6">
                       <a href="mailto:<?=$row['con_phoneline'];?>">
                        <p><i class="fa fa-envelope" aria-hidden="true"></i> <?=$row['con_phoneline'];?></p>
                       </a>
                   </div>
                   <div class="col  col-sm-6 col-xs-6 col-md-6 col-lg-6">
                     <a href="mailto:<?=$row['con_email'];?>">
                       <p><i class="fa fa-envelope" aria-hidden="true"></i> <?=$row['con_email'];?></p>
                     </a>
                   </div>
                   <?php
                    }
                    ?>
                 </div>

               </div>
               <div class="col col-sm-6 hidden-xs hidden-sm col-md-6 col-lg-6 pull-right" id="myNav0">
                   <div class=" social" id="#contact-us">
                      <a href="#contact-us">
                        <i class="fa fa-map-marker" aria-hidden="true"> <span style="margin-right:10px;"></span>Our Offices </i>
                      </a>

                      <a href="#contact-us"  style="padding-right:10px; text-align:center;">
                            Contact Us <span> <i class="fa fa-play-circle-o" aria-hidden="true"></i></span> 
                      </a>
                   </div>
               </div>
           </div>
       </div>
    </div>
    <!-- END OF THE SMALL CONTACT NAV -->
     <!--The Big NAVIGATION BAR -->
   <div class="navbar navbar-default big-nav " id="myNavbar" role="navigation">
    <div class="container-dave phone">
        <div class="navbar-header">
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a href="<?= site_url('home');?>" class="navbar-brand">
              <img src="<?= base_url();?>assets/images/home/logo.png" width="300px" height="100px">
            </a>
        </div>
        <div class="navbar-collapse collapse">
            <div class=" navbar-right">
              <ul class="nav navbar-nav" id="myNav">
                <li class=""><a href="<?= site_url('home');?>" > Home</a></li>
                <li><a href="<?= site_url('about');?>">About</a></li>
                <li class="dropdown dropdown-toggle main_li " role="button" aria-haspopup="true" aria-expanded="false"><a class="" href="#">Current Air <span class="caret"></span></a> 
                    <ul class="dropdown-menu drop_M" role="menu">
                        <?php 
                          $appNodes = $this->AirqoModel->get_app_nodes();
                          foreach($appNodes as $row){
                        ?>
                            <li><a  class="hov" href="<?= site_url('node/'.$row['an_channel_id']);?>"> <?=  $row['an_name']; ?></a></li>    
                        <?php
                          }
                        ?>
                    </ul>
                </li>
                <li><a href="<?= site_url('amap'); ?>">Map</a></li>
                <li><a href="<?= site_url('how-it-works');?>">How It Works</a></li>
                <li><a href="<?= site_url('team');?>">Team</a></li>
                <li><a href="<?= site_url('news');?>">News</a></li>
                <li><a href="<?= site_url('faqs');?>">Faqs</a></li>
                <li><a href="#contact-us">Contact Us</a></li>
            </ul>
            </div>

         </div>
    </div>
   </div>
<!-- END OF  NAVIGATION -->

<!-- START OF HEADER INFO -->
    <div class="below-nav" id="ome" >
       <div class="container-dave">
           <div class="row row-pad">
             <div class="col col-lg-3 col-md-3 col-pad">
              <div class="container-fluid header-info hidden-sm ">
                <h4>Design & Development</h4>
                <p>Quality Monitoring Devices</p>
              </div>
             </div>
             <div class="col col-lg-3 col-md-3 col-pad">
              <div class="container-fluid header-info hidden-sm ">
                <h4>Monitoring</h4>
                <p>Participatory and regular air quality</p>
              </div>
             </div>
             <div class="col col-lg-3 col-md-3 col-pad">
              <div class="container-fluid header-info hidden-sm ">
                <h4>Awareness</h4>
                <p>Air quality awareness campaigns</p>
              </div>
             </div>
             <div class="col col-lg-3 col-md-3 col-pad">
              <div class="container-fluid header-info hidden-sm  last">
                <h4>Inform & Policy</h4>
                <p>Evidence to inform policy</p>
              </div>
             </div>
          </div>
       </div>
   </div>

<!-- END OF HEADER INFO -->