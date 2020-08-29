<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">

		<div class="page-bar">
			<ul class="page-breadcrumb">
				<li>
					<i class="fa fa-dashboard (alias)"></i>
					<a href="#">Dashboard</a>
					<i class="fa fa-angle-right"></i>
					<a href="#">Statisticts</a>
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
						<!-- <div class="caption"> -->
						<table class="table table-bordered table-stripped" id="sample_2">
							<thead>
								<tr>
									<th>NO</th>
									<th>USER</th>
									<th>IP ADDRESS</th>
									<th>LAST LOG IN</th>
									<th>USER BROWSER</th>

								</tr>
							</thead>
							<tbody>
								<?php
								$i = 0;
								foreach ($logins as $row) {
									if ($row['login_userAgent'] == 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0') {
										$broswer = 'Mozilla Firefox';
									} else {
										$broswer = 'Google Chrome';
									}
									$i++;
									?>
									<tr>
										<td><?php echo $i ?></td>
										<td><?php echo $row['login_user']; ?></td>
										<td><?php echo $row['login_ipAddress']; ?></td>
										<td><?php echo $row['login_date']; ?></td>
										<td><?php echo $broswer; ?></td>
									</tr>
									<?php
								}
								?>
							</tbody>
						</table>

						<!-- </div> -->
					</div>
				</div>

			</div>
		</div>
	</div><!-- END PAGE CONTENT-->
</div>

<!-- END CONTENT -->

<!-- END CONTAINER -->

<!-- BEGIN FOOTER -->
<div class="page-footer">
	<div class="page-footer-inner">
		<?= date('Y'); ?> &copy; AirQo; All Rights Reserved.
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
<script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/jquery-migrate.min.js" type="text/javascript"></script>
<!-- IMPORTANT! Load jquery-ui.min.js before bootstrap.min.js to fix bootstrap tooltip conflict with jquery ui tooltip -->
<script src="<?= base_url(); ?>assets/global/plugins/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
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
<!-- <script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script> -->
<script src="<?= base_url(); ?>assets/gn/js/cropping/cropper.min.js"></script>


<script type="text/javascript">
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
						// "sExtends": "pdf",
						// "sButtonText": "PDF"
						// }, {
						// "sExtends": "csv",
						// "sButtonText": "CSV"
						// }, {
						// "sExtends": "xls",
						// "sButtonText": "Excel"
						// },
						{
							"sExtends": "print",
							"sButtonText": "Print",
							"sInfo": 'Please press "CTRL+P" to print or "ESC" to quit',
							"sMessage": "Generated by DataTables"
						},
						// {
						// "sExtends": "copy",
						// "sButtonText": "Copy"
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