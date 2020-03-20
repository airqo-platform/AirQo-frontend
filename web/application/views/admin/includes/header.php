<?php
if (isset($this->session->userdata['loggedin']['adminname'])) { } else {
     redirect('Admin/index');
}
?>
<!DOCTYPE html>
<html lang="en" class="no-js">

<head>
     <meta charset="utf-8" />
     <title><?= $title; ?> | AIRQO ADMIN</title>
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta content="width=device-width, initial-scale=1" name="viewport" />
     <meta content="" name="description" />
     <meta content="" name="author" />
     <!-- BEGIN GLOBAL MANDATORY STYLES -->
     <link href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=all" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/uniform/css/uniform.default.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css" rel="stylesheet" type="text/css" />
     <!-- END GLOBAL MANDATORY STYLES -->
     <!-- BEGIN PAGE LEVEL PLUGIN STYLES -->
     <link href="<?= base_url(); ?>assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/fullcalendar/fullcalendar.min.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/plugins/jqvmap/jqvmap/jqvmap.css" rel="stylesheet" type="text/css" />
     <!-- END PAGE LEVEL PLUGIN STYLES -->
     <!-- BEGIN PAGE STYLES -->
     <link href="<?= base_url(); ?>assets/admin/pages/css/tasks.css" rel="stylesheet" type="text/css" />
     <!-- END PAGE STYLES -->
     <!-- BEGIN THEME STYLES -->
     <link href="<?= base_url(); ?>assets/global/css/components.css" id="style_components" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/global/css/plugins.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/admin/layout/css/layout.css" rel="stylesheet" type="text/css" />
     <link href="<?= base_url(); ?>assets/admin/layout/css/themes/default.css" rel="stylesheet" type="text/css" id="style_color" />
     <link href="<?= base_url(); ?>assets/admin/layout/css/custom.css" rel="stylesheet" type="text/css" />
     <!-- END THEME STYLES -->
     <link rel="shortcut icon" href="<?= base_url(); ?>assets/images/logo.png" />
     <!-- <link rel="shortcut icon" href="<?= base_url(); ?>assets/images/logo.jpg"/> -->

     <!-- <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.css" /> -->
     <!-- <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css"> -->
     <!-- <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/bootstrap-summernote/summernote.css"> -->
     <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/dist/summernote.css">

     <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/select2/select2.css" />
     <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/datatables/extensions/Scroller/css/dataTables.scroller.min.css" />
     <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/datatables/extensions/ColReorder/css/dataTables.colReorder.min.css" />
     <link rel="stylesheet" type="text/css" href="<?= base_url(); ?>assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.css" />


     <!-- Custom styling plus plugins -->
     <link href="<?= base_url(); ?>assets/gn/fonts/css/font-awesome.min.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/gn/css/animate.min.css" rel="stylesheet">
     <link href="<?= base_url(); ?>assets/gn/css/fineCrop.css" rel="stylesheet"><!-- fineCrop -->
     <!-- Custom styling plus plugins -->
     <link href="<?= base_url(); ?>assets/gn/css/custom.css" rel="stylesheet">
     <!-- <link href="<?= base_url(); ?>assets/bootstrap/ccs/bootstrap-confirm-delete.css" rel="stylesheet"> -->
     <link rel="shortcut icon" href="<?= base_url(); ?>assets/images/logo.png" />
     <script src="<?= base_url(); ?>assets/gn/js/jquery.min.js"></script>
     <script src="<?php echo base_url(); ?>assets/bootstrap/js/locationpicker.jquery.min.js"></script>
     <!-- <script src="<?= base_url(); ?>assets/ckeditor/ckeditor.js" type="text/javascript"></script> -->

     <script src="<?= base_url(); ?>assets/gn/js/cropping/cropper.min.js"></script>

</head>
<!-- END HEAD -->
<!-- BEGIN BODY -->
<!-- DOC: Apply "page-header-fixed-mobile" and "page-footer-fixed-mobile" class to body element to force fixed header or footer in mobile devices -->
<!-- DOC: Apply "page-sidebar-closed" class to the body and "page-sidebar-menu-closed" class to the sidebar menu element to hide the sidebar by default -->
<!-- DOC: Apply "page-sidebar-hide" class to the body to make the sidebar completely hidden on toggle -->
<!-- DOC: Apply "page-sidebar-closed-hide-logo" class to the body element to make the logo hidden on sidebar toggle -->
<!-- DOC: Apply "page-sidebar-hide" class to body element to completely hide the sidebar on sidebar toggle -->
<!-- DOC: Apply "page-sidebar-fixed" class to have fixed sidebar -->
<!-- DOC: Apply "page-footer-fixed" class to the body element to have fixed footer -->
<!-- DOC: Apply "page-sidebar-reversed" class to put the sidebar on the right side -->
<!-- DOC: Apply "page-full-width" class to the body element to have full width page without the sidebar menu -->

