	<!-- BEGIN CONTENT -->
  <style type="text/css">
            img{
              object-fit: cover!important;
            }
            .kaboom .add .btn
            {
            border-radius: 0px !important;
            width: 120px;
            }
            .kaboom #actionbtn1
            {
            margin: auto;
            border-radius: 0px !important;
            width: 90px;
            height: 30px;
            margin-bottom: 5px;
            }
            .kaboom #actionbtn2
            {
            margin: auto;
            border-radius: 0px !important;
            width: 90px;
            height: 30px;
            margin-bottom: 5px;
            }
            .kaboom .actionbtn3
            {
            margin: auto;
            border-radius: 0px !important;
            width: 90px;
            height: 30px;
            margin-bottom: 5px;
            }
            .kaboom .add
            {
            text-align: right;
            }
            .kaboom .pro
            {
            text-align: center;
            }
            .kaboom .pro .btn
            {
            width: 200px;

            }

            /* Style the Image Used to Trigger the Modal two */
            #myImg1 {
                border-radius: 5px;
                cursor: pointer;
                transition: 0.3s;
                z-index: 180000;

            }

                        .shwimg{
                          width: 100%;
                          height: 480px;

                        }
            #myImg1:hover {opacity: 0.7;}

             /*The Modal (background) */
            .modal1 {
                display: none; /* Hidden by default 
                position: fixed; /* Stay in place */
                z-index: 190000; /* Sit on top */
                left: 0;
                top: 0;
                width: 100%; /* Full width */
                height: 100%; /* Full height */
                overflow: auto; /* Enable scroll if needed */
                background-color: rgb(0,0,0); /* Fallback color */
                background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
            }

            /* Modal Content (Image) */
            .modal-content1 {
                margin: auto;
                display: block;
                width: 80%;
                max-width: 700px;
                height: 83%;
                margin-top: 50px;
                /*max-height: 700px;*/
            }

            /* Caption of Modal Image (Image Text) - Same Width as the Image */
            .modal-title {
                text-align: center;

            }



            @keyframes zoom {
                from {transform:scale(0)}
                to {transform:scale(1)}
            }

            /* The Close Button */
            .modal1 .close {
                position: absolute;
                top: 70px;
                right: 340px;
                font-size: 400px;
                font-weight: bold;
                transition: 0.3s;
                height: 10px;
                width: 10px;
                padding: 6px!important;
                background-color: #fff!important;
            }

                      .modal1 .close h1{

                font-size: 40px;

            }
            .modal .modal-header .close {
                margin-top: -60px !important;
                right: 10px;
            }

            .modal1 .close:hover,
            .modal1 .close:focus {
                color: #fff;
                text-decoration: none;
                cursor: pointer;
            }

            /* 100% Image Width on Smaller Screens */
            @media only screen and (max-width: 700px){
            .modal-content1 {
                    width: 100%;
                }
              }
              .modal-dialog {
              width: 66.5%;
              margin: 48px auto;
            }
            /*.modal_1 {
                overflow-y:scroll !important;
            }*/
            /*.modal_1 { overflow: auto !important; }*/
          </style>
	<div class="page-content-wrapper">
		<div class="page-content">
			
			<div class="page-bar">
				<ul class="page-breadcrumb">
					<li>
             <a href="#">Dashboard</a>
            <i class="fa fa-angle-right"></i>
						<a href="#">Statisticts</a>
						<i class="fa fa-angle-right"></i>
					</li>
					<li>
						<a href="#"><?= $title; ?></a>
					</li>
				</ul>
			</div>
			<!-- BEGIN PAGE CONTENT-->
			<div class="row">
				<div class="col-md-12">
					<div class="portlet box grey">
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
							<div class="caption">
								<table class="table table-stripped table-bordered" id="sample_2">
									 <thead>
										 <tr>
                      <th>No.</th>
											 <th>PAGE NAME</th>
											 <th>DATE VISITED</th>
                       <th>BROWSER</th>


										 </tr>
									 </thead>
									  <tbody>
                      
                     <?php
                      $i = 0;
                      foreach ($site_stats as $row) {
                         if($row['ss_userAgent'] == 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0')
                        {
                          $broswer = 'Mozilla Firefox';
                        }
                        else
                        {
                          $broswer = 'Google Chrome';
                        }
                      $i++;
                      ?>
                    <tr>
                      <td><?php echo $i ?></td>
                      <td><?php echo $row['ss_page'];?></td>
                      <td><?php echo $row['ss_date'];?></td>
                     <td><?php echo $broswer ;?></td>
                         
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
			</div>
		</div><!-- END PAGE CONTENT-->
	</div>

	<!-- END CONTENT -->

<!-- END CONTAINER -->
<!-- BEGIN FOOTER -->
<div class="page-footer">
	<div class="page-footer-inner">
		 <?= date('Y'); ?> &copy;  African Cloud Initiative; All Rights Reserved.
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
	$(function () {

  'use strict';

  var console = window.console || { log: function () {} },
      $alert = $('.docs-alert'),
      $message = $alert.find('.message'),
      showMessage = function (message, type) {
        $message.text(message);

        if (type) {
          $message.addClass(type);
        }

        $alert.fadeIn();

        setTimeout(function () {
          $alert.fadeOut();
        }, 3000);
      };

  // Demo
  // -------------------------------------------------------------------------

  (function () {
    var $image = $('.img-container > img'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
          aspectRatio: 16 / 9,
          preview: '.img-preview',
          crop: function (data) {
            $dataX.val(Math.round(data.x));
            $dataY.val(Math.round(data.y));
            $dataHeight.val(Math.round(data.height));
            $dataWidth.val(Math.round(data.width));
            $dataRotate.val(Math.round(data.rotate));
          }
        };

    $image.on({
      'build.cropper': function (e) {
        console.log(e.type);
      },
      'built.cropper': function (e) {
        console.log(e.type);
      }
    }).cropper(options);


    // Methods
    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getDataURL') {
          $('#getDataURLModal').modal().find('.modal-body').html('<img src="' + result + '">');
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }

      }
    }).on('keydown', function (e) {

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }

    });


    // Import image
    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);

            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL);
            $inputImage.val(blobURL);//$inputImage.val('');
          } else {
            showMessage('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    }


    // Options
    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    });


    // Tooltips
    $('[data-toggle="tooltip"]').tooltip();

  }());

});

