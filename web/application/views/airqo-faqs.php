<!-- cards section -->
<div class="buzen-card-section from-top" id="buzen-card-section">
     <div class="container">
          <div class="row">

			<div class="buzen-header" style="margin-top: 15px; padding-left: 15px; padding-right: 15px;">
				<div class="buzen-header">
					<div class="row">
						<h4><b>Frequently Asked Questions</b></h4>
						<h5>Here are some of the frequently asked questions about AirQo and air quality index.</h5>
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

		</div>
	</div>
</div>