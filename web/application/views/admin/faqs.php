<!-- BEGIN CONTENT -->

<div class="page-content-wrapper">
	<div class="page-content">
	<!-- BEGIN SAMPLE PORTLET CONFIGURATION MODAL FORM-->
		<div class="modal fade" id="portlet-config" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title"></h4>
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
		if($this->session->flashdata('error'))
		{
			echo '<div class="alert alert-danger">
			<button class="close" data-close="alert"></button><span>'.$this->session->flashdata('error').'</span></div>';
		}
		if($this->session->flashdata('msg'))
		{
			echo '<div class="alert alert-success">
			<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>'.$this->session->flashdata('msg').'</span></div>';
		}
		?>
		<script type="text/javascript">
			  setTimeout(function() {
				  $('.alert').fadeOut('fast');
			  }, 5000); // <-- time in milliseconds
		</script>
	<div class="row">
		<div class="col-md-12">

			<div class="portlet">
				<div class="portlet-title">
					<div class="caption">

					</div>
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
				</div>
				<style type="text/css">

					.kaboom .add .btn{
						border-radius: 0px !important;
						width: 120px;
					}
					.kaboom #actionbtn1{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
					}
					.kaboom #actionbtn2{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
					}
					.kaboom .actionbtn3{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
					}
					.kaboom .add{
						text-align: right;
						font-size: 12px;
					}
					.kaboom .pro{
				     text-align: center;

					}
					.kaboom .pro .btn{
				     width: 200px;

					}
					.btn-default {
						    color: #fff;
						    background-color: #006400;
						    border-color: #ccc;
						}
						.shwimg{
              	width: 100%;
              	height: 500px;
              }
              .modal-title {
	    				text-align: center;
						}
						.modal-dialog {
						width: 64.5%;
						margin: 44px auto;
					}
				</style>

				<div class="BuzenHomepage">
					<div class="kaboom">

						<div id="info">
						    <br/>
							<table class="table table-responsive table-bordered" width="100%" id="sample_2">
									<thead>
										<tr>
											<th>No. </th>
											<th>Title </th>
                      <th>Content</th>
											<th>Date</th>
										</tr>
									</thead>
									<tbody>
										<?php
										  $faq = $this->AdminModel->get_user_faqs();
										$i = 0;
											foreach($faq as $row)
											{
												$i++;
										?>
											<tr>
											<td><?php echo $i ?></td>
											<td><?php echo $row['faq_title'];?></td>
											<td><?php echo $row['faq_content'];?></td>
											<td><?php echo $row['faq_date'];?></td>
											
										<?php
										  }
										?>
								</tbody>
							</table>
						</div>
            <!-- The Modal for the image -->
						<div class="modal fade modal1" id="myModal1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
							<div class="modal-dialog">
								<div class="modal-content">
									<div class="modal-header">
										<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
										<h4 class="modal-title"></h4>
									</div>
									<div class="modal-body">
										<img class="shwimg" >
									</div>
								</div>
							</div>
						</div>
					<!-- </div> -->
				</div>
			</div>
		</div>
	</div>
</div>
<!-- END PAGE CONTENT-->
</div>
</div>
	<!-- END CONTENT -->

<!-- END CONTAINER -->

<!-- THE EDIT MODAL -->

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
<script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
<!-- <script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script> -->
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


<script type="text/javascript">
	// IMAGE POPUP
	$('.img_zero').click(function(){
			var modal 		= $('#myModal1');
			$('.shwimg').attr('src', this.src);
				$('.modal-title').html(this.alt);
				modal.modal();
		});
	</script>


<script>
	var TableAdvanced = function () {
    var initTable2 = function () {
        var table = $('#sample_2');
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
        init: function () {

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
