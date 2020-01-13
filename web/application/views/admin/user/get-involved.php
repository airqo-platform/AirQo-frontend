<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">
		
		<div class="modal fade bs-modal-lg" style="z-index: 10000 !important;" id="create-user" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Create Question
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
						<form action="" id="createUserForm" enctype="multipart/form-data">
							<table class="table table-bordered table-stripped">
                                        <tr>
									<td>Question</td>
									<td>
										<textarea name="question" class="form-control"></textarea>
									</td>
								</tr>
								<tr>
									<td>Image</td>
									<td>
										<input type="file" class="form-control" id="fb_upload" name="qn_image" />
										<input type="text" id="fb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
									</td>
								</tr> 
								<tr>
									<td>Answer</td>
									<td><input type="text" name="answer" class="form-control"/></td>
								</tr>
								<tr>
									<td>Choice A</td>
									<td><input type="text" name="choicea" id="" class="form-control"/></td>
								</tr> 
								<tr>
									<td>Choice B</td>
									<td><input type="text" name="choiceb" id="" class="form-control"/></td>
								</tr>
								<tr>
									<td>Choice C</td>
									<td><input type="text" name="choicec" id="" class="form-control"/></td>
								</tr> 
								<tr>
									<td>Choice D</td>
									<td><input type="text" name="choiced" id="" class="form-control"/></td>
								</tr>
							</table>
					</div>
					<div class="modal-footer">
						<button type="submit" id="" class="btn btn-default btn-primary">Create</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
					</form>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<div class="modal fade bs-modal-lg" id="editUser" style="z-index: 10000 !important;" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Edit Question
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
						<form action="" id="editUserForm" enctype="multipart/form-data">
							<input type="hidden" name="qid" id="eid">
							<table class="table table-bordered table-stripped">
								<tr>
									<td>Question</td>
									<td>
										<textarea name="question" id="equestion1" class="form-control"></textarea>
									</td>
								</tr> 
								<tr>
									<td>Current Image</td>
									<td>
										<img src="#" alt="image" id="eimage" class="thumbnail" width="100">
									</td>
								</tr>   
								<tr>
									<td>Image</td>
									<td>
										<input type="file" class="form-control" id="efb_upload" name="qn_image" />
										<input type="text" id="efb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
									</td>
								</tr>
								<tr>
									<td>Answer</td>
									<td><input type="text" name="answer" id="eanswer" class="form-control"/></td>
								</tr>
								<tr>
									<td>Choice A</td>
									<td><input type="text" name="choicea" id="echoicea" class="form-control"/></td>
								</tr> 
								<tr>
									<td>Choice B</td>
									<td><input type="text" name="choiceb" id="echoiceb" class="form-control"/></td>
								</tr>
								<tr>
									<td>Choice C</td>
									<td><input type="text" name="choicec" id="echoicec" class="form-control"/></td>
								</tr> 
								<tr>
									<td>Choice D</td>
									<td><input type="text" name="choiced" id="echoiced" class="form-control"/></td>
								</tr>
							</table>
					</div>
					<div class="modal-footer">
						<button type="submit" id="" class="btn btn-default btn-primary">Save</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
					</form>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<!-- Delete modal -->
		<div class="modal fade" id="deleteUser" style="z-index: 10000 !important;" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Delete Question</h4>
					</div>
					<div class="modal-body">
						<div id="delete-message"></div>
						<form action="" method="post" id="deleteUserForm">
							<input type="hidden" id="deleteID" name="qid" />
							<table class="table table-striped">
								<tr>
									<th id="delete-init-message"></th>
								</tr>
							</table>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn red">Delete</button>
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
					</div>
					</form>
				</div>
			</div>
		</div>
		<!-- Delete modal -->

		<!-- Activate modal -->
		<div class="modal fade" id="activateUser" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Activate Question</h4>
					</div>
					<div class="modal-body">
						<div id="activate-message"></div>
						<form action="" method="post" id="activateUserForm">
							<input type="hidden" id="activateID" name="qid" />
							<table class="table table-striped">
								<tr>
									<th id="activate-init-message"></th>
								</tr>
							</table>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn btn-success">Activate</button>
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
					</div>
					</form>
				</div>
			</div>
		</div>
		<!-- Activate modal -->

		<!-- Disable modal -->
		<div class="modal fade" id="disableUser" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Disable Question</h4>
					</div>
					<div class="modal-body">
						<div id="disable-message"></div>
						<form action="" method="post" id="disableUserForm">
							<input type="hidden" id="disableID" name="qid" />
							<table class="table table-striped">
								<tr>
									<th id="disable-init-message"></th>
								</tr>
							</table>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn btn-success">Disable</button>
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
					</div>
					</form>
				</div>
			</div>
		</div>
		<!-- Activate modal -->

		<!-- BEGIN PAGE HEADER-->
		<!-- <h3 class="page-title">
			Dashboard <small><?= $title; ?></small>
		</h3> -->
		<div class="page-bar">
			<ul class="page-breadcrumb">
				<li>
					<i class="fa fa-home"></i>
					<a href="#">Home</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#">Dashboard</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#"><?= $title; ?></a>
				</li>
			</ul>
		</div>
		<!-- END PAGE HEADER-->
		<!-- BEGIN PAGE CONTENT-->
		<div class="row">
			<div class="col-md-12">
				<!-- BEGIN EXAMPLE TABLE PORTLET-->
				<div class="portlet box blue">
					<div class="portlet-title">
						<div class="caption">
							<i class="fa fa-users"></i><?= $title; ?>
						</div>
						<div class="tools">
							<a href="javascript:;" class="reload">
							</a>
							<a href="javascript:;" class="remove">
							</a>
						</div>
					</div>
					<div class="portlet-body">
						<?php

						if ($this->session->flashdata('error')) {
							echo '	<div class="alert alert-danger">
										<strong>Error!</strong> ' . $this->session->flashdata('error') . '
										</div>';
						}

						if ($this->session->flashdata('success')) {
							echo '	<div class="alert alert-success">
										<strong>Message!</strong> ' . $this->session->flashdata('success') . '
										</div>';
						}

						?>
						<div class="btn-group">
							<button data-toggle="modal" data-target="#create-user" class="btn btn-primary blue">
								Add <i class="fa fa-plus"></i>
							</button>
						</div>
						<table class="table table-striped table-bordered table-hover" id="sample_2">
							<thead>
								<tr>
									<th>
										No
									</th>
									<th>
										Question
									</th>
									<th>
										Image
                                             </th>
                                             <th>
										Answer
                                             </th>
                                             <th>
										Choice a
                                             </th>
                                             <th>
										Choice b
                                             </th>
                                             <th>
										Choice c
                                             </th>
                                             <th>
										Choice d
                                             </th>
                                             <th>
										Date Added
									</th>
									<th>
										Status
									</th>
									<th>
										Action
									</th>
								</tr>
							</thead>
							<tbody>

							</tbody>
						</table>
					</div>
				</div>
				<!-- END EXAMPLE TABLE PORTLET-->
			</div>
		</div>
		<!-- END PAGE CONTENT-->
	</div>
