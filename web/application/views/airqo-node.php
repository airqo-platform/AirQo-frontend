<?php
$node_color    = $this->AirqoModel->nodestate($node['reading'], $node['time'])['node_color'];
$node_caption  = $this->AirqoModel->nodestate($node['reading'], $node['time'])['node_caption'];
$node_icon     = $this->AirqoModel->nodestate($node['reading'], $node['time'])['node_icon'];
$node_range    = $this->AirqoModel->nodestate($node['reading'], $node['time'])['node_range'];
$node_description = $this->AirqoModel->nodestate($node['reading'], $node['time'])['node_description'];
?>
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>
<script src="<?= base_url(); ?>assets/global/scripts/loadingoverlay.min.js"></script>
<script src="<?= base_url(); ?>assets/chartjs/Chart.min.js"></script>

<div class="buzen-card-section from-top">
     <div class="container">
          <div class="row buzen-header" style="padding-left:15px; ">
               <h4><b><?= $node['an_name']; ?></b></h4>
               <h5><?= $node['an_map_address']; ?></h5>
          </div>
     </div>
</div>
<?php
$txt_color = '';
if ($node['reading'] >= 0 && $node['reading'] <= 12) {
     $txt_color = "#000";
} else if ($node['reading'] >= 12.1 && $node['reading'] <= 35.4) {
     $txt_color = "#000";
} else if ($node['reading'] >= 35.6 && $node['reading'] <= 55.4) {
     $txt_color = "#fff";
} else if ($node['reading'] >= 55.5 && $node['reading'] <= 150.4) {
     $txt_color = "#fff";
} else if ($node['reading'] >= 150.5 && $node['reading'] <= 250.4) {
     $txt_color = "#fff";
} else if ($node['reading'] >= 250.5 && $node['reading'] <= 500.4) {
     $txt_color = "#fff";
}

?>
<!--Map Section-->
<div class="buzen-map" id="buzen-map">
     <div class="container">
          <div class="panel panel-default">
               <div class="row">
                    <div class="col-md-12">
                         <div class="col-md-6" style="background: <?= $node_color; ?>; color: <?= $txt_color; ?>; height: 415px; margin-top: 0em !important; margin-bottom: 1.5em !important;">
                              <div class="col-md-12 text-center">
                                   <img src="<?= base_url(); ?>assets/images/<?= $node_icon; ?>" style="width: 150px; padding: 10px;" />
                                   <h4><b><?= $node['reading']; ?> <small style="color: <?= $txt_color; ?>;">PM<sub>2.5</sub></small></b></h4>
                                   <h4><?= $node_caption; ?> (<?= $node_range; ?>)</h4>
                                   <hr>
                                   <p class="text-justify"><?= $node_description; ?></p>
                                   <p>&nbsp;</p>
                              </div>
                         </div>
                         <div class="col-md-6">
                              <div id="map" style="width: 100%; height: 415px; border: 1px solid #cdcdcd; margin-top: 0em !important; margin-bottom: 1.5em !important;"></div>
                         </div>
                    </div>



                    <div class="col-md-12">
                         <div class="col-md-12">
                              <h5 style="font-weight: bold;">History - PM2.5 over last 48 hours</h5>
                              <?php
                              if ($this->AirqoModel->numberOfDays($node['time']) > 2) {
                              ?>
                                   <div class="alert alert-danger">No History Data Available</div>
                              <?php
                              } else {
                              ?>
                                   <div id="chart_loader" style="background-color: #ffffff; width: 100%; max-height: 200px;">
                                        <canvas id="chart_div" height="105vw"></canvas>
                                   </div>
                              <?php
                              }
                              ?>

                         </div>
                         <?php
                         if ($this->AirqoModel->numberOfDays($node['time']) > 2) {
                         ?>
                              <!-- <div class="alert alert-danger">No History Data Available</div> -->
                         <?php
                         } else {
                         ?>
                              <div>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                                   <p>&nbsp;</p>
                              </div>
                         <?php
                         }
                         ?>

                         <div class="col-md-12">
                              <h5 style="font-weight: bold;">Forecast over next 24 hours</h5>
                              <?php
                              if ($this->AirqoModel->numberOfDays($node['time']) > 2) {
                              ?>
                                   <div class="alert alert-danger">No Forecast Data Available</div>
                              <?php
                              } else {
                              ?>
                                   <div id="chart_loader_forecast" style="background-color: #ffffff; width: 100%; max-height: 200px;">
                                        <canvas id="chart_d" height="60vw"></canvas>
                                   </div>
                              <?php
                              }
                              ?>

                         </div>

                         <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                              <h3>Key</h3>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #45e50d; color: #000; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_good.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Good <br><br>(0 - 12)</small></br>
                              </div>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #f8fe28; color: #000; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_moderate.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Moderate<br><br />(12.1 - 35.4)</small></b>
                              </div>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #ee8310; color: #fff; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_unhealthy.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Unhealthy for <br />sensitive groups<br>(35.6 - 55.4)</small></br>
                              </div>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #fe0000; color: #fff; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Unhealthy<br /><br>(55.5 - 150.4)</small></b>
                              </div>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #8639c0; color: #fff; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Very Unhealthy<br /><br>(150.5 - 250.4)</small></b>
                              </div>
                              <div class="col-md-2 col-sm-12 col-xs-12" style="background-color: #81202e; color: #fff; text-align: center; padding: 3px;">
                                   <img src="<?= base_url(); ?>assets/images/face_hazardous.png" style="width: 20px;" />&nbsp;&nbsp;&nbsp;<b><small>Hazardous<br><br />(250.5 - 500.4)</small></b>
                              </div>
                              <br>
                              <br>
                              <p>PM<sub>2.5</sub> - Particulate Matter</p>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</div>
