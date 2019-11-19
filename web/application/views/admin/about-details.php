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
			<div class="row">
				<div class="col-md-12">

					<div class="portlet">
						<div class="portlet-title">
							<div class="page-bar">
								<ul class="page-breadcrumb">
									<li>
										<a class="" href="#"><?= $title;?> </a>
									</li>
								    <!-- <span class="pull-right"> -->
									 <li class="" >
										 <a href="<?php echo site_url('Admin/about');?>" class='btn btn-success' id="Storybtn"  style="margin-left: 780px;" title="Back">
										  <i class="fa fa-long-arrow-left"></i></a>
									</li>
										<?php
										foreach($aboutDetails as $row)
										{
										?>
											<li class=""> <a data-toggle="modal" data-target=".edit_contact" class="btn btn-warning" data-id="<?= $row['pg_id']; ?>" id="actionbtn2" title="Edit"><i class="fa fa-edit (alias)"></i></a></li>

											<li>
											<a title="Delete" data-id="<?php echo $row['pg_id'];?>" class="btn btn-danger actionbtn3 delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">
													<i class="fa fa-trash"></i></a>
											</li>
										<?php
										}
										?>
										<!-- </span> -->
								</ul>
						   </div>
						</div>
									<style type="text/css">
										.page-bar .btn
										{
											color: white !important;
											margin-right:;
										}

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
											margin-left: 300px;
											border-radius: 0px !important;
											width:  200px;
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
											width: 64.3%;
											margin: 48px auto;
										}
									</style>
			<div class="BuzenHomepage">
					<div class="kaboom">
						<div class="row">
							<div class="col-md-2"></div>
							<div class="col-md-8">
							 <div id="info">
					          <div class="outline">
										<?php
										foreach($aboutDetails as $row ){
										echo'
										<div class="">
										<h5 style="font-size:14px;"> <b> Title: </b> '.$row['pg_title'].'</h5>
										</div>
										<div class="">
										<h5 style="font-size:14px;"> <b> Simple Description: </b> '.$row['pg_excerts'].'</h5>
										</div>

										<div class="form-group">
										<p> <b>Content:</b> </p>
											<textarea cols="20" rows="5" id="ckeditorr" name="pg_content" placeholder=" Description">
												'.$row['pg_content'].'
											</textarea>
											<script>
											  CKEDITOR.replace("ckeditorr");
											</script>
										</div>
										<p>&nbsp;</p>
										<div class="">
												<p> <b> Date Created: </b>'.$row['pg_dateCreated'].' </p>
												<div>

												';
											if($row['pg_dateUpdated'] == null)
													{
														echo '<p> <b> Last Updated: </b> <span style="color:brown; font-weight:bolder;">Not Updated Yet.!</span> </p>';
													}
													else if($row['pg_dateUpdated'] == '0000-00-00 00:00:00')
													{
													echo '<p> <b> Last Updated: </b> <span style="color:brown; font-weight:bolder;">Not Updated Yet.!</span> </p>';	
													}
													else

													{
														echo '
														<p> <b> Last Updated: </b>'.$row['pg_dateUpdated'].' 
														    By: <span style="color:brown; font-weight:bolder;">'.$row['pg_updatedBy'].'</span>
														</p>
														';
													}
												}
												?>

								</div>
										<style type="text/css">
											.outline img{

												max-height: 250px !important;
												min-height: 250px !important;
												min-width: 250px !important;
												max-width: 250px !important;
											}
											.outline img:hover{

											}
											.outline .wal{
												margin: auto;
											}

										</style>
			</div> <!--end of the info div class-->
							
							</div> <!--end of column eight--> 
							<div class="col-md-2"></div>
						
						</div>
						
			
		            </div>


					<script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
					<script type="text/javascript">
					$(".story_form").hide();
					$(".NewStory").click(function(){$(".story_form").toggle();});
					</script>
					<script type="text/javascript">
					$(".NewStory").click(function(){$("#info").toggle();});
					</script>

				</div>
			</div>
		</div>

	</div>
</div>
<!-- END PAGE CONTENT-->
</div>
  <script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
    <script type="text/javascript">

    $(document).ready(function(){

        $('.delete-btn').on('confirmed.bs.confirmation', function(){

        var id  = $(this).data('id');

          $.ajax({
              type : 'post',
              url  : '<?= site_url("Admin/deleteAboutInformation"); ?>',
              data : {
                pg_id : id
              },
                success : function(data){
                  console.log(data);
                  console.log('yiki');
                    if(data == '1'){
                      window.location="<?= site_url("Admin/about"); ?>";
                    } else {
                    window.location="<?= site_url("Admin/about"); ?>";
                      console.log("Unable to delete...");
                    }
                },
                error: function(error){
                  console.log(error);
                }
        });
      });
    });
</script>
<!-- END CONTENT -->

<!-- THE EDIT MODAL -->
<div class="buzenAcc_edit" >
  <div class="modal fade edit_contact" id="" role="dialog"
      aria-labelledby="myModalLabel" aria-hidden="true" >
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close"
                      data-dismiss="modal" aria-hidden="true">
                         &times;
                  </button>
                  <h4 style="color: #00326f; text-align: center; margin-top: 15px;"> MAKE CHANGES</h4>

              </div>

        <div class="modal-body"> <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
          <form name="form" method="post" action="<?php echo site_url('Admin/editAbout');?>"  enctype="multipart/form-data">
            
            <input class="form-control" type="hidden" id="pg_id" name="pg_id" placeholder="" />
             <div class="form-group col-md-6">
                Simple Description:
                <input type="text" name="pg_excerts" id="pg_excerts"  class="form-control" placeholder="Maximum 100 characters" required/>
             </div>
             <div class="form-group col-md-6">
                Title:
                <input type="text" name="pg_title" id="a_title" readonly class="form-control" placeholder="Enter title address" required/>
             </div>

         <br/>
            Content:
            <div class="form-group col-md-12">
              <textarea cols="10" rows="2" id="ckeditor1" name="pg_content" required></textarea>
              <script type="text/javascript">
                CKEDITOR.replace("ckeditor1");
              </script>
            </div>
           <br/>  <br/><br/><br/><br/>
            <div class="form-group pro">
              <button type="submit" class="btn btn-primary " title="Click to save changes" name="submit" id="submit"> Save Changes</button>
               <button type="button" class="btn default" data-dismiss="modal">Cancel</button>
            </div>
          <hr style="background-color:red; height:2px;"/>
          </form><!--End of the form-->
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
<script type="text/javascript">

 //Editing Modal
        $('.edit_contact').on('show.bs.modal', function (e) {
            console.log('yiki');
            var id = $(e.relatedTarget).data('id');
            $.ajax({
                type : 'post',
                url  : '<?= site_url("Admin/editAboutDetails"); ?>',
                data : {
                     pg_id : id
                },
                cache : false,
                dataType : 'json',
                beforeSend : function(){
                },
                success : function(data){
                    $('#pg_id').val(data.id);
                    $('#pg_excerts').val(data.pg_excerts);
                    CKEDITOR.instances['ckeditor1'].setData(data.c_content);
                    $('#a_title').val(data.c_title);

                }
            });
        });
</script>

<script>
var TableAdvanced = function () {

  var initTable2 = function () {
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
