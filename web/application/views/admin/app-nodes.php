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
                              <table class="table table-bordered table-stripped">
                                   <tr>
                                        <th class="text-center">Are you sure you want to deactivate node?</th>
                                   </tr>
                                   <tr>
                                        <th class="text-center"><input type="hidden" id="deactivateID" /></th>
                                   </tr>
                              </table>
                         </div>
                         <div class="modal-footer">
                              <button type="button" id="btndeactivatenode" class="btn btn-default btn-danger">Deactivate</button>
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
                              <table class="table table-bordered table-stripped">
                                   <tr>
                                        <th class="text-center">Are you sure you want to activate node?</th>
                                   </tr>
                                   <tr>
                                        <th class="text-center"><input type="hidden" id="activateID" /></th>
                                   </tr>
                              </table>
                         </div>
                         <div class="modal-footer">
                              <button type="button" id="btnactivatenode" class="btn btn-default btn-success">Activate</button>
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
				<button class='btn btn-success NewStory pull-right addPro' id="Storybtn">+ ADD</button>
				<a  href="<?php echo site_url('Admin/appNodes');?>" class='btn btn-success addPro1 pull-right' id="Storybtn1"> Back</a>
			</div>
           <script type="text/javascript">

				$(".addPro1").hide();
				$(".addPro").click(function()
				{
				$(".addPro1").show();
				$(".addPro").hide();
				});
		
			</script>
			     


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
					if($this->session->flashdata('error_id')){


						echo '<div class="alert alert-warning">
						<button class="close" data-close="alert"></button>
						<span> <i class="fa fa-warning (alias)"></i>'.$this->session->flashdata('error_id').'</span></div>';
					}
					?>
					<script type="text/javascript">
						  setTimeout(function() {
							  $('.alert').fadeOut('fast');
						  }, 7000); // <-- time in milliseconds
					</script>
					<div class="BuzenHomepage">
						<div class="kaboom">  	


						

						<div id="info">
							<!-- <h4>All Properties</h4> -->
							<table class="table table-stripped table-bordered" id="sample_2">
								<thead>
									<tr>
										<th>No. </th>
										<th>Channel ID </th>
										<th>Name </th>
										<th>Location</th>
										<th>Reading</th>
										<th>Time</th>
										<th>Date Added</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
										<?php
										$nodes       = $this->AdminModel->list_nodes();
										$i = 0;

										foreach($nodes as $row)
										{
											$activebtn = '';
											if($row['an_active'] == 1)
											{
												//deactivate
												$activebtn = '<button data-id="'. $row['an_id'].'" class="btn btn-xs btn-block btn-default" data-toggle="modal" data-target=".deactivateNode">Deactivate</button>';
											}	
											else
											{
												//reactivate
												$activebtn = '<button data-id="'. $row['an_id'].'" class="btn btn-xs btn-block btn-success activate-btn" data-toggle="modal" data-target=".activateNode">Activate</button>';
											}
											$i++;
											?>
											<tr>
												<td><?= $i; ?></td>
												<td><?= $row['an_channel_id'];?></td>
												<td><?= $row['an_name'];?></td>
												<td><?= $row['an_map_address'];?></td>
												<td><?= $row['reading1'];?></td>
												<td><?= $row['time1'];?></td>
												<td><p><?= date("F j, Y", strtotime($row['an_dateAdded'])) ;?></p></td>
												<td>
													<a href="<?php echo base_url('Admin/appNodeDetails/');?><?= $row['an_id'];?>"  class="btn btn-xs btn-block btn-primary">  View </a>
													<?= $activebtn; ?>
													<a class="btn btn-xs btn-block btn-warning" href="<?php echo base_url('Admin/editAppNodesView/');?><?php echo $row['an_id'];?>" >Edit</a>
													<button data-id="<?php echo $row['an_id'];?>" class="btn btn-xs btn-block btn-danger delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
												</td>
											</tr>
											<?php
										}
								    ?>
							    </tbody>
							</table>
							   
						</div>

					<!-- THE ADD PROPERTY FORM -->

					<form name="form" method="post" action="<?php echo site_url('Admin/createAppNode')?>" class="story_form" enctype="multipart/form-data" style="padding: 10px 30px;">
						<h4 style="font-weight: bold;">Please Provide Details</h4>
						<hr>

						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> ID:</b>
								<span class="col col-md-10">
									<input type="text" name="an_channel_id" class="form-control " placeholder="Enter the id" required/></span>	
						    </div>

							<div class="form-group col-md-12">
								<b class="col col-md-2 right"> Name:</b>
								<span class="col col-md-10"><input type="text" name="an_name" class="form-control " placeholder="Enter name" required/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(1):</b>
								<span class="col col-md-10"><input type="text" name="time1" class="form-control " placeholder="Enter fast reading time"/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(1):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="ckeditor1" name="reading1" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("ckeditor1");
								</script>
							</div>
							 <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(2):</b>
								<span class="col col-md-10"><input type="text" name="time2" class="form-control " placeholder="Enter second reading time"/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(2):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="ckeditor2" name="reading2" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("ckeditor2");
								</script>
							</div>
							 <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(3):</b>
								<span class="col col-md-10"><input type="text" name="time3" class="form-control " placeholder="Enter third reading time" required/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(3):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="ckeditor3" name="reading3" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("ckeditor3");
								</script>
							</div>
								<!-- location picker -->
								<div>
								    <div class="form-group  col-md-12">
								    	<b class="col col-md-2 right">Location on Map :</b>
										<span class="col col-md-10">
										<input type="text" name="an_map_address" id="map_address"  class="form-control" placeholder="Type in your address" style="width: 100%; resize: none;" />						
										</span>
										 <input type="hidden" class="form-control" id="lat" name="an_lat" value="" /> 
										 <input type="hidden" class="form-control" id="lon" name="an_lng" value="" /> 
							        </div>

							        <div class="col col-md-12">
							        	<span class="col col-md-2">
														
										</span>
							        	<span class="col col-md-10">
											<div id="test" style=" width: 100%; height: 400px; border: 1px solid gray;"></div>						
										</span>
							        	
							        </div>

							        <script>
								    	var latt;
								    	var lngg;

								        $('#test').locationpicker({
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
								            onchanged: function (currentLocation, radius, isMarkerDropped) {
								            	latt = currentLocation.latitude;
								            	lngg = currentLocation.longitude;
								            	$('#lat').val(latt);
								            	$('#lon').val(lngg);

								                // alert("Lat: " + currentLocation.latitude + ", Long: " + currentLocation.longitude);
								            }
								        });
									</script>
									
								</div>
								<!-- end of location picker -->


								<br/>  <br/><br/><br/><br/> 
								<p>&nbsp;</p>
								<div class="form-group pro">
								<button type="submit" class="btn btn-success " title="Click to save" name="submit" id="submit"> + Submit</button>
								</div>
								<hr style="background-color:red; height:2px;"/>
						</form><!--End of the form-->

						<!-- THE EDIT PROPERTY MODAL -->
						<div class="buzenAcc_edit" >
						<div class="modal modal_1 fade edit_property" id="modal_1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >
						    <div class="modal-dialog">
						        <div class="modal-content">
						            <div class="modal-header">
						                <button type="button" class="close"
						                    data-dismiss="modal" aria-hidden="true" style="margin-top: 0px !important;">
						                       &times;
						                </button>
						                <h4 style="color: #00326f; text-align: center; margin-top: 15px;">MAKE CHANGES</h4>

						            </div>

									<div class="modal-body">
								 <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
										<form name="form" method="post" action="<?php echo site_url('Admin/editAppNodes');?>"  enctype="multipart/form-data">
											<input class="form-control" type="hidden" id="an_id" name="an_id" placeholder="" />

									<div class="form-group col-md-12">
										<b class="col col-md-2 right"> Channel ID:</b>
										<span class="col col-md-10">
										<input type="text" id="an_channel_id" name="an_channel_id" class="form-control " placeholder="Enter ID" required/></span>
							        </div>
							      <br/>

									<div class="form-group col-md-12">
										<b class="col col-md-2 right"> Name:</b>
										<span class="col col-md-10"><input type="text" id="an_name" name="an_name" class="form-control " placeholder="Enter name" required/></span>
							        </div>
							      <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(1):</b>
								<span class="col col-md-10">
									<input type="text" name="time1" id="time1" class="form-control " placeholder="Enter fast reading time" required/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(1):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="reading1" name="reading1" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("reading1");
								</script>
							</div>
							 <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(2):</b>
								<span class="col col-md-10">
									<input type="text" name="time2" id="time2" class="form-control " placeholder="Enter second reading time" required/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(2):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="reading2" name="reading2" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("reading2");
								</script>
							</div>
							 <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Time(3):</b>
								<span class="col col-md-10">
									<input type="text" name="time3" id="time3" class="form-control " placeholder="Enter third reading time" required/></span>	
						    </div>
						    <br/>
						    <div class="form-group col-md-12">
								<b class="col col-md-2 right"> Readings(3):</b>
								<span class="col col-md-10">
									<textarea cols="20" rows="5" id="reading3" name="reading3" placeholder=""></textarea>
								</span>
								
								<script>

								CKEDITOR.replace("reading3");
								</script>
							</div>

								<!-- location picker -->
								<div>
								    <div class="form-group  col-md-12">
								    	<b class="col col-md-2 right">Map Address :</b>
										<span class="col col-md-10">
										<input type="text" name="an_map_address" id="map_address"  class="form-control" placeholder="Type in your address" style="width: 100%; resize: none;" />						
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
							        <?php
										foreach ($nodes as $row) {										
									?>
									<script>
								    	var latt;
								    	var lngg;

								        $('#test1').locationpicker({
								            location: {
        					                latitude: <?= $row['an_lat'] == '' ? 0.0000 : $row['an_lat']; ?>,
		                        			longitude: <?= $row['an_lng'] == '' ? 0.0000 : $row['an_lng']; ?>,
								               
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
								            onchanged: function (currentLocation, radius, isMarkerDropped) {
								            	latt = currentLocation.latitude;
								            	lngg = currentLocation.longitude;
								            	$('#lat').val(latt);
								            	$('#lon').val(lngg);

								                alert("Lat: " + currentLocation.latitude + ", Long: " + currentLocation.longitude);
								            }
								        });
									</script>
									<?php
						          		}
						              ?>
								</div>
							<!-- end of location picker -->
											<br/>  <br/><br/><br/><br/>
											<div class="form-group pro">
												<button type="submit" class="btn btn-primary " title="Click to save changes"> Save Changes</button>
												<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
											</div>
											<hr style="background-color:red; height:2px;"/>
										</form><!--End of the form-->
									</div>
						        </div>
						    </div>
						</div>
						</div>
						<!-- end of editing modal -->
						</div><!-- kaboom -->

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



<!-- script for modal image -->
<script type="text/javascript">

$('[data-toggle=confirmation]').confirmation({
  rootSelector: '[data-toggle=confirmation]',
  // other options
});

$(document).ready(function(){

		//
		$('.deactivateNode').on('show.bs.modal', function (e) {

			var id = $(e.relatedTarget).data('id');
			$('#deactivateID').val(id);
		///alert(id);
		});
		//
		$('.activateNode').on('show.bs.modal', function (e) {

			var id = $(e.relatedTarget).data('id');
			$('#activateID').val(id);
		///alert(id);
		});

		$('#btndeactivatenode').click(function(){
			var id = $('#deactivateID').val();
			$.ajax({
				type      : 'post',
				url       : '<?= site_url("admin/deactivatenode"); ?>',
				data      : {
					ap_id    : id
				},
				dataType  : 'json',
				beforeSend : function(){
					// $.LoadingOverlay("show");
				},
				success : function(data) {
					var success = data.success;
					if(success == 1)
					{
							$('#dd_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
							var delay = 1000;
							setTimeout(function(){
								document.location = "<?= site_url('admin/appnodes'); ?>";
							}, delay);
							// $.LoadingOverlay("hide");
					}
					else
					{
							$('#dd_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
							// $.LoadingOverlay("hide");
					}
				}
			});
		});
		
		$('#btnactivatenode').click(function(){
			var id = $('#activateID').val();
			$.ajax({
				type      : 'post',
				url       : '<?= site_url("admin/activatenode"); ?>',
				data      : {
					ap_id    : id
				},
				dataType  : 'json',
				beforeSend : function(){
					// $.LoadingOverlay("show");
				},
				success : function(data) {
					var success = data.success;
					if(success == 1)
					{
							$('#a_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
							var delay = 1000;
							setTimeout(function(){
								document.location = "<?= site_url('admin/appnodes'); ?>";
							}, delay);
							// $.LoadingOverlay("hide");
					}
					else
					{
							$('#a_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
							// $.LoadingOverlay("hide");
					}
				}
			});
		});

	$('.delete-btn').on('confirmed.bs.confirmation', function(){
		
		var id  = $(this).data('id');

	    $.ajax({
	        type : 'post',
	        url  : '<?= site_url("Admin/deleteAppNode"); ?>',
	        data : {
	        	an_id : id
	        },
            success : function(data){
            	// console.log(data);
            	// console.log('yiki');
                if(data == '1'){
                	window.location="<?= site_url("Admin/appNodes"); ?>";
                } else {
                	window.location="<?= site_url("Admin/appNodes"); ?>";
                }
            },
            error: function(error){
            	console.log(error);
            }

		});
	});	

	$('.img_zero').click(function(){
		var modal 		= $('#myModal1');
		$('.shwimg').attr('src', this.src);
	    $('.modal-title').html(this.alt);
	    modal.modal();
	});

	//PROPERTY Editing Modal
    $('.edit_property').on('show.bs.modal', function (e) {
	   console.log('yiki');
	   var id = $(e.relatedTarget).data('id');
        $.ajax({
            type : 'post',
            url  : '<?= site_url("Admin/editAppNodesDetails"); ?>',
            data : {
                 an_id : id
            },
            cache : false,
            dataType : 'json',
            beforeSend : function(){
            },
            success : function(data){

                $('#an_id').val(data.an_id);
                $('#an_channel_id').val(data.an_channel_id);
                $('#p_name').val(data.a_name);
                $('#time1').val(data.a_time1);
                $('#time2').val(data.a_time2);
                $('#time3').val(data.a_time3);
                CKEDITOR.instances['reading1'].setData(data.a_reading1);
                CKEDITOR.instances['reading2'].setData(data.a_reading2);
                CKEDITOR.instances['reading3'].setData(data.a_reading3);
                
            }
        });
    });

});

</script>

<!-- DATA TABLES -->
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
