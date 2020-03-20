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
		if ($this->session->flashdata('error')) {
			echo '<div class="alert alert-danger">
			<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('error') . '</span></div>';
		}
		if ($this->session->flashdata('msg')) {
			echo '<div class="alert alert-success">
			<button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>' . $this->session->flashdata('msg') . '</span></div>';
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
							<button class='btn btn-success addMember pull-right' id="Storybtn">+ Add Member</button>
							<a href="<?php echo site_url('Admin/team'); ?>" class='btn btn-success addMember1 pull-right' id="Storybtn1"> Back</a>
						</div>
					</div>
					<style type="text/css">
						img {
							object-fit: cover;
						}

						.btn-success {
							background-color: #3399CC;
							border-color: #3399CC;
						}

						.kaboom .add .btn {
							border-radius: 0px !important;
							width: 120px;
						}

						.kaboom #actionbtn1 {
							margin: auto;
							border-radius: 0px !important;
							width: 90px;
							height: 30px;
							margin-bottom: 5px;
						}

						.kaboom #actionbtn2 {
							margin: auto;
							border-radius: 0px !important;
							width: 90px;
							height: 30px;
							margin-bottom: 5px;
						}

						.kaboom .actionbtn3 {
							margin: auto;
							border-radius: 0px !important;
							width: 90px;
							height: 30px;
							margin-bottom: 5px;
						}

						.kaboom .add {
							text-align: right;
							font-size: 12px;
						}

						.kaboom .pro {
							text-align: center;

						}

						.kaboom .pro .btn {
							width: 200px;

						}

						/* .btn-default {
					    color: #fff;
					    background-color: #006400;
					    border-color: #ccc;
						} */
						.shwimg {
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
								<br />
								<table class="table table-responsive table-bordered" width="100%" id="sample_2">
									<thead>
										<tr>
											<th>No. </th>
											<th>Position </th>
											<th>Name </th>
											<th>Title </th>
											<th>Mobile</th>
											<th>Email</th>
											<th>Facebook</th>
											<th>Twitter</th>
											<!-- <th>Other Address</th> -->
											<th>Image</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										<?php
										$team_members = $this->AdminModel->list_team_members();
										$i = 0;
										foreach ($team_members as $row) {
											$i++;
										?>
											<tr>
												<td><?php echo $i ?></td>
												<td><?php echo $row['team_position']; ?></td>
												<td><?php echo $row['team_name']; ?></td>
												<td><?php echo $row['team_title']; ?></td>
												<td><?php echo $row['team_phoneline']; ?></td>
												<td><?php echo $row['team_emailAddress']; ?></td>
												<td><?php echo $row['team_facebook']; ?></td>
												<td><?php echo $row['team_twitter']; ?></td>
												<!-- <td><?php echo $row['team_otherAddress']; ?></td> -->
												<td>
													<?php
													if (!empty($row['team_image'])) {
														echo '
													<img class="img_zero"  src="' . $row['team_image'] . '" width="70px" height="70px;" alt="Team Member Image">
													';
													} else {
														echo '';
													}
													?>
												</td>

												<td>
													<!-- <a href="<?php echo base_url('Admin/teamDetails/'); ?><?= $row['tm_id']; ?>" type="submit" class="btn btn-primary" id="actionbtn1">  View </a> -->
													<a data-toggle="modal" data-target=".edit_team" class="btn btn-warning" data-id="<?= $row['team_id']; ?>" id="actionbtn2">Edit</a>
													<br />
													<button data-id="<?php echo $row['team_id']; ?>" class="btn btn-danger actionbtn3 delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
												</td>
											<?php
										}
											?>
									</tbody>
								</table>
							</div>

							<!-- THE ADD MEMBER FORM -->

							<form name="form" method="post" action="<?php echo site_url('Admin/addMember'); ?>" class="addMember_form" enctype="multipart/form-data">

								<div class="form-group col-md-6">
									Member Name:
									<input type="text" name="team_name" class="form-control" placeholder="Enter member name" required />
								</div>
								<div class="form-group col-md-6">
									Position/Title:
									<input type="text" name="team_title" class="form-control" placeholder="Enter position/title " required />
								</div>
								<div class="form-group col-md-3">
									Phone:
									<input type="text" name="team_phoneline" class="form-control" placeholder="Enter phone number" />
								</div>
								<br />
								<div class="form-group col-md-3">
									Email:
									<input type="email" name="team_emailAddress" class="form-control" placeholder="Enter email Address" />
								</div>
								<br />
								<div class="form-group col-md-3">
									Facebook Address:
									<input type="text" name="team_facebook" class="form-control" placeholder="Enter facebook Address" />
								</div>
								<br />
								<div class="form-group col-md-3">
									Twitter Address:
									<input type="text" name="team_twitter" class="form-control" placeholder="Enter twitter handle" />
								</div>
								<br />
								<div class="form-group col-md-3">
									Position
									<input type="number" name="team_position" class="form-control" value="0" placeholder="Enter Position" />
								</div>
								<br />
								<div class="form-group col-md-12">
									Profile Image:
									<input type="file" class="form-control" id="fb_upload" name="qn_image" />
									<input type="text" id="fb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
								</div>
								<br />
								
								<div class="form-group col-md-12">
									Profile Information:
									<textarea cols="20" rows="5" id="ckeditor1" class="summernote" name="team_otherAddress" placeholder="enter any other addresses"></textarea>
									<script>
										// CKEDITOR.replace("ckeditor1");
									</script>
								</div>

								<br /> <br /><br /><br /><br />
								<div class="form-group pro">
									<button type="submit" class="btn btn-primary " title="Click to add team member" name="submit" id="submit"> Add Member</button>
								</div>
								<hr style="background-color:red; height:2px;" />
							</form>
							<!--End of the form-->

							<!-- The Modal for the image -->
							<div class="modal fade modal1" id="myModal1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
								<div class="modal-dialog">
									<div class="modal-content">
										<div class="modal-header">
											<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
											<h4 class="modal-title"></h4>
										</div>
										<div class="modal-body">
											<img class="shwimg">
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
<div class="buzenAcc_edit">
	<div class="modal fade edit_team" id="" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
						&times;
					</button>
					<h4 style="color: #00326f; text-align: center; margin-top: 15px;">EDIT THE TEAM MEMBER DETAILS</h4>

				</div>

				<div class="modal-body">
					<!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
					<form name="form" method="post" action="<?php echo site_url('Admin/editTeam'); ?>" enctype="multipart/form-data">
						<input class="form-control" type="hidden" id="team_id" name="team_id" placeholder="" />
						<div class="form-group col-md-6">
							Name:
							<input type="text" name="team_name" id="tm_name" class="form-control" required />
						</div>
						<div class="form-group col-md-6">
							Position/Title:
							<input type="text" name="team_title" id="tm_title" class="form-control" required />
						</div>

						<div class="form-group col-md-3">
							Phone Number:
							<input type="text" name="team_phoneline" id="tm_contact" class="form-control" required />
						</div>

						<div class="form-group col-md-3">
							Email:
							<input type="email" name="team_emailAddress" id="tm_email" class="form-control" required />
						</div>
						<div class="form-group col-md-3">
							Facebook Address:
							<input type="text" name="team_facebook" id="tm_facebook" class="form-control" required />
						</div>
						<div class="form-group col-md-3">
							Twitter Handle:
							<input type="text" name="team_twitter" id="tm_twitter" class="form-control" required />
						</div>
						<div class="form-group col-md-12">
							Position
							<input type="number" name="team_position" id="tm_position" class="form-control" placeholder="Enter Position" />
						</div>
						<br />
						<div class="form-group col-md-12">
							<span style="color:blue;">Previous Image</span>
							<img id="eImg" src="" height="100" width="150" class="thumbnail" />
							Profile Image
							<input type="file" class="form-control" id="efb_upload" name="qn_image" />
							<input type="text" id="efb_downloadURL" class="form-control" name="imagelink" placeholder="Image Link" readonly/>
						</div>
						<div class="form-group col-md-12">
							Profile Information
							<textarea cols="10" rows="2" id="ckeditor2" class="summernote" name="team_otherAddress" required></textarea>
							<script type="text/javascript">
								// CKEDITOR.replace("ckeditor2");
							</script>
						</div>
						<br /> <br /><br /><br /><br />
						<div class="form-group pro">
							<button type="submit" class="btn btn-primary " title="Click to save changes" name="submit" id="submit"> Save Changes</button>
							<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						</div>
						<hr style="background-color:red; height:2px;" />
					</form>
					<!--End of the form-->
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
<script src="<?php echo base_url(); ?>assets/js/jquery-1.11.1.min.js"></script>
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
<script src="<?= base_url(); ?>assets/dist/summernote.min.js" type="text/javascript"></script>
<!-- BEGIN PAGE LEVEL PLUGINS -->
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/select2/select2.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/media/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/TableTools/js/dataTables.tableTools.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/ColReorder/js/dataTables.colReorder.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/extensions/Scroller/js/dataTables.scroller.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js"></script>
<!-- END PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/loadingoverlay.min.js"></script>

<script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script>
<script src="<?= base_url(); ?>assets/gn/js/cropping/cropper.min.js"></script>

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
	$(".addMember1").hide();
	$(".addMember").click(function() {
		$(".addMember1").show();
		$(".addMember").hide();
	});

	$('.summernote').summernote({
		fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Lato'],
		fontNamesIgnoreCheck: ['Lato'],
		toolbar: [
			['style', ['style']],
			['font', ['bold', 'underline', 'clear']],
			['fontsize', ['fontsize']],
			['fontname', ['fontname']],
			['color', ['color']],
			['para', ['ul', 'ol', 'paragraph']],
			['table', ['table']],
			['insert', ['link', 'picture', 'video']],
			['view', ['fullscreen', 'codeview', 'help']],
		],
		height: 400
	});
</script>
<script type="text/javascript">
	// AUTO HIDE CONTENT SCRIPT
	$(".addMember_form").hide();
	$(".addMember").click(function() {
		$(".addMember_form").toggle();
	});

	$(".addMember").click(function() {
		$("#info").toggle();
	});

	// IMAGE POPUP
	$('.img_zero').click(function() {
		var modal = $('#myModal1');
		$('.shwimg').attr('src', this.src);
		$('.modal-title').html(this.alt);
		modal.modal();
	});
</script>
<script type="text/javascript">
	$(document).ready(function() {
		//Editing Modal
		$('.edit_team').on('show.bs.modal', function(e) {
			// console.log('yiki');
			var id = $(e.relatedTarget).data('id');
			// console.log(id);
			$.ajax({
				type: 'post',
				url: '<?= site_url("Admin/editTeamDetails"); ?>',
				data: {
					team_id: id
				},
				cache: false,
				dataType: 'json',
				beforeSend: function() {

					//$.LoadingOverlay("show");
				},
				success: function(data) {

					$('#team_id').val(data.id);
					$('#tm_name').val(data.t_name);
					$('#tm_title').val(data.t_title);
					$('#tm_contact').val(data.t_contacts);
					$('#tm_facebook').val(data.t_facebook);
					$('#tm_twitter').val(data.t_twitter);
					$('#tm_position').val(data.t_position);
					$('#tm_email').val(data.t_email);
					$('#efb_downloadURL').val(data.t_image);
					$('#ckeditor2').summernote('code', data.t_otherAdress);
					// CKEDITOR.instances['ckeditor2'].setData(data.t_otherAdress);
					var url = data.t_image;
					// console.log(url);
					$('#eImg').attr('src', url);
				}
			});
		});

		// SCRIPT FOR THE DELETE function

		$('.delete-btn').on('confirmed.bs.confirmation', function() {

			var id = $(this).data('id');

			$.ajax({
				type: 'post',
				url: '<?= site_url("Admin/deleteTeamMember"); ?>',
				data: {
					team_id: id
				},
				success: function(data) {
					// console.log(data);
					// console.log('yiki');
					if (data == '1') {
						window.location = "<?= site_url("Admin/team"); ?>";
					} else {
						window.location = "<?= site_url("Admin/team"); ?>";
						console.log("Unable to delete...");
					}
				},
				error: function(error) {
					console.log(error);
				}
			});
		});
	});
</script>

<!-- script for edit image crop -->
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