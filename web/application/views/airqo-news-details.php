<!--buzen-logo-->
<div class="buzen-logo" id="buzen-logo">
	<div class="container">
		<div class="row">
			<div class="col-sm-12 col-md-12 col-lg-12">
				<form method="POST" action="#">
					<input type="text" id="search-value" name="search" class="form-control" placeholder="Your town, City, District..." required>
					<button class="btn btn-default pull-right" name="submit"> <i class="fa fa-search"></i> </button>
				</form>
				<br>
				<div class="hide" id="search-results">
					
				</div>
			</div>
		</div>
	</div>
</div>
<!--buzen-logo-->

<div class="buzen-header">
	<div class="container">
		<div class="row">
			<p class="top-header"> <b><?= $news['news_title']; ?> </b></p>
		</div>
	</div>
</div>
<div class="buzen-current-projects details all-projects">
	<div class="container">
		<div class="project-big-tile">
			<div class="myrow">
				<div class="row row-centered">
					<div class="col-md-12">
						<div class="image-section">
							<img src="<?= base_url(); ?>assets/images/news/<?= $news['news_image']; ?>" width="100%" style="object-fit: cover;" height="350px">
						</div>
						<div class="text-section" align="justify">
							<br />
							<?= $news['news_content']; ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<p>&nbsp;</p>
		<p>&nbsp;</p>
	</div>
</div>