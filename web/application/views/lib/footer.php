<p>&nbsp;</p>
<p>&nbsp;</p>
<button onclick="topFunction()" id="myBtn" class="scroll-to-top" title="Scroll to the top"><i class="fa fa-chevron-up"></i></button>
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<!-- <script src="<?php echo base_url(); ?>assets/bootstrap/js/jquery-2.1.4.min.js"></script> -->
<script src="<?php echo base_url(); ?>assets/bootstrap/js/popper.min.js"></script>
<script src="<?php echo base_url(); ?>assets/bootstrap/js/bootstrap.min.js"></script>

<script src="<?php echo base_url(); ?>assets/bootstrap/js/wow.min.js"></script>
<script>
	new WOW().init();
	// $('#popup').modal('show');
</script>

<script>
// Set the date we're counting down to
var countDownDate = new Date("Feb 26, 2020 12:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("countdown").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "We are Live";
  }
}, 1000);
</script>

<!-- animated scroll -->
<script type="text/javascript" src="<?php echo base_url(); ?>assets/scroll animation/jquery.localScroll.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>assets/scroll animation/jquery.scrollTo.min.js"></script>

<style>
	.scroll-to-top {

		display: none;
		position: fixed;
		right: 35px;
		bottom: 35px;
		font-size: 1.15em;
		height: 40px;
		width: 40px;
		background: rgba(152, 155, 160);
		line-height: 38px;
		color: #ffffff;
		z-index: 99;
		text-align: center;
		opacity: .3;
		cursor: pointer;
		-webkit-transition: all .25s ease;
		-moz-transition: all .25s ease;
		-ms-transition: all .25s ease;
		-o-transition: all .25s ease;
		transition: all .25s ease;
	}

	@media(max-width:768px) {
		.scroll-to-top {
			right: 20px;
			bottom: 20px;
			font-size: 1.10em;
			height: 30px;
			width: 30px;
			line-height: 18px;
		}
	}
</style>


<script>
	// When the user scrolls down 20px from the top of the document, show the button
	window.onscroll = function() {
		scrollFunction()
	};

	function scrollFunction() {
		if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			document.getElementById("myBtn").style.display = "block";
		} else {
			document.getElementById("myBtn").style.display = "none";
		}
	}

	// When the user clicks on the button, scroll to the top of the document
	function topFunction() {
		$('body,html').animate({
			scrollTop: 0
		}, 500);
	}
</script>

