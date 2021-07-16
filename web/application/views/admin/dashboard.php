	<!-- BEGIN CONTENT -->
	<div class="page-content-wrapper">
		<div class="page-content">

      <style type="text/css">
        .modal-dialog {
            width: 64.3%;
            margin: 48px auto;
          }
      </style>

			<!-- BEGIN SAMPLE PORTLET CONFIGURATION MODAL FORM-->
			<div class="modal fade" id="portlet-config" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
						   <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						   <h4 class="modal-title"></h4>
						</div>
						<div class="modal-body"></div>
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
          <div class="page-bar">
              <ul class="page-breadcrumb">
                <li>
                  <i class="fa fa-dashboard (alias)"></i>
                  <a href="#">Dashboard</a>
                  <i class="fa fa-angle-right"></i>
                  <a href="#">Charts</a>
                </li>
                <li>
                  <!-- <a href="#"><?= $title; ?></a> -->
                </li>
              </ul>
            </div>
            <?php
              if($this->session->flashdata('error'))
                {
                  echo '<div class="alert alert-warning">
                  <button class="close" data-close="alert"></button><span> <i class="fa fa-warning (alias)"></i> '.$this->session->flashdata('error').' </span></div>';
                }
               ?>
    <script type="text/javascript">
        setTimeout(function() {
          $('.alert').fadeOut('fast');
        }, 8000); // <-- time in milliseconds
    </script>
          
						<div class="portlet-body">
							<div class="caption">
								<!-- <h4 style="text-align: center;">The Bar Graph of Vistors Against Unique IPs </h4> -->
							</div>


               <!-- BEGIN BASIC CHART PORTLET-->
               <div class="row">

                 <div class="col col-md-1">
                   <b class="pull-right" style="margin:50px 0px 0px 30px;"> No. of people</b>
                 </div>
                 <div class="col col-md-10">
                   <div class="portlet  ">
                      <div class="portlet-title">
                        <div class="caption">
                          <i class="fa fa-bar-chart" style="font-size: 25px; margin-top: -2px; margin-right: 15px;"></i>The Bar Graph of Number Of Unique Visitors Against Date Visited (For the previous 7days)
                        </div>
                        <div class="tools">
                        <a href="javascript:;" class="collapse">
                        </a>
                        <a href="#portlet-config" data-toggle="modal" class="config">
                        </a>
                        <a href="javascript:;" class="reload">
                        </a>
                        <a href="javascript:;" class="fullscreen">
                        </a>
                        <a href="javascript:;" class="remove">
                        </a>
                      </div>
                    </div>
                    <div class="portlet-body">
                      <div id="chart_1" class="chart" style="height: 500px;">
                      </div>
                    </div>
                  </div>
                        <!-- END CHART PORTLET-->
                </div>
              </div>
              <!-- END ROW -->
                <b class="pull-right" style="margin-right:100px;">Date</b>
                <div class="col col-md-1">

                </div>
                    <!-- END OF BAR CHART -->
              </div>
               </div>
                <!-- The dates site was visted -->
               <hr> <br><br><br>

              <div class="row">

                <div class="col col-md-1">

                </div>

                 <div class="col col-md-5">
                   <h4 style="font-weight: bold; text-align: center;"><i class="fa fa-pie-chart " style="font-size: 25px; margin-top: -2px; margin-right: 15px; "></i>Browser Types</h4>
                 <div class="portlet box blue " style="border-top:1px solid #00c9ff; box-shadow: 1px 1px 5px grey;">

                    <div class="portlet-body">

                      <div id="pie_chart_1" class="chart">
                      </div>
                    </div>
                  </div>
                   </div>
                  <div class="col col-md-5">
                    <h4 style="font-weight: bold; text-align: center;"><i class="fa fa-pie-chart " style="font-size: 25px; margin-top: -2px; margin-right: 15px; "></i>Page Visits</h4>
                   <div class="portlet box blue " style="border-top:1px solid #00c9ff; box-shadow: 1px 1px 5px grey;">

                    <div class="portlet-body">
                      <div id="pie_chart_3" class="chart">
                      </div>
                    </div>
                   </div>
                  </div>
                  <div class="col col-md-1">

                  </div>
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
		 <?= date('Y'); ?> © AIRQO. All Rights Reserved!.
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

