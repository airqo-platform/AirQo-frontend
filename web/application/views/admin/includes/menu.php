<?php
$usertype = '';
if (!$this->session->userdata('loggedin')) { } else
{
	$user_id  = $this->session->userdata['loggedin']['adminid'];
     $usertype = $this->session->userdata['loggedin']['adminrole'];
}
?>
<div class="clearfix">
</div>
<!-- BEGIN CONTAINER -->
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
			<ul class="page-sidebar-menu page-sidebar-menu-light"  data-keep-expanded="true" data-auto-scroll="true" data-slide-speed="200">
				<!-- DOC: To remove the sidebar toggler from the sidebar you just need to completely remove the below "sidebar-toggler-wrapper" LI element -->
				<li class="sidebar-toggler-wrapper">
					<!-- BEGIN SIDEBAR TOGGLER BUTTON -->
					<div class="sidebar-toggler">
					</div>
					<!-- END SIDEBAR TOGGLER BUTTON -->
				</li>
				<!-- DOC: To remove the search box from the sidebar you just need to completely remove the below "sidebar-search-wrapper" LI element -->
				<li class="sidebar-search-wrapper">
					<!-- BEGIN RESPONSIVE QUICK SEARCH FORM -->
					<!-- DOC: Apply "sidebar-search-bordered" class the below search form to have bordered search box -->
					<!-- DOC: Apply "sidebar-search-bordered sidebar-search-solid" class the below search form to have bordered & solid search box -->
					<form class="sidebar-search " action="extra_search.html" method="POST">
						<a href="javascript:;" class="remove">
						<i class="icon-close"></i>
						</a>
						<div class="input-group">
							<!-- <input type="text" class="form-control" disabled placeholder="Search...">
							<span class="input-group-btn">
							<a href="javascript:;" class="btn submit"><i class="icon-magnifier"></i></a>
							</span> -->
						</div>
					</form>
					<!-- END RESPONSIVE QUICK SEARCH FORM -->
                    </li>
				
                    
				
                    <li class="<?php if($title == 'Dashboard') { echo 'active';} ?>">
                         <a href="<?= site_url('a-dashboard'); ?>">
                         <i class="icon-home"></i>
                         Dashboard</a>
                    </li>
                         
                    <li class="<?php if($title == 'Site Visitors' || $title == 'Site Logins' || $title == 'Visited Pages') { echo 'active';} ?>">
					<a href="javascript:;">
					<i class="fa fa-book"></i>
					<span class="title">Statistics</span>
					<span class="selected"></span>
					<span class="arrow"></span>
					</a>
					<ul class="sub-menu">
						<!-- <li class="<?php if($title == 'Site Visitors') { echo 'active';} ?>">
							<a href="<?= site_url('admin/sitevistors'); ?>">
							Site Visitors</a>
						</li> -->
						<li class="<?php if($title == 'Site Logins') { echo 'active';} ?>">
							<a href="<?= site_url('admin/sitelogins'); ?>">
							Site Logins</a>
						</li>
						<!-- <li class="<?php if($title == 'Visited Pages') { echo 'active';} ?>">
							<a href="<?= site_url('admin/sitevisitedpages'); ?>">
							Visited Pages</a>
						</li> -->
					</ul>
				</li>
				
                    <!-- <li class="<?php if($title == 'Airqo App Nodes') { echo 'active';} ?>">
                         <a href="<?= site_url('admin/appnodes'); ?>">
                         <i class="fa fa-money"></i>
                         App Nodes</a>
                    </li> -->
					
				
                    <li class="<?php if($title == 'Team Members') { echo 'active';} ?>">
                         <a href="<?= site_url('admin/team'); ?>">
                         <i class="fa fa-user"></i>
                         Team</a>
                    </li>
					
				
                    <li class="<?php if($title == 'FAQS') { echo 'active';} ?>">
                         <a href="<?= site_url('admin/faqs'); ?>">
                         <i class="fa fa-book"></i>
                         FAQ(s)</a>
					</li>

					<li class="<?php if($title == 'All Categories') { echo 'active';} ?>">
							<a href="<?= site_url('a-categories'); ?>">
							<i class="icon-list"></i>
							Categories</a>
					</li>

					<li class="<?php if($title == 'Add Post' || $title == 'All Posts') { echo 'active';} ?>">
						<a href="javascript:;">
						<i class="fa fa-tasks"></i>
						<span class="title">Posts</span>
						<span class="selected"></span>
						<span class="arrow"></span>
						</a>
						<ul class="sub-menu">
							<li class="<?php if($title == 'Add Post') { echo 'active';} ?>">
								<a href="<?= site_url('a-add-post'); ?>">
								<i class="icon-plus"></i>
								Add New</a>
							</li>
							<li class="<?php if($title == 'All Posts') { echo 'active';} ?>">
								<a href="<?= site_url('a-posts'); ?>">
								<i class="icon-bulb"></i>
								All Posts</a>
							</li>
						</ul>
					</li>
					
					<!-- <li class="<?php if($title == 'Careers') { echo 'active';} ?>">
                         <a href="<?= site_url('admin/careers'); ?>">
                         <i class="fa fa-question"></i>
                         Careers</a>
                    </li> -->

                    <li class="<?php if($title == 'Admins') { echo 'active';} ?>">
                         <a href="<?= site_url('admin/administrators'); ?>">
                         <i class="fa fa-users"></i>
                         Administrators</a>
                    </li>
					
				
                    <li class="<?php if($title == 'User Places') { echo 'active';} ?>">
                         <a href="<?= site_url('a-user-places'); ?>">
                         <i class="fa fa-map-marker"></i>
                         User Places</a>
                    </li>
					
				
                    <li class="<?php if($title == 'Daily Reports Subscription') { echo 'active';} ?>">
                         <a href="<?= site_url('a-report-subscription'); ?>">
                         <i class="fa fa-envelope"></i>
                         Reports Subscription</a>
					</li>

					<li class="<?php if($title == 'Threshold Alerts') { echo 'active';} ?>">
                         <a href="<?= site_url('a-threshold-alerts'); ?>">
                         <i class="fa fa-book"></i>
                         Threshold Alerts</a>
					</li>

					<li class="<?php if($title == 'Get Involved') { echo 'active';} ?>">
                         <a href="<?= site_url('a-get-involved'); ?>">
                         <i class="fa fa-adjust"></i>
                         Get Involved</a>
					</li>

					<li class="<?php if($title == 'App Feedback') { echo 'active';} ?>">
                         <a href="<?= site_url('a-feedback'); ?>">
                         <i class="fa fa-comments-o"></i>
                         Feedback</a>
					</li>

					<li class="<?php if($title == 'AQI Camera') { echo 'active';} ?>">
                         <a href="<?= site_url('a-aqi-camera'); ?>">
                         <i class="fa fa-camera"></i>
                         AQI Camera</a>
					</li>
			</ul>
			<!-- END SIDEBAR MENU -->
		</div>
	</div>
	<!-- END SIDEBAR -->