<!--end of map section-->

<script>
     // --------------------------------------------------------------------------------------------------------------------
     // Leading Zeroes for hours and minutes
     // --------------------------------------------------------------------------------------------------------------------
     function leadingZeroes(value) {
          if (value < 10) {
               return '0' + value;
          } else {
               return value;
          }
     }


     // --------------------------------------------------------------------------------------------------------------------
     // AirQo UTC DateTIme to Graph DateTime
     // --------------------------------------------------------------------------------------------------------------------
     function graphTime(api_date) {
          const months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          let date = new Date(api_date);

          let display_date = dateOrdinal(date.getDate());
          let display_month = months_names[date.getMonth()];
          let display_hour = date.toLocaleString('en-US', {
               hour: 'numeric',
               hour12: true
          });

          return `${display_date} ${display_month}, ${display_hour}`;
     }

     // --------------------------------------------------------------------------------------------------------------------
     // Add ordinal to date e.g. 1st, 2nd, 3rd, 4th
     // --------------------------------------------------------------------------------------------------------------------
     function dateOrdinal(date) {
          if (date > 3 && date < 21) return `${date}th`;
          switch (date % 10) {
               case 1:
                    return `${date}st`;
               case 2:
                    return `${date}nd`;
               case 3:
                    return `${date}rd`;
               default:
                    return `${date}th`;
          }
     }

     $.ajax({
          type: "POST",
          url: "<?= site_url('Apis/airqoPlace24Hours'); ?>",
          data: {
               api: 'AQ_9ec70a070c75E6af14FCca86/0621d1D83',
               channel: "<?= $node['an_channel_id']; ?>"
          },
          dataType: "json",
          beforeSend: function() {
               $('#chart_loader').LoadingOverlay("show");
          },
          success: function(response) {
               $('#chart_loader').LoadingOverlay("hide");
               let x_data = [];
               let y_data = [];
               let bar_colors = [];

               let graph_feeds = response.feed.hourly_results;
               if(graph_feeds != null) {
                    graph_feeds = graph_feeds.splice(0, 48);
                    graph_feeds.reverse();
                    for (let i = 0; i < graph_feeds.length; i++) {
                         // var d = new Date(graph_feeds[i].time);
                         var d = graphTime(graph_feeds[i].time);
                         // var a = d.getTime();
                         // var h = d.getHours();
                         // var m = d.getMinutes();

                         //color
                         var b = parseFloat(graph_feeds[i].pm2_5);
                         var color = "";
                         if (b >= 0 && b <= 12) {
                              color = "#00e400";
                         } else if (b >= 12.1 && b <= 35.4) {
                              color = "#ffff00";
                         } else if (b >= 35.6 && b <= 55.4) {
                              color = "#ff7e00";
                         } else if (b >= 55.5 && b <= 150.4) {
                              color = "#ff0000";
                         } else if (b >= 150.5 && b <= 250.4) {
                              color = "#8f3f97";
                         } else if (b >= 250.5 && b <= 500.4) {
                              color = "#7e0023";
                         }

                         y_data.push(parseFloat(graph_feeds[i].pm2_5));
                         x_data.push(d);
                         // x_data.push(leadingZeroes(h) + ":" + leadingZeroes(m));
                         bar_colors.push(color);
                    }
                    var ctx = document.getElementById('chart_div');
                    var chart = new Chart(ctx, {
                         type: 'bar',
                         data: {
                              labels: x_data,
                              datasets: [{
                                   label: "PM 2.5 (µg/m3)",
                                   data: y_data,
                                   backgroundColor: bar_colors,
                                   borderColor: bar_colors,
                                   borderWidth: 0
                              }]
                         },
                         options: {
                              tooltips: {
                                   "enabled": true
                              },
                              legend: {
                                   display: false,
                              },
                              scales: {
                                   xAxes: [{
                                        ticks: {
                                             autoSkip: false,
                                             minRotation: 90,
                                             maxRotation: 90
                                        },
                                        gridLines: {
                                             // display: false,
                                             offsetGridLines: true
                                        },
                                        scaleLabel: {
                                             display: true,
                                             labelString: "Time",
                                             fontColor: "#415c7b"
                                        }
                                   }],
                                   yAxes: [{
                                        ticks: {
                                             display: true,
                                             beginAtZero: true,
                                             // stepSize: 1
                                        },
                                        gridLines: {
                                             // display: true,
                                             offsetGridLines: true
                                        },
                                        scaleLabel: {
                                             display: true,
                                             labelString: "PM 2.5 (µg/m3)",
                                             fontColor: "#415c7b"
                                        }
                                   }]
                              }
                         }
                    });
               } else {
                    $('#chart_loader').html('<div class="alert alert-danger">No History data available</div>');
               }
               
          }
     });

     function initMap() {
          var myLatLng = {
               lat: parseFloat("<?= $node['an_lat']; ?>"),
               lng: parseFloat("<?= $node['an_lng']; ?>")
          };

          var map = new google.maps.Map(document.getElementById('map'), {
               zoom: 13,
               center: myLatLng
          });

          var marker = new google.maps.Marker({
               position: myLatLng,
               map: map,
               title: '<?= $node['an_name']; ?>'
          });
     }

     $.ajax({
          type: "POST",
          url: "<?= site_url("Apis/placeForecast"); ?>",
          data: {

               lat: "<?= $node['an_lat']; ?>",
               lng: "<?= $node['an_lng']; ?>",
               api: 'AQ_9ec70a070c75E6af14FCca86/0621d1D83'
          },
          dataType: "json",
          beforeSend: function() {
               // console.log('Loading prediction');
               $('#chart_loader_forecast').LoadingOverlay("show");
          },
          success: function(response) {
               $('#chart_loader_forecast').LoadingOverlay("hide");
               let x_data = [];
               let y_data = [];
               let bar_colors = [];

               let graph_feeds = response.formatted_results.predictions;
               if (graph_feeds != null) {
                    //graph_feeds.reverse();
                    for (let i = 0; i < graph_feeds.length; i++) {
                         var d = graphTime(graph_feeds[i].prediction_time);
                         // var d = new Date(graph_feeds[i].prediction_time);
                         // var a = d.getTime();
                         // var h = d.getHours();
                         // var m = d.getMinutes();

                         //color
                         var b = parseFloat(graph_feeds[i].prediction_value);
                         var color = "";
                         if (b >= 0 && b <= 12) {
                              color = "#00e400";
                         } else if (b >= 12.1 && b <= 35.4) {
                              color = "#ffff00";
                         } else if (b >= 35.6 && b <= 55.4) {
                              color = "#ff7e00";
                         } else if (b >= 55.5 && b <= 150.4) {
                              color = "#ff0000";
                         } else if (b >= 150.5 && b <= 250.4) {
                              color = "#8f3f97";
                         } else if (b >= 250.5 && b <= 500.4) {
                              color = "#7e0023";
                         }

                         y_data.push(parseFloat(graph_feeds[i].prediction_value));
                         x_data.push(d);
                         // x_data.push(leadingZeroes(h) + ":" + leadingZeroes(m));
                         bar_colors.push(color);
                    }
                    var ctx = document.getElementById('chart_d');
                    var chart = new Chart(ctx, {
                         type: 'bar',
                         data: {
                              labels: x_data,
                              datasets: [{
                                   label: "PM 2.5 (µg/m3)",
                                   data: y_data,
                                   backgroundColor: bar_colors,
                                   borderColor: bar_colors,
                                   borderWidth: 0
                              }]
                         },
                         options: {
                              tooltips: {
                                   "enabled": true
                              },
                              legend: {
                                   display: false,
                              },
                              scales: {
                                   xAxes: [{
                                        gridLines: {
                                             // display: false,
                                             offsetGridLines: true
                                        },
                                        scaleLabel: {
                                             display: true,
                                             labelString: "Time",
                                             fontColor: "#415c7b"
                                        }
                                   }],
                                   yAxes: [{
                                        ticks: {
                                             display: true,
                                             beginAtZero: true,
                                             // stepSize: 1
                                        },
                                        gridLines: {
                                             // display: true,
                                             offsetGridLines: true
                                        },
                                        scaleLabel: {
                                             display: true,
                                             labelString: "PM 2.5 (µg/m3)",
                                             fontColor: "#415c7b"
                                        }
                                   }]
                              }
                         }
                    });
               } else {
                    $('#chart_loader_forecast').html('<div class="alert alert-danger">No Forecast Available</div>');
               }
          }
     });


     // chart_d
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCRYzOeKP6vS_Mrht-kh6rYokJGHXSLABE&callback=initMap">
</script>