<!-- BEGIN graph & chart SCRIPTS -->
<!-- <script src="<?= base_url();?>assets/js/charts-flotcharts.js"></script> -->
<!-- <script src="<?= base_url();?>assets/js/charts-amcharts.js"></script> -->



<!-- BEGIN PAGE LEVEL PLUGINS -->
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.min.js"></script>
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.resize.min.js"></script>
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.pie.min.js"></script>
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.stack.min.js"></script>
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.crosshair.min.js"></script>
<script src="<?= base_url();?>assets/global/plugins/flot/jquery.flot.categories.min.js" type="text/javascript"></script>

<!-- END PAGE LEVEL PLUGINS -->
<!-- BEGIN PAGE LEVEL PLUGINS -->
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/amcharts.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/serial.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/pie.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/radar.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/themes/light.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/themes/patterns.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amcharts/themes/chalk.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/ammap/ammap.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/ammap/maps/js/worldLow.js" type="text/javascript"></script>
<script src="<?= base_url();?>assets/global/plugins/amcharts/amstockcharts/amstock.js" type="text/javascript"></script>
<!-- END PAGE LEVEL PLUGINS -->
<!-- BEGIN PAGE LEVEL SCRIPTS -->
<script>
jQuery(document).ready(function() {
   // initiate layout and plugins
    Metronic.init(); // init metronic core components
    ChartsAmcharts.init(); // init demo charts
    Layout.init(); // init current layout
    QuickSidebar.init(); // init quick sidebar
    Demo.init(); // init demo features
    ChartsFlotcharts.init();
    ChartsFlotcharts.initCharts();
    ChartsFlotcharts.initPieCharts();
    ChartsFlotcharts.initBarCharts();
});
</script>





 <!-- THE BAR GRAPH CHART SCRIPT  STARTS-->
 <script type="text/javascript">
   var ChartsAmcharts = function() {

    var initChartSample1 = function() {
        var chart = AmCharts.makeChart("chart_1", {
            "type": "serial",
            "theme": "light",
            "pathToImages": Metronic.getGlobalPluginsPath() + "amcharts/amcharts/images/",
            "autoMargins": false,
            "marginLeft": 30,
            "marginRight": 8,
            "marginTop": 10,
            "marginBottom": 26,

            "fontFamily": 'Open Sans',
            "color":    '#888',



            <?php
              $barchartData  = '';
              //Current Date
              $current_date  = date('Y-m-d');
              //Loop thru 7 days back from current date
              for($i = 6; $i >= 0; $i--)
              {
                $previous_date = date('Y-m-d', strtotime('-'.$i.' days', strtotime($current_date)));
                $chartQuery    = $this->db->query("SELECT count(*) as total FROM tbl_sitestats WHERE ss_date = '$previous_date'");
                $chartResult   = $chartQuery->row_array();
                if($chartQuery->num_rows() > 0)
                {
                  //Result Exists
                  $barchartData .= '{
                                    "date": "'.$previous_date.'",
                                    "visitors": '.$chartResult['total'].'
                                },';
                }
                else
                {
                  $barchartData .= '{
                                    "date": "'.$previous_date.'",
                                    "visitors": 0
                                },';
                }
              }

             ?>
            "dataProvider": [<?= substr_replace($barchartData, "", -1); ?>],
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left"
            }],
            "startDuration": 1,
            "graphs": [{
                "alphaField": "alpha",
                "balloonText": "<span style='font-size:13px;'>[[title]] on [[category]] : <b>[[value]]</b> [[additional]]</span>",
                "dashLengthField": "dashLengthColumn",
                "fillAlphas": 1,
                "title": "Number of Visitors",
                "type": "column",
                "valueField": "visitors"
            }, {
                "balloonText": "<span style='font-size:13px;'>[[title]] in [[category]]:<b>[[value]]</b> [[additional]]</span>",
                "bullet": "round",
                "dashLengthField": "dashLengthLine",
                "lineThickness": 3,
                "bulletSize": 7,
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "useLineColorForBulletBorder": true,
                "bulletBorderThickness": 3,
                "fillAlphas": 0,
                "lineAlpha": 1,
                "title": "Expenses",
                "valueField": "expenses"
            }],
            "categoryField": "date",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha":0,
                "tickLength": 0
            }
        });

        $('#chart_1').closest('.portlet').find('.fullscreen').click(function() {
            chart.invalidateSize();
        });
    }


    return {
        //main function to initiate the module

        init: function() {
            initChartSample1();
        }

    };

}();
 </script>
 <!-- THE BAR GRAPH CHART SCRIPT  ENDS -->


 <!-- THE PIE CHART SCRIPT  STARTS -->
 <script type="text/javascript">
   var ChartsFlotcharts = function() {

    return {
        //main function to initiate the module

        init: function() {

            Metronic.addResizeHandler(function() {
                Charts.initPieCharts();
            });

        },

        initCharts: function() {

            if (!jQuery.plot) {
                return;
            }

            var data = [];
            var totalPoints = 250;


            //Basic Chart

            function chart1() {
                if ($('#chart_1').size() != 1) {
                    return;
                }

                var d1 = [];
                for (var i = 0; i < Math.PI * 2; i += 0.25)
                    d1.push([i, Math.sin(i)]);

                var d2 = [];
                for (var i = 0; i < Math.PI * 2; i += 0.25)
                    d2.push([i, Math.cos(i)]);

                var d3 = [];
                for (var i = 0; i < Math.PI * 2; i += 0.1)
                    d3.push([i, Math.tan(i)]);

                $.plot($("#chart_1"), [{
                    label: "sin(x)",
                    data: d1,
                    lines: {
                        lineWidth: 1,
                    },
                    shadowSize: 0
                }, {
                    label: "cos(x)",
                    data: d2,
                    lines: {
                        lineWidth: 1,
                    },
                    shadowSize: 0
                }, {
                    label: "tan(x)",
                    data: d3,
                    lines: {
                        lineWidth: 1,
                    },
                    shadowSize: 0
                }], {
                    series: {
                        lines: {
                            show: true,
                        },
                        points: {
                            show: true,
                            fill: true,
                            radius: 3,
                            lineWidth: 1
                        }
                    },
                    xaxis: {
                        tickColor: "#eee",
                        ticks: [0, [Math.PI / 2, "\u03c0/2"],
                            [Math.PI, "\u03c0"],
                            [Math.PI * 3 / 2, "3\u03c0/2"],
                            [Math.PI * 2, "2\u03c0"]
                        ]
                    },
                    yaxis: {
                        tickColor: "#eee",
                        ticks: 10,
                        min: -2,
                        max: 2
                    },
                    grid: {
                        borderColor: "#eee",
                        borderWidth: 1
                    }
                });

            }


            //Tracking Curves

            function chart3() {
                if ($('#chart_3').size() != 1) {
                    return;
                }
                //tracking curves:

                var sin = [],
                    cos = [];
                for (var i = 0; i < 14; i += 0.1) {
                    sin.push([i, Math.sin(i)]);
                    cos.push([i, Math.cos(i)]);
                }

                plot = $.plot($("#chart_3"), [{
                    data: sin,
                    label: "sin(x) = -0.00",
                    lines: {
                        lineWidth: 1,
                    },
                    shadowSize: 0
                }, {
                    data: cos,
                    label: "cos(x) = -0.00",
                    lines: {
                        lineWidth: 1,
                    },
                    shadowSize: 0
                }], {
                    series: {
                        lines: {
                            show: true
                        }
                    },
                    crosshair: {
                        mode: "x"
                    },
                    grid: {
                        hoverable: true,
                        autoHighlight: false,
                        tickColor: "#eee",
                        borderColor: "#eee",
                        borderWidth: 1
                    },
                    yaxis: {
                        min: -1.2,
                        max: 1.2
                    }
                });

                var legends = $("#chart_3 .legendLabel");
                legends.each(function() {
                    // fix the widths so they don't jump around
                    $(this).css('width', $(this).width());
                });

                var updateLegendTimeout = null;
                var latestPosition = null;

                function updateLegend() {
                    updateLegendTimeout = null;

                    var pos = latestPosition;

                    var axes = plot.getAxes();
                    if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) return;

                    var i, j, dataset = plot.getData();
                    for (i = 0; i < dataset.length; ++i) {
                        var series = dataset[i];

                        // find the nearest points, x-wise
                        for (j = 0; j < series.data.length; ++j)
                            if (series.data[j][0] > pos.x) break;

                            // now interpolate
                        var y, p1 = series.data[j - 1],
                            p2 = series.data[j];

                        if (p1 == null) y = p2[1];
                        else if (p2 == null) y = p1[1];
                        else y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);

                        legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(2)));
                    }
                }

                $("#chart_3").bind("plothover", function(event, pos, item) {
                    latestPosition = pos;
                    if (!updateLegendTimeout) updateLegendTimeout = setTimeout(updateLegend, 50);
                });
            }

            //graph
            chart1();
            chart3();

        },


        initPieCharts: function() {
            // data values for pie chart1
            var data = [];
            var series = Math.floor(Math.random() * 10) + 1;
            series = series < 5 ? 5 : series;

            <?php

              $piechartData = '';
              $chartQuery = $this->db->query("SELECT count(*) as total, ss_userAgent FROM tbl_sitestats GROUP BY ss_userAgent");
              $chartResult = $chartQuery->result_array();
              if(empty( $chartResult)){
                   $piechartData .= '{
                                    label: "No Browser Data Yet",
                                    data: "0"
                                },';

              }else{
              foreach ($chartResult as $row) {
                $piechartData .= '{
                                    label : "'.ucwords(strtolower(substr($row['ss_userAgent'], 0, 20)) ).'...'.'",
                                    data : '.$row['total'].'
                                },';
              }
            }

             ?>
            data = [<?= substr_replace($piechartData, "", -1); ?>];
             var data1 = [];
            var series = Math.floor(Math.random() * 10) + 1;
            series = series < 5 ? 5 : series;

            <?php

              $piechartData = '';
              $chartQuery = $this->db->query("SELECT count(*) as total, ss_page FROM tbl_sitestats GROUP BY ss_page");
              $chartResult = $chartQuery->result_array();
               if(empty( $chartResult)){
                   $piechartData .= '{
                                    label: "No Pages Visited Yet",
                                    data: "0"
                                },';

              }else{
              foreach ($chartResult as $row) {
                $piechartData .= '{
                                    label : "'.ucwords(strtolower($row['ss_page'])).'",
                                    data : '.$row['total'].'
                                },';
              }
            }
             ?>
            data1 = [<?= substr_replace($piechartData, "", -1); ?>];
            // GRAPH FOR PAGE VISITS
            if ($('#pie_chart_1').size() !== 0) {
                $.plot($("#pie_chart_1"), data, {
                    series: {
                        pie: {
                            show: true
                        }
                    },
                    legend: {
                        show: false
                    }
                });
            }

            // GRAPH 2
            if ($('#pie_chart_3').size() !== 0) {
                $.plot($("#pie_chart_3"), data1, {
                    series: {
                        pie: {
                            show: true,
                            radius: 1,
                            label: {
                                show: true,
                                radius: 3 / 4,
                                formatter: function(label, series) {
                                    return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
                                },
                                background: {
                                    opacity: 0.5
                                }
                            }
                        }
                    },
                    legend: {
                        show: false
                    }
                });
            }
            function pieHover(event, pos, obj) {
                if (!obj)
                    return;
                percent = parseFloat(obj.series.percent).toFixed(2);
                $("#hover").html('<span style="font-weight: bold; color: ' + obj.series.color + '">' + obj.series.label + ' (' + percent + '%)</span>');
            }
            function pieClick(event, pos, obj) {
                if (!obj)
                    return;
                percent = parseFloat(obj.series.percent).toFixed(2);
                alert('' + obj.series.label + ': ' + percent + '%');
            }
        }
    };
}();
 </script>
  <!-- THE PIE CHART SCRIPT  ENDS -->
<!-- END JAVASCRIPTS -->
</body>
<!-- END BODY -->
</html>
