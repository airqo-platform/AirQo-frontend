<section class="w3l-index-block10 py-0" style="background-image: linear-gradient(to right, rgba(25, 51, 101, 0.85), rgba(0, 0, 0, 0.08)), url('<?= base_url(); ?>assets/update/images/partners-1.png'); background-size: cover; background-repeat: no-repeat;">
	<div class="new-block top-bottom">
		<div class="container">
			<div class="py-5">
				<div class="">
					<h2 style="font-family:'Raleway Bold'; font-size:3em; line-height: 1em; padding-top: 1.5em; color: #fff;"><?= $post['p_title']; ?></h2>
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
					<div class="blog-single-post">
						<div class="post-content">
							<p class="sub-para"><?= $post['category']; ?></p>
							<h4 class="text-head-text-9 my-3"><?= $post['p_title']; ?></h4>
						</div>
						<ul class="blog-single-author-date mb-4 d-flex align-items-center">
							<li class="circle avatar"><img src="<?= base_url(); ?>assets/images/fav.png" alt="" /></li>
							<li>By <a href="#">AirQo</a></li>
							<li><?= date("F jS, Y", strtotime($post['p_added'])); ?></li>
						</ul>
						<!-- <ul class="share-post mb-3">
							<li class="facebook">
								<a href="#link" title="Facebook">
									<span class="fa fa-facebook" aria-hidden="true"></span>
								</a>
							</li>
							<li class="twitter">
								<a href="#link" title="Twitter">
									<span class="fa fa-twitter" aria-hidden="true"></span>
								</a>
							</li>
							<li class="google">
								<a href="#link" title="Google">
									<span class="fa fa-google" aria-hidden="true"></span>
								</a>
							</li>
						</ul> -->
						<div class="single-post-image mb-4">
							<img src="<?= $post['p_img']; ?>" class="img-fluid w-100" alt="blog-post-image" />
						</div>
						<div class="single-post-content ck-content">
							<?= $postmeta['pm_content']; ?>
						</div>

						<!-- <div class="reply mt-5 pt-5" id="reply">
							<h3 class="post-content-title py-3">Leave a reply</h3>
							<form action="#" method="POST">
								<div class="form-group reply">
									<textarea class="form-control" placeholder="Your Message" id="exampleFormControlTextarea1" rows="4"></textarea>
									<div class="text-right">
										<button class="btn btn-primary btn-reply mt-3" type="submit">Submit</button>
									</div>
								</div>
							</form>
						</div> -->


					</div>
				</div>
				<div class="col-md-4 left-text-9 mt-md-5 mt-5 pl-md-4">
					<div class="blog-search">
						<form action="<?= site_url('blog-search') ?>" method="post" class="d-flex search-form">
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


<section class="w3l-about6 py-5">
	<div class="container py-md-3 text-center">
		<div class="heading text-center mx-auto">
			<h3 class="head">Know the air in locations that matter to you</h3>
			<p class="my-3 head">Download the AirQo app</p>
		</div>
		<div class="buttons mt-4">
			<a href=<?= APPLE_APP_LINK; ?> class="btn mr-2">
				<img src="<?= base_url(); ?>assets/images/download2.png" width="200" class="img-fluid">
			</a>
			<a href=<?= ANDROID_APP_LINK; ?> class="btn mr-2">
				<img src="<?= base_url(); ?>assets/images/download1.png" style="height: 62px !important;" width="200" class="img-fluid">
			</a>
			
		</div>
	</div>
</section>

<div class="display-ad" style="margin: 8px auto; display: block; text-align:center;">

</div>