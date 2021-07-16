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
					  			<button class='btn btn-success addMember pull-right' id="Storybtn">+ Create</button>
					  			<a  href="<?php echo site_url('Admin/news');?>" class='btn btn-success addMember1 pull-right' id="Storybtn1"> Back</a>
			        </div>
				</div>
				<style type="text/css">
					 .btn-success
					 {
		                background-color: #3399CC;
		                border-color: #3399CC;
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
				.buzenAcc_edit .modal {
				    z-index: 10000 !important;
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
											<th>Content </th>
											<th>Image</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<?php
										  $news = $this->AdminModel->list_news();
										$i = 0;
											foreach($news as $row)
											{
												$i++;
										?>
											<tr>
											<td><?php echo $i ?></td>
											<td><?php echo $row['news_title'];?></td>
											<td><?php echo $row['news_excerts'];?></td>
											<td>
												<?php
												if(!empty($row['news_image'])) {
													echo '
													<img class="img_zero"  src="'. base_url().'assets/images/news/'.$row['news_image'].'" width="70px" height="70px;" alt="News image">
													';
												}else{
													echo '';
												}
												?>
											</td>
											<td>
												<a href="<?php echo base_url('Admin/newsDetails/');?><?= $row['news_id'];?>" type="submit" class="btn btn-primary" id="actionbtn1">  View </a>
										        <br/>

												<a data-toggle="modal" data-target=".edit_team" class="btn btn-warning" data-id="<?= $row['news_id']; ?>" id="actionbtn2" >Edit</a>
												<br/>
												<button data-id="<?php echo $row['news_id'];?>" class="btn btn-danger actionbtn3 delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
											</td>
										<?php
										  }
										?>
								</tbody>
							</table>
						</div>

						 <!-- THE ADD MEMBER FORM -->

						<form name="form" method="post" action="<?php echo site_url('Admin/addNews');?>" class="addMember_form" enctype="multipart/form-data">

							<div class="form-group col-md-12">
							  Title:
								<input type="text" name="news_title" class="form-control" placeholder="Enter news title" required/>
							</div>
							<br/>
							<b>Simple Description:<br/> <small>Please provide some info </small></b>
								<input type="text" maxlength="100" name="news_excerts" class="form-control" placeholder="maximum 100 characters" required/>
							</div>
							<br/>
							 <b class="col col-md-12 left">	Content:</b>
					   <div class="form-group col-md-12">
							 <textarea cols="20" rows="5" id="ckeditor3" name="news_content" placeholder="enter  description"></textarea>
							 <script>
							   CKEDITOR.replace("ckeditor3");
							 </script>
					   </div>

							<div class="form-group col-md-12">
								<div class="row">
									<p><b class="col col-md-2 right">Add News Image:</b></p>
								</div>
						    </div>
								<div class="row">
								 	<div class="form-group col-md-12">
										<label class="col-md-3 control-label"><b class="pull-right">Image:</b></label>
										<div class="col-md-6">
											<div class="input-group">
												<span class="input-group-addon">
												<i class="fa fa-image"></i>
												</span>
												<label class="btn btn-primary btn-upload" for="inputImage1" title="Upload image file">
		                      <input class="btn btn-default" id="inputImage1" name="news_image" type="file" accept="image/*">
		                      <span class="docs-tooltip" data-toggle="tooltip" title="Select Image">
		                      </span>
		                    </label>
											</div>
										</div>
									</div>
									<script>
										var uploadField = document.getElementById("inputImage1");

											uploadField.onchange = function() {
												if(this.files[0].size > 5007200){
												  alert(" The Image File is Too Big! Please Choose Another One");
												  $('#error-modal').modal('show');
												  this.value = "";
												};
											};
									</script>
									<div class="form-group col col-md-12">
										<label class="col-md-3 control-label"></label>
										<div class="col-md-9">
										        <div class="col-md-6">
								                  <div class="img-container1 " style="background: transparent/*771429*/; padding: 50px 30px;">
								                    <img  class="center-block" src="<?= base_url(); ?>assets/images/logo.png" alt="Picture">
								                  </div>
								                </div>
								                <div class="col-md-6">
								                  <!-- <h3 class="page-header">Data:</h3> -->
								                  <div class="docs-data hide">
								                    <div class="input-group">
								                      <label class="input-group-addon" for="dataX1">X</label>
								                      <input class="form-control" id="dataX1" name="dataX1" type="text" placeholder="x">
								                      <span class="input-group-addon">px</span>
								                    </div>
								                    <div class="input-group">
								                      <label class="input-group-addon" for="dataY1">Y</label>
								                      <input class="form-control" id="dataY1" name="dataY1" type="text" placeholder="y">
								                      <span class="input-group-addon">px</span>
								                    </div>
								                    <div class="input-group">
								                      <label class="input-group-addon" for="dataWidth1">Width</label>
								                      <input class="form-control" id="dataWidth1" name="dataWidth1" type="text" placeholder="width">
								                      <span class="input-group-addon">px</span>
								                    </div>
								                    <div class="input-group">
								                      <label class="input-group-addon" for="dataHeight1">Height</label>
								                      <input class="form-control" id="dataHeight1" name="dataHeight1" type="text" placeholder="height">
								                      <span class="input-group-addon">px</span>
								                    </div>
								                  </div>
								                </div>
											<div>
									      </div>
										</div>

									</div>
								</div>
							<br/>  <br/><br/>
							<div class="form-group pro">
								<button type="submit" class="btn btn-primary " title="Click to add a news Article" name="submit" id="submit"> Create Article</button>

							</div>
							<hr style="background-color:red; height:2px;"/>
						</form><!--End of the form-->

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
<div class="buzenAcc_edit" >
	<div class="modal fade edit_team" id="" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
				<button type="button" class="close"
				    data-dismiss="modal" aria-hidden="true">
				       &times;
				</button>
				<h4 style="color: #00326f; text-align: center; margin-top: 15px;"> MAKE CHANGES </h4>

				</div>

				<div class="modal-body"> <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
					<form name="form" method="post" action="<?php echo site_url('Admin/editNews');?>"  enctype="multipart/form-data">
						 <input class="form-control" type="hidden" id="news_id" name="news_id" placeholder="" />
							<div class="form-group col-md-12">
								 Title:
								<input type="text" name="news_title" id="n_title" class="form-control"  required/>
							</div>
							<br/>
							<b>Simple Description:<br/> <small>Please provide some info </small></b>
								<input type="text" maxlength="100" name="news_excerts" id="news_excerts" class="form-control" placeholder="maximum 100 characters" required/>
							</div>
							<br/>

							 <b class="col col-md-12 left">	Content:</b>
							   <div class="form-group col-md-12">
									 <textarea cols="20" rows="5" id="ckeditor2" name="news_content" placeholder="enter  description"></textarea>
									 <script>
									   CKEDITOR.replace("ckeditor2");
									 </script>
							   </div>

							<div class="row">
							<div class="form-group col-md-12">
									<div class="col-md-6">
										<span style="color:blue;">Previous Logo</span>
										<img id="eImg" src="" height="100" width="150" class="thumbnail"/>
										<h4>Add a New Image:</h4>
										<!-- <input type="file" name="image" id="eImg1" class="form-control inputImage2"  width="70px" height="70px;" alt="No Image" required/> -->
										<label class="btn btn-primary btn-upload" for="news_image" title="Upload image file">
												<input class="btn btn-default" id="news_image" name="news_image" type="file" accept="image/*" >
												<span class="docs-tooltip" data-toggle="tooltip" title="Select Image">
												<!-- <span class="fa fa-upload"></span> -->
												</span>
										</label>
									</div>
								</div>
								<script>
									var uploadField = document.getElementById("news_image");

										uploadField.onchange = function() {
											if(this.files[0].size > 5007200){
												alert(" The Image File is Too Big! Please Choose Another One");
												$('#error-modal').modal('show');
												this.value = "";
											};
										};
								</script>
								<div class="form-group col col-md-12">
									<div class="col-md-9">
													<div class="col-md-6" style="margin-left:-45px;">
																<div class="img-containerTm " style="background: transparent/*771429*/; padding: 30px 30px;">
																	<img  class="center-block" src="<?= base_url(); ?>assets/images/logo.png" alt="Image">
																</div>
															</div>
															<div class="col-md-6">
																<!-- <h3 class="page-header">Data:</h3> -->
																<div class="docs-data hide">
																	<div class="input-group">
																		<label class="input-group-addon" for="dataX">X</label>
																		<input class="form-control" id="dataXtm" name="dataX" type="text" placeholder="x">
																		<span class="input-group-addon">px</span>
																	</div>
																	<div class="input-group">
																		<label class="input-group-addon" for="dataY">Y</label>
																		<input class="form-control" id="dataYtm" name="dataY" type="text" placeholder="y">
																		<span class="input-group-addon">px</span>
																	</div>
																	<div class="input-group">
																		<label class="input-group-addon" for="dataWidth">Width</label>
																		<input class="form-control" id="dataWidthtm" name="dataWidth" type="text" placeholder="width">
																		<span class="input-group-addon">px</span>
																	</div>
																	<div class="input-group">
																		<label class="input-group-addon" for="dataHeight">Height</label>
																		<input class="form-control" id="dataHeighttm" name="dataHeight" type="text" placeholder="height">
																		<span class="input-group-addon">px</span>
																	</div>
																</div>
															</div>
										<div>
											</div>
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
		$(".addMember1").hide();
		$(".addMember").click(function()
		{
		$(".addMember1").show();
		$(".addMember").hide();
		});

	</script>
<script type="text/javascript">
	// AUTO HIDE CONTENT SCRIPT
	$(".addMember_form").hide();
	$(".addMember").click(function(){$(".addMember_form").toggle();});

	$(".addMember").click(function(){$("#info").toggle();});

	// IMAGE POPUP
	$('.img_zero').click(function(){
			var modal 		= $('#myModal1');
			$('.shwimg').attr('src', this.src);
				$('.modal-title').html(this.alt);
				modal.modal();
		});
	</script>
<script type="text/javascript">

$(document).ready(function(){
//Editing Modal
$('.edit_team').on('show.bs.modal', function (e) {
	console.log('yiki');
	var id = $(e.relatedTarget).data('id');
	// console.log(id);
	$.ajax({
		type : 'post',
		url  : '<?= site_url("Admin/editNewsDetails"); ?>',
		data : {
		news_id : id
		},
		cache : false,
		dataType : 'json',
		beforeSend : function(){

		//$.LoadingOverlay("show");
		},
		success : function(data){

		$('#news_id').val(data.id);
		$('#n_title').val(data.nws_title);
		$('#news_excerts').val(data.news_excerts);
		CKEDITOR.instances['ckeditor2'].setData(data.nws_content);
		var url = "<?= base_url() ?>/assets/images/news/" + data.nws_image;
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
		        url  : '<?= site_url("Admin/deleteNews"); ?>',
		        data : {
		        	news_id : id
		        },
		        success : function(data){
		        	console.log(data);
		        	console.log('yiki');
		            if(data == '1'){
		            	window.location="<?= site_url("Admin/news"); ?>";
		            } else {
		            window.location="<?= site_url("Admin/news"); ?>";
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

<!-- SCRIPT FOR IMAGE1 cropping -->
<script type="text/javascript">
	$(function () {
  'use strict';
  var console = window.console || { log: function () {} },
      $alert = $('.docs-alert'),
      $message = $alert.find('.message'),
      showMessage = function (message, type) {
        $message.text(message);

        if (type) {
          $message.addClass(type);
        }

        $alert.fadeIn();

        setTimeout(function () {
          $alert.fadeOut();
        }, 3000);
      };

  // Demo
  // -------------------------------------------------------------------------

  (function () {
    var $image = $('.img-container1 > img'),
        $dataX = $('#dataX1'),
        $dataY = $('#dataY1'),
        $dataHeight = $('#dataHeight1'),
        $dataWidth = $('#dataWidth1'),
        $dataRotate = $('#dataRotate1'),
        options = {
          aspectRatio: 16 / 9,
          preview: '.img-preview',
          crop: function (data) {
            $dataX.val(Math.round(data.x));
            $dataY.val(Math.round(data.y));
            $dataHeight.val(Math.round(data.height));
            $dataWidth.val(Math.round(data.width));
            $dataRotate.val(Math.round(data.rotate));
          }
        };

    $image.on({
      'build.cropper': function (e) {
        console.log(e.type);
      },
      'built.cropper': function (e) {
        console.log(e.type);
      }
    }).cropper(options);


    // Methods
    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getDataURL') {
          $('#getDataURLModal').modal().find('.modal-body').html('<img src="' + result + '">');
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }

      }
    }).on('keydown', function (e) {

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }

    });

    // Import image
    var $inputImage = $('#inputImage1'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);

            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL);
            $inputImage.val(blobURL);//$inputImage.val('');
          } else {
            showMessage('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    }


    // Options
    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    });
    // Tooltips
    $('[data-toggle="tooltip"]').tooltip();
  }());
});
</script>
<!-- end of crop of image 1 -->



<!-- script for edit image crop -->
<script type="text/javascript">
	$(function () {
  'use strict';
  var console = window.console || { log: function () {} },
      $alert = $('.docs-alert'),
      $message = $alert.find('.message'),
      showMessage = function (message, type) {
        $message.text(message);

        if (type) {
          $message.addClass(type);
        }

        $alert.fadeIn();

        setTimeout(function () {
          $alert.fadeOut();
        }, 3000);
      };

  // Demo
  // -------------------------------------------------------------------------

  (function () {
    var $image = $('.img-containerTm > img'),
        $dataX = $('#dataXtm'),
        $dataY = $('#dataYtm'),
        $dataHeight = $('#dataHeighttm'),
        $dataWidth = $('#dataWidthtm'),
        $dataRotate = $('#dataRotate'),
        options = {
          aspectRatio: 16 / 9,
          preview: '.img-preview',
          crop: function (data) {
            $dataX.val(Math.round(data.x));
            $dataY.val(Math.round(data.y));
            $dataHeight.val(Math.round(data.height));
            $dataWidth.val(Math.round(data.width));
            $dataRotate.val(Math.round(data.rotate));
          }
        };

    $image.on({
      'build.cropper': function (e) {
        console.log(e.type);
      },
      'built.cropper': function (e) {
        console.log(e.type);
      }
    }).cropper(options);


    // Methods
    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getDataURL') {
          $('#getDataURLModal').modal().find('.modal-body').html('<img src="' + result + '">');
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }

      }
    }).on('keydown', function (e) {

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }

    });

    // Import image
    var $inputImage = $('#news_image'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);

            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL);
            $inputImage.val(blobURL);//$inputImage.val('');
          } else {
            showMessage('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    }


    // Options
    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    });
    // Tooltips
    $('[data-toggle="tooltip"]').tooltip();
  }());
});
</script>

<!-- script for edit image crop -->
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