</div>
<!-- END CONTENT -->
</div>
<!-- END CONTAINER -->
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
<script src="<?= base_url(); ?>assets/global/plugins/respond.min.js"></script>
<script src="<?= base_url(); ?>assets/global/plugins/excanvas.min.js"></script> 
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
<script src="<?= base_url(); ?>assets/global/plugins/uniform/jquery.uniform.min.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js" type="text/javascript"></script>
<!-- END CORE PLUGINS -->
<!-- BEGIN PAGE LEVEL PLUGINS -->
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/select2/select2.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/media/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/TableTools/js/dataTables.tableTools.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/ColReorder/js/dataTables.colReorder.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/Scroller/js/dataTables.scroller.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js"></script>
<!-- END PAGE LEVEL PLUGINS -->
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-wysihtml5/wysihtml5-0.3.0.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.js"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-markdown/lib/markdown.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-markdown/js/bootstrap-markdown.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-summernote/summernote.min.js" type="text/javascript"></script>

<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
<!-- <script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script> -->
<!-- <script src="<?= base_url(); ?>assets/global/scripts/loadingoverlay.min.js"></script> -->
<!-- <script src="<?= base_url(); ?>assets/ckeditor/ckeditor.js"></script> -->


<!-- Insert these scripts at the bottom of the HTML, but before you use any Firebase services -->