<body class="page-header-fixed page-quick-sidebar-over-content page-sidebar-closed-hide-logo  page-sidebar-fixed page-footer-fixed">
     <!-- BEGIN HEADER -->
     <div class="page-header -i navbar navbar-fixed-top">
          <!-- BEGIN HEADER INNER -->
          <div class="page-header-inner">
               <!-- BEGIN LOGO -->
               <div class="page-logo">
                    <a href="#">
                         <img src="<?= base_url(); ?>assets/frontend/images/logo.png" height="30px" width="100%" style="margin-top:1px;" alt="logo" class="logo-default" />
                    </a>
                    <div class="menu-toggler sidebar-toggler hide">
                    </div>
               </div>
               <!-- END LOGO -->
               <!-- BEGIN RESPONSIVE MENU TOGGLER -->
               <a href="javascript:;" class="menu-toggler responsive-toggler" data-toggle="collapse" data-target=".navbar-collapse">
               </a>
               <!-- END RESPONSIVE MENU TOGGLER -->
               <!-- BEGIN TOP NAVIGATION MENU -->
               <div class="top-menu">
                    <ul class="nav navbar-nav pull-right">
                         <li class="dropdown dropdown-user">

                              <a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown" data-hover="dropdown" data-close-others="true">
                                   <?php
                                   if (!empty($this->session->userdata['loggedin']['adminimage'])) {
                                        echo '
                                        <img alt="" class="img-circle" src="' . base_url() . 'assets/images/admins/' . $this->session->userdata['loggedin']['adminimage'] . '" style="height:30px; width:30px; object-fit:cover;"/>
                                        ';
                                   } else {
                                        echo '
                                        <img alt="" class="img-circle"  src="' . base_url() . 'assets/images/admins/account.jpg" style="height:30px; width:30px; object-fit:cover;"/>
                                        ';
                                   }
                                   ?>

                                   <span class="username username-hide-on-mobile">
                                        <?php if (isset($user)) {
                                             echo substr($user, 0, 10);
                                        } ?>... </span>
                                   <i class="fa fa-angle-down"></i>
                              </a>
                              <ul class="dropdown-menu dropdown-menu-default">
                                   <li>
                                        <a href="#" data-toggle="modal" data-target="#acc_editModal">
                                             <i class="icon-user"></i> Edit Profile </a>
                                   </li>
                                   <li class="divider">
                                   </li>
                                   <li>
                                        <a href="<?= site_url('Admin/logout'); ?>">
                                             <i class="icon-key"></i> Log Out </a>
                                   </li>
                              </ul>

                         </li>
                    </ul>
               </div>
               <!-- END TOP NAVIGATION MENU -->
          </div>
          <!-- END HEADER INNER -->
     </div>
     <!-- END HEADER -->
     <div class="clearfix">
     </div>

     <!-- THE START OF account_edit MODAL -->
     <div class="buzenAcc_edit">
          <div class="modal fade" id="acc_editModal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
               <div class="modal-dialog">
                    <div class="modal-content">
                         <div class="modal-header">
                              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                                   &times;
                              </button>
                              <h4 style="color: #00326f; text-align: center; margin-top: 15px;">EDIT YOUR ACCOUNT INFORMATION HERE</h4>
                         </div>
                         <div class="modal-body">
                              <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
                              <form name="form" method="post" action="<?php echo site_url('Admin/editAccount'); ?>" class="" enctype="multipart/form-data">
                                   <div style="font-size: 10px;" id="msgEdit"></div>
                                   <div class="form-group col-md-6">
                                        <b>Full Name:</b>
                                        <input type="text" name="admin_name" value="<?php echo $this->session->userdata['loggedin']['adminname']; ?>" class="form-control" placeholder="Enter full name" required />
                                   </div>

                                   <div class="form-group col-md-6">
                                        <b>Current Password:</b>

                                        <input class="form-control" id="current_password" name="current_password" placeholder="Enter your current password" type="password" required="required">
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>User Name:</b>
                                        <input type="text" value="<?php echo $this->session->userdata['loggedin']['adminusername']; ?>" name="admin_username" class="form-control" placeholder="Enter user name" required />
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>New Password:</b>
                                        <input class="form-control" id="new_password" name="new_password" placeholder="Enter your new password" type="password">
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>Email:</b>
                                        <input type="text" name="admin_email" value="<?php echo $this->session->userdata['loggedin']['adminemail']; ?>" class="form-control" placeholder="Enter email" required />
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>Confirm Password:</b>
                                        <input class="form-control" id="confirm_password" name="confirm_password" placeholder="Re-enter your new password" type="password">
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>Phone Number:</b>
                                        <input type="text" name="admin_phoneNumber" value="<?php echo $this->session->userdata['loggedin']['adminphoneNumber']; ?>" class="form-control" placeholder="Enter phone number" />
                                   </div>
                                   <div class="form-group col-md-6">
                                        <b>Role:</b>
                                        <select class="form-control" name="admin_role">
                                             <option value="<?= $this->session->userdata['loggedin']['adminrole']; ?>"><?= $this->session->userdata['loggedin']['adminrole']; ?></option>
                                        </select>
                                   </div>
                                   <div class="form-group col-md-12">
                                        <b>Previous Profile Image:</b>
                                        <img src="<?php echo base_url() ?>assets/images/admins/<?= $this->session->userdata['loggedin']['adminimage']; ?>" src="" height="100px" width="100px" class="thumbnail" />
                                        <b>New Image:</b>
                                        <input type="file" name="admin_image" class="" alt="select a new image here" />
                                   </div>
                                   <br />
                                   <br />
                                   <br />
                                   <div class="form-group pro">
                                        <button type="submit" style="margin-left: 17px;" class="btn btn-primary " title="Click to create Property" name="submit" id="submit"> UPDATE ACCOUNT</button>
                                   </div>
                                   <hr style="background-color:red; height:2px;" />
                              </form>
                              <!--End of the form-->
                         </div>
                    </div>
               </div>
          </div>
     </div>
     <!-- THE END OF account_edit MODAL -->
     <style type="text/css">
          .modal-backdrop {
               position: absolute !important; /*it was hidden */
               bottom: 0;
          }
     </style>