<!-- BEGINNING OF FOOTER -->
<div class="buzen-footer" id="contact-us">
	<div class="container">
		<div class="row">
			<div class="col-md-3 col-lg-3">
				<h4>AirQo</h4>
				<p>Software Systems Centre, <br />Level 3, Block B, College <br /> of Computing and Information Sciences <br />Kampala, Uganda</p>
				<p><br /></p>
				<a href="https://web.facebook.com/AirQo/" target="_blank"><i class="fa fa-facebook-square fa-2x" style="color: #fff;"></i></i></a>
				<a href="https://twitter.com/AirQoProject" target="_blank"><i class="fa fa-twitter-square fa-2x" style="color: #fff;"></i></i></a>
			</div>

			<div class="col-md-6 col-lg-6 col-sm-12 col-xs-12" style="padding-top: 0px !important; padding-left: 0px !important; padding-right: 0px !important; padding-bottom: 30px !important; z-index: 1;">
				<div class="col-md-6 col-lg-6 col-sm-6 col-xs-6">
					<h4>Explore</h4>
					<ul class="nav">
						<p><a href="<?= base_url(); ?>" style="color: #fff;">Home</a></p>
						<p><a href="<?= base_url(); ?>partnerships" style="color: #fff;">Partnerships</a></p>
						<p><a href="<?= base_url(); ?>blog" style="color: #fff;">Blog</a></p>
						<p><a href="<?= base_url(); ?>faqs" style="color: #fff;">Faqs</a></p>
					</ul>
				</div>

				<div class="col-md-6 col-lg-6 col-sm-6 col-xs-6">
					<h4>About AirQo</h4>
					<ul class="nav">
						<p><a href="<?= base_url(); ?>about" style="color: #fff;">About</a></p>
						<p><a href="<?= base_url(); ?>team" style="color: #fff;">Our team</a></p>
						<p><a href="<?= base_url(); ?>careers" style="color: #fff;">Careers</a></p>
						<p><a href="<?= base_url(); ?>contact-us" style="color: #fff;">Contact Us</a></p>
					</ul>
				</div>
			</div>

			<div class="col-md-3 col-lg-3">
				<h4>subscribe to our newsletter</h4>
				<!-- Begin Mailchimp Signup Form -->
				<link href="//cdn-images.mailchimp.com/embedcode/slim-10_7.css" rel="stylesheet" type="text/css">
				<style type="text/css">
					#mc_embed_signup {
						background-color: transparent;
						clear: left;
						font: 14px;
						color: #ff0000;
					}
				</style>
				<div id="mc_embed_signup">
					<form action="https://airqo.us4.list-manage.com/subscribe/post?u=0dbb373a20484114777d7590a&amp;id=865133b4d7" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
						<div id="mc_embed_signup_scroll">
							<p style="color: #fff !important;">Recieve our Latest updates via email</p>
							<div class="mc-field-group">
								<input style="width: 100% !important;" type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL" placeholder="Email address">
							</div>
							<div id="mce-responses" class="clear">
								<div class="response" id="mce-error-response" style="display:none">
								</div>
								<div class="response" id="mce-success-response" style="display:none">
								</div>
							</div>
							<!-- auto fill -->
							<div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_0dbb373a20484114777d7590a_865133b4d7" tabindex="-1" value=""></div>
							<div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
						</div>
					</form>
				</div>
				<!--End mc_embed_signup-->
			</div>
		</div>
	</div>
	<hr />
	<div class="container-fluid">
		<div class="row">

			<div class="col-lg-12 col-md-12">
				<center>
					&copy; <?php echo date("Y"); ?> | AirQo
				</center>
			</div>
		</div>
	</div>
</div>
<script src="js/BackToTop.js"></script>
<script>
	// Select all links with hashes
	$('a[href*="#"]')
		// Remove links that don't actually link to anything
		.not('[href="#"]')
		.not('[href="#0"]')
		.click(function(event) {
			// On-page links
			if (
				location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
				location.hostname == this.hostname
			) {
				// Figure out element to scroll to
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
				// Does a scroll target exist?
				if (target.length) {
					// Only prevent default if animation is actually gonna happen
					event.preventDefault();
					$('html, body').animate({
						scrollTop: target.offset().top
					}, 1000, function() {
						// Callback after animation
						// Must change focus!
						var $target = $(target);
						$target.focus();
						if ($target.is(":focus")) { // Checking if the target was focused
							return false;
						} else {
							$target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
							$target.focus(); // Set focus again
						};
					});
				}
			}
		});
</script>
<!-- animated scroll inntialisation -->
<script type="text/javascript">
	$(document).ready(function() {
		$('#myNav').localScroll({
			duration: 800
		});
		$('#myNav0').localScroll({
			duration: 800
		});
	});
</script>

<script type="text/javascript">
	$("#myNavbar").click(function() {
		$(".navbar-collapse").toggle();
	});

	$('#search-value').keyup(function(e) {
		e.preventDefault();
		var searchKey = $('#search-value').val();
		if (searchKey.length >= 3) {
			$.ajax({
				type: "POST",
				url: "<?= site_url('node-search'); ?>",
				data: {
					searchkey: searchKey
				},
				dataType: "json",
				success: function(response) {
					var success = response.success;
					if (success == 1) {
						$('#search-results').html(response.searchresults);
					} else {

					}
				}
			});
			$('#search-results').removeClass('hide');
		} else {
			$('#search-results').addClass('hide');
		}
	});
</script>
</body>

</html>