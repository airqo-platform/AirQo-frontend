<?php
$ptitle = $title . " | AIRQO";
$desc  = "AirQo is the leading air quality data monitoring, analysis and modelling platform in East Africa. Collaborate with us as we use data to achieve clean air for all African cities";
$img   = base_url() . "assets/images/fav.png";
$route = "";
$author = "Buzen Technologies";
?>
<!Doctype html>
<html lang="en">

<head>
	<!-- Required meta tags -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="<?= $desc; ?>">
	<meta name="author" content="<?= $author; ?>">
	<link rel="icon" href="<?= base_url(); ?>assets/images/fav.png">

	<meta property="og:image" content="<?= $img ?>" />
	<meta property="og:image:width" content="600" />
	<meta property="og:image:height" content="315" />
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@KampalaAirQo">
	<meta name="twitter:url" content="<?= base_url(); ?><?= $route; ?>">
	<meta name="twitter:title" content="<?= $ptitle; ?>">
	<meta name="twitter:description" content="<?= $desc; ?>">
	<meta name="twitter:image" content="<?= $img ?>">
	<title><?= $ptitle; ?></title>

	<!-- cache timeout -->
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
	<meta http-equiv="Pragma" content="no-cache" />
	<meta http-equiv="Expires" content="<?= gmdate('D, d M Y H:i:s', time() - 3600) . ' GMT' ?>" />
	<!-- web fonts -->
	<!-- <link href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,900&display=swap" rel="stylesheet"> -->
	<!-- <link href="//fonts.googleapis.com/css?family=Nunito:200,300,400,600,700,800,900&display=swap" rel="stylesheet"> -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
	<!-- //web fonts -->
	<!-- Template CSS -->
	<link rel="stylesheet" href="<?= base_url(); ?>assets/update/css/style-starter.css">
	<!-- add ckedtitor styles -->
	<link rel="stylesheet" href="<?= base_url(); ?>assets/ckeditor/css/content-styles.css">
    <script src="<?php echo base_url(); ?>assets/bootstrap/js/jquery-2.1.4.min.js"></script>
    <!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-156033287-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-156033287-1');
	</script>

	<!-- Hotjar Tracking Code for https://www.airqo.net/ -->
	<script>
		(function(h,o,t,j,a,r){
			h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
			h._hjSettings={hjid:2546387,hjsv:6};
			a=o.getElementsByTagName('head')[0];
			r=o.createElement('script');r.async=1;
			r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
			a.appendChild(r);
		})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
	</script>
</head>

<body>
	<div class="w3l-bootstrap-header fixed-top">
		<nav class="navbar navbar-expand-lg navbar-dark p-4">
			<div class="container">
				<a class="navbar-brand" href="<?= site_url('home'); ?>">
					<img src="<?= base_url(); ?>assets/images/logo.png" alt="AirQo" title="AirQo" style="height:50px;" />
				</a>
				<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon fa fa-bars" style="color:#3067e2;"></span>
				</button>

				<div class="collapse navbar-collapse" id="navbarSupportedContent">
					<ul class="navbar-nav mr-auto">
						
					</ul>
					<div class="form-inline">
						<ul class="navbar-nav mr-auto">
							<li class="nav-item active">
								<a class="nav-link" href="<?= site_url('home'); ?>">Home</a>
							</li>
							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									About Us
								</a>
								<div class="dropdown-menu" aria-labelledby="navbarDropdown">
									<a class="dropdown-item" href="<?= site_url('about'); ?>">About Us</a>
									<a class="dropdown-item" href="<?= site_url('careers'); ?>">Careers</a>
									<a class="dropdown-item" href="<?= site_url('team'); ?>">Our Team</a>
									<a class="dropdown-item" href="<?= site_url('contact-us'); ?>">Contact Us</a>
								</div>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="<?= site_url('partnerships'); ?>">Partnerships</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="<?= site_url('products'); ?>">Products &amp; Services</a>
							</li>
							<!-- <li class="nav-item">
								<a class="nav-link" href="<?= site_url('blog'); ?>">Blog</a>
							</li> -->
							<li class="nav-item"> <!-- medium-->
								<a class="nav-link" href="<?= site_url('airqo-blog'); ?>">Blog</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="<?= REQUEST_DATA_ACCESS; ?>" target="_blank">Request Data Access</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</nav>
	</div>