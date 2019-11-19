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
			<p class="top-header"> <b> Frequently Asked Questions </b></p>
		</div>
	</div>
</div>

	<div class="container">
		<div class="row">
			<div class="list-group">
			<?php
			$modal1 = '';
			foreach ($faqs as $row) {
				?>
				
					<a href="#" class="list-group-item list-group-item-action" data-toggle="modal" data-target=".member<?= $row['faq_id']; ?>" data-id="<?= $row['faq_id']; ?>">
						<div class="d-flex w-100 justify-content-between">
							<h5 class="mb-1"><b><?= $row['faq_title']; ?></b></h5>
							<small class="text-muted"></small>
						</div>
						<p class="mb-1"><?= substr($row['faq_content'], 0, 200); ?>...</p>
						<small class="text-muted"></small>
					</a>
					<?php $modal1 .= '<div class="modal myModal member' . $row['faq_id'] . ' fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="width:100%;">
						<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
							<span>Frequently Asked Questions</span>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span class="video-close" aria-hidden="true" >&times;</span>
							</button>
							</div>
							<div class="modal-body">
							<h3 class="text-center">' . $row['faq_title'] . '</h3>
							<p class="text-justify">' . $row['faq_content'] . '</p>
							<p>&nbsp;</p>
							<p>&nbsp;</p>
							</div>
						</div>
						</div>
					</div>';
					?>
			<?php } ?>
			</div>
		</div>
	</div>

<?= $modal1; ?>