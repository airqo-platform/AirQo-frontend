<?php
if (isset($this->session->userdata['logged_in']['admin_name'])) {
	redirect('a-dashboard');
}
?>
<!DOCTYPE html>
<html lang="en">
<!--<![endif]-->
<!-- BEGIN HEAD -->
<head>
	<meta charset="utf-8" />
	<title><?= $title; ?> | AIRQO ADMIN</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta content="width=device-width, initial-scale=1.0" name="viewport" />
	<meta http-equiv="Content-type" content="text/html; charset=utf-8">
	<meta content="" name="description" />
	<meta content="" name="author" />
	<!-- BEGIN GLOBAL MANDATORY STYLES -->
	<link href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=all" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/global/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/global/plugins/uniform/css/uniform.default.css" rel="stylesheet" type="text/css" />
	<!-- END GLOBAL MANDATORY STYLES -->
	<!-- BEGIN PAGE LEVEL STYLES -->
	<link href="<?= base_url(); ?>assets/admin/pages/css/login.css" rel="stylesheet" type="text/css" />
	<!-- END PAGE LEVEL SCRIPTS -->
	<!-- BEGIN TIME AND DATE LEVEL STYLES -->
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/clockface/css/clockface.css" />
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-datepicker/css/datepicker3.css" />
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css" />
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css" />
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css" />
	<link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css" />
	<!-- END TIME AND DATE LEVEL STYLES -->
	<!-- BEGIN THEME STYLES -->
	<link href="<?= base_url(); ?>assets/global/css/components-md.css" id="style_components" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/global/css/plugins-md.css" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/admin/layout/css/layout.css" rel="stylesheet" type="text/css" />
	<link href="<?= base_url(); ?>assets/admin/layout/css/themes/default.css" rel="stylesheet" type="text/css" id="style_color" />
	<link href="<?= base_url(); ?>assets/admin/layout/css/custom.css" rel="stylesheet" type="text/css" />
	<!-- END THEME STYLES -->
	<link rel="shortcut icon" href="<?= base_url(); ?>assets/images/logo.png" />
</head>
<!-- END HEAD -->
<!-- BEGIN BODY -->

