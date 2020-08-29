	<!-- BEGIN CONTENT -->
	<script src="https://maps.googleapis.com/maps/api/js?key=<API_KEY>&libraries=places"></script> <!-- you use ur map api key -->
	<div class="page-content-wrapper">
		<div class="page-content">
			<div class="modal fade create-node" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="portlet box blue">
							<div class="portlet-title">
								<div class="caption">
									<i class="fa fa-plus"></i>Create Node
								</div>
								<div class="tools">
									<a href="javascript:;" data-dismiss="modal">
										<i class="fa fa-close"></i>
									</a>
								</div>
							</div>
						</div>
						<div class="modal-body">
						<div id="create-message"></div>
						<form method="post" id="createNodeForm" enctype="multipart/form-data">
							<table class="table table-bordered table-stripped">
								<tr>
									<th>ID</th>
									<td><input type="text" name="an_channel_id" class="form-control " placeholder="Node ID" required /></td>
								</tr>
								<tr>
									<th>Name</th>
									<td><input type="text" name="an_name" class="form-control " placeholder="Node Name" required /></td>
								</tr>
								<tr>
									<th>Time(1)</th>
									<td><input type="text" name="time1" class="form-control " placeholder="Time for first reading" /></td>
								</tr>
								<tr>
									<th>Reading(1)</th>
									<td><input type="text" name="reading1" class="form-control " placeholder="First Reading" /></td>
								</tr>
								<tr>
									<th>Time(2)</th>
									<td><input type="text" name="time2" class="form-control " placeholder="Time for second reading" /></td>
								</tr>
								<tr>
									<th>Reading(2)</th>
									<td><input type="text" name="reading2" class="form-control " placeholder="Second Reading" /></td>
								</tr>
								<tr>
									<th>Time(3)</th>
									<td><input type="text" name="time3" class="form-control " placeholder="Time for third reading" /></td>
								</tr>
								<tr>
									<th>Reading(3)</th>
									<td><input type="text" name="reading3" class="form-control " placeholder="Third Reading" /></td>
								</tr>
								<tr>
									<th>Location</th>
									<td>
										<input type="text" name="an_map_address" id="map_address" class="form-control" placeholder="Type in your address" style="width: 100%; resize: none;" />
										<input type="hidden" class="form-control" id="lat" name="an_lat" value="" />
										<input type="hidden" class="form-control" id="lon" name="an_lng" value="" />
										<div id="map_location" style=" width: 100%; height: 300px; border: 1px solid gray;"></div>
										<script>
											var latt;
											var lngg;

											$('#map_location').locationpicker({
												location: {
													latitude: 0.344652,
													longitude: 32.571466999999984,

												},
												zoom: 14,
												radius: 300,
												inputBinding: {
													latitudeInput: $('#lat'),
													longitudeInput: $('#lon'),
													radiusInput: $('#radius'),
													locationNameInput: $('#map_address')
												},
												enableAutocomplete: true,
												onchanged: function(currentLocation, radius, isMarkerDropped) {
													latt = currentLocation.latitude;
													lngg = currentLocation.longitude;
													// $('#lat').val(latt);
													// $('#lon').val(lngg);
													

													// alert("Lat: " + currentLocation.latitude + ", Long: " + currentLocation.longitude);
												}
											});
										</script>
									</td>
								</tr>
							</table>
						</div>
						<div class="modal-footer">
							<button type="submit" class="btn btn-default btn-primary">Create</button>
							<button type="button" class="btn default" data-dismiss="modal">Close</button>
						</div>
						</form>
					</div>
					<!-- /.modal-content -->
				</div>
				<!-- /.modal-dialog -->
			</div>

			<div class="modal fade edit-node" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="portlet box blue">
							<div class="portlet-title">
								<div class="caption">
									<i class="fa fa-plus"></i>Edit Node
								</div>
								<div class="tools">
									<a href="javascript:;" data-dismiss="modal">
										<i class="fa fa-close"></i>
									</a>
								</div>
							</div>
						</div>
						<div class="modal-body">
						<div id="edit-message"></div>
						<form method="post" id="editNodeForm" enctype="multipart/form-data">
							<input type="hidden" id="ean_id" name="an_id" />
							<table class="table table-bordered table-stripped">
								<tr>
									<th>ID</th>
									<td><input type="text" id="an_channel_id" name="an_channel_id" class="form-control " placeholder="Node ID" required /></td>
								</tr>
								<tr>
									<th>Name</th>
									<td><input type="text" id="an_name" name="an_name" class="form-control " placeholder="Node Name" required /></td>
								</tr>
								<tr>
									<th>Time(1)</th>
									<td><input type="text" id="time1" name="time1" class="form-control " placeholder="Time for first reading" /></td>
								</tr>
								<tr>
									<th>Reading(1)</th>
									<td><input type="text" id="reading1" name="reading1" class="form-control " placeholder="First Reading" /></td>
								</tr>
								<tr>
									<th>Time(2)</th>
									<td><input type="text" id="time2" name="time2" class="form-control " placeholder="Time for second reading" /></td>
								</tr>
								<tr>
									<th>Reading(2)</th>
									<td><input type="text" id="reading2" name="reading2" class="form-control " placeholder="Second Reading" /></td>
								</tr>
								<tr>
									<th>Time(3)</th>
									<td><input type="text" id="time3" name="time3" class="form-control " placeholder="Time for third reading" /></td>
								</tr>
								<tr>
									<th>Reading(3)</th>
									<td><input type="text" id="reading3" name="reading3" class="form-control " placeholder="Third Reading" /></td>
								</tr>
								<tr>
									<th>Location</th>
									<td>
										<input type="text" name="an_map_address" id="emap_address" class="form-control" placeholder="Type in your address" style="width: 100%; resize: none;" />
										<input type="hidden" class="form-control" id="elat" name="an_lat" value="" />
										<input type="hidden" class="form-control" id="elon" name="an_lng" value="" />
										<div id="emap_location" style=" width: 100%; height: 300px; border: 1px solid gray;"></div>
										<script>
											var latt;
											var lngg;

											$('#emap_location').locationpicker({
												location: {
													latitude: 0.344652,
													longitude: 32.571466999999984
												},
												zoom: 14,
												radius: 300,
												inputBinding: {
													latitudeInput: $('#elat'),
													longitudeInput: $('#elon'),
													radiusInput: $('#eradius'),
													locationNameInput: $('#emap_address')
												},
												enableAutocomplete: true,
												onchanged: function(currentLocation, radius, isMarkerDropped) {
													latt = currentLocation.latitude;
													lngg = currentLocation.longitude;
												}
											});
										</script>
									</td>
								</tr>
							</table>
						</div>
						<div class="modal-footer">
							<button type="submit" class="btn btn-default btn-primary">Save</button>
							<button type="button" class="btn default" data-dismiss="modal">Close</button>
						</div>
						</form>
					</div>
					<!-- /.modal-content -->
				</div>
				<!-- /.modal-dialog -->
			</div>

			<div class="modal fade deactivateNode" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="portlet box blue">
							<div class="portlet-title">
								<div class="caption">
									<i class="fa fa-plus"></i>Deactivate Node
								</div>
								<div class="tools">
									<a href="javascript:;" data-dismiss="modal">
										<i class="fa fa-close"></i>
									</a>
								</div>
							</div>
						</div>
						<div class="modal-body">
							<div id="dd_message"></div>
							<input type="hidden" id="deactivateID" />
							<table class="table table-bordered table-stripped">
								<tr>
									<th class="text-center">Are you sure you want to deactivate node?</th>
								</tr>

							</table>
						</div>
						<div class="modal-footer">
							<button type="button" id="btndeactivatenode" class="btn btn-default btn-primary">Deactivate</button>
							<button type="button" class="btn default" data-dismiss="modal">Close</button>
						</div>
					</div>
					<!-- /.modal-content -->
				</div>
				<!-- /.modal-dialog -->
			</div>

			<div class="modal fade activateNode" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="portlet box blue">
							<div class="portlet-title">
								<div class="caption">
									<i class="fa fa-plus"></i>Activate Node
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
							<input type="hidden" id="activateID" />
							<table class="table table-bordered table-stripped">
								<tr>
									<th class="text-center">Are you sure you want to activate node?</th>
								</tr>
							</table>
						</div>
						<div class="modal-footer">
							<button type="button" id="btnactivatenode" class="btn btn-default btn-primary">Activate</button>
							<button type="button" class="btn default" data-dismiss="modal">Close</button>
						</div>
					</div>
					<!-- /.modal-content -->
				</div>
				<!-- /.modal-dialog -->
			</div>

			<!-- END SAMPLE PORTLET CONFIGURATION MODAL FORM-->
			<div class="page-bar">
				<ul class="page-breadcrumb">
					<li>
						<i class="fa fa-dashboard (alias)"></i>
						<a href="#">Dashboard</a>
						<i class="fa fa-angle-right"></i>
					</li>
					<li>
						<a href="#"><?= $title; ?></a>
					</li>
				</ul>
			</div>
			<!-- BEGIN PAGE CONTENT-->
			<div class="row">
				<div class="col-md-12">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-globe"></i><?= $title; ?>
							</div>
							<div class="tools">
								<a href="javascript:;" class="reload">
								</a>
								<a href="javascript:;" class="remove">
								</a>
							</div>
						</div>
						<div class="portlet-body">
							<button data-target=".create-node" data-toggle="modal" class="btn btn-primary">
								Create
							</button>
							<?php
							if ($this->session->flashdata('error')) {


								echo '<div class="alert alert-danger">
									<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('error') . '</span></div>';
							}
							if ($this->session->flashdata('msg')) {


								echo '<div class="alert alert-success">
									<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>' . $this->session->flashdata('msg') . '</span></div>';
							}
							if ($this->session->flashdata('error_id')) {


								echo '<div class="alert alert-warning">
									<button class="close" data-close="alert"></button>
									<span> <i class="fa fa-warning (alias)"></i>' . $this->session->flashdata('error_id') . '</span></div>';
							}
							?>
							<table class="table table-stripped table-bordered" id="sample_2">
								<thead>
									<tr>
										<th>
											No. 
										</th>
										<th>
											Channel ID 
										</th>
										<th>
											Name 
										</th>
										<th>
											Location
										</th>
										<th>
											Reading
										</th>
										<th>
											Time
										</th>
										<th>
											Date Added
										</th>
										<th>
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									<?php
									$nodes       = $this->AdminModel->list_nodes();
									$i = 0;

									foreach ($nodes as $row) {
										$activebtn = '';
										if ($row['an_active'] == 1) {
											//deactivate
											$activebtn = '<button data-id="' . $row['an_id'] . '" class="btn btn-xs btn-block btn-default" data-toggle="modal" data-target=".deactivateNode">Deactivate</button>';
										} else {
											//reactivate
											$activebtn = '<button data-id="' . $row['an_id'] . '" class="btn btn-xs btn-block btn-success activate-btn" data-toggle="modal" data-target=".activateNode">Activate</button>';
										}
										$i++;
										?>
										<tr>
											<td><?= $i; ?></td>
											<td><?= $row['an_channel_id']; ?></td>
											<td><?= $row['an_name']; ?></td>
											<td><?= $row['an_map_address']; ?></td>
											<td><?= $row['reading1']; ?></td>
											<td><?= $row['time1']; ?></td>
											<td>
												<p><?= date("F j, Y", strtotime($row['an_dateAdded'])); ?></p>
											</td>
											<td>
												<a href="<?= site_url('admin/appnodedetails/' . $row['an_id']); ?>" class="btn btn-xs btn-block btn-primary"> View </a>
												<?= $activebtn; ?>
												<a class="btn btn-xs btn-block btn-warning btn-edit-node" data-id="<?= $row['an_id']; ?>" data-toggle="modal" data-target=".edit-node">Edit</a>
												<button data-id="<?= $row['an_id']; ?>" class="btn btn-xs btn-block btn-danger delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
											</td>
										</tr>
										<?php
									}
									?>
								</tbody>
							</table>
						</div>
					</div> <!-- portlet -->
				</div>
			</div>
		</div>
	</div>


	<!-- BEGIN FOOTER -->
	<div class="page-footer">
		<div class="page-footer-inner">
			<?= date('Y'); ?> © AIRQO. All Rights Reserved!
		</div>
		<div class="scroll-to-top">
			<i class="icon-arrow-up"></i>
		</div>
	</div>

	<!-- AUTO HIDE SCRIPT -->
	<script src="<?php echo base_url(); ?>assets/js/jquery-1.11.1.min.js"></script>
	<!-- END FOOTER -->
	<!-- BEGIN JAVASCRIPTS(Load javascripts at bottom, this will reduce page load time) -->
	<!-- BEGIN CORE PLUGINS -->
	<!--[if lt IE 9]>
