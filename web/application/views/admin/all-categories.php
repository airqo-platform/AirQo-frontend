<!-- BEGIN CONTENT -->
<div class="page-content-wrapper">
    <div class="page-content">

        <div class="modal fade createCategory" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="portlet box blue">
                        <div class="portlet-title">
                            <div class="caption">
                                <i class="fa fa-plus"></i>Create Category
                            </div>
                            <div class="tools">
                                <a href="javascript:;" data-dismiss="modal">
                                    <i class="fa fa-close"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="cat_message"></div>
                        <form action="" id="createCategoryForm">
                            <table class="table table-bordered table-stripped">
                                <tr>
                                    <td>Category Name</td>
                                    <td><input type="text" class="form-control" name="category_name"></td>
                                </tr>
                                <!-- <tr>
                                    <td>Category Position</td>
                                    <td><input type="text" class="form-control" name="category_position"></td>
                                </tr> -->
                                <!-- <tr>
                                    <td>Category Parent</td>
                                    <td>
                                        <select name="category_parent" class="form-control select2me" id="">
                                            <option value="">Select Parent Category</option>
                                            <?php
                                            $categories_ = $this->CategoryModel->get_category();
                                            foreach ($categories_ as $cat) {
                                                if ($cat['c_parent'] == null || $cat['c_parent'] == '') {
                                            ?>
                                                    <option value="<?= $cat['c_id']; ?>"><?= $cat['c_name']; ?></option>
                                            <?php
                                                }
                                            }
                                            ?>
                                        </select>
                                    </td>
                                </tr> -->

                            </table>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" id="" class="btn btn-default btn-danger">Create</button>
                        <button type="button" class="btn default" data-dismiss="modal">Close</button>
                    </div>
                    </form>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>

        <div class="modal fade DeleteCategory" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="portlet box blue">
                        <div class="portlet-title">
                            <div class="caption">
                                <i class="fa fa-plus"></i>Delete Category
                            </div>
                            <div class="tools">
                                <a href="javascript:;" data-dismiss="modal">
                                    <i class="fa fa-close"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="del_message"></div>
                        <table class="table table-bordered table-stripped">
                            <tr>
                                <th class="text-center">Are you sure you want to delete category?</th>
                            </tr>
                            <tr>
                                <th class="text-center"><input type="hidden" id="deleteID" /></th>
                            </tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btndeletecategory" class="btn btn-default btn-danger">Delete</button>
                        <button type="button" class="btn default" data-dismiss="modal">Close</button>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>

        <div class="modal fade DisableCategory" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="portlet box blue">
                        <div class="portlet-title">
                            <div class="caption">
                                <i class="fa fa-plus"></i>Disable Category
                            </div>
                            <div class="tools">
                                <a href="javascript:;" data-dismiss="modal">
                                    <i class="fa fa-close"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="dis_message"></div>
                        <table class="table table-bordered table-stripped">
                            <tr>
                                <th class="text-center">Are you sure you want to disable category?</th>
                            </tr>
                            <tr>
                                <th class="text-center"><input type="hidden" id="disableID" /></th>
                            </tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btndisablecategory" class="btn btn-default btn-danger">Disable</button>
                        <button type="button" class="btn default" data-dismiss="modal">Close</button>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>

        <div class="modal fade ActivateCategory" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="portlet box blue">
                        <div class="portlet-title">
                            <div class="caption">
                                <i class="fa fa-plus"></i>Activate Category
                            </div>
                            <div class="tools">
                                <a href="javascript:;" data-dismiss="modal">
                                    <i class="fa fa-close"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="a_message"></div>
                        <table class="table table-bordered table-stripped">
                            <tr>
                                <th class="text-center">Are you sure you want to activate category?</th>
                            </tr>
                            <tr>
                                <th class="text-center"><input type="hidden" id="activateID" /></th>
                            </tr>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btnactivatecategory" class="btn btn-default btn-danger">Activate</button>
                        <button type="button" class="btn default" data-dismiss="modal">Close</button>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>

        <div class="modal fade editCategory" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="portlet box blue">
                        <div class="portlet-title">
                            <div class="caption">
                                <i class="fa fa-plus"></i>Edit Category
                            </div>
                            <div class="tools">
                                <a href="javascript:;" data-dismiss="modal">
                                    <i class="fa fa-close"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="ecat_message"></div>
                        <form action="" id="editCategoryForm" method="post">
                            <input type="hidden" name="category_id" id="catt_id" />
                            <table class="table table-bordered table-stripped">
                                <tr>
                                    <td>Category Name</td>
                                    <td><input type="text" class="form-control" id="cat_name" name="category_name"></td>
                                </tr>
                                <!-- <tr>
                                    <td>Category Position</td>
                                    <td><input type="text" class="form-control" id="cat_position" name="category_position"></td>
                                </tr> -->
                                <!-- <tr>
                                    <td>Category Parent</td>
                                    <td>
                                        <select name="category_parent" class="form-control" id="cat_parent">

                                        </select>
                                    </td>
                                </tr> -->

                            </table>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" id="" class="btn btn-default btn-danger">Update</button>
                        <button type="button" class="btn default" data-dismiss="modal">Close</button>
                    </div>
                    </form>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>
        <!-- BEGIN PAGE HEADER-->
        <h3 class="page-title">
            Category <small>All Categories</small>
        </h3>
        <div class="page-bar">
            <ul class="page-breadcrumb">
                <li>
                    <i class="fa fa-home"></i>
                    <a href="#">Home</a>
                    <i class="fa fa-angle-right"></i>
                </li>
                <li>
                    <a href="#">Category</a>
                    <i class="fa fa-angle-right"></i>
                </li>
                <li>
                    <a href="#">All Categories</a>
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
                            <i class="fa fa-users"></i>Categories
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
                        <button class="btn btn-danger blue" data-toggle="modal" data-target=".createCategory"><i class="fa fa-plus"></i> &nbsp;Add New</button>
                        <table class="table table-striped table-bordered table-hover" id="sample_2">
                            <thead>
                                <tr>
                                    <th>
                                        No
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <!-- <th>
                                        Position
                                    </th>
                                    <th>
                                        Parent
                                    </th> -->
                                    <th>
                                        Status
                                    </th>
                                    <th>
                                        Date
                                    </th>
                                    
                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $counter = 1;
                                foreach ($categories as $row) {
                                    $status     = '';
                                    $btnactions = '';

                                    if ($row['c_status'] == 'disabled') {
                                        $status = '<button class="btn btn-xs btn-danger">Disabled</button>';
                                        $btnactions .= '<button class="btn btn-xs btn-success btn-block" data-target=".ActivateCategory" data-toggle="modal" title="Activate Category" data-id="' . $row['c_id'] . '"><i class="fa fa-check"></i></button>';
                                    } else if ($row['c_status'] == 'active') {
                                        $status = '<button class="btn btn-xs btn-success">Active</button>';
                                        $btnactions .= '<button class="btn btn-xs btn-warning btn-block" data-target=".DisableCategory" data-toggle="modal" title="Disable Post" data-id="' . $row['c_id'] . '"><i class="fa fa-pause"></i></button>';
                                    } else if ($row['c_status'] == 'deleted') {
                                        $status = '';
                                    }
                                    
                                    
                                ?>
                                    <tr>
                                        <td>
                                            <?= $counter++; ?>
                                        </td>
                                        <td>
                                            <?= $row['c_name']; ?>
                                        </td>
                                        <!--  -->
                                        <td>
                                            <?= $status; ?>
                                        </td>
                                        <td>
                                            <?= $row['c_added']; ?>

                                        </td>
                                       
                                        <td>
                                            <button class="btn btn-xs btn-primary btn-block" data-toggle="modal" data-id="<?= $row['c_id']; ?>" data-target=".editCategory"> <i class="fa fa-edit"></i> </a>
                                                <button class="btn btn-xs btn-danger btn-block" data-target=".DeleteCategory" data-toggle="modal" title="Delete Category" data-id="<?= $row['c_id']; ?>"><i class="fa fa-trash"></i></button>
                                                <?= $btnactions; ?>
                                        </td>

                                    </tr>
                                <?php
                                }
                                ?>
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
<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script src="<?= base_url(); ?>assets/global/scripts/metronic.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/layout.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/layout/scripts/demo.js" type="text/javascript"></script>
<script src="<?= base_url(); ?>assets/admin/pages/scripts/table-advanced.js"></script>
<script type="text/javascript">
    $(document).ready(function() {

        $('#createCategoryForm').submit(function(e) {
            e.preventDefault();
            // alert('submission');
            var formData = $('#createCategoryForm').serialize();
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/createcategory"); ?>',
                data: formData,
                dataType: 'json',
                beforeSend: function() {

                },
                success: function(data) {
                    if (data.success == 1) {
                        $('#cat_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
                        var delay = 1000;
                        setTimeout(function() {
                            document.location = "<?= site_url('a-categories'); ?>";
                        }, delay);
                    } else {
                        $('#cat_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                    }
                },
                error: function() {
                    // $('#c_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                }
            });
        });

        $('.editCategory').on('show.bs.modal', function(e) {

            var id = $(e.relatedTarget).data('id');
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/singlecategory"); ?>',
                data: {
                    cat_id: id
                },
                cache: false,
                dataType: 'json',
                beforeSend: function() {
                    // $.LoadingOverlay("show");
                },
                success: function(data) {

                    $('#cat_name').val(data.category_name);
                    $('#catt_id').val(data.category_id);
                    // $('#cat_position').val(data.category_position);
                    // $('#cat_parent').html(data.category_parent);
                }
            });
        });


        $('#editCategoryForm').submit(function(e) {
            e.preventDefault();
            // alert('submission');
            var formData = $('#editCategoryForm').serialize();
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/editcategory"); ?>',
                data: formData,
                dataType: 'json',
                beforeSend: function() {

                },
                success: function(data) {
                    if (data.success == 1) {
                        $('#ecat_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
                        var delay = 1000;
                        setTimeout(function() {
                            document.location = "<?= site_url('a-categories'); ?>";
                        }, delay);
                    } else {
                        $('#ecat_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                    }
                },
                error: function() {
                    // $('#c_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                }
            });
        });
        //Cancel sale
        $('.DeleteCategory').on('show.bs.modal', function(e) {

            var id = $(e.relatedTarget).data('id');
            $('#deleteID').val(id);
            // alert(id);
        });

        $('#btndeletecategory').click(function() {
            var id = $('#deleteID').val();
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/deletecategory"); ?>',
                data: {
                    cat_id: id
                },
                dataType: 'json',
                beforeSend: function() {
                    // $.LoadingOverlay("show");
                },
                success: function(data) {
                    var success = data.success;
                    if (success == 1) {
                        $('#del_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
                        var delay = 1000;
                        setTimeout(function() {
                            document.location = "<?= site_url('a-categories'); ?>";
                        }, delay);
                        // $.LoadingOverlay("hide");
                    } else {
                        $('#del_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                        // $.LoadingOverlay("hide");
                    }
                }
            });
        });


        $('.DisableCategory').on('show.bs.modal', function(e) {

            var id = $(e.relatedTarget).data('id');
            $('#disableID').val(id);
            // alert(id);
        });

        $('#btndisablecategory').click(function() {
            var id = $('#disableID').val();
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/disablecategory"); ?>',
                data: {
                    cat_id: id
                },
                dataType: 'json',
                beforeSend: function() {
                    // $.LoadingOverlay("show");
                },
                success: function(data) {
                    var success = data.success;
                    if (success == 1) {
                        $('#dis_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
                        var delay = 1000;
                        setTimeout(function() {
                            document.location = "<?= site_url('a-categories'); ?>";
                        }, delay);
                        // $.LoadingOverlay("hide");
                    } else {
                        $('#dis_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                        // $.LoadingOverlay("hide");
                    }
                }
            });
        });

        $('.ActivateCategory').on('show.bs.modal', function(e) {

            var id = $(e.relatedTarget).data('id');
            $('#activateID').val(id);
            // alert(id);
        });

        $('#btnactivatecategory').click(function() {
            var id = $('#activateID').val();
            $.ajax({
                type: 'post',
                url: '<?= site_url("category/activatecategory"); ?>',
                data: {
                    cat_id: id
                },
                dataType: 'json',
                beforeSend: function() {
                    // $.LoadingOverlay("show");
                },
                success: function(data) {
                    var success = data.success;
                    if (success == 1) {
                        $('#a_message').html('<div class="note note-success"><h4 class="block">Success</h4><p>' + data.message + '</p></div>');
                        var delay = 1000;
                        setTimeout(function() {
                            document.location = "<?= site_url('a-categories'); ?>";
                        }, delay);
                        // $.LoadingOverlay("hide");
                    } else {
                        $('#a_message').html('<div class="note note-danger"><h4 class="block">Error</h4><p>' + data.message + '</p></div>');
                        // $.LoadingOverlay("hide");
                    }
                }
            });
        });
    });
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