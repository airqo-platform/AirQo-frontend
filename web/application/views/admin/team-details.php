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
										<a  class="" href="#"><?= $title; ?></a>
									</li>
                                    <!-- <span class="pull-right"> -->
                    <li class="" style="margin-left:680px;">
										<a href="<?php echo site_url('Admin/team');?>" class='btn btn-success actionbtn1 col-md-3' id = "Storybtn " >  Back</a>
									</li >
										<?php
										foreach($memberDetails as $row)
										{
										?>
											<li class=""><button data-toggle="modal" data-target=".edit_team" class="btn btn-warning col-md-2" data-id="<?= $row['id']; ?>" id="actionbtn2" >Edit</button></li>
											<li class="">
												<button data-id="<?php echo $row['id'];?>" class="btn btn-danger actionbtn3 delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
											</li>
										<?php
										}
										?>
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
						width: 200px!important;
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
				    .actionbtn1{
						margin: auto;
						border-radius: 0px !important;
						width: 90px!important;
						height: 30px;
						margin-bottom: 5px;
					}
					#actionbtn2{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
					}
				    .actionbtn3{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-top: -34px !important;
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
						width: 67%;
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
										foreach($memberDetails as $row ){
										echo'
										<div class="">
										<p> <b>Name: </b>'.$row['full_name'].'</p>
										</div>
										<div class="">
										<p> <b>Position: </b>'.$row['position'].'</p>
										</div>
										<div class="">
										<p> <b>Contact: </b>'.$row['contacts'].'</p>
										</div>

										<div class="form-group">
										<p> <b>Description:</b> </p>
											<textarea cols="20" rows="5" id="ckeditorr" name="details" placeholder=" Description">
												'.$row['details'].'
											</textarea>
											<script>
											  CKEDITOR.replace("ckeditorr");
											</script>
										</div>


										<div class="wal">
										<div class="row">
										<div class="col">
										<h4><b>Image:</b></h4>
										<img class="img_zero " style="object-fit:cover" src="'.base_url().'assets/images/team/'.$row['photo'].'" width="100%" height="100%" alt="">
										</div>
										</div>

										</div>
										<div>
										<p>&nbsp;</p>
										<div class="">
												<p> <b> Date Added: </b>'.$row['added_at'].' </p>
												<div>

												';
													if($row['last_edit_at'] == '0000-00-00 00:00:00' || null)
													{
														echo '<p> <b> Last Updated: </b> <span style="color:brown; font-weight:bolder;">Not Updated Yet.!</span> </p>';
													}else

													{
														echo '
														<p> <b> Last Updated: </b>'.$row['last_edit_at'].' </p>
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

							</div><!-- end of column eight-->
							<div class="col-md-2"></div>
							</div>
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


						<script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
						<script type="text/javascript">
							// to auto hide content
							$(".addMember_form").hide();
							$(".NewStory").click(function(){$(".addMember_form").toggle();});

							$(".NewStory").click(function(){$("#info").toggle();});

						    // IMAGE POPUP
							$('.img_zero').click(function(){
									var modal 		= $('#myModal1');
									$('.shwimg').attr('src', this.src);
								    $('.modal-title').html(this.alt);
								    modal.modal();
							});

						</script>

					</div>
				</div>
			</div>

		</div>
	</div>
    <!-- END PAGE CONTENT-->
</div>

<!-- END CONTENT -->

<!-- END CONTAINER -->
<!-- THE EDIT MODAL -->
<div class="buzenAcc_edit" >
	<div class="modal fade edit_team" id="" role="dialog"
	aria-labelledby="myModalLabel" aria-hidden="true" >
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
				<button type="button" class="close"
				    data-dismiss="modal" aria-hidden="true">
				       &times;
				</button>
				<h4 style="color: #00326f; text-align: center; margin-top: 15px;">EDIT THE TEAM MEMBER DETAILS</h4>

				</div>

				<div class="modal-body"> <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
					<form name="form" method="post" action="<?php echo site_url('Admin/editTeam');?>"  enctype="multipart/form-data">
						 <input class="form-control" type="hidden" id="tm_id" name="id" placeholder="" />
							<div class="form-group col-md-12">
								 Name:
								<input type="text" name="full_name" id="tm_name" class="form-control"  required/>
							</div>
							<div class="form-group col-md-12">
								Position:
								<input type="text" name="position" id="tm_title" class="form-control"  required/>
							</div>
							<div class="form-group col-md-12">
								Contact:
								<input type="text" name="contacts" id="tm_contact" class="form-control"  required/>
							</div>
							Details:
							<div class="form-group col-md-12">
								<textarea cols="10" rows="2" id="ckeditor3" name="details" required></textarea>
								<script type="text/javascript">
									CKEDITOR.replace("ckeditor3");
								</script>
							</div>

							<div class="form-group col-md-12">
								<div class="row">
									<div class="col-md-4">
									<h4>Add a New Image:</h4>
										<!-- <img id="eImg" src="" height="100" class="thumbnail"/> -->
										<input type="file" name="photo" id="tm_image" class="form-control"  width="70px" height="70px;" alt="No Image"/>

									</div>

								</div>
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
		 <?= date('Y'); ?> &copy;  African Cloud Initiative; All Rights Reserved.
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

$(document).ready(function(){
//Editing Modal
$('.edit_team').on('show.bs.modal', function (e) {
	console.log('mwesigwa');
	var id = $(e.relatedTarget).data('id');
	$.ajax({
		type : 'post',
		url  : '<?= site_url("Admin/editTeamDetails"); ?>',
		data : {
		member_id : id
		},
		cache : false,
		dataType : 'json',
		beforeSend : function(){

		//$.LoadingOverlay("show");
		},
		success : function(data){

		$('#tm_id').val(data.id);
		$('#tm_name').val(data.full_name);
		$('#tm_title').val(data.position);
		$('#tm_contact').val(data.contacts);
		CKEDITOR.instances['ckeditor3'].setData(data.details);
		var url = "<?= base_url() ?>/assets/images/team/" + data.photo;
		console.log(url);
		$('#eImg').attr('src', url);
		}
	});
});


// SCRIPT FOR THE DELETE function

		$('.delete-btn').on('confirmed.bs.confirmation', function(){

			var id  = $(this).data('id');

		    $.ajax({
		        type : 'post',
		        url  : '<?= site_url("Admin/deleteTeamMember"); ?>',
		        data : {
		        	team_id : id
		        },
		        success : function(data){
		        	console.log(data);
		        	console.log('yiki');
		            if(data == '1'){
		            	window.location="<?= site_url("Admin/team"); ?>";
		            } else {
		            	alert("Unable to delete at the moment. Please try again later.");
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
