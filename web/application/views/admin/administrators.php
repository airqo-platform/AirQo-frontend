<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">
		<div class="modal fade create-node" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Create Admin
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
					<form method="post" id="createTeamForm" enctype="multipart/form-data">
						<table class="table table-bordered table-stripped">
							<tr>
								<th>Fullname</th>
								<td><input type="text" name="admin_name" class="form-control" placeholder="Fullname" required /></td>
							</tr>
							<tr>
								<th>Username</th>
								<td><input type="text" name="admin_username" class="form-control" placeholder="Username" required /></td>
							</tr>
							<tr>
								<th>Password</th>
								<td><input type="password" name="admin_password" class="form-control" placeholder="Password" required /></td>
							</tr>
							<tr>
								<th>Email</th>
								<td><input type="email" name="admin_email" class="form-control" placeholder="Email Address" /></td>
							</tr>
							<tr>
								<th>Phone</th>
								<td><input type="text" name="admin_phoneNumber" class="form-control" placeholder="Phone" required /></td>
							</tr>
							<tr>
								<th>Role</th>
								<td>
									<select class="form-control" name="admin_role" required>
										<option>Select Role</option>
										<option value="super">Super Admin</option>
										<option value="admin">Admin</option>
									</select>
								</td>
							</tr>
							<tr>
								<th>Profile Image</th>
								<td>
									<input type="file" class="form-control" id="fb_upload" name="qn_image" />
									<input type="text" id="fb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
								</td>
							</tr>
						</table>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn btn-default btn-primary">Create</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
					</form>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
		</div>

		<div class="modal fade edit-node" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="portlet box blue">
						<div class="portlet-title">
							<div class="caption">
								<i class="fa fa-plus"></i>Edit Admin
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
					<form method="post" id="createTeamForm" enctype="multipart/form-data">
						<table class="table table-bordered table-stripped">
							<tr>
								<th>Fullname</th>
								<td><input type="text" id="ename" name="admin_name" class="form-control" placeholder="Fullname" required /></td>
							</tr>
							<tr>
								<th>Username</th>
								<td><input type="text" id="euname" name="admin_username" class="form-control" placeholder="Username" required /></td>
							</tr>
							<tr>
								<th>Email</th>
								<td><input type="email" id="eemail" name="admin_email" class="form-control" placeholder="Email Address" /></td>
							</tr>
							<tr>
								<th>Phone</th>
								<td><input type="text" id="phone" name="admin_phoneNumber" class="form-control" placeholder="Phone" required /></td>
							</tr>
							<tr>
								<th>Role</th>
								<td>
									<select class="form-control" id="erole" name="admin_role" required>
										<option>Select Role</option>
										<option value="super">Super Admin</option>
										<option value="admin">Admin</option>
									</select>
								</td>
							</tr>
							<tr>
								<th>Profile Image</th>
								<td>
									<input type="file" class="form-control" id="efb_upload" name="qn_image" />
									<input type="text" id="efb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
								</td>
							</tr>
						</table>
					</div>
					<div class="modal-footer">
						<button type="submit" class="btn btn-default btn-primary">Save</button>
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
					</form>
				</div>
				<!-- /.modal-content -->
			</div>
			<!-- /.modal-dialog -->
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
						<button data-target=".create-node" data-toggle="modal" class="btn btn-primary">
							Create
						</button>
						<table class="table table-bordered" id="sample_2">
							<thead>
								<tr>
									<th>
										No.
									</th>
									<th>
										Full Name
									</th>
									<th>
										User Name
									</th>
									<th>
										Email
									</th>
									<th>
										Phone
									</th>
									<th>
										Role
									</th>
									<th>
										Image
									</th>
									<th>
										Action
									</th>
								</tr>
							</thead>

							<tbody>
								<?php
								$i = 0;
								foreach ($admin as $row) {
									$i++;
									?>
									<tr>
										<td><?php echo $i ?></td>
										<td><?php echo $row['admin_name']; ?></td>
										<td><?php echo $row['admin_username']; ?></td>
										<td><?php echo $row['admin_email']; ?></td>
										<td><?php echo $row['admin_phoneNumber']; ?></td>
										<td><?php echo $row['admin_role']; ?></td>
										<td>
											<?php
											if (!empty($row['admin_image'])) {
												echo '<img class="img_zero"  src="' . $row['admin_image'] . '" width="70px" height="70px;" alt="Admin Image">';
											}
											?>
										</td>
										<td>
											<?php
											if ($row['admin_status'] == '1' && $row['admin_role'] == 'super') {
												echo '<h4>All rights.!</h4>';
											} else if ($row['admin_status'] == '1') {
												echo '<a data-id="' . $row['admin_id'] . '" href="#" type="submit" class="de_activate btn btn-danger actionbtn3">De-activate </a>';
											} else {
												echo '<a data-id="' . $row["admin_id"] . '"  href="#" type="submit" class="activate btn btn-primary actionbtn3"> Activate </a>';
											}
											?>
										</td>
									</tr>
								<?php
								}
								?>
							</tbody>
						</table>
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
		<?= date('Y'); ?> &copy; Airqo All Rights Reserved.
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
<script src="<?php echo base_url(); ?>assets/js/jquery-1.11.1.min.js"></script>
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
<script src="<?= base_url(); ?>assets/global/scripts/loadingoverlay.min.js"></script>

