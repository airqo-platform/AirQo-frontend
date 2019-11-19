<!-- BEGIN CONTENT -->
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBFTTxFO8GmWAAgeI08CPZwqgS5s2FhNno&libraries=places"></script> <!-- you use ur map api key -->
	<div class="page-content-wrapper">
		<div class="page-content">
			<!-- BEGIN SAMPLE PORTLET CONFIGURATION MODAL FORM-->
			<div class="modal fade" id="portlet-config" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<!-- <div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
							<h4 class="modal-title">Modal title</h4>
						</div> -->
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
				
				<a  href="<?php echo site_url('Admin/appNodes');?>" class='btn btn-success addPro1 pull-right' id="Storybtn1"> Back</a>
			</div>
          


			<!-- BEGIN PAGE CONTENT-->
			<div class="row">
				<div class="col-md-12">

					<div class="portlet">

						<style type="text/css">
						.btn-success
						{
			                background-color: #3399CC;
			                border-color: #3399CC;
			            }

						.kaboom .add .btn
					 	{
						border-radius: 0px !important;
						width: 120px;
						}
						.kaboom #actionbtn1
						{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
						}
						.kaboom #actionbtn2
						{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
						}
						.kaboom .actionbtn3
						{
						margin: auto;
						border-radius: 0px !important;
						width: 90px;
						height: 30px;
						margin-bottom: 5px;
						}
						.kaboom .add
						{
						text-align: right;
						}
						.kaboom .pro
						{
						text-align: center;
						}
						.kaboom .pro .btn
						{
						width: 200px;

						}

						/* Style the Image Used to Trigger the Modal two */
						#myImg1 {
						    border-radius: 5px;
						    cursor: pointer;
						    transition: 0.3s;
						    z-index: 180000;

						}

                        .shwimg{
                        	width: 100%;
                        	height: 480px;

                        }
						#myImg1:hover {opacity: 0.7;}

						 /*The Modal (background) */
						.modal1 {
						    display: none; /* Hidden by default 
						    position: fixed; /* Stay in place */
						    z-index: 190000; /* Sit on top */
						    left: 0;
						    top: 0;
						    width: 100%; /* Full width */
						    height: 100%; /* Full height */
						    overflow: auto; /* Enable scroll if needed */
						    background-color: rgb(0,0,0); /* Fallback color */
						    background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
						}

						/* Modal Content (Image) */
						.modal-content1 {
						    margin: auto;
						    display: block;
						    width: 80%;
						    max-width: 700px;
						    height: 83%;
						    margin-top: 50px;
						    /*max-height: 700px;*/
						}

						/* Caption of Modal Image (Image Text) - Same Width as the Image */
						.modal-title {
						    text-align: center;

						}



						@keyframes zoom {
						    from {transform:scale(0)}
						    to {transform:scale(1)}
						}

						/* The Close Button */
						.modal1 .close {
						    position: absolute;
						    top: 70px;
						    right: 340px;
						    font-size: 400px;
						    font-weight: bold;
						    transition: 0.3s;
						    height: 10px;
						    width: 10px;
						    padding: 6px!important;
						    background-color: #fff!important;
						}

                  		.modal1 .close h1{

						    font-size: 40px;

						}
						.modal .modal-header .close {
						    margin-top: -60px !important;
						    right: 10px;
						}

						.modal1 .close:hover,
						.modal1 .close:focus {
						    color: #fff;
						    text-decoration: none;
						    cursor: pointer;
						}

						/* 100% Image Width on Smaller Screens */
						@media only screen and (max-width: 700px){
						.modal-content1 {
						        width: 100%;
						    }
					    }
					    .modal-dialog {
							width: 64.3%;
							margin: 48px auto;
						}
						.right{
							text-align: right;
							margin-top: 10px;
						}
						/*.modal_1 {
						    overflow-y:scroll !important;
						}*/
						/*.modal_1 { overflow: auto !important; }*/
					</style>
                	<?php
					if($this->session->flashdata('error')){


						echo '<div class="alert alert-danger">
						<button class="close" data-close="alert"></button><span>'.$this->session->flashdata('error').'</span></div>';
					}
					if($this->session->flashdata('msg')){


						echo '<div class="alert alert-success">
						<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>'.$this->session->flashdata('msg').'</span></div>';
					}
					?>
					<script type="text/javascript">
						  setTimeout(function() {
							  $('.alert').fadeOut('fast');
						  }, 5000); // <-- time in milliseconds
					</script>
					<div class="BuzenHomepage">
						<div class="kaboom">  	

						<!-- ******************************************************************************* -->
						 <?php 
						   // $an_id = $this->input->post('an_id');
							// $appnodes  = $this->AdminModel->get_app_nodes($an_id);
						?> 

									<div class=""> <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
										<form name="form" method="post" action="<?php echo base_url('Admin/editAppNodes');?>">
											<input class="form-control" type="hidden"  name="an_id" value="<?= $appnodes['an_id'];?> " />
											
 											<div class="form-group col-md-12">
												<b class="col col-md-2 right"> Channel ID:</b>
												<span class="col col-md-10">
												<input type="text" value="<?= $appnodes['an_channel_id'];?>" name="an_channel_id" class="form-control " placeholder="Enter ID" required/></span>
											    	
										    </div>
										    <div class="form-group col-md-12">
												<b class="col col-md-2 right"> Name:</b>
												<span class="col col-md-10">
												<input type="text" value="<?= $appnodes['an_name'];?>" name="an_name" class="form-control " placeholder="Enter name" required/></span>
											    	
										    </div>

										    <div class="form-group col-md-12">
												<b class="col col-md-2 right"> Time(1):</b>
												<span class="col col-md-10">
												<input type="text" value="<?= $appnodes['time1'];?>" name="time1" class="form-control " placeholder="Enter time 1" required/></span>
											    	
										    </div>
										
									
												<div class="form-group col-md-12">
												<b class="col col-md-2 right"> Readings(1):</b>
												<span class="col col-md-10">
													<textarea cols="20" rows="5" id="ckeditor_one" value="" name="reading1" placeholder="" required>
														<?php echo $appnodes['reading1'];?></textarea>
												</span>
												
												<script>

												CKEDITOR.replace("ckeditor_one");
												</script>
												</div>
												 <div class="form-group col-md-12">
												<b class="col col-md-2 right"> Time(2):</b>
												<span class="col col-md-10">
												<input type="text" value="<?= $appnodes['time2'];?>" name="time2" class="form-control " placeholder="Enter time 2" required/></span>
											    	
										    </div>
										
									
												<div class="form-group col-md-12">
												<b class="col col-md-2 right"> Readings(2):</b>
												<span class="col col-md-10">
													<textarea cols="20" rows="5" id="ckeditor_two" value="" name="reading2" placeholder="" required>
														<?php echo $appnodes['reading2'];?></textarea>
												</span>
												
												<script>

												CKEDITOR.replace("ckeditor_two");
												</script>
												</div>

												 <div class="form-group col-md-12">
												<b class="col col-md-2 right"> Time(3):</b>
												<span class="col col-md-10">
												<input type="text" value="<?= $appnodes['time3'];?>" name="time3" class="form-control " placeholder="Enter time" required/></span>
											    	
										    </div>
										
									
												<div class="form-group col-md-12">
												<b class="col col-md-2 right"> Readings(3):</b>
												<span class="col col-md-10">
													<textarea cols="20" rows="5" id="ckeditor_three" value="" name="reading3" placeholder="" required>
														<?php echo $appnodes['reading3'];?></textarea>
												</span>
												
												<script>

												CKEDITOR.replace("ckeditor_three");
												</script>
												</div>

												<!-- location picker -->
												<div>
												    <div class="form-group  col-md-12">
												    	<b class="col col-md-2 right">Map Address :</b>
														<span class="col col-md-10">
														<input type="text" name="an_map_address" id="map_address" value="<?= $appnodes['an_map_address']; ?>"  class="form-control" placeholder="Type in your address" style="width: 100%; resize: none;" />						
														</span>
														 <input type="hidden" class="form-control" id="lat" name="an_lat" value=""  /> 
														 <input type="hidden" class="form-control" id="lon" name="an_lng" value=""  /> 
											        </div>

											        <div class="col col-md-12">
											        	<span class="col col-md-2">
																		
														</span>
											        	<span class="col col-md-10">
															<div id="test1" style=" width: 100%; height: 400px; border: 1px solid gray;"></div>						
														</span>
											        	
											        </div>		        
					  
											        <!-- script for the map -->
						
											        <script>
												    	var latt;
													    var lngg;
													//     0783159879

												        $('#test1').locationpicker({
												            location: {
                        					                			latitude: <?= $appnodes['an_lat'] == '' ? 0.0000 : $appnodes['an_lat']; ?>,
						                        					longitude: <?= $appnodes['an_lng'] == '' ? 0.0000 : $appnodes['an_lng']; ?>,
												               
												            },
												            zoom: 14,
												            radius: 300,
												            inputBinding: {
												                latitudeInput: $('#lat'),
												                longitudeInput: $('#lon'),
												                radiusInput: $('#radius')
												               //  locationNameInput: $('#map_address')
												            },
												            enableAutocomplete: true,
												            onchanged: function (currentLocation, radius, isMarkerDropped) {
												            	latt = currentLocation.latitude;
												            	lngg = currentLocation.longitude;
												            	$('#lat').val(latt);
												            	$('#lon').val(lngg);

												                alert("Lat: " + currentLocation.latitude + ", Long: " + currentLocation.longitude);
												            }
												        });
													</script>
													
												</div>
											<br/>  <br/><br/><br/><br/>
											<p>&nbsp;</p>
											<div class="form-group pro">
												<button type="submit" class="btn btn-primary " title="Click to save changes"> Save Changes</button>
												<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
											</div>
											<hr style="background-color:red; height:2px;"/>
										</form><!--End of the form-->
									</div>
									<?php
								     //}
								     ?>
								</div>
							</div>
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
<script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
<script type="text/javascript">
$(".story_form").hide();
$(".NewStory").click(function(){$(".story_form").toggle();});
</script>
<script type="text/javascript">
$(".NewStory").click(function(){$("#info").toggle();});

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

 <!-- SCRIPT FOR IMAGE1 cropping -->

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