<!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-app.js"></script>

<!-- If you enabled Analytics in your project, add the Firebase SDK for Analytics -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-analytics.js"></script>

<!-- Add Firebase products that you want to use -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-storage.js"></script>

<script>
// Your web app's Firebase configuration

var firebaseConfig = {
    apiKey: "AIzaSyDHo5NWWdpmeDyrFRM8DwHHqGZAGPepoUQ",
    authDomain: "airqo-frontend-media.firebaseapp.com",
    databaseURL: "https://airqo-frontend-media.firebaseio.com",
    projectId: "airqo-frontend-media",
    storageBucket: "airqo-frontend-media.appspot.com",
    messagingSenderId: "1093508119261",
    appId: "1:1093508119261:web:ab4219a0c1bde3165c3934"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

var selectedFile;
var selectedFile1;


$( document ).ready(function() {
	document.getElementById("fb_upload").addEventListener('change', handleFileSelect, false);
	document.getElementById("efb_upload").addEventListener('change', handleFileSelect1, false);
});

function handleFileSelect(event) {
	selectedFile = event.target.files[0];
	confirmUpload();
};

function handleFileSelect1(event) {
	selectedFile1 = event.target.files[0];
	confirmUpload1();
};

function confirmUpload() {
	// $.LoadingOverlay("show");
	var metadata = {
		contentType: 'image'
	};
	var uploadTask = firebase.storage().ref().child('questions/images/' + selectedFile.name).put(selectedFile, metadata);
	// Register three observers:
	// 1. 'state_changed' observer, called any time the state changes
	// 2. Error observer, called on failure
	// 3. Completion observer, called on successful completion
	uploadTask.on('state_changed', function(snapshot){
  		// Observe state change events such as progress, pause, and resume
  		// See below for more detail
	}, function(error) {
  		// Handle unsuccessful uploads
	}, function() {
  		// Handle successful uploads on complete
  		// For instance, get the download URL: https://firebasestorage.googleapis.com/...
  		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
			// console.log(downloadURL);
			// $.LoadingOverlay("hide");
			$('#fb_downloadURL').val(downloadURL);
		});

	});

}
function confirmUpload1() {
	$.LoadingOverlay("show");
	var metadata = {
		contentType: 'image'
	};
	var uploadTask = firebase.storage().ref().child('questions/images/' + selectedFile1.name).put(selectedFile1, metadata);
	// Register three observers:
	// 1. 'state_changed' observer, called any time the state changes
	// 2. Error observer, called on failure
	// 3. Completion observer, called on successful completion
	uploadTask.on('state_changed', function(snapshot){
  		// Observe state change events such as progress, pause, and resume
  		// See below for more detail
	}, function(error) {
  		// Handle unsuccessful uploads
	}, function() {
  		// Handle successful uploads on complete
  		// For instance, get the download URL: https://firebasestorage.googleapis.com/...
  		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
			// console.log(downloadURL);
			// $.LoadingOverlay("hide");
			$('#efb_downloadURL').val(downloadURL);
		});

	});

}
</script>
<script type="text/javascript">
	$(document).on("click", ".open-edit", function() {
		var id = $(this).data('id');
		//get category details
		$.ajax({
			type: "POST",
			url: "<?= site_url('a-load-question'); ?>",
			data: {
				qid: id
			},
			dataType: "json",
			beforeSend: function() {
				// $.LoadingOverlay("show");
			},
			success: function(response) {
				var success = response.success;
				if (success == 1) {
					$('#eid').val(response.id);
					$('#eanswer').val(response.answer);
					$('#equestion1').val(response.question);
					$('#echoicea').val(response.choicea);
					$('#echoiceb').val(response.choiceb);
					$('#echoicec').val(response.choicec);
					$('#echoiced').val(response.choiced);
					$('#eimage').attr('src', response.question_image);
					$('#efb_downloadURL').val(response.question_image);

					// $.LoadingOverlay("hide");
				} else {
					// $.LoadingOverlay("hide");
				}
			}
		});
	});

	$(document).on("click", ".open-delete", function() {
		var id = $(this).data('id');
		var name = $(this).data('name');
		$('#deleteID').val(id);
		$('#delete-init-message').html('<div class="alert alert-warning">Are you sure you want to delete ' + name + '</div>');
	});

	$(document).on("click", ".open-disable", function() {
		var id = $(this).data('id');
		var name = $(this).data('name');
		$('#disableID').val(id);
		$('#disable-init-message').html('<div class="alert alert-warning">Are you sure you want to disable ' + name + '</div>');
	});

	$(document).on("click", ".open-activate", function() {
		var id = $(this).data('id');
		var name = $(this).data('name');
		$('#activateID').val(id);
		$('#activate-init-message').html('<div class="alert alert-warning">Are you sure you want to activate ' + name + '</div>');
	});
	$(document).ready(function() {
		$('#createUserForm').submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('a-create-question'); ?>",
				data: new FormData(this),
				contentType: false,
				processData: false,
				cache: false,
				async: false,
				dataType: "json",
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if (success == 1) {
						$('#create-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function() {
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

		// Edit Category
		$('#editUserForm').submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('a-edit-question'); ?>",
				data: new FormData(this),
				contentType: false,
				processData: false,
				cache: false,
				async: false,
				dataType: "json",
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if (success == 1) {
						$('#edit-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function() {
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

		//Delete Cateogry
		$('#deleteUserForm').submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('a-delete-question'); ?>",
				data: new FormData(this),
				contentType: false,
				processData: false,
				cache: false,
				async: false,
				dataType: "json",
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if (success == 1) {
						$('#delete-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function() {
							$('#delete-message').html('');
							document.location = '<?= current_url(); ?>';
						}, 2000);
					} else {
						//unable to sign up
						$('#delete-message').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
					}
				}
			});
		});

		//Disable Cateogry
		$('#disableUserForm').submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('a-disable-question'); ?>",
				data: new FormData(this),
				contentType: false,
				processData: false,
				cache: false,
				async: false,
				dataType: "json",
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if (success == 1) {
						$('#disable-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function() {
							$('#disable-message').html('');
							document.location = '<?= current_url(); ?>';
						}, 2000);
					} else {
						//unable to sign up
						$('#disable-message').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
					}
				}
			});
		});

		//Activate Cateogry
		$('#activateUserForm').submit(function(e) {
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "<?= site_url('a-activate-question'); ?>",
				data: new FormData(this),
				contentType: false,
				processData: false,
				cache: false,
				async: false,
				dataType: "json",
				beforeSend: function() {
					// $.LoadingOverlay("show");
				},
				success: function(response) {
					var success = response.success;
					// $.LoadingOverlay("hide");
					if (success == 1) {
						$('#activate-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
						setTimeout(function() {
							$('#activate-message').html('');
							document.location = '<?= current_url(); ?>';
						}, 2000);
					} else {
						//unable to sign up
						$('#activate-message').html('<div class="alert alert-danger" role="alert">' + response.message + '</div>');
					}
				}
			});
		});
	});
</script>
<script>
	var TableAdvanced = function() {

		var initUserTable = function() {
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
				"serverSide": "true",
				"processing": "true",
				"ajax": {
					"url": "<?= site_url('a-load-questions-table'); ?>",
					"type": "POST",
					"data": {

					},
					"dataType": "json",
				},
				"order": [
					[0, 'desc']
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
					"aButtons": [{
						"sExtends": "pdf",
						"sButtonText": "PDF"
					}, {
						"sExtends": "csv",
						"sButtonText": "CSV"
					}, {
						"sExtends": "xls",
						"sButtonText": "Excel"
					}, {
						"sExtends": "print",
						"sButtonText": "Print",
						"sInfo": 'Please press "CTRL+P" to print or "ESC" to quit',
						"sMessage": "Generated by DataTables"
					}, {
						"sExtends": "copy",
						"sButtonText": "Copy"
					}]
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

				initUserTable();
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
</body>
<!-- END BODY -->

</html>