<?php
$node_color    = $this->AirqoModel->nodestate($node['reading'])['node_color'];
$node_caption  = $this->AirqoModel->nodestate($node['reading'])['node_caption'];
?>
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>

<div class="buzen-card-section from-top">
     <div class="container">
          <div class="row buzen-header" style="padding-left:15px; ">
               <h4><b><?= $node['an_name']; ?></b></h4>
               <h5><?= $node['an_map_address']; ?></h5>
          </div>
     </div>
</div>

<!--Map Section-->
<div class="buzen-map" id="buzen-map">
     <div class="container">
          <div class="panel panel-default">
               <div class="row">
                    <div class="col-md-3 col-lg-3 col-xs-12 col-sm-12">
                         <div class="panel panel-danger" style="background: <?= $node_color; ?>; color: #fff; text-shadow: 2px 2px 2px #000;">
                              <i class="fa fa-frown-o"></i>
                              <h3><?= $node['reading']; ?></h3>
                              <h4>PM <sub>2.5</sub></h4>
                              <h5><?= $node_caption; ?></h5>
                         </div>
                    </div>
                    <div class="col-md-4 col-lg-4 col-xs-12 col-sm-12">
                         <h2 class="text-center"></h2>
                         <div id="chart-container" style="width:100%; height:300px;">
                         </div>
                    </div>
                    <div class="col-md-5 col-lg-5 col-xs-12 col-sm-12">
                         <div class="buzen-map-section">
                              <div id="map" style="width: 100%; height: 400px; border: 1px solid #000;"></div>
                         </div>
                    </div>
               </div>
          </div>
     </div>
</div>
<!--end of map section-->

<script>
     $('#chart-container').show();
     $.ajax({
          type: "POST",
          url: "<?= site_url('Apis/airqoChannelFeed'); ?>",
          data: {
               api: 'AQ_9ec70a070c75E6af14FCca86/0621d1D83',
               channel: "<?= $node['an_channel_id']; ?>"
          },
          dataType: "json",
          beforeSend: function() {
               // console.log('loading graph');
          },
          success: function(response) {

               var obj = response.lastfeeds.feeds;
               // var obj = JSON.parse(graphdata);
               // console.log(obj);
               var i;
               var gdata = [];
               for (i = 0; i < obj.length; i++) {
                    var dsingle = [];
                    var d = new Date(obj[i].created_at);
                    var a = d.getTime();
                    var b = parseFloat(obj[i].field2);
                    dsingle[0] = a;
                    dsingle[1] = b;

                    gdata.push(dsingle);
               }

               Highcharts.chart('chart-container', {
                    chart: {
                         type: 'line',
                         // scrollablePlotArea: {
                         // 	minWidth: 600,
                         // 	scrollPositionX: 1
                         // },
                         width: 500,
                         height: 300
                    },
                    title: {
                         text: 'PM Concertration'
                    },
                    xAxis: {
                         type: 'datetime',
                         labels: {
                              overflow: 'justify',
                              format: '{value:%Y-%b-%e}'
                         }
                    },
                    yAxis: {
                         title: {
                              text: 'PM 2.5'
                         },
                         minorGridLineWidth: 0,
                         gridLineWidth: 0,
                         alternateGridColor: null,
                         plotBands: [{ // Good
                              from: 0,
                              to: 12,
                              color: '#28c781',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }, { // Moderate
                              from: 12.1,
                              to: 35.4,
                              color: '#122546',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }, { // Gentle breeze
                              from: 35.6,
                              to: 55.4,
                              color: '#ff9f24',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }, { // Moderate breeze
                              from: 55.5,
                              to: 150.4,
                              color: '#ec323c',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }, { // Fresh breeze
                              from: 150.5,
                              to: 250.4,
                              color: '#931945',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }, { // Strong breeze
                              from: 250.5,
                              to: 500.4,
                              color: '#000000',
                              label: {
                                   text: '',
                                   style: {
                                        color: '#ffffff'
                                   }
                              }
                         }]
                    },
                    tooltip: {
                         valueSuffix: ''
                    },
                    plotOptions: {
                         spline: {
                              lineWidth: 4,
                              states: {
                                   hover: {
                                        lineWidth: 5
                                   }
                              },
                              marker: {
                                   enabled: false
                              }
                         }
                    },
                    series: [{
                         name: name,
                         color: '#fff',
                         data: gdata
                    }],
                    navigation: {
                         menuItemStyle: {
                              fontSize: '10px'
                         }
                    }
                    // ,
                    // exporting: {
                    // 	buttons: {
                    // 		customButton: {
                    // 			x: -62,
                    // 			onclick: function() {
                    // 				// alert('Clicked');
                    // 				$('#chart-container').hide();
                    // 			},
                    // 			text: '<span style="float: right;" onmouseover="hideHighlight(\'c1\')">X</span>'
                    // 		}
                    // 	}
                    // }
               });
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
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCRYzOeKP6vS_Mrht-kh6rYokJGHXSLABE&callback=initMap">
</script>