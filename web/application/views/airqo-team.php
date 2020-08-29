<section class="w3l-index-block10 py-0" style="background-image: linear-gradient(to right, rgba(25, 51, 101, 0.85), rgba(0, 0, 0, 0.08)), url('<?= base_url(); ?>assets/update/images/partners-3.png'); background-size: cover; background-repeat: no-repeat;">
	<div class="new-block top-bottom">
		<div class="container">
			<div class="middle-section py-5">
				<div class="section-width">
					<h2 style="font-family:'Raleway Bold'; font-size:3em; line-height: 1em; padding-top: 1.5em;"><span style="text-decoration: underline 5px solid blue;">Meet the</span> <span style="text-decoration: underline 5px solid blue;">Team</span></h2>
				</div>
			</div>
		</div>
	</div>
</section>
<div class="w3l-index-block1">
	<div class="content py-5">
		<div class="container">
			<div class="row align-items-center py-md-5 py-3">
				<div class="col-md-12 content-left pt-md-0 pt-5">
					<p class="mt-0 mb-md-0 mb-0" style="font-size:1.5em; line-height: normal;">
						We work with an excellent pool of talent comprising Data Scientists, Software Engineers, Air Quality Scientists, Project managers, Marketing Specialists, PhD fellows, Research Scientists and other fields. These are the backbone of everything we do to provide you with the best air quality data.
					</p>
				</div>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>

<!-- cards section -->
<div class="buzen-card-section from-top" id="buzen-card-section">
	<div class="container">
		<div class="row">
			<div class="buzen-current-projects all-projects">
				<div class="container">
					<div class="project-big-tile">
						<div class="myrow">
							<div class="row row-centered">
								<?php
								$modal = '';
								foreach ($team as $row) {
								?>
									<div class="col-md-3">
										<div class="" style="padding-bottom: 2em; min-height: 420px;">
											<a href="#" data-toggle="modal" data-target=".member<?= $row['team_id']; ?>" data-id="<?= $row['team_id']; ?>"><img src="<?= $row['team_image']; ?>" class="thumbnail" width="250" height="250" style="object-fit: cover; border-radius: 50%;" alt=""></a>
											<div class="card-body">
												<h5 class="card-title"><b><?= $row['team_name']; ?></b></h5>
												<p class="card-text"><?= $row['team_title']; ?></p>
											</div>
										</div>
									</div>
									<?php $modal .= '
										<div class="modal myModal member' . $row['team_id'] . ' fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="width:100%;">
											<div class="modal-dialog" role="document">
											<div class="modal-content">
												<div class="modal-header">
												<button type="button" class="close" data-dismiss="modal" aria-label="Close">
												<span class="video-close" aria-hidden="true" >&times;</span>
												</button>
												</div>
												<div class="modal-body" style="padding:1px; border-radius:0px;">
												<div>
													<img src="' . $row['team_image'] . '" style="width:100%; height:450px; object-fit:cover; border-radius: 50%;">
												</div>
												<div class="text-section">
													<table class="table table-striped">
														<tr>
															<th>Name</th>
															<td>' . $row['team_name'] . '</td>
														</tr>
														<tr>
															<th>Title</th>
															<td>' . $row['team_title'] . '</td>
														</tr>
														<tr>
															<th>Email</th>
															<td>' . strtolower($row['team_emailAddress']) . '</td>
														</tr>
														
														<tr>
															<th>Profile Information</th>
															<td>' . $row['team_otherAddress'] . '</td>
														</tr>
													</table>
												</div>
												</div>
											</div>
											</div>
										</div>';
									?>
								<?php } ?>
							</div>
						</div>
					</div>
				</div>
			</div>
			<?= $modal; ?>

		</div>
	</div>
</div>