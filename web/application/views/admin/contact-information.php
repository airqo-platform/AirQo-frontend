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
               <?php
                if(empty($contactInfo)) {
                  echo '
                    <button class="btn btn-success NewStory pull-right" id="Storybtn">+ New Contact</button>
                  ';
                }else{

                }
              ?>
                </div>
            </div>
            <style type="text/css">
              .btn-success{
                background-color: #3399CC;
                border-color: #3399CC;
              }
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
              .btn-default {
                  color: #fff;
                  background-color: #006400;
                  border-color: #ccc;
              }
              table{
                margin: auto;
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
          if($this->session->flashdata('msg'))
          {
            echo '<div class="alert alert-success">
            <button class="close" data-close="alert"></button><span> <i class="fa fa-check"></i>'.$this->session->flashdata('msg').'</span></div>';
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
          <br/>
            <table class="table table-responsive table-bordered" width="100%" id="sample_2">

           <thead>
            <tr>
              <th>No.</th>
              <th>Address</th>
              <th>Information</th>
              <th>Email </th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
           </thead>

     <tbody>
        <?php
        $i = 0;
       foreach($contactInfo as $row)
       {
         $i++;
      ?>
        <tr>
       <td><?php echo $i ?></td>
       <td><?php echo $row['con_address'];?></td>
       <td><?php echo $row['con_info'];?></td>
       <td><?php echo $row['con_email'];?></td>
       <td><?php echo $row['con_phoneline'];?></td>
       <td>
        <a data-toggle="modal" data-target=".edit_contact" class="btn btn-warning" data-id="<?= $row['con_id']; ?>" id="actionbtn2" >Edit</a>
         <button data-id="<?php echo $row['con_id'];?>" class="btn btn-danger actionbtn3 delete-btn" data-toggle="confirmation" data-placement="left" data-singleton="true" type="submit">Delete</button>
       </td>

       </tr>
      <?php
       }
       ?>


 </tbody>
  <script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
    <script type="text/javascript">

    $(document).ready(function(){

        $('.delete-btn').on('confirmed.bs.confirmation', function(){

        var id  = $(this).data('id');

          $.ajax({
              type : 'post',
              url  : '<?= site_url("Admin/deleteContactInformation"); ?>',
              data : {
                con_id : id
              },
                success : function(data){
                  console.log(data);
                  console.log('yiki');
                    if(data == '1'){
                      window.location="<?= site_url("Admin/contactInformation"); ?>";
                    } else {
                    window.location="<?= site_url("Admin/contactInformation"); ?>";
                      console.log("Unable to delete...");
                    }
                },
                error: function(error){
                  console.log(error);
                }
        });
      });
    });
</script>
</table>
<script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
<script type="text/javascript">
$(".NewStory").click(function(){$(".info").toggle();});
</script>
</div>
<!-- THE ADD CONTACT FORM -->

<form name="form" method="post" action="<?php echo site_url('Admin/addContactInformation');?>" class="story_form" enctype="multipart/form-data">

      Address:
      <div class="form-group col-md-12">
        <textarea cols="10" rows="2" id="ckeditor3" name="con_address" required></textarea>
        <script type="text/javascript">
          CKEDITOR.replace("ckeditor3");
        </script>
      </div>
      <br/>
      Information:
      <div class="form-group col-md-12">
        <textarea cols="10" rows="2" id="ckeditor4" name="con_info" required></textarea>
        <script type="text/javascript">
          CKEDITOR.replace("ckeditor4");
        </script>
      </div>
      <br/>

    <div class="form-group col-md-12">
        Email :
      <input type="email" name="con_email" class="form-control" placeholder="Enter email address" required/>
    </div>
      
     <div class="form-group col-md-12">
      Phone :
    <input type="text" name="con_phoneline"  class="form-control" placeholder="Enter phone number" required/>
     </div>

     <br/>  <br/><br/><br/><br/>
<div class="form-group pro">
    <button type="submit" class="btn btn-primary " title="Click to add contact" name="submit" id="submit"> Save Information</button>
    </div>
      <hr style="background-color:red; height:2px;"/>
</form><!--End of the form-->



 </div>

 <script src="<?php echo base_url();?>assets/js/jquery-1.11.1.min.js"></script>
<script type="text/javascript">
  $(".story_form").hide();
  $(".NewStory").click(function(){$(".story_form").toggle();});
</script>
  </div>
</div>
</div>

      </div>
    </div>
    <!-- END PAGE CONTENT-->
  </div>

<!-- END CONTENT -->

<!-- END CONTAINER -->
<!-- THE EDIT MODAL -->
<div class="buzenAcc_edit" >
  <div class="modal fade edit_contact" id="" role="dialog"
      aria-labelledby="myModalLabel" aria-hidden="true" >
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close"
                      data-dismiss="modal" aria-hidden="true">
                         &times;
                  </button>
                  <h4 style="color: #00326f; text-align: center; margin-top: 15px;">UPDATE THE CONTACT INFORMATION</h4>

              </div>

        <div class="modal-body"> <!-- GIVE THE TABS DIFFERENT ID FROM THE PREVIOUS ONES 2 AVOID CONFLICT -->
          <form name="form" method="post" action="<?php echo site_url('Admin/editContact');?>"  enctype="multipart/form-data">
            <input class="form-control" type="hidden" id="con_id" name="con_id" placeholder="" />
            Address:
            <div class="form-group col-md-12">
              <textarea cols="10" rows="2" id="ckeditor1" name="con_address" required></textarea>
              <script type="text/javascript">
                CKEDITOR.replace("ckeditor1");
              </script>
            </div>
            <br/>
            Information:
            <div class="form-group col-md-12">
              <textarea cols="10" rows="2" id="ckeditor2" name="con_info" required></textarea>
              <script type="text/javascript">
                CKEDITOR.replace("ckeditor2");
              </script>
            </div>
            <br/>

           
          <div class="form-group col-md-12">
              Email:
            <input type="email" name="con_email" id="c_email" class="form-control" placeholder="Enter email address" required/>
          </div>
         <br/>
           <div class="form-group col-md-12">
            Phone :
          <input type="text" name="con_phoneline" id="c_phone"  class="form-control" placeholder="Enter phone number" required/>
           </div>
            <br/>  <br/><br/><br/><br/>
            <div class="form-group pro">
              <button type="submit" class="btn btn-primary " title="Click to save changes" name="submit" id="submit"> Save Changes</button>
               <button type="button" class="btn default" data-dismiss="modal">Cancel</button>
            </div>
          <hr style="background-color:red; height:2px;"/>
          </form><!--End of the form-->
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
<script src="<?= base_url(); ?>assets/global/plugins/jquery.min.js" type="text/javascript"></script>
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

 //Editing Modal
        $('.edit_contact').on('show.bs.modal', function (e) {
            console.log('yiki');
            var id = $(e.relatedTarget).data('id');
            $.ajax({
                type : 'post',
                url  : '<?= site_url("Admin/editContactDetails"); ?>',
                data : {
                     con_id : id
                },
                cache : false,
                dataType : 'json',
                beforeSend : function(){
                },
                success : function(data){
                    $('#con_id').val(data.id);
                    CKEDITOR.instances['ckeditor1'].setData(data.c_address);
                    CKEDITOR.instances['ckeditor2'].setData(data.c_infor);
                    $('#c_phone').val(data.c_phone);
                    $('#c_email').val(data.c_email);

                }
            });
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