<body class="page-md login">
	<!-- BEGIN SIDEBAR TOGGLER BUTTON -->
	<div class="menu-toggler sidebar-toggler">
	</div>
	<!-- END SIDEBAR TOGGLER BUTTON -->
	<div class="content" style="margin-top:10em;">
		<!-- BEGIN LOGIN FORM -->
		<form class="login-form" action="<?= site_url('a-login'); ?>" method="post">
			<!-- BEGIN LOGO -->
			<div class="logo" style="margin-top:1em;">
				<a href="#" style="padding:20px ; box-shadow: ; border-radius: 5px;">
					<img src="<?= base_url(); ?>assets/frontend/images/original.png" width="100px" alt="AIRQO Logo" />
				</a>
			</div>
			<!-- END LOGO -->
			<?php
			if ($this->session->flashdata('error')) {
				echo '<div class="alert alert-danger">
					<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('error') . '</span></div>';
			}
			if ($this->session->flashdata('success')) {
				echo '<div class="alert alert-success">
					<button class="close" data-close="alert"></button><span>' . $this->session->flashdata('success') . '</span></div>';
			}
			?>

			<div class="form-group">
				<!--ie8, ie9 does not support html5 placeholder, so we just show field title for that-->

				<label class="control-label visible-ie8 visible-ie9" required="required">User Name</label>
				<input class="form-control form-control-solid placeholder-no-fix" type="text" autocomplete="off" placeholder="User Name" name="admin_username" />
			</div>
			<div class="form-group">
				<label class="control-label visible-ie8 visible-ie9" required="required">Password</label>
				<input class="form-control form-control-solid placeholder-no-fix" type="password" autocomplete="off" placeholder="Password" name="admin_password" />
			</div>
			<div class="form-actions">
				<button type="submit" class="btn btn-success uppercase">Login</button>
				<a href="javascript:;" id="forget-password" class="forget-password">Forgot Password?</a>
			</div>
			<div class="login-options">

			</div>
			<div class="create-account" style="background-color: #3399CC;">
				<p class="uppercase" style=" color:white; font-size: 19px; font-weight: 10px">
					AIRQO - ADMIN PORTAL
				</p>
			</div>
		</form>
		<!-- END LOGIN FORM -->
		<!-- BEGIN FORGOT PASSWORD FORM -->
		<form class="forget-form" method="post" id="forgotPasswordForm">
			<h3>Forgot Password ?</h3>
			<div id="forgotPMessage"></div>
			<p>
				Enter your e-mail address below to reset your password.
			</p>
			<div class="form-group">
				<input class="form-control placeholder-no-fix" id="forgotP_email" type="text" autocomplete="off" placeholder="Email" name="name" />
			</div>
			<div class="form-actions">
				<button type="button" id="back-btn" class="btn btn-default">Back</button>
				<button type="submit" class="btn btn-success uppercase pull-right">Submit</button>
			</div>
		</form>
		<!-- END FORGOT PASSWORD FORM -->
	</div>
	<div class="copyright">
		<?= date('Y'); ?> © AIRQO. All Rights Reserved!
	</div>
	<!-- END LOGIN -->
	<!-- BEGIN JAVASCRIPTS(Load javascripts at bottom, this will reduce page load time) -->
	<!-- BEGIN CORE PLUGINS -->
	<!--[if lt IE 9]>
	<script src="<?= base_url(); ?>assets/global/plugins/respond.min.js"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/excanvas.min.js"></script>
	<![endif]-->
	<script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/jquery-migrate.min.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/jquery.blockui.min.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/uniform/jquery.uniform.min.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/jquery.cokie.min.js" type="text/javascript"></script>
	<!-- END CORE PLUGINS -->
	<!-- BEGIN PAGE LEVEL PLUGINS -->
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/clockface/js/clockface.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-daterangepicker/moment.min.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js"></script>
	<script type="text/javascript" src="<?= base_url(); ?>assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js"></script>
	<script src="<?= base_url(); ?>assets/global/plugins/jquery-validation/js/jquery.validate.min.js" type="text/javascript"></script>
	<!-- END PAGE LEVEL PLUGINS -->
	<!-- BEGIN PAGE LEVEL SCRIPTS -->
	<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
	<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
	<!--	<script src="<?= base_url(); ?>assets/admin/pages/scripts/login.js" type="text/javascript"></script>-->
	<script src="<?= base_url(); ?>assets/admin/pages/scripts/components-pickers.js"></script>
	<!-- END PAGE LEVEL SCRIPTS -->
	<script>
		$(document).ready(function() {
			$('#forgotPasswordForm').submit(function(e) {
				e.preventDefault();
				var email = $('#forgotP_email').val();
				//check if email exists
				$.ajax({
					url: '<?= site_url("a-check-mail"); ?>',
					type: 'POST',
					data: {
						email: email
					},
					dataType: 'json',
					success: function(data) {
						var success = data.success;
						if (success == 1) {
							//Email Exists
							var email = $('#forgotP_email').val();
							//Send Email
							$.ajax({
								url: '<?= site_url("a-send-forgot-password-email"); ?>',
								type: 'POST',
								data: {
									email: email
								},
								dataType: 'json',
								success: function(data) {
									var success = data.success;
									if (success == 1) {
										$('#forgotPMessage').html('<div class="alert " style="color: green;" >' + data.message + '</div>');
										var delay = 2000;
										setTimeout(function() {
											$('#forgotPMessage').html('');
											$('#forgotP_email').val('');
										}, delay);
									} else {
										//Error Message Not Registered
										$('#forgotPMessage').html('<div class="alert alert-error" style="color: red;" >' + data.message + '</div>');
										var delay = 2000;
										setTimeout(function() {
											$('#forgotPMessage').html('');
											$('#forgotP_email').val('');
										}, delay);
									}
								}
							});
							//Show Message of having sent email
						} else {
							//Error Message Not Registered
							$('#forgotPMessage').html('<div class="alert alert-error" style="color: red;">' + data.message + '</div>');
							var delay = 2000;
							setTimeout(function() {
								$('#forgotPMessage').html('');
							}, delay);
						}
					}
				});
			});
		});
	</script>

	<script>
		var Login = function() {

			var handleLogin = function() {

				$('.login-form').validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					rules: {
						username: {
							required: true
						},
						password: {
							required: true
						},
						remember: {
							required: false
						}
					},

					messages: {
						username: {
							required: "Username is required."
						},
						password: {
							required: "Password is required."
						}
					},

					invalidHandler: function(event, validator) { //display error alert on form submit
						$('.alert-danger', $('.login-form')).show();
					},

					highlight: function(element) { // hightlight error inputs
						$(element)
							.closest('.form-group').addClass('has-error'); // set error class to the control group
					},

					success: function(label) {
						label.closest('.form-group').removeClass('has-error');
						label.remove();
					},

					errorPlacement: function(error, element) {
						error.insertAfter(element.closest('.input-icon'));
					},

					submitHandler: function(form) {
						form.submit(); // form validation success, call ajax form submit
					}
				});

				$('.login-form input').keypress(function(e) {
					if (e.which == 13) {
						if ($('.login-form').validate().form()) {
							$('.login-form').submit(); //form validation success, call ajax form submit
						}
						return false;
					}
				});
			}

			var handleForgetPassword = function() {
				jQuery('#forget-password').click(function() {
					jQuery('.login-form').hide();
					jQuery('.forget-form').show();
				});

				jQuery('#back-btn').click(function() {
					jQuery('.login-form').show();
					jQuery('.forget-form').hide();
				});
			}
			// var handleRegister = function() {

			// 	function format(state) {
			// 		if (!state.id) return state.text; // optgroup
			// 		return "<img class='flag' src='../../assets/global/img/flags/" + state.id.toLowerCase() + ".png'/>&nbsp;&nbsp;" + state.text;
			// 	}

			// 	if (jQuery().select2) {
			// 		$("#select2_sample4").select2({
			// 			placeholder: '<i class="fa fa-map-marker"></i>&nbsp;Select a Country',
			// 			allowClear: true,
			// 			formatResult: format,
			// 			formatSelection: format,
			// 			escapeMarkup: function(m) {
			// 				return m;
			// 			}
			// 		});


			// 		$('#select2_sample4').change(function() {
			// 			$('.register-form').validate().element($(this)); //revalidate the chosen dropdown value and show error or success message for the input
			// 		});
			// 	}

			// 	$('.register-form').validate({
			// 		errorElement: 'span', //default input error message container
			// 		errorClass: 'help-block', // default input error message class
			// 		focusInvalid: false, // do not focus the last invalid input
			// 		ignore: "",
			// 		rules: {

			// 			fullname: {
			// 				required: true
			// 			},
			// 			email: {
			// 				required: true,
			// 				email: true
			// 			},
			// 			address: {
			// 				required: true
			// 			},
			// 			city: {
			// 				required: true
			// 			},
			// 			country: {
			// 				required: true
			// 			},

			// 			username: {
			// 				required: true
			// 			},
			// 			password: {
			// 				required: true
			// 			},
			// 			rpassword: {
			// 				equalTo: "#register_password"
			// 			},

			// 			tnc: {
			// 				required: true
			// 			}
			// 		},

			// 		messages: { // custom messages for radio buttons and checkboxes
			// 			tnc: {
			// 				required: "Please accept TNC first."
			// 			}
			// 		},

			// 		invalidHandler: function(event, validator) { //display error alert on form submit

			// 		},

			// 		highlight: function(element) { // hightlight error inputs
			// 			$(element)
			// 				.closest('.form-group').addClass('has-error'); // set error class to the control group
			// 		},

			// 		success: function(label) {
			// 			label.closest('.form-group').removeClass('has-error');
			// 			label.remove();
			// 		},

			// 		errorPlacement: function(error, element) {
			// 			if (element.attr("name") == "tnc") { // insert checkbox errors after the container
			// 				error.insertAfter($('#register_tnc_error'));
			// 			} else if (element.closest('.input-icon').size() === 1) {
			// 				error.insertAfter(element.closest('.input-icon'));
			// 			} else {
			// 				error.insertAfter(element);
			// 			}
			// 		},

			// 		submitHandler: function(form) {
			// 			form.submit();
			// 		}
			// 	});

			// 	$('.register-form input').keypress(function(e) {
			// 		if (e.which == 13) {
			// 			if ($('.register-form').validate().form()) {
			// 				$('.register-form').submit();
			// 			}
			// 			return false;
			// 		}
			// 	});

			// 	jQuery('#register-btn').click(function() {
			// 		jQuery('.login-form').hide();
			// 		jQuery('.register-form').show();
			// 	});

			// 	jQuery('#register-back-btn').click(function() {
			// 		jQuery('.login-form').show();
			// 		jQuery('.register-form').hide();
			// 	});
			// }

			return {
				//main function to initiate the module
				init: function() {

					handleLogin();
					handleForgetPassword();
					// handleRegister();

				}

			};

		}();
	</script>

	<script>
		jQuery(document).ready(function() {
			Metronic.init(); // init metronic core components
			Layout.init(); // init current layout
			Login.init();
			Demo.init();
			ComponentsPickers.init();
		});
	</script>
	<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->

</html>