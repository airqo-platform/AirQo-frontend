<section class="w3l-index-block10 py-0" style="background-image: linear-gradient(to right, rgba(25, 51, 101, 0.85), rgba(0, 0, 0, 0.08)), url('<?= base_url(); ?>assets/update/images/partners-1.png'); background-size: cover; background-repeat: no-repeat;">
	<div class="new-block top-bottom">
		<div class="container">
			<div class="middle-section py-5">
				<div class="section-width">
					<h2 style="font-family:'Raleway Bold'; font-size:3em; line-height: 1em; padding-top: 1.5em;">Blog Posts</h2>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="w3l-blog mt-5">
	<div class="text-element-9 py-5 mt-5">
		<div class="display-ad" style="margin: 8px auto; display: block; text-align:center;">

		</div>
		<div class="container py-lg-3">
			<div class="row grid-text-9">
				<div class="col-md-8">
					<div class="row">
						<?php 
						foreach ($posts as $post) {
							?>
							<a href="<?= site_url('blog-post/'. $post['p_slug']); ?>" class="col-lg-6 blog-article-post">
								<div class="blog-post d-flex flex-wrap align-content-between">
									<div class="post-content">
										<img src="<?= $post['p_img']; ?>" class="img-fluid" alt="blog-post-image" />
										<p class="sub-para my-3"><?= $post['category']; ?></p>
										<h4 class="text-head-text-9"><?= ucwords(strtolower($post['p_title'])); ?></h4>
									</div>
									<ul class="blog-author-date mt-4 d-flex justify-content-between align-items-end">
										<li class="author">By AirQo</li>
										<li><?= date("F jS, Y", strtotime($post['p_added'])); ?></li>
									</ul>
								</div>
							</a>
							<?php	
                        }
                        if($posts == null){
							?>
							<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
								<p>No Posts Available</p>
							</div>
							<?php 
						}
						?>
					</div>
					<!-- <nav aria-label="Page navigation example">
						<ul class="pagination float-left">
							<li class="page-item">
								<a class="page-link" href="blog.html"> <span class="fa fa-angle-double-left"></span></a>
							</li>
							<li class="page-item">
								<a class="page-link active" href="blog.html">1</a>
							</li>
							<li class="page-item">
								<a class="page-link" href="blog.html">2</a>
							</li>
							<li class="page-item">
								<a class="page-link" href="blog.html">3</a>
							</li>
							<li class="page-item">
								<a class="page-link" href="blog.html">4</a>
							</li>
							<li class="page-item">
								<a class="page-link" href="blog.html"> <span class="fa fa-angle-double-right"></span></a>
							</li>
						</ul>
					</nav> -->
				</div>
				<div class="col-md-4 left-text-9 mt-md-5 mt-5 pl-md-4">
					<div class="blog-search">
						<form action="<?= site_url('blog-search') ?>" method="POST" class="d-flex search-form">
							<input type="search" class="form-control" placeholder="Search..." name="search" required="required">
							<button type="submit" class="btn search-btn"><span class="fa fa-search"></span></button>
						</form>
					</div>

					<!-- <div class="blog-subscribe p-3 mt-5">
						<h5>Subscribe to Blog</h5>
						<form action="#" method="GET" class="subscribe-form">
							<input type="email" class="form-control subscribe-field mt-3 mb-2" placeholder="Email Address" name="subscribe" required="required">
							<button type="submit" class="btn btn-primary btn-theme">Subscribe</button>
						</form>
					</div> -->

					<div class="left-top-9 mt-5">
						<h6 class="heading-small-text-9 mb-3">Popular Post</h6>
						<?php 
						foreach ($suggestions as $suggestion) {
							?>
							<a href="<?= site_url('blog-post/'. $suggestion['p_slug']); ?>" class="p-post d-block py-2">
								<h6 class="text-left-inner-9"><?= ucwords(strtolower($suggestion['p_title'])); ?></h6>
								<span class="sub-inner-text-9"><?= date("F jS, Y", strtotime($suggestion['p_added'])); ?></span>
							</a>
							<?php 
						}
						?>
					</div>
					<div class="categories mt-5">
						<h6 class="heading-small-text-9">Categories</h6>
						<ul>
							<?php 
							foreach ($categories as $category) {
								?>
								<li>
									<a href="<?= site_url('blog-category/'. $category['c_id']); ?>" class=""><?= $category['c_name']; ?></a>
								</li>
								<?php 
							}
							?>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div class="display-ad" style="margin: 8px auto; display: block; text-align:center;">

		</div>
	</div>
</section>

<!-- //footer-28 block -->

<!-- jQuery, Bootstrap JS -->
<!-- <script src="assets/js/jquery-3.3.1.min.js"></script>
      <script src="assets/js/bootstrap.min.js"></script> -->

<!-- Template JavaScript -->

<!-- <script src="assets/js/owl.carousel.js"></script> -->

<!-- script for owlcarousel -->
<!-- <script>
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
      </script> -->
<!-- //script for owlcarousel -->

<!-- disable body scroll which navbar is in active -->
<!-- <script>
        $(function () {
          $('.navbar-toggler').click(function () {
            $('body').toggleClass('noscroll');
          })
        });
      </script> -->
<!-- disable body scroll which navbar is in active -->

<!-- <script src="assets/js/smartphoto.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const sm = new SmartPhoto(".js-img-viwer", {
            showAnimation: false
          });
          // sm.destroy();
        });
      </script> -->

<!-- <script src="assets/js/jquery.magnific-popup.min.js"></script>
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
      </script> -->

<!-- </body>
</html> -->