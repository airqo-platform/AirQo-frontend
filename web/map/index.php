<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Airqo Map</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css' rel='stylesheet' />
    <link href='https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' rel='stylesheet' />
    
    <style>
        body { margin:0; padding:0; }
        #map { position:absolute; top:0; bottom:0; width:100%; }
    </style>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">
</head>
<body>
    <div class="" id="wrapper" style="position: absolute; width: 100%; height: 100%; bottom: 0;">
        <div id='map'></div>
        <div id="chart-container" style="position: absolute; height: 300px;left: 10px; top: 10px;"></div>
        <div id="key-container" style="position: fixed;left: 10px; bottom: 10px;">
            <div class="card" style="width: 27em;">
                <div class="card-body">
                    <h5 class="card-title">Key</h5>
                    <p class="card-text">
                        <div class="btn-group btn-group-sm">
                            <button style="background-color: rgb(35,155,86);" type="button" class="btn btn-default"><small>Good</small><br/></button>
                            <button style="background-color: rgb(249,220,9);" type="button" class="btn btn-default"><small>Moderate</small><br/></button>
                            <button style="background-color: rgb(243,156,18);" type="button" class="btn btn-default"><small>Unhealthy</small><br/></button>
                            <button style="background-color: rgb(243,22,55);" type="button" class="btn btn-default"><small>Unhealthy</small><br/></button>
                            <button style="background-color: rgb(124,71,181);" type="button" class="btn btn-default"><small>Very Unhealthy</small><br/></button>
                            <button style="background-color: rgb(147,11,21);" type="button" class="btn btn-default"><small>Hazardous</small><br/></button>
                        </div>
                    </p>
                </div>
            </div>
        </div>
    </div>

<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/js/bootstrap.min.js" integrity="sha384-7aThvCh9TypR7fIc2HV4O/nFMVCBwyIUKL8XCtKE+8xgCgl/PQGuFsvShjr74PBp" crossorigin="anonymous"></script>

<script src="code/highcharts.js"></script>
<script src="code/modules/series-label.js"></script>
<script src="code/modules/exporting.js"></script>
<script src="code/modules/export-data.js"></script>


<script>
mapboxgl.accessToken = 'pk.eyJ1IjoiYWRvbmdvdCIsImEiOiJjanMyd3g0OHMyMjJiM3luMW5sczQyMHVuIn0.80zLqlLLxgTvYOCeI44jsg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [32.59179687498357, 0.66995747013945],
    zoom: 6
});

map.on('load', function(ee) {
    map.addControl(new mapboxgl.NavigationControl());
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("nodes", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ nodes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        // data: "https://docs.mapbox.com/mapbox-gl-js/assets/nodes.geojson",
        data: "https://airqo.net/apis/android/ver1/03/adongot.php",
        cluster: true,
        clusterMaxZoom: 1, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "nodes",
        filter: ["has", "point_count"],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#ff0000",
                100,
                "#f1f075",
                750,
                "#f28cb1"
            ],
            "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "nodes",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": ["get", "color_av_lt"],
            "circle-radius": 16,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff"
        }
    });

    map.addLayer({
        "id": "unclustered-point-label",
        "type": "symbol",
        "source": "nodes",
        "layout": {
        "text-field": ["get", "latest"],
        "text-font": [
                "DIN Offc Pro Medium",
                "Arial Unicode MS Bold"
            ],
            "text-size": 12
        },
        paint: {
            "text-color": "#ffffff"
        }
    });

    // inspect a cluster on click
    map.on('click', 'unclustered-point', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
        var clusterId = features[0].properties.cluster_id;
        map.getSource('nodes').getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err)
                return;

          var coordinates  = features[0].geometry.coordinates.slice();
          var name         = features[0].properties.name;
          var desc         = features[0].properties.desc;
          var av_hr        = features[0].properties.av_hour;
          var color_av_hr  = features[0].properties.color_av_hr;
          var av_day       = features[0].properties.av_day;
          var color_av_day = features[0].properties.color_av_day;
          var latest       = features[0].properties.latest;
          var ic_day       = features[0].properties.ic_day;
          var ic_hr        = features[0].properties.ic_hr;
          var ic_latest    = features[0].properties.ic_lt;
          var color_latest = features[0].properties.color_av_lt;
          var date         = features[0].properties.date;
          var date_n       = new Date(date);

          var graphdata = features[0].properties.data;
          var obj = JSON.parse(graphdata);
         
          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
               coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          infoWindow = '<p></p>' +
                         '<div class="alert col-md-12" style="max-width: 260px;" role="alert">' +
                         '<h4><b>' + name + '</b></h4>' +
                         '<h6>' + desc + '</h6>' +
                         '<hr>' +
                         '<div class="btn-group btn-group">' +
                              '<button style="" type="button" class="btn btn-default"><small>24 hrs</small><br/><span style="padding: 2px; border-radius: 3px; background-color:' + color_av_day + ';">'+ parseFloat(av_day).toFixed(3) +'</span><br/><img src="node-states/' + ic_day + '" width="20" /></button>' +
                              '<button style="" type="button" class="btn btn-default"><small>Past hr</small><br/><span style="padding: 2px; border-radius: 3px;background-color:' + color_av_hr + ';">'+ parseFloat(av_hr).toFixed(3) +'</span><br/><img src="node-states/' + ic_hr + '" width="20" /></button>' +
                              '<button style="" type="button" class="btn btn-default"><small>Latest</small><br/><span style="padding: 2px; border-radius: 3px;background-color:' + color_latest + ';">'+ parseFloat(latest).toFixed(3) +'</span><br/><img src="node-states/' + ic_latest + '" width="20" /></button>' +
                         '</div>' +
                         '<hr>' +
                         '<p>' + date_n + '</p>' +
                         '</div>';
          new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(infoWindow)
          .addTo(map);

          Highcharts.chart('chart-container', {
                chart: {
                    type: 'line',
                    scrollablePlotArea: {
                        minWidth: 600,
                        scrollPositionX: 1
                    }
                },
                title: {
                    text: name + ' PM2.5 AIQO'
                },
                // subtitle: {
                //     text: 'Current Air Quality in a selected Area of Kampala City(Bukoto Area)'
                // },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        overflow: 'justify'
                    }
                },
                yAxis: {
                    title: {
                        text: 'PM Concertration'
                    },
                    minorGridLineWidth: 0,
                    gridLineWidth: 0,
                    alternateGridColor: null,
                    plotBands: [{ // Good
                        from: 0,
                        to: 12,
                        color: 'rgb(35,155,86)',
                        label: {
                            text: '',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }, { // Moderate
                        from: 12.1,
                        to: 35.4,
                        color: 'rgb(249,220,9)',
                        label: {
                            text: '',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }, { // Gentle breeze
                        from: 35.6,
                        to: 55.4,
                        color: 'rgb(243,156,18)',
                        label: {
                            text: '',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }, { // Moderate breeze
                        from: 55.5,
                        to: 150.4,
                        color: 'rgb(243,22,55)',
                        label: {
                            text: '',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }, { // Fresh breeze
                        from: 150.5,
                        to: 250.4,
                        color: 'rgb(124,71,181)',
                        label: {
                            text: '',
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }, { // Strong breeze
                        from: 250.5,
                        to: 500.4,
                        color: 'rgb(147,11,21)',
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
                    color: '#000000',
                    data: obj
                }],
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            });
        });
    });

    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});
</script>
</body>
</small>