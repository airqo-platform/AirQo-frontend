<style type="text/css">
     .badge {
          background-color: rgb(51, 122, 183);
          padding: ;
     }
</style>
<?php
$admin_role = $this->session->userdata['logged_in']['admin_role'];
?>
<div class="page-container">
     <!-- BEGIN SIDEBAR -->
     <div class="page-sidebar-wrapper">
          <!-- DOC: Set data-auto-scroll="false" to disable the sidebar from auto scrolling/focusing -->
          <!-- DOC: Change data-auto-speed="200" to adjust the sub menu slide up/down speed -->
          <div class="page-sidebar navbar-collapse collapse">
               <!-- BEGIN SIDEBAR MENU -->
               <!-- DOC: Apply "page-sidebar-menu-light" class right after "page-sidebar-menu" to enable light sidebar menu style(without borders) -->
               <!-- DOC: Apply "page-sidebar-menu-hover-submenu" class right after "page-sidebar-menu" to enable hoverable(hover vs accordion) sub menu mode -->
               <!-- DOC: Apply "page-sidebar-menu-closed" class right after "page-sidebar-menu" to collapse("page-sidebar-closed" class must be applied to the body element) the sidebar sub menu mode -->
               <!-- DOC: Set data-auto-scroll="false" to disable the sidebar from auto scrolling/focusing -->
               <!-- DOC: Set data-keep-expand="true" to keep the submenues expanded -->
               <!-- DOC: Set data-auto-speed="200" to adjust the sub menu slide up/down speed -->
               <ul class="page-sidebar-menu" data-keep-expanded="false" data-auto-scroll="true" data-slide-speed="200">
                    <!-- DOC: To remove the sidebar toggler from the sidebar you just need to completely remove the below "sidebar-toggler-wrapper" LI element -->
                    <li class="sidebar-toggler-wrapper">
                         <!-- BEGIN SIDEBAR TOGGLER BUTTON -->
                         <div class="sidebar-toggler">
                         </div>
                         <style type="text/css">

                         </style>
                         <!-- END SIDEBAR TOGGLER BUTTON -->
                    </li>
                    <li class="start <?php if ($navigation == 'dashboard') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/dashboard'); ?>">
                              <i class="fa fa-dashboard (alias) "></i>
                              <span class="title">Dashboard</span>
                              <span class=" <?php if ($navigation == 'dashboard') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class=" <?php if ($navigation == 'statistics') { echo 'active'; } ?>">
                         <a href="javascript:;">
                              <i class="fa fa-server"></i>
                              <span class="title">Statistics</span>
                              <span class=" <?php if ($navigation == 'statistics') { echo 'selected'; } ?>"></span>
                              <span class="arrow open"></span>
                         </a>
                         <ul class="sub-menu">
                              <?php
                              if ($admin_role == 'super') {
                                   echo '
                                        <li>

                                        <a href="' . site_url('Admin/siteVisitors') . '">
                                        <i class="fa fa-minus"></i>
                                        <span class="title">Site Visitors</span>
                                        </a>
                                        </li>
                                   ';
                              }
                              ?>
                              <?php
                              if ($admin_role == 'super') {
                                   echo '
                                        <li>
                                        <a href="' . site_url('Admin/siteLogins') . '">
                                        <i class="fa fa-minus"></i>
                                        <span class="title">Site Logins</span>
                                        </a>
                                        </li>
                                   ';
                              }
                              ?>
                              <?php
                              if ($admin_role == 'super') {
                                   echo '
                                        <li>
                                        <a href="' . site_url('Admin/siteVistedPages') . '">
                                        <i class="fa fa-minus"></i>
                                        <span class="title">Visited Pages</span>
                                        </a>
                                        </li>
                                   ';
                              }
                              ?>
                         </ul>
                    </li>

                    <li class="start  <?php if ($navigation == 'nodes') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/appNodes'); ?>">
                              <i class="fa fa-arrows-alt"></i>
                              <span class="title">App Nodes</span>
                              <span class=" <?php if ($navigation == 'nodes') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class="start  <?php if ($navigation == 'about') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/about'); ?>">
                              <i class="fa fa-info-circle"></i>
                              <span class="title">About Info</span>
                              <span class=" <?php if ($navigation == 'about') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class="start  <?php if ($navigation == 'projects') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/projects'); ?>">
                              <i class="fa fa-chain (alias)"></i>
                              <span class="title">Projects</span>
                              <span class=" <?php if ($navigation == 'projects') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class="start  <?php if ($navigation == 'team') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/team'); ?>">
                              <i class="fa fa-user"></i>
                              <span class="title">Team</span>
                              <span class=" <?php if ($navigation == 'team') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class="start  <?php if ($navigation == 'news') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/news'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">News</span>
                              <span class=" <?php if ($navigation == 'news') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>

                    <li class="start  <?php if ($navigation == 'contacts') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/contactInformation'); ?>">
                              <i class="fa fa-mobile-phone (alias)"></i>
                              <span class="title">Contacts</span>
                              <span class=" <?php if ($navigation == 'contacts') { echo 'selected'; } ?>"></span>

                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'sub') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/subscribers'); ?>">
                              <?php $messages = $this->AdminModel->get_total(); ?>
                              <i class="fa fa-users "></i>
                              <span class="title">Subscribers <div class="badge pull-right"><?php echo $messages['total']; ?></div></span>
                              <span class=" <?php if ($navigation == 'sub') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == '') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('Admin/faqs'); ?>">
                              <?php $faq = $this->AdminModel->get_faqs_total(); ?>
                              <i class="fa fa-book"></i>
                              <span class="title">FAQ(S) <div class="badge pull-right"><?php echo $faq['total']; ?></div></span>
                              <span class=" <?php if ($navigation == '') { echo 'selected'; } ?>"></span>
                         </a>
                    </li>
                    <?php
                    if ($admin_role == 'super') {
                         ?>
                         <li class="<?php if ($navigation == 'admin') { echo 'active'; } ?>">
                              <a href="<?php echo site_url('Admin/administrators'); ?>">
                                   <i class="fa fa-user"></i>
                                   <span class="title">Administrators</span>
                                   <span class="<?php if ($navigation == 'admin') { echo 'selected'; } ?>"> </span>
                              </a>
                         </li>
                    <?php
                    }
                    ?>
                    <li class="start  <?php if ($navigation == 'User Places') { echo 'active'; } ?>">
                         <a href="<?= site_url('a-user-places'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">User Places</span>
                              <span class=""></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'Daily Reports Subscription') { echo 'active'; } ?>">
                         <a href="<?= site_url('a-report-subscription'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">Reports Subscription</span>
                              <span class=""></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'Threshold Alerts') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('a-threshold-alerts'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">Threshold Alerts</span>
                              <span class=""></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'Get Involved') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('a-get-involved'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">Get Involved</span>
                              <span class=""></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'App Feedback') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('a-feedback'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">Feedback</span>
                              <span class=""></span>
                         </a>
                    </li>
                    <li class="start  <?php if ($navigation == 'AQI Camera') { echo 'active'; } ?>">
                         <a href="<?php echo site_url('a-aqi-camera'); ?>">
                              <i class="fa fa-book"></i>
                              <span class="title">AQI Camera</span>
                              <span class=""></span>
                         </a>
                    </li>
               </ul>
               <!-- END SIDEBAR MENU -->
          </div>
     </div>
     <!-- END SIDEBAR -->