<!-- Insert these scripts at the bottom of the HTML, but before you use any Firebase services -->

<!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-app.js"></script>

<!-- If you enabled Analytics in your project, add the Firebase SDK for Analytics -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-analytics.js"></script>

<!-- Add Firebase products that you want to use -->
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.1.0/firebase-storage.js"></script>

<script type="text/javascript">
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
	$.LoadingOverlay("show");
	var metadata = {
		contentType: 'image'
	};
	var uploadTask = firebase.storage().ref().child('profile/images/' + selectedFile.name).put(selectedFile, metadata);
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
			$.LoadingOverlay("hide");
			$('#fb_downloadURL').val(downloadURL);
		});

	});

}
function confirmUpload1() {
	$.LoadingOverlay("show");
	var metadata = {
		contentType: 'image'
	};
	var uploadTask = firebase.storage().ref().child('profile/images/' + selectedFile1.name).put(selectedFile1, metadata);
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
			$.LoadingOverlay("hide");
			$('#efb_downloadURL').val(downloadURL);
		});

	});

}
</script>

<script type="text/javascript">

	$(document).on("submit", "#createTeamForm", function(e) {
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "<?= site_url('admin/registeradministrator'); ?>",
			data: new FormData(this),
			contentType : false,
			processData : false,
			cache: false,
			async: false,
			dataType    : "json",
			beforeSend  : function(){
				// $.LoadingOverlay("show");
			},
			success     : function (response) {
				var success = response.success;
				// $.LoadingOverlay("hide");
				if(success == 1){
					$('#create-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
					setTimeout(function(){
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

	$(document).on("submit", "#editTeamForm", function(e) {
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "<?= site_url('admin/editteam'); ?>",
			data: new FormData(this),
			contentType : false,
			processData : false,
			cache: false,
			async: false,
			dataType    : "json",
			beforeSend  : function(){
				// $.LoadingOverlay("show");
			},
			success     : function (response) {
				var success = response.success;
				// $.LoadingOverlay("hide");
				if(success == 1){
					$('#edit-message').html('<div class="alert alert-success" role="alert">' + response.message + '</div>');
					setTimeout(function(){
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

	$(document).on("click", ".btn-edit-team", function() {
		var id = $(this).data('id');
		// alert(id);
		$.ajax({
			type: 'post',
			url: '<?= site_url("Admin/editTeamDetails"); ?>',
			data: {
				team_id: id
			},
			cache: false,
			dataType: 'json',
			beforeSend: function() {},
			success: function(data) {
				$('#team_id').val(data.id);
				$('#tm_name').val(data.t_name);
				$('#tm_title').val(data.t_title);
				$('#tm_phone').val(data.t_contacts);
				$('#tm_facebook').val(data.t_facebook);
				$('#tm_twitter').val(data.t_twitter);
				$('#tm_position').val(data.t_position);
				$('#tm_email').val(data.t_email);
				$('#efb_downloadURL').val(data.t_image);
				$('#tm_profile').html(data.t_otherAdress);
				var url = data.t_image;
				$('#eImg').attr('src', url);
			}
		});
	});

	// IMAGE POPUP
	$(document).ready(function() {

		$('.img_zero').click(function() {
			var modal = $('#myModal1');
			$('.shwimg').attr('src', this.src);
			$('.modal-title').html(this.alt);
			modal.modal();
		});
	});
	// ADMIN DELETE
	$(document).ready(function() {
		$('.de_activate').click(function() {
			//alert('go');
			//				var id  = $(this).attr(id);
			var id = $(this).data('id');

			if (confirm("Are you sure de-activating this Admin?")) {
				//alert(id);
				window.location = "<?php echo site_url('Admin/updateAdministratorStatus/'); ?>" + id;
			} else {
				return false;
			}
		});
	});
	$(document).ready(function() {
		$('.activate').click(function() {
			//alert('go');
			//				var id  = $(this).attr(id);
			var id = $(this).data('id');

			if (confirm("Are you sure activating this Admin?")) {
				//alert(id);
				window.location = "<?php echo site_url('Admin/updateActiveStatus/'); ?>" + id;
			} else {
				return false;
			}
		});
	});
</script>

<script>
	var TableAdvanced = function() {
		var initTable2 = function() {
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