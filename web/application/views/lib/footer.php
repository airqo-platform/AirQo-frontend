<!-- footer-28 block -->
	<section class="w3l-market-footer">
		<footer class="footer-28">
			<div class="footer-bg-layer">
				<div class="container py-lg-3">
					<div class="row footer-top-28">
						<div class="col-md-5 footer-list-28 mt-5">
							<h6 class="footer-title-28">AirQo</h6>
							<ul>
								<li>
									<p><strong>Address</strong> : 
									Software Systems Centre, <br>
									Block B, Level 3,<br>
									College of Computing and Information Sciences,<br>
									Plot 56 University Pool Road <br>
									Makerere University, <br>
									Kampala, Uganda
									</p>
								</li>
								<li>
									<p><strong>Phone</strong> : <a href="tel: +256 786 142 396"> +256 786 142 396</a>
									</p>
								</li>
								<li>
									<p><strong>Email</strong> : <a href="mailto:info@airqo.net">info@airqo.net</a></p>
								</li>
							</ul>

							<div class="main-social-footer-28 mt-3">
								<ul class="social-icons">
									<li class="facebook">
										<a href="https://web.facebook.com/AirQo/" title="Facebook">
											<span class="fa fa-facebook" aria-hidden="true"></span>
										</a>
									</li>
									<li class="twitter">
										<a href="https://twitter.com/AirQoProject" title="Twitter">
											<span class="fa fa-twitter" aria-hidden="true"></span>
										</a>
									</li>
									<li class="dribbble">
										<a href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ/" title="youtube">
											<span class="fa fa-youtube" aria-hidden="true"></span>
										</a>
									</li>
									<li class="google">
										<a href="https://www.linkedin.com/company/airqo/" title="Linkedin">
											<span class="fa fa-linkedin" aria-hidden="true"></span>
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div class="col-md-7">
							<div class="row">
								<div class="col-md-3 footer-list-28 mt-5">
									<h6 class="footer-title-28">Explore</h6>
									<ul>
										<li><a href="<?= site_url('/'); ?>">Home</a></li>
										<!-- <li><a href="#">Partnerships</a></li> -->
										<li><a href="<?= site_url('blog'); ?>">Blog</a></li>
										<li><a href="<?= site_url('faqs'); ?>">FAQS</a></li>
									</ul>
								</div>
								<div class="col-md-3 footer-list-28 mt-5">
									<h6 class="footer-title-28">About AirQo</h6>
									<ul>
										<li><a href="<?= site_url('about'); ?>">About Us</a></li>
										<li><a href="<?= site_url('team'); ?>">Our Team</a></li>
										<li><a href="<?= site_url('careers'); ?>">Careers</a></li>
										<li><a href="<?= site_url('contact-us'); ?>">Contact Us</a></li>
									</ul>
								</div>
								<div class="col-md-6 footer-list-28 mt-5">
									<h6 class="footer-title-28">Subscribe to Our Newsletter</h6>
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
					</div>
				</div>


				<div class="midd-footer-28 align-center py-lg-4 py-3 mt-5">
					<div class="container">
						<p class="copy-footer-28 text-center"> &copy; <?= date('Y'); ?> | AirQo</p>
					</div>
				</div>
			</div>
		</footer>

		<!-- move top -->
		<button onclick="topFunction()" id="movetop" title="Go to top">
			&#10548;
		</button>
		<script>
			// When the user scrolls down 20px from the top of the document, show the button
			window.onscroll = function () {
				scrollFunction()
			};

			function scrollFunction() {
				if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
					document.getElementById("movetop").style.display = "block";
				} else {
					document.getElementById("movetop").style.display = "none";
				}
			}

			// When the user clicks on the button, scroll to the top of the document
			function topFunction() {
				document.body.scrollTop = 0;
				document.documentElement.scrollTop = 0;
			}
		</script>
		<!-- /move top -->
	</section>
	<!-- //footer-28 block -->

	<!-- jQuery, Bootstrap JS -->
	<!--<script src="<?= base_url(); ?>assets/update/js/jquery-3.3.1.min.js"></script>-->
	<script src="<?= base_url(); ?>assets/update/js/bootstrap.min.js"></script>

	<!-- Template JavaScript -->

	<script src="<?= base_url(); ?>assets/update/js/owl.carousel.js"></script>

	<!-- script for owlcarousel -->
	<script>
		$(document).ready(function () {
			$('.owl-one').owlCarousel({
				loop: true,
				margin: 0,
				nav: true,
				responsiveClass: true,
				autoplay: false,
				autoplayTimeout: 5000,
				autoplaySpeed: 1000,
				autoplayHoverPause: false,
				responsive: {
					0: {
						items: 1,
						nav: false
					},
					480: {
						items: 1,
						nav: false
					},
					667: {
						items: 1,
						nav: true
					},
					1000: {
						items: 1,
						nav: true
					}
				}
			})
		})
	</script>
	<!-- //script for owlcarousel -->

	<!-- disable body scroll which navbar is in active -->
	<script>
		$(function () {
			$('.navbar-toggler').click(function () {
				$('body').toggleClass('noscroll');
			})
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
	<!-- disable body scroll which navbar is in active -->

	<script src="<?= base_url(); ?>assets/update/js/jquery.magnific-popup.min.js"></script>
	<script>
		$(document).ready(function () {
			$('.popup-with-zoom-anim').magnificPopup({
				type: 'inline',

				fixedContentPos: false,
				fixedBgPos: true,

				overflowY: 'auto',

				closeBtnInside: true,
				preloader: false,

				midClick: true,
				removalDelay: 300,
				mainClass: 'my-mfp-zoom-in'
			});

			$('.popup-with-move-anim').magnificPopup({
				type: 'inline',

				fixedContentPos: false,
				fixedBgPos: true,

				overflowY: 'auto',

				closeBtnInside: true,
				preloader: false,

				midClick: true,
				removalDelay: 300,
				mainClass: 'my-mfp-slide-bottom'
			});
		});
	</script>

</body>

</html>