<br/>
<br/>
<div class="w3l-index-block1">
	<div class="content py-5">
		<div class="container">
			<div class="row align-items-center py-md-5 py-3">
				<div class="col-md-12 content-left pt-md-0 pt-5">
					<h1>Frequently Asked Questions</h1>
					<p class="mt-0 mb-md-0 mb-0">
						Here are some of the frequently asked questions about AirQo and air quality index.
					</p>
				</div>
			</div>
			<div class="clear"></div>
		</div>
	</div>
</div>


<section class="w3l-index-block2 py-0">
	<div class="container py-md-0">
		<div class="mx-auto">
			<div class="list-group">
			<?php
			$i = 0;
			foreach ($faqs as $row) {
				?>
					<div class="flex-wrapper list-group-item ">
						<div class="w-100 darker">
						    <label for=<?= "checkBtn-".$i; ?>>
                                <h5><span class="c-pointer"><?= $row['faq_title']; ?></span></h5>
							</label>
						</div>
						<input type="checkbox" id=<?= "checkBtn-".$i; ?> class="dd-input"></input>
						<p class="dd-answer"><?= $row['faq_content']; ?></p>
						<small class="text-muted"></small>
					</div>
			<?php $i++;} ?>
			</div>
		</div>
	</div>
</section>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

<?php
	echo $modal1;
?>