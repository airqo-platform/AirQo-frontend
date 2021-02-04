<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">

		<div class="modal fade DeletePost" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Delete Post
							</div>
							<div class="tools">
								<a href="javascript:;" data-dismiss="modal">
									<i class="fa fa-close"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="modal-body">
						<div id="c_message"></div>
						<table class="table table-bordered table-stripped">
							<tr>
								<th class="text-center">Are you sure you want to delete post?</th>
							</tr>
							<tr>
								<th class="text-center"><input type="hidden" id="deleteID" /></th>
							</tr>
						</table>
					</div>
					<div class="modal-footer">
						<button type="button" id="btndeletepost" class="btn btn-default btn-danger">Delete</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<div class="modal fade DisablePost" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Disable Post
							</div>
							<div class="tools">
								<a href="javascript:;" data-dismiss="modal">
									<i class="fa fa-close"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="modal-body">
						<div id="s_message"></div>
						<table class="table table-bordered table-stripped">
							<tr>
								<th class="text-center">Are you sure you want to disable post?</th>
							</tr>
							<tr>
								<th class="text-center"><input type="hidden" id="suspendID" /></th>
							</tr>
						</table>
					</div>
					<div class="modal-footer">
						<button type="button" id="btndisablepost" class="btn btn-default btn-danger">Disable</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<div class="modal fade PublishPost" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Publish Post
							</div>
							<div class="tools">
								<a href="javascript:;" data-dismiss="modal">
									<i class="fa fa-close"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="modal-body">
						<div id="a_message"></div>
						<table class="table table-bordered table-stripped">
							<tr>
								<th class="text-center">Are you sure you want to publish post?</th>
							</tr>
							<tr>
								<th class="text-center"><input type="hidden" id="publishID" /></th>
							</tr>
						</table>
					</div>
					<div class="modal-footer">
						<button type="button" id="btnpublishpost" class="btn btn-default btn-danger">Publish</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<!-- BEGIN PAGE HEADER-->
		<h3 class="page-title">
			Posts <small>All Post</small>
		</h3>
		<div class="page-bar">
			<ul class="page-breadcrumb">
				<li>
					<i class="fa fa-home"></i>
					<a href="#">Home</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#">Post</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#">All Post</a>
				</li>
			</ul>
		</div>
		<!-- END PAGE HEADER-->
		<!-- BEGIN PAGE CONTENT-->
		<div class="row">
			<div class="col-md-12">
				<!-- BEGIN EXAMPLE TABLE PORTLET-->
				<div class="portlet box blue">
					<div class="portlet-title">
						<div class="caption">
							<i class="fa fa-users"></i>Posts
						</div>
						<div class="tools">
							<a href="javascript:;" class="reload">
							</a>
							<a href="javascript:;" class="remove">
							</a>
						</div>
					</div>
					<div class="portlet-body">
						<?php

						if ($this->session->flashdata('error')) {
							echo '	<div class="alert alert-danger">
										<strong>Error!</strong> ' . $this->session->flashdata('error') . '
										</div>';
						}

						if ($this->session->flashdata('success')) {
							echo '	<div class="alert alert-success">
										<strong>Message!</strong> ' . $this->session->flashdata('success') . '
										</div>';
						}

						?>
						<table class="table table-striped table-bordered table-hover" id="sample_2">
							<thead>
								<tr>
									<th>
										Image
									</th>
									<th>
										Title
									</th>
									<th>
										Excert
									</th>
									
									<th>
										Categories
									</th>
									<th>
										Status
									</th>
									<th>
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								<?php
								foreach ($posts as $row) {
									$status     = '';
									$btnactions = '';

									if ($row['p_status'] == 'draft') {
										$status = '<button class="btn btn-xs btn-warning">Draft</button>';
										$btnactions .= '<button class="btn btn-xs btn-success btn-block" data-target=".PublishPost" data-toggle="modal" title="Publish Post" data-id="' . $row['p_id'] . '"><i class="fa fa-check"></i></button>';
									} else if ($row['p_status'] == 'published') {
										$status = '<button class="btn btn-xs btn-success">Published</button>';
										$btnactions .= '<button class="btn btn-xs btn-warning btn-block" data-target=".DisablePost" data-toggle="modal" title="Disable Post" data-id="' . $row['p_id'] . '"><i class="fa fa-pause"></i></button>';
									} else if ($row['p_status'] == 'deleted') {
										$status = '';
									} else if ($row['p_status'] == 'disabled') {
										$status = '<button class="btn btn-xs btn-danger">Disabled</button>';
										$btnactions .= '<button class="btn btn-xs btn-success btn-block" data-target=".PublishPost" data-toggle="modal" title="Publish Post" data-id="' . $row['p_id'] . '"><i class="fa fa-check"></i></button>';
									}

									$catss = explode(',', $row['p_categories']);
									$cc = '';
									foreach ($catss as $cat) {
										$c = $this->CategoryModel->get_category($cat);
										$cc .= $c['c_name'] . ',';
									}
									$cc = substr_replace($cc, ' ', -1);
									?>
									<tr>
										<td>
											<img src="<?= $row['p_img']; ?>" width="100" class="thumbnail" alt="">
										</td>
										<td>
											<?= $row['p_title']; ?>
										</td>
										<td>
											<p style="height: 9.8em; overflow: hidden;"><?= $row['p_excert']; ?></p>
										</td>
										<td>
											<?= $cc; ?>
										</td>
										<td>
											<?= $status; ?>
										</td>
										<td>
											<a href="<?= site_url('a-edit-post/' . $row['p_id']); ?>" class="btn btn-xs btn-primary btn-block"> <i class="fa fa-edit"></i> </a>
											<button class="btn btn-xs btn-danger btn-block" data-target=".DeletePost" data-toggle="modal" title="Delete Post" data-id="<?= $row['p_id']; ?>"><i class="fa fa-trash"></i></button>
											<?= $btnactions; ?>
                                            <a class="btn btn-xs btn-block btn-primary" href="<?= site_url('blog-post-preview/' . $row['p_slug']); ?>">Preview</a>
										</td>
									</tr>
								<?php
								}
								?>
							</tbody>
						</table>
					</div>
				</div>
				<!-- END EXAMPLE TABLE PORTLET-->
			</div>
		</div>
		<!-- END PAGE CONTENT-->
	</div>
