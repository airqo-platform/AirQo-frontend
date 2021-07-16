<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">
		<!-- BEGIN SAMPLE PORTLET CONFIGURATION MODAL FORM-->
		<div class="modal fade" id="portlet-config" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Modal title</h4>
					</div>
					<div class="modal-body">

					</div>
					<div class="modal-footer">
						<button type="button" class="btn blue">Save changes</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>
		<!-- /.modal -->
		<!-- END SAMPLE PORTLET CONFIGURATION MODAL FORM-->

		<!-- BEGIN PAGE CONTENT-->
		<?php
		if ($this->session->flashdata('error')) {
			echo '<div class="alert alert-danger">
					<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('error') . '</span></div>';
		}
		if ($this->session->flashdata('msg')) {
			echo '<div class="alert alert-success">
					<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>' . $this->session->flashdata('msg') . '</span></div>';
		}
		?>
		<div class="row">
			<div class="col-md-12">

				<div class="portlet">
					<div class="portlet-title">
						<div class="page-bar">
							<ul class="page-breadcrumb">
								<li>
									<a class="" href="#"><?= $title; ?> </a>
								</li>
								<!-- <span class="pull-right"> -->
								<li class="">
									<a href="<?php echo site_url('Admin/about'); ?>" class='btn btn-success' id="Storybtn" style="margin-left: 780px;" title="Back">
										<i class="fa fa-long-arrow-left"></i></a>
								</li>
								
								<!-- </span> -->
							</ul>
						</div>
					</div>
					
					<form name="form" method="post" action="<?php echo site_url('Admin/editAbout'); ?>" enctype="multipart/form-data">
						<input class="form-control" type="hidden" id="pg_id" name="pg_id" value="<?= $paged['pg_id']; ?>" placeholder="" />
						<div class="form-group col-md-6">
							Simple Description:
							<input type="text" name="pg_excerts" id="pg_excerts" class="form-control" value="<?= $paged['pg_excerts']; ?>" placeholder="Maximum 100 characters" required />
						</div>
						<div class="form-group col-md-6">
							Title:
							<input type="text" name="pg_title" id="a_title" value="<?= $paged['pg_title']; ?>" readonly class="form-control" placeholder="Enter title address" required />
						</div>

						<br />
						Content:
						<div class="form-group col-md-12">
							<textarea class="summernote" name="pg_content" required></textarea>
						</div>
						<br /> <br /><br /><br /><br />
						<div class="form-group pro">
							<button type="submit" class="btn btn-primary " title="Click to save changes" name="submit" id="submit"> Save Changes</button>
						</div>
						<hr style="background-color:red; height:2px;" />
					</form>
				</div>
			</div>

		</div>
	</div>
	<!-- END PAGE CONTENT-->
</div>
<!-- END CONTENT -->

<!-- BEGIN FOOTER -->
<div class="page-footer">
	<div class="page-footer-inner">
		<?= date('Y'); ?> © AIRQO. All Rights Reserved!
	</div>
	<div class="scroll-to-top">
		<i class="icon-arrow-up"></i>
	</div>
</div>
<!-- END FOOTER -->
<!-- BEGIN JAVASCRIPTS(Load javascripts at bottom, this will reduce page load time) -->
<!-- BEGIN CORE PLUGINS -->
<!--[if lt IE 9]>
<script src="../../assets/global/plugins/respond.min.js"></script>
<script src="../../assets/global/plugins/excanvas.min.js"></script>
<![endif]-->
<script src="<?php echo base_url(); ?>assets/js/jquery-1.11.1.min.js"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery-migrate.min.js" type="text/javascript"></script>
<!-- IMPORTANT! Load jquery-ui.min.js before bootstrap.min.js to fix bootstrap tooltip conflict with jquery ui tooltip -->
<script src="<?= base_url(); ?>assets/global/plugins/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/bootstrap/js/bootstrap-confirmation.min.js"></script>

<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery-slimscroll/jquery.slimscroll.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery.blockui.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery.cokie.min.js" type="text/javascript"></script>
<!-- END CORE PLUGINS -->

<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/scripts/datatable.js"></script>
<script src="<?= base_url(); ?>assets/admin/pages/scripts/ecommerce-products-edit.js"></script>
<script src="<?= base_url(); ?>assets/dist/summernote.min.js" type="text/javascript"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.15/dist/summernote.min.js"></script> -->
<!-- END PAGE LEVEL SCRIPTS -->
<!-- BEGIN PAGE LEVEL PLUGINS -->

<script type="text/javascript">
	$(document).ready(function() {
		$('.delete-btn').on('confirmed.bs.confirmation', function() {
			var id = $(this).data('id');
			$.ajax({
				type: 'post',
				url: '<?= site_url("Admin/deleteAboutInformation"); ?>',
				data: {
					pg_id: id
				},
				success: function(data) {
					// console.log(data);
					// console.log('yiki');
					if (data.success == 1) {
						window.location = "<?= site_url("Admin/about"); ?>";
					} else {
						window.location = "<?= site_url("Admin/about"); ?>";
						// console.log("Unable to delete...");
					}
				},
				error: function(error) {
					console.log(error);
				}
			});
		});
	});
</script>
<script type="text/javascript">
	$('.summernote').summernote({
		fontNames: ['Arial', 'Arial Black', 'OpenSans', 'Courier New', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Lato'],
		fontNamesIgnoreCheck: ['OpenSans'],
		toolbar: [
			['style', ['style']],
			['font', ['bold', 'underline', 'clear']],
			['fontsize', ['fontsize']],
			['fontname', ['fontname']],
			['color', ['color']],
			['para', ['ul', 'ol', 'paragraph']],
			['table', ['table']],
			['insert', ['link', 'picture', 'video']],
			['view', ['fullscreen', 'codeview', 'help']],
		],
		height: 400
	});

	$.ajax({
		type: "POST",
		url: "<?= site_url('Admin/editAboutDetails'); ?>",
		data: {
			pg_id : "<?= $paged['pg_id']; ?>"
		},
		dataType: "json",
		success: function (response) {
			$('.summernote').summernote('code', response.c_content);
		}
	});
</script>

<script>
	jQuery(document).ready(function() {
		Metronic.init(); // init metronic core components
		Layout.init(); // init current layout
		QuickSidebar.init(); // init quick sidebar
		Demo.init(); // init demo features
	});
</script>
<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->

</html>