<!-- BEGIN CONTENT -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAnK2dESOs8To3A01UdU3YpRNcC7cU_MKc&libraries=places"></script>
<div class="page-content-wrapper">
<div class="page-content">
	<?php
	if ($this->session->flashdata('error')) {
		echo '<div class="alert alert-danger">
			<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('error') . '</span></div>';
	}
	if ($this->session->flashdata('msg')) {
		echo '<div class="alert alert-danger">
			<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>' . $this->session->flashdata('msg') . '</span></div>';
	}
	?>
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

	<div class="row">
		<div class="col-md-12">
			<div class="portlet box blue">
				<div class="portlet-title">
					<div class="caption">
						<i class="fa fa-globe"></i>
						<?= $nodesDetails['an_name']; ?>
					</div>
					<div class="tools">
						<a href="javascript:;" class="reload">
						</a>
						<a href="javascript:;" class="remove">
						</a>
					</div>
				</div>
				<div class="portlet-body">
					<table class="table table-stripped table-bordered">
						<tr>
							<th>Channel ID</th>
							<td><?= $nodesDetails['an_channel_id']; ?></td>
						</tr>
						<tr>
							<th>Name</th>
							<td><?= $nodesDetails['an_name']; ?></td>
						</tr>
						<tr>
							<th>Time (1)</th>
							<td><?= $nodesDetails['time1']; ?></td>
						</tr>
						<tr>
							<th>Reading (1)</th>
							<td><?= $nodesDetails['reading1']; ?></td>
						</tr>
						<tr>
							<th>Time (2)</th>
							<td><?= $nodesDetails['time2']; ?></td>
						</tr>
						<tr>
							<th>Reading (2)</th>
							<td><?= $nodesDetails['reading2']; ?></td>
						</tr>
						<tr>
							<th>Time (3)</th>
							<td><?= $nodesDetails['time3']; ?></td>
						</tr>
						<tr>
							<th>Reading (3)</th>
							<td><?= $nodesDetails['reading3']; ?></td>
						</tr>
						<tr>
							<th>Map</th>
							<td>
								<div id="map_display" style=" width: 100%; height: 400px; margin-bottom: 20px; border: 1px solid gray;"></div>
								<script>
									var latt;
									var lngg;

									$('#map_display').locationpicker({
										location: {
											latitude: <?= $nodesDetails['an_lat'] == '' ? 0.0000 : $nodesDetails['an_lat']; ?>,
											longitude: <?= $nodesDetails['an_lng'] == '' ? 0.0000 : $nodesDetails['an_lng']; ?>,
										},
										zoom: 14,
										radius: 300,
										inputBinding: {
											radiusInput: $('#radius')
										},
										enableAutocomplete: true,
										onchanged: function(currentLocation, radius, isMarkerDropped) {
											latt = currentLocation.latitude;
											lngg = currentLocation.longitude;
											$('#lat').val(latt);
											$('#lon').val(lngg);
										}
									});
								</script>
							</td>
						</tr>
					</table>
				</div>
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
<script type="text/javascript">
	$(".story_form").hide();
	$(".NewStory").click(function() {
		$(".story_form").toggle();
	});
</script>
<script type="text/javascript">
	$(".NewStory").click(function() {
		$("#info").toggle();
	});
</script>
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

	$(document).ready(function() {
		$('.delete-btn').on('confirmed.bs.confirmation', function() {
			var id = $(this).data('id');
			$.ajax({
				type: 'post',
				url: '<?= site_url("Admin/deleteAppNode"); ?>',
				data: {
					an_id: id
				},
				success: function(data) {
					// console.log(data);
					// console.log('yiki');
					if (data == '1') {
						window.location = "<?= site_url("Admin/appNodes"); ?>";
					} else {
						window.location = "<?= site_url("Admin/appNodes"); ?>";
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