</script>
<script type="text/javascript">
var TableAdvanced = function () {

    var initTable1 = function () {
     var table = $('#sample_1');

     /* Table tools samples: https://www.datatables.net/release-datatables/extras/TableTools/ */

     /* Set tabletools buttons and button container */

     $.extend(true, $.fn.DataTable.TableTools.classes, {
      "container": "btn-group tabletools-dropdown-on-portlet",
      "buttons": {
       "normal": "btn btn-sm default",
       "disabled": "btn btn-sm default disabled"
      },
      "collection": {
       "container": "DTTT_dropdown dropdown-menu tabletools-dropdown-menu"
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

      // Or you can use remote translation file
      //"language": {
      //   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
      //},

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
       // {
        // "sExtends": "pdf",
        // "sButtonText": "PDF"
       // }, {
        // "sExtends": "csv",
        // "sButtonText": "CSV"
       // }, {
        // "sExtends": "xls",
        // "sButtonText": "Excel"
       // }, 
       {
        "sExtends": "print",
        "sButtonText": "Print",
        "sInfo": 'Please press "CTR+P" to print or "ESC" to quit',
        "sMessage": "Generated by DataTables"
       }]
      }
     });

     var tableWrapper = $('#sample_1_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper

     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
    }

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
       // {
        // "sExtends": "pdf",
        // "sButtonText": "PDF"
       // }, {
        // "sExtends": "csv",
        // "sButtonText": "CSV"
       // }, {
        // "sExtends": "xls",
        // "sButtonText": "Excel"
       // }, 
       {
        "sExtends": "print",
        "sButtonText": "Print",
        "sInfo": 'Please press "CTRL+P" to print or "ESC" to quit',
        "sMessage": "Generated by DataTables"
       }, 
       // {
        // "sExtends": "copy",
        // "sButtonText": "Copy"
       // }
       ]
      }
     });

     var tableWrapper = $('#sample_2_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
    }

    var initTable3 = function () {
     var table = $('#sample_3');

     /* Formatting function for row details */
     function fnFormatDetails(oTable, nTr) {
      var aData = oTable.fnGetData(nTr);
      var sOut = '<table>';
      sOut += '<tr><td>Platform(s):</td><td>' + aData[2] + '</td></tr>';
      sOut += '<tr><td>Engine version:</td><td>' + aData[3] + '</td></tr>';
      sOut += '<tr><td>CSS grade:</td><td>' + aData[4] + '</td></tr>';
      sOut += '<tr><td>Others:</td><td>Could provide a link here</td></tr>';
      sOut += '</table>';

      return sOut;
     }

     /*
      * Insert a 'details' column to the table
      */
     var nCloneTh = document.createElement('th');
     nCloneTh.className = "table-checkbox";

     var nCloneTd = document.createElement('td');
     nCloneTd.innerHTML = '<span class="row-details row-details-close"></span>';

     table.find('thead tr').each(function () {
      this.insertBefore(nCloneTh, this.childNodes[0]);
     });

     table.find('tbody tr').each(function () {
      this.insertBefore(nCloneTd.cloneNode(true), this.childNodes[0]);
     });

     /*
      * Initialize DataTables, with no sorting on the 'details' column
      */
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

      "columnDefs": [{
       "orderable": false,
       "targets": [0]
      }],
      "order": [
       [1, 'asc']
      ],
      "lengthMenu": [
       [5, 15, 20, -1],
       [5, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "pageLength": 10,
     });
     var tableWrapper = $('#sample_3_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper

     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown

     /* Add event listener for opening and closing details
      * Note that the indicator for showing which row is open is not controlled by DataTables,
      * rather it is done here
      */
     table.on('click', ' tbody td .row-details', function () {
      var nTr = $(this).parents('tr')[0];
      if (oTable.fnIsOpen(nTr)) {
       /* This row is already open - close it */
       $(this).addClass("row-details-close").removeClass("row-details-open");
       oTable.fnClose(nTr);
      } else {
       /* Open this row */
       $(this).addClass("row-details-open").removeClass("row-details-close");
       oTable.fnOpen(nTr, fnFormatDetails(oTable, nTr), 'details');
      }
     });
    }

    var initTable4 = function () {
     var table = $('#sample_4');

     /* Formatting function for row expanded details */
     function fnFormatDetails(oTable, nTr) {
      var aData = oTable.fnGetData(nTr);
      var sOut = '<table>';
      sOut += '<tr><td>Platform(s):</td><td>' + aData[2] + '</td></tr>';
      sOut += '<tr><td>Engine version:</td><td>' + aData[3] + '</td></tr>';
      sOut += '<tr><td>CSS grade:</td><td>' + aData[4] + '</td></tr>';
      sOut += '<tr><td>Others:</td><td>Could provide a link here</td></tr>';
      sOut += '</table>';

      return sOut;
     }

     /*
      * Insert a 'details' column to the table
      */
     var nCloneTh = document.createElement('th');
     nCloneTh.className = "table-checkbox";

     var nCloneTd = document.createElement('td');
     nCloneTd.innerHTML = '<span class="row-details row-details-close"></span>';

     table.find('thead tr').each(function () {
      this.insertBefore(nCloneTh, this.childNodes[0]);
     });

     table.find('tbody tr').each(function () {
      this.insertBefore(nCloneTd.cloneNode(true), this.childNodes[0]);
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

      "columnDefs": [{
       "orderable": false,
       "targets": [0]
      }],
      "order": [
       [1, 'asc']
      ],
      "lengthMenu": [
       [5, 15, 20, -1],
       [5, 15, 20, "All"] // change per page values here
      ],
      // set the initial value
      "pageLength": 10,
     });

     var tableWrapper = $('#sample_4_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
     var tableColumnToggler = $('#sample_4_column_toggler');

     /* modify datatable control inputs */
     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown

     /* Add event listener for opening and closing details
      * Note that the indicator for showing which row is open is not controlled by DataTables,
      * rather it is done here
      */
     table.on('click', ' tbody td .row-details', function () {
      var nTr = $(this).parents('tr')[0];
      if (oTable.fnIsOpen(nTr)) {
       /* This row is already open - close it */
       $(this).addClass("row-details-close").removeClass("row-details-open");
       oTable.fnClose(nTr);
      } else {
       /* Open this row */
       $(this).addClass("row-details-open").removeClass("row-details-close");
       oTable.fnOpen(nTr, fnFormatDetails(oTable, nTr), 'details');
      }
     });

     /* handle show/hide columns*/
     $('input[type="checkbox"]', tableColumnToggler).change(function () {
      /* Get the DataTables object again - this is not a recreation, just a get of the object */
      var iCol = parseInt($(this).attr("data-column"));
      var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
      oTable.fnSetColumnVis(iCol, (bVis ? false : true));
     });
    }

    var initTable5 = function () {

     var table = $('#sample_5');

     /* Fixed header extension: http://datatables.net/extensions/scroller/ */

     var oTable = table.dataTable({
      "dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>", // datatable layout without  horizobtal scroll
      "scrollY": "300",
      "deferRender": true,
      "order": [
       [0, 'asc']
      ],
      "lengthMenu": [
       [5, 15, 20, -1],
       [5, 15, 20, "All"] // change per page values here
      ],
      "pageLength": 10 // set the initial value
     });


     var tableWrapper = $('#sample_5_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
    }

    var initTable6 = function () {

     var table = $('#sample_6');

     /* Fixed header extension: http://datatables.net/extensions/keytable/ */

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
      "pageLength": 10, // set the initial value,
      "columnDefs": [{  // set default column settings
       'orderable': false,
       'targets': [0]
      }, {
       "searchable": false,
       "targets": [0]
      }],
      "order": [
       [1, "asc"]
      ]
     });

     var oTableColReorder = new $.fn.dataTable.ColReorder( oTable );

     var tableWrapper = $('#sample_6_wrapper'); // datatable creates the table wrapper by adding with id {your_table_jd}_wrapper
     tableWrapper.find('.dataTables_length select').select2(); // initialize select2 dropdown
    }

    return {

     //main function to initiate the module
     init: function () {

      if (!jQuery().dataTable) {
       return;
      }

      console.log('me 1');

      initTable1();
      initTable2();
      initTable3();
      initTable4();
      initTable5();
      initTable6();

      console.log('me 2');
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
<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->
</html>
