<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
	<div class="page-content">
		<!-- BEGIN PAGE HEADER-->
		<h3 class="page-title">
			Post <small>Edit Post</small>
		</h3>
		<div class="page-bar">
			<ul class="page-breadcrumb">
				<li>
					<i class="fa fa-home"></i>
					<a href="#">Home</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#">Post</a>
					<i class="fa fa-angle-right"></i>
				</li>
				<li>
					<a href="#">Edit Post</a>
				</li>
			</ul>
		</div>
		<!-- END PAGE HEADER-->
		<!-- BEGIN PAGE CONTENT-->
		<div class="row">
			<div class="col-md-12">
				<div class="portlet box blue">
					<div class="portlet-title">
						<div class="caption">
							<i class="fa fa-tasks"></i>Edit Post
						</div>
						<div class="tools">
							<a href="javascript:;" class="collapse">
							</a>
							<a href="#portlet-config" data-toggle="modal" class="config">
							</a>
							<a href="javascript:;" class="reload">
							</a>
							<a href="javascript:;" class="remove">
							</a>
						</div>
					</div>
					<div class="portlet-body form">
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
						<!-- BEGIN FORM-->
						<form action="<?= site_url('a-edit-post/' . $post['p_id']); ?>" method="post" class="form-horizontal" enctype="multipart/form-data">
							<div class="form-body">
								<div class="form-group">
									<label class="col-md-3 control-label">Post Title</label>
									<div class="col-md-8">
										<input type="text" class="form-control" name="post_title" value="<?= $post['p_title']; ?>" placeholder="Post Title">
									</div>
								</div>

								<div class="form-group">
									<label class="col-md-3 control-label">Post Image</label>
									<div class="col-md-4">
										<input type="file" id="fb_upload" name="image" class="form-control" />
                                             	<input type="text" id="fb_downloadURL" class="form-control" name="post_image" value="<?= $post['p_img']; ?>" placeholder="Image Link" readonly/>

									</div>
									<div class="col-md-4">
										<img src="<?= $post['p_img']; ?>" class="img-responsive thumbnail" width="150" style="" alt="">

									</div>
								</div>
								<div class="form-group">
									<label class="col-md-3 control-label">Image Caption</label>
									<div class="col-md-8">
										<input type="text" class="form-control" name="post_image_caption" placeholder="Image Caption" value="<?= $post['p_img_caption']; ?>">
									</div>
								</div>
								<div class="form-group">
									<label class="col-md-3 control-label">Content</label>
									<div class="col-md-8">
										<textarea class="form-control" id="summernote_1" name="post_content" placeholder="Content"><?= $postmeta['pm_content']; ?></textarea>
									</div>
								</div>


								<div class="form-group">
									<label class="col-md-3 control-label">Excert</label>
									<div class="col-md-8">
										<textarea class="form-control" name="post_excert" placeholder="Excert"><?= $post['p_excert']; ?></textarea>

									</div>
								</div>
							</div>

							<div class="form-group">
								<label class="col-md-3 control-label">Post Categories</label>
								<div class="col-md-4">
									<select class="form-control" name="post_category">
										<?php
										$catlist = $this->CategoryModel->get_category();
										$pcategories = explode(',', $post['p_categories']);
										foreach ($catlist as $cat) {
											if (in_array($cat['c_id'], $pcategories)) {
											?>
												<option value="<?= $cat['c_id']; ?>" selected><?= $cat['c_name']; ?></option>
											<?php
											} else {
											?>
												<option value="<?= $cat['c_id']; ?>"><?= $cat['c_name']; ?></option>
											<?php
											}
										}
										?>
									</select>
									
								</div>
							</div>


							<div class="form-actions">
								<div class="row">
									<div class="col-md-offset-3 col-md-9">
										<button type="submit" class="btn btn-circle blue">Update</button>
										<button type="button" class="btn btn-circle default">Cancel</button>
									</div>
								</div>
							</div>
						</form>
						<!-- END FORM-->
					</div>
				</div>
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

<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-wysihtml5/wysihtml5-0.3.0.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.js"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-markdown/lib/markdown.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-markdown/js/bootstrap-markdown.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/global/plugins/bootstrap-summernote/summernote.min.js" type="text/javascript"></script>

<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-select/bootstrap-select.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/select2/select2.min.js"></script>
<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/jquery-multi-select/js/jquery.multi-select.js"></script>
<!-- END PAGE LEVEL PLUGINS -->
<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
<!-- <script src="<?= base_url(); ?>assets/admin/pages/scripts/form-samples.js"></script> -->
<!-- END PAGE LEVEL SCRIPTS -->

<script src="<?= base_url(); ?>assets/global/scripts/loadingoverlay.min.js"></script>
     <!-- <script src="<?= base_url(); ?>assets/admin/pages/scripts/form-samples.js"></script> -->
     <!-- END PAGE LEVEL SCRIPTS -->
    
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
	//document.getElementById("efb_upload").addEventListener('change', handleFileSelect1, false);
});

function handleFileSelect(event) {
	selectedFile = event.target.files[0];
	confirmUpload();
};

// function handleFileSelect1(event) {
// 	selectedFile1 = event.target.files[0];
// 	confirmUpload1();
// };

function confirmUpload() {
	$.LoadingOverlay("show");
	var metadata = {
		contentType: 'image'
	};
	var uploadTask = firebase.storage().ref().child('blog/images/' + selectedFile.name).put(selectedFile, metadata);
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
// function confirmUpload1() {
// 	$.LoadingOverlay("show");
// 	var metadata = {
// 		contentType: 'image'
// 	};
// 	var uploadTask = firebase.storage().ref().child('profile/images/' + selectedFile1.name).put(selectedFile1, metadata);
// 	// Register three observers:
// 	// 1. 'state_changed' observer, called any time the state changes
// 	// 2. Error observer, called on failure
// 	// 3. Completion observer, called on successful completion
// 	uploadTask.on('state_changed', function(snapshot){
//   		// Observe state change events such as progress, pause, and resume
//   		// See below for more detail
// 	}, function(error) {
//   		// Handle unsuccessful uploads
// 	}, function() {
//   		// Handle successful uploads on complete
//   		// For instance, get the download URL: https://firebasestorage.googleapis.com/...
//   		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
// 			// console.log(downloadURL);
// 			$.LoadingOverlay("hide");
// 			$('#efb_downloadURL').val(downloadURL);
// 		});

// 	});

// }
</script>

<script>
	$(document).ready(function() {
		$('#summernote_1').summernote({
			height: 300
		});
	});
	jQuery(document).ready(function() {
		// initiate layout and plugins
		Metronic.init(); // init metronic core components
		Layout.init(); // init current layout
		QuickSidebar.init(); // init quick sidebar
		Demo.init(); // init demo features
		//    FormSamples.init();
	});
</script>
<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->

</html>