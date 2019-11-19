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
			<p class="top-header"> <b> About us </b></p>
		</div>
	</div>
</div>

<div class="buzen-card-section" id="buzen-card-section">
     <div class="container">
		<div class="row">
			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
				<div class="text-section">
					<?= $about['pg_content']; ?>
				</div>
			</div>
		</div>
	</div>
</div>