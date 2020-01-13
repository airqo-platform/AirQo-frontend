<!DOCTYPE html>
<html lang="en">

<head>
	<?php
	$ptitle = $title . " | AIRQO";
	$desc  = "AirQo is the leading air quality data monitoring, analysis and modelling platform in East Africa. Collaborate with us as we use data to achieve clean air for all African cities";
	$img   = base_url() . "assets/images/fav.png";
	$route = "";
	$author = "Buzen Technologies";

	?>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<!-- to avoid horizontal scroll in mobile devices -->
	<meta name="viewport" content="width=device-width, initial-scale = 1.0, maximum-scale=1.0, user-scalable=no" />
	<!--responsiveness of the browser-->
	<meta name="description" content="<?= $desc; ?>">
	<meta name="author" content="<?= $author; ?>">
	<link rel="icon" href="<?= base_url(); ?>assets/images/fav.png">

	<meta property="og:image" content="<?php echo $img ?>" />
	<meta property="og:image:width" content="600" />
	<meta property="og:image:height" content="315" />
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@KampalaAirQo">
	<meta name="twitter:url" content="<?= base_url(); ?><?= $route; ?>">
	<meta name="twitter:title" content="<?= $ptitle; ?>">
	<meta name="twitter:description" content="<?= $desc; ?>">
	<meta name="twitter:image" content="<?php echo $img ?>">
	<title><?= $ptitle; ?></title>

	<!-- cache timeout -->
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
	<meta http-equiv="Pragma" content="no-cache" />
	<meta http-equiv="Expires" content="<?php echo gmdate('D, d M Y H:i:s', time() - 3600) . ' GMT' ?>" />

	<script src="<?php echo base_url(); ?>js/modernizr.js"></script>
	<link href="<?php echo base_url(); ?>assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
	<link href="<?php echo base_url(); ?>assets/bootstrap/css/style.css" rel="stylesheet">
	<link href="<?php echo base_url(); ?>assets/bootstrap/css/backtop.css" rel="stylesheet">
	<link href="<?php echo base_url(); ?>assets/bootstrap/css/animate.min.css" rel="stylesheet">
	<link href="<?php echo base_url(); ?>assets/bootstrap/css/font-awesome.min.css" rel="stylesheet">
	<script src="<?php echo base_url(); ?>assets/bootstrap/js/jquery-2.1.4.min.js"></script>

	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-156033287-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-156033287-1');
	</script>


</head>


<body>

	<!--The NAVIGATION BAR -->
	<div class="navbar navbar-default big-nav "  role="navigation">
		<div class="container">
			<div class="row">
				<div class="">

					<div class="navbar-header">
						<button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".navbar-collapse">
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
						</button>
						<a href="<?= base_url(); ?>" class="navbar-brand ">
							<img src="<?php echo base_url(); ?>assets/images/logo.png">
						</a>
					</div>

					<div class="navbar-collapse collapse">
						<div class="navbar-left">
							<ul class="nav navbar-nav" id="myNav">
								<li><a href="<?= base_url(); ?>">Home</a></li>
								<!-- <li class="dropdown dropdown-toggle main_li " role="button" aria-haspopup="true" aria-expanded="false"><a class="" href="#">About us <span class="caret"></span></a>
								 <li class="dropdown dropdown-toggle main_li " role="button" aria-haspopup="true" aria-expanded="false"><a class="" href="<?= base_url(); ?>about">About us <span class="caret"></span></a> 
									 <ul class="dropdown-menu drop_M" role="menu">
										<li><a class="hov" href="<?= base_url(); ?>about" style="margin-top: 0px !important; padding: 10px !important; color: #555 !important; margin-right: 0px; text-align: left !important;">About</a></li>
										<li><a class="hov" href="<?= base_url(); ?>careers" style="margin-top: 0px !important; padding: 10px !important; color: #555 !important; margin-right: 0px; text-align: left !important;">Careers</a></li>
				s						<li><a class="hov" href="<?= base_url(); ?>contact-us" style="margin-top: 0px !important; padding: 10px !important; color: #555 !important; margin-right: 0px; text-align: left !important;">Contact Us</a></li>
									</ul> 
									
								</li> -->

								<li class="dropdown new-drop">
									<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									About us<span class="caret">
									</button>
									<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
									  <div style="margin-top: 10px;"><a  class="dropdown-item" href="<?= base_url(); ?>about#">About</a></div>
									  <div><a  class="dropdown-item" href="<?= base_url(); ?>careers">Careers</a></div>
									  <div><a  class="dropdown-item" href="<?= base_url(); ?>contact-us">Contact-us</a></div>
									</div>
								</li>
								<li><a href="<?= base_url(); ?>partnerships">Partnerships</a></li>
								<li><a href="<?= base_url(); ?>blog">Blog</a></li>
							</ul>

						</div>
					</div>

				</div>
			</div>

		</div>
	</div>