<script src="../../assets/global/plugins/respond.min.js"></script>
<script src="../../assets/global/plugins/excanvas.min.js"></script>
<![endif]-->
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
	<!-- END PAGE LEVEL SCRIPTS -->
	<!-- BEGIN PAGE LEVEL PLUGINS -->
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/select2/select2.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/media/js/jquery.dataTables.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/TableTools/js/dataTables.tableTools.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/ColReorder/js/dataTables.colReorder.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/Scroller/js/dataTables.scroller.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js"></script>
	<!-- END PAGE LEVEL SCRIPTS -->
	<script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script>
	<script src="<?= base_url(); ?>assets/gn/js/cropping/cropper.min.js"></script>



	<!-- script for modal image -->
	<script type="text/javascript">
		$('[data-toggle=confirmation]').confirmation({
			rootSelector: '[data-toggle=confirmation]',
			// other options
		});
		
		$(document).on("submit", "#createNodeForm", function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('admin/createappnode'); ?>",
				data: new FormData(this),
				contentType : false,
				processData : false,
				cache: false,
				async: false,
				dataType    : "json",
				beforeSend  : function(){
					// $.LoadingOverlay("show");
				},
				success     : function (response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if(success == 1){
						$('#create-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function(){
							$('#create-message').html('');
							document.location = '<?= current_url(); ?>';
						}, 2000);
					} else { 
						//unable to sign up
						$('#create-message').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
					}
				}
			});
		});
		
		// editNodeForm
		$(document).on("submit", "#editNodeForm", function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('admin/editappnodes'); ?>",
				data: new FormData(this),
				contentType : false,
				processData : false,
				cache: false,
				async: false,
				dataType    : "json",
				beforeSend  : function(){
					// $.LoadingOverlay("show");
				},
				success     : function (response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if(success == 1){
						$('#edit-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function(){
							$('#edit-message').html('');
							document.location = '<?= current_url(); ?>';
						}, 2000);
					} else { 
						//unable to sign up
						$('#edit-message').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
					}
				}
			});
		});

		$(document).ready(function() {
			$('.deactivateNode').on('show.bs.modal', function(e) {
				var id = $(e.relatedTarget).data('id');
				$('#deactivateID').val(id);
			});

			$('.activateNode').on('show.bs.modal', function(e) {

				var id = $(e.relatedTarget).data('id');
				$('#activateID').val(id);
			});

			$('#btndeactivatenode').click(function() {
				var id = $('#deactivateID').val();
				$.ajax({
					type: 'post',
					url: '<?= site_url("admin/deactivatenode"); ?>',
					data: {
						ap_id: id
					},
					dataType: 'json',
					beforeSend: function() {
						// $.LoadingOverlay("show");
					},
					success: function(data) {
						var success = data.success;
						if (success == 1) {
							$('#dd_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
							var delay = 1000;
							setTimeout(function() {
								document.location = "<?= current_url(); ?>";
							}, delay);
							// $.LoadingOverlay("hide");
						} else {
							$('#dd_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
							// $.LoadingOverlay("hide");
						}
					}
				});
			});

			$('#btnactivatenode').click(function() {
				var id = $('#activateID').val();
				$.ajax({
					type: 'post',
					url: '<?= site_url("admin/activatenode"); ?>',
					data: {
						ap_id: id
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

			$('.delete-btn').on('confirmed.bs.confirmation', function() {

				var id = $(this).data('id');

				$.ajax({
					type: 'post',
					url: '<?= site_url("admin/deleteappnode"); ?>',
					data: {
						an_id: id
					},
					success: function(data) {
						if (data == 1) {
							window.location = "<?= current_url(); ?>";
						} else {
							window.location = "<?= current_url(); ?>";
						}
					},
					error: function(error) {
						console.log(error);
					}

				});
			});

			$('.img_zero').click(function() {
				var modal = $('#myModal1');
				$('.shwimg').attr('src', this.src);
				$('.modal-title').html(this.alt);
				modal.modal();
			});

			$(document).on("click", ".btn-edit-node", function() {
				var id = $(this).data('id');
				// alert(id);
				$.ajax({
					type: 'post',
					url: '<?= site_url("Admin/editAppNodesDetails"); ?>',
					data: {
						an_id: id
					},
					cache: false,
					dataType: 'json',
					beforeSend: function() {},
					success: function(data) {
						$('#ean_id').val(data.an_id);
						$('#an_channel_id').val(data.an_channel_id);
						$('#an_name').val(data.a_name);
						$('#time1').val(data.a_time1);
						$('#time2').val(data.a_time2);
						$('#time3').val(data.a_time3);
						$('#reading1').val(data.a_reading1);
						$('#reading2').val(data.a_reading2);
						$('#reading3').val(data.a_reading3);
						$('#emap_address').val(data.a_location);
						$('#elat').val(data.a_lat);
						$('#elng').val(data.a_lng);
					}
				});
			});

		});
	</script>

	<!-- DATA TABLES -->
	<script>
		var TableAdvanced = function() {


			var initTable2 = function() {
				var table = $('#sample_2');

				/* Table tools samples: https://www.datatables.net/release-datatables/extras/TableTools/ */

				/* Set tabletools buttons and button container */

				$.extend(true, $.fn.DataTable.TableTools.classes, {
					"container": "btn-group tabletools-btn-group pull-right",
					"buttons": {
						"normal": "btn btn-sm default",
						"disabled": "btn btn-sm default disabled"
					}
				});

				var oTable = table.dataTable({

					// Internationalisation. For more info refer to http://datatables.net/manual/i18n
					"language": {
						"aria": {
							"sortAscending": ": activate to sort column ascending",
							"sortDescending": ": activate to sort column descending"
						},
						"emptyTable": "No data available in table",
						"info": "Showing _START_ to _END_ of _TOTAL_ entries",
						"infoEmpty": "No entries found",
						"infoFiltered": "(filtered1 from _MAX_ total entries)",
						"lengthMenu": "Show _MENU_ entries",
						"search": "Search:",
						"zeroRecords": "No matching records found"
					},

					"order": [
						[0, 'asc']
					],
					"lengthMenu": [
						[5, 15, 20, -1],
						[5, 15, 20, "All"] // change per page values here
					],

					// set the initial value
					"pageLength": 10,
					"dom": "<'row' <'col-md-12'T>><'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r><'table-scrollable't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>", // horizobtal scrollable datatable

					// Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
					// setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js).
					// So when dropdowns used the scrollable div should be removed.
					//"dom": "<'row' <'col-md-12'T>><'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",

					"tableTools": {
						"sSwfPath": "../../assets/global/plugins/datatables/extensions/TableTools/swf/copy_csv_xls_pdf.swf",
						"aButtons": [
							// {
							//     "sExtends": "pdf",
							//     "sButtonText": "PDF"
							// }, {
							//     "sExtends": "csv",
							//     "sButtonText": "CSV"
							// }, {
							//     "sExtends": "xls",
							//     "sButtonText": "Excel"
							// }, {
							//     "sExtends": "print",
							//     "sButtonText": "Print",
							//     "sInfo": 'Please press "CTRL+P" to print or "ESC" to quit',
							//     "sMessage": "Generated by DataTables"
							// }, {
							//     "sExtends": "copy",
							//     "sButtonText": "Copy"
							// }
						]
					}
				});

				var tableWrapper = $('#sample_2_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
				tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
			}

			return {

				//main function to initiate the module
				init: function() {

					if (!jQuery().dataTable) {
						return;
					}

					initTable2();

				}

			};

		}();
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
	<!-- END JAVASCRIPTS -->
	</body>
	<!-- END BODY -->

	</html>