</div>
<!-- END CONTENT -->
</div>
<!-- END CONTAINER -->
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
<script src="<?= base_url(); ?>assets/global/plugins/respond.min.js"></script>
<script src="<?= base_url(); ?>assets/global/plugins/excanvas.min.js"></script> 
<![endif]-->
<script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery-migrate.min.js" type="text/javascript"></script>
<!-- IMPORTANT! Load jquery-ui.min.js before bootstrap.min.js to fix bootstrap tooltip conflict with jquery ui tooltip -->
<script src="<?= base_url(); ?>assets/global/plugins/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery-slimscroll/jquery.slimscroll.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery.blockui.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery.cokie.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/uniform/jquery.uniform.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js" type="text/javascript"></script>
<!-- END CORE PLUGINS -->
<!-- BEGIN PAGE LEVEL PLUGINS -->
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/select2/select2.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/media/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/TableTools/js/dataTables.tableTools.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/ColReorder/js/dataTables.colReorder.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/Scroller/js/dataTables.scroller.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js"></script>
<!-- END PAGE LEVEL PLUGINS -->
<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script>
<script type="text/javascript">
	$(document).ready(function() {
		//Cancel sale
		$('.DeletePost').on('show.bs.modal', function(e) {

			var id = $(e.relatedTarget).data('id');
			$('#deleteID').val(id);
			// alert(id);
		});

		$('#btndeletepost').click(function() {
			var id = $('#deleteID').val();
			$.ajax({
				type: 'post',
				url: '<?= site_url("post/deletepost"); ?>',
				data: {
					delete_id: id
				},
				dataType: 'json',
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(data) {
					var success = data.success;
					if (success == 1) {
						$('#c_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
						var delay = 1000;
						setTimeout(function() {
							document.location = "<?= current_url(); ?>";
						}, delay);
						// $.LoadingOverlay("hide");
					} else {
						$('#c_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
						// $.LoadingOverlay("hide");
					}
				}
			});
		});


		$('.DisablePost').on('show.bs.modal', function(e) {

			var id = $(e.relatedTarget).data('id');
			$('#suspendID').val(id);
			// alert(id);
		});

		$('#btndisablepost').click(function() {
			var id = $('#suspendID').val();
			$.ajax({
				type: 'post',
				url: '<?= site_url("post/disablepost"); ?>',
				data: {
					post_id: id
				},
				dataType: 'json',
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(data) {
					var success = data.success;
					if (success == 1) {
						$('#s_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
						var delay = 1000;
						setTimeout(function() {
							document.location = "<?= current_url(); ?>";
						}, delay);
						// $.LoadingOverlay("hide");
					} else {
						$('#s_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
						// $.LoadingOverlay("hide");
					}
				}
			});
		});

		$('#btnpublishpost').click(function() {
			var id = $('#publishID').val();
			$.ajax({
				type: 'post',
				url: '<?= site_url("post/publishpost"); ?>',
				data: {
					post_id: id
				},
				dataType: 'json',
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(data) {
					var success = data.success;
					if (success == 1) {
						$('#a_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
						var delay = 1000;
						setTimeout(function() {
							document.location = "<?= current_url(); ?>";
						}, delay);
						// $.LoadingOverlay("hide");
					} else {
						$('#a_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
						// $.LoadingOverlay("hide");
					}
				}
			});
		});

		$('.PublishPost').on('show.bs.modal', function(e) {

			var id = $(e.relatedTarget).data('id');
			$('#publishID').val(id);
			// alert(id);
		});
	});
</script>
<script>
	jQuery(document).ready(function() {
		Metronic.init(); // init metronic core components
		Layout.init(); // init current layout
		QuickSidebar.init(); // init quick sidebar
		Demo.init(); // init demo features
		TableAdvanced.init();
	});
</script>
</body>
<!-- END BODY -->

</html>