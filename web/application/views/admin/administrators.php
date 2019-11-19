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
								   <button class='btn btn-success NewStory pull-right' id="Storybtn">+ New Admin</button>
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
								text-align: center !important;
							}

							.info .actionbtn3
							{
							text-align: center !important;
								font-size: 12px;
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
							table{
								margin: auto;
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
						<?php
						if(isset($_POST['submit'])){
						if($this->form_validation->run() === FALSE)
						{
						echo '<div class="alert alert-danger">
						<button class="close" data-close="alert"></button><span>'.validation_errors().'</span></div>';

						}
						}
					if($this->session->flashdata('error'))
					{
						echo '<div class="alert alert-danger">
						<button class="close" data-close="alert"></button><span>'.$this->session->flashdata('error').'</span></div>';
					}
					if($this->session->flashdata('success'))
					{
						echo '<div class="alert alert-success">
						<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>'.$this->session->flashdata('success').'</span></div>';
					}
					?>
					<script type="text/javascript">
								  setTimeout(function() {
									  $('.alert').fadeOut('fast');
								  }, 5000); // <-- time in milliseconds
					</script>

						<div class="BuzenHomepage">
							<div class="kaboom">
									<div id=""></div>


		 <div class="info">
		<h4>All Admins</h4>
			<table class="table table-responsive table-bordered" width="100%" id="sample_2">

		 <thead>
		    <tr>
		    <th>No.</th>
				<th>Full Name</th>
				<th>User Name</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Role</th>
				<th>Image</th>
				<th>Action</th>
			</tr>
		 </thead>

		 <tbody>
			 <?php
			 $i = 0;
			 foreach($admin as $row)
			   {
				$i++;
			?>
			  <tr>
			 <td><?php echo $i ?></td>
			 <td><?php echo $row['admin_name'];?></td>
			 <td><?php echo $row['admin_username'];?></td>
			 <td><?php echo $row['admin_email'];?></td>
			 <td><?php echo $row['admin_phoneNumber'];?></td>
			 <td><?php echo $row['admin_role'];?></td>
			 <td>
			 <?php
				if(!empty($row['admin_image'])) {
					echo '
					<img class="img_zero" src="'. base_url().'assets/images/admins/'.$row['admin_image'].'" width="70px" height="70px;" alt="Admin Image">
					';
				}else{
					echo '';
				}
			?>
			</td>
			 <td>
				  <?php
				/* echo $row['admin_status'];*/
				 if($row['admin_status'] == '1' && $row['admin_role'] == 'super'){
					 echo'
					 		<h4>All rights.!</h4>
					 ';
				 }
				 else if($row['admin_status'] == '1'){
					 echo'
					<a data-id="'.$row['admin_id'].'" href="#" type="submit" class="de_activate btn btn-danger actionbtn3">De-activate </a>

					 ';
				 }
				 else
				 {
					  echo'
					<a data-id="'.$row["admin_id"].'"  href="#" type="submit" class="activate btn btn-primary actionbtn3"> Activate </a>

					 ';
				 }
				 ?>
				<!--<a data-id="$row["admin_id]" href="#"  type="submit" class="delete btn btn-danger actionbtn3">  Delete </a>-->
			 </td>
		 </tr>
			<?php
			 }
			 ?>
		</tbody>
		<!-- The Modal for the image -->
		<div class="modal fade modal1" id="myModal1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<!-- <button type="button" class="close" data-dismiss="modal" title="Close"> <span class="glyphicon glyphicon-remove"></span></button> -->
						<h4 class="modal-title"></h4>
					</div>
					<div class="modal-body">
						<img class="shwimg" >
					</div>
				</div>
			</div>
		</div>

		<!-- <script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script> -->
		<script type="text/javascript">
			// IMAGE POPUP
			$(document).ready(function(){

					$('.img_zero').click(function(){
						var modal 		= $('#myModal1');
						$('.shwimg').attr('src', this.src);
					    $('.modal-title').html(this.alt);
					    modal.modal();
					});
				});
			// ADMIN DELETE
				$(document).ready(function(){
				$('.de_activate').click(function(){
				//alert('go');
				//				var id  = $(this).attr(id);
				var id  = $(this).data('id');

				if(confirm("Are you sure de-activating this Admin?"))
				{
				//alert(id);
				window.location = "<?php echo site_url('Admin/updateAdministratorStatus/');?>"+id;
				}
				else
				{
				return false;
				}
				});
				});
			$(document).ready(function(){
				$('.activate').click(function(){
				//alert('go');
				//				var id  = $(this).attr(id);
				var id  = $(this).data('id');

				if(confirm("Are you sure activating this Admin?"))
				{
				//alert(id);
				window.location = "<?php echo site_url('Admin/updateActiveStatus/');?>"+id;
				}
				else
				{
				return false;
				}
				});
				});

		    </script>
		</table>

		<script type="text/javascript">
			$(".NewStory").click(function(){$(".info").toggle();});
		</script>
		</div>
        <!-- ADD ADMINISTRATOR -->
		<form name="form" method="post" action="<?php echo site_url('Admin/registerAdministrator');?>" class="story_form" enctype="multipart/form-data">

		   <div class="form-group col-md-4">
			  Full Name:
			<input type="text" name="admin_name" class="form-control" placeholder="Enter full name" required/>
		   </div>
			 <div class="form-group col-md-4">
			  User Name:
			<input type="text" name="admin_username" class="form-control" placeholder="Enter user name" required/>
		   </div>
			<div class="form-group col-md-4">
					  Password:
					<input type="password" name="admin_password" class="form-control" placeholder="Enter password" required/>
			 </div>
			 <div class="form-group col-md-4">
					  Email:
					<input type="text" name="admin_email" class="form-control" placeholder="Enter email" required/>
			</div>
			<div class="form-group col-md-4">
					  Phone Number:
					<input type="text" name="admin_phoneNumber" class="form-control" placeholder="Enter phone number" required/>
			</div>
			<div class="form-group col-md-4">
				Role:
			    <select class="form-control" name="admin_role" required>
					<option>---choose---</option>
					<option value="super">Super Admin</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<!-- <div class="form-group col-md-12"> -->
				<!--   Image:
				<input type="file" name="admin_image" class=""/> -->
			<!-- </div> -->
			<!-- ************************************************************************************************************ -->
			<div class="row">
			 	<div class="form-group col-md-12">
					<label class="col-md-3 control-label">Image</label>
					<div class="col-md-4">
						<div class="input-group">
							<span class="input-group-addon">
							<i class="fa fa-image"></i>
							</span>
							<label class="btn btn-primary btn-upload" for="inputImage" title="Upload image file">
		                      <input class="btn btn-default" id="inputImage" name="image" type="file" accept="image/*">
		                      <span class="docs-tooltip" data-toggle="tooltip" title="Select Image">
		                        <!-- <span class="fa fa-upload"></span> -->
		                      </span>
		                    </label>
						</div>
					</div>

				</div>
				<script>
					var uploadField = document.getElementById("inputImage");

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
			                  <div class="img-container " style="background: transparent/*771429*/; padding: 50px 30px;">
			                    <img  class="center-block" src="<?= base_url(); ?>assets/images/admins/logo.png" alt="Picture">
			                  </div>
			                </div>
			                <div class="col-md-6">
			                  <!-- <h3 class="page-header">Data:</h3> -->
			                  <div class="docs-data hide">
			                    <div class="input-group">
			                      <label class="input-group-addon" for="dataX">X</label>
			                      <input class="form-control" id="dataX" name="dataX" type="text" placeholder="x">
			                      <span class="input-group-addon">px</span>
			                    </div>
			                    <div class="input-group">
			                      <label class="input-group-addon" for="dataY">Y</label>
			                      <input class="form-control" id="dataY" name="dataY" type="text" placeholder="y">
			                      <span class="input-group-addon">px</span>
			                    </div>
			                    <div class="input-group">
			                      <label class="input-group-addon" for="dataWidth">Width</label>
			                      <input class="form-control" id="dataWidth" name="dataWidth" type="text" placeholder="width">
			                      <span class="input-group-addon">px</span>
			                    </div>
			                    <div class="input-group">
			                      <label class="input-group-addon" for="dataHeight">Height</label>
			                      <input class="form-control" id="dataHeight" name="dataHeight" type="text" placeholder="height">
			                      <span class="input-group-addon">px</span>
			                    </div>
			                  </div>
			                </div>
						<div>
				      </div>
					</div>

				</div>
			</div>
			<!-- ************************************************************************************************************ -->
					 <br/>
			<div class="form-group pro">
				<button type="submit" class="btn btn-primary " title="Click to create Property" name="submit" id="submit"> Add Admin</button>
				</div>
				<hr style="background-color:red; height:2px;"/>
		</form><!--End of the form-->

	</div>


<script type="text/javascript">
	$(".story_form").hide();
	$(".NewStory").click(function(){$(".story_form").toggle();});
</script>
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
	 <?= date('Y'); ?>  &copy; Airqo All Rights Reserved.
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
<!-- <script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script> -->
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
<script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script>
<script src="<?= base_url(); ?>assets/gn/js/cropping/cropper.min.js"></script>

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
    var $image = $('.img-container > img'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
          aspectRatio: 1 / 1,
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
    var $inputImage = $('#inputImage'),
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
