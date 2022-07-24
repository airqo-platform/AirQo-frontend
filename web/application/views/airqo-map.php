<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css' rel='stylesheet' />
<style>
    /* body { margin:0; padding:0; } */
    #map {
        position: relative;
        top: 0px;
        height: 600px;
        width: 100%;
    }
</style>
<div class="" id="wrapper" style="position: relative; width: 100%; bottom: 0;">
    <div id='map'></div>
    <div id="chart-container" style="position: absolute; height: 300px;left: 10px; top: 10px;"></div>
    <div id="key-container" style="position: absolute;left: 10px; bottom: 10px;">
        <div class="card" style="width: 27em;">
            <div class="card-body">
                <h5 class="card-title">Key</h5>
                <p class="card-text">
                    <div class="btn-group btn-group-sm">
                        <button style="background-color: rgb(35,155,86); color: #fff;" type="button" class="btn col-xs-4"><small>Good</small></button>
                        <button style="background-color: rgb(249,220,9); color: #fff;" type="button" class="btn col-xs-4"><small>Moderate</small></button>
                        <button style="background-color: rgb(243,156,18); color: #fff;" type="button" class="btn col-xs-4"><small>Unhealthy</small></button>
                        <button style="background-color: rgb(243,22,55); color: #fff;" type="button" class="btn col-xs-4"><small>Unhealthy</small></button>
                        <button style="background-color: rgb(124,71,181); color: #fff;" type="button" class="btn col-xs-4"><small>Very Unhealthy</small></button>
                        <button style="background-color: rgb(147,11,21); color: #fff;" type="button" class="btn col-xs-4"><small>Hazardous</small></button>
                    </div>
                </p>
            </div>
        </div>
    </div>
</div>

<?php
$contact = $this->AirqoModel->get_contact_details(1);
?>
<!-- End of the maps section -->
<!--back to top funtion-->
<a href="#0" class="cd-top"></a>
<!--back to top funtion-->
<!-- BEGINNING OF FOOTER -->
<div class="buzen-footer" id="contact-us">
    <div class="container">
        <div class="row">
            <div class="col-sm-3 col-md-3 col-lg-3">
                <h4>AirQo</h4>
                <?= $contact['con_address']; ?>
                <p><br /></p>
            </div>
            <div class="col-sm-3 col-md-3 col-lg-3">
                <h4>Explore</h4><br />
                <ul class="nav">
                    <li><a href="<?= site_url('airqo/news'); ?>">News</a></li>
                    <li><a href="<?= site_url('airqo/projects'); ?>">Projects</a></li>
                    <li><a href="<?= site_url('/'); ?>">Get Involved</a></li>
                    <li><a href="<?= site_url('/'); ?>">Apps</a></li>
                </ul>
            </div>

            <div class="col-sm-3 col-md-3 col-lg-3">
                <h4>About</h4>
                <ul class="nav">
                    <li><a href="<?= site_url('airqo/about'); ?>">About Us</a></li>
                    <li><a href="<?= site_url('airqo/howItWorks'); ?>">How it Works</a></li>
                    <li><a href="<?= site_url('airqo/team'); ?>">Team</a></li>
                    <li><a href="<?= site_url('airqo/faqs'); ?>">Faqs</a></li>
                </ul>
            </div>
            <div class="col-sm-3 col-md-3 col-lg-3">
                <h4>subscribe to our newsletter</h4>
                <p>Recieve our Latest updates via email</p>
                <form method="post" action="#">
                    <input type="email" class="form-control" name="email" placeholder="Enter your email address" required />
                    <button type="submit" name="submit" value="Send Message" class="btn btn-default push-right"><i class="fa fa-envelope"></i></button>
                </form>
            </div>
        </div>
    </div>
    <hr />
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12 col-md-12">
                <center>
                    &copy; <?php echo date("Y"); ?> AirQo
                </center>
            </div>
        </div>
    </div>
</div>

<script src="<?php echo base_url(); ?>assets/bootstrap/js/jquery-2.1.4.min.js"></script>
<script src="<?php echo base_url(); ?>assets/bootstrap/js/popper.min.js"></script>
<script src="<?php echo base_url(); ?>assets/bootstrap/js/bootstrap.min.js"></script>

<script src="<?php echo base_url(); ?>assets/bootstrap/js/wow.min.js"></script>
<script>
    new WOW().init();
</script>

<!-- animated scroll -->
<script type="text/javascript" src="<?php echo base_url(); ?>assets/scroll animation/jquery.localScroll.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>assets/scroll animation/jquery.scrollTo.min.js"></script>
<!-- animated scroll inntialisation -->
<script type="text/javascript">
    // $(document).ready(function() {
    //     $('#myNav').localScroll({
    //         duration: 800
    //     });
    //     $('#myNav0').localScroll({
    //         duration: 800
    //     });
    // });
</script>
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>


<script>
    mapboxgl.accessToken = "<?= getenv('MAPBOX_API_KEY'); ?>";
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
            // data: "<?= site_url('Apis/airqoPlaces'); ?>",
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
        map.on('click', 'unclustered-point', function(e) {
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['unclustered-point']
            });
            var clusterId = features[0].properties.cluster_id;
            map.getSource('nodes').getClusterExpansionZoom(clusterId, function(err, zoom) {
                if (err)
                    return;

                var coordinates = features[0].geometry.coordinates.slice();
                var name = features[0].properties.name;
                var desc = features[0].properties.desc;
                var av_hr = features[0].properties.av_hour;
                var color_av_hr = features[0].properties.color_av_hr;
                var av_day = features[0].properties.av_day;
                var color_av_day = features[0].properties.color_av_day;
                var latest = features[0].properties.latest;
                var ic_day = features[0].properties.ic_day;
                var ic_hr = features[0].properties.ic_hr;
                var ic_latest = features[0].properties.ic_lt;
                var color_latest = features[0].properties.color_av_lt;
                var date = features[0].properties.date;
                var date_n = new Date(date);

                var graphdata = features[0].properties.data;
                var obj = JSON.parse(graphdata);
                //  console.log(obj.length);
                var i;
                var gdata = [];
                for (i = 0; i < obj.length; i++) {
                    for (let j = 0; j < obj[i].length; j++) {
                        var dsingle = [];
                        var d = new Date(obj[i][0]);
                        // console.log(d.getTime());
                        var a = d.getTime();
                        var b = obj[i][1];
                        dsingle[0] = a;
                        dsingle[1] = b;
                        // gdata[]

                    }
                    gdata.push(dsingle);
                }

                //  console.log(gdata);

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
                    '<button style="" type="button" class="btn btn-default"><small>24 hrs</small><br/><span style="padding: 2px; border-radius: 3px; background-color:' + color_av_day + ';">' + parseFloat(av_day).toFixed(3) + '</span><br/><img src="<?= base_url(); ?>assets/node-states/' + ic_day + '" width="20" /></button>' +
                    '<button style="" type="button" class="btn btn-default"><small>Past hr</small><br/><span style="padding: 2px; border-radius: 3px;background-color:' + color_av_hr + ';">' + parseFloat(av_hr).toFixed(3) + '</span><br/><img src="<?= base_url(); ?>assets/node-states/' + ic_hr + '" width="20" /></button>' +
                    '<button style="" type="button" class="btn btn-default"><small>Latest</small><br/><span style="padding: 2px; border-radius: 3px;background-color:' + color_latest + ';">' + parseFloat(latest).toFixed(3) + '</span><br/><img src="<?= base_url(); ?>assets/node-states/' + ic_latest + '" width="20" /></button>' +
                    '</div>' +
                    '<hr>' +
                    '<p>' + date_n + '</p>' +
                    '</div>';
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(infoWindow)
                    .addTo(map);

                $('#chart-container').show();
                Highcharts.chart('chart-container', {
                    chart: {
                        type: 'line',
                        scrollablePlotArea: {
                            minWidth: 600,
                            scrollPositionX: 1
                        }
                    },
                    title: {
                        text: name
                    },
                    // subtitle: {
                    //     text: 'Current Air Quality in a selected Area of Kampala City(Bukoto Area)'
                    // },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            overflow: 'justify',
                            format: '{value:%Y-%b-%e}'
                        }
                    },
                    // xAxis: {
                    //      type: 'datetime',
                    //      tickInterval : 1
                    //      // labels: {
                    //      //      formatter: function() {
                    //      //           return this.value;
                    //      //           // return Highcharts.dateFormat('%e %b', this.value); // milliseconds not seconds
                    //      //      },
                    //      // }
                    // },
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
                        data: gdata
                    }],
                    navigation: {
                        menuItemStyle: {
                            fontSize: '10px'
                        }
                    },
                    exporting: {
                        buttons: {
                            customButton: {
                                x: -62,
                                onclick: function() {
                                    // alert('Clicked');
                                    $('#chart-container').hide();
                                },
                                text: '<span style="float: right;" onmouseover="hideHighlight(\'c1\')">X</span>'
                            }
                        }
                    }
                });
            });
        });

        map.on('mouseenter', 'unclustered-point', function() {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function() {
            map.getCanvas().style.cursor = '';
        });
    });
</script>
<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="<?= base_url(); ?>assets/frontend/js/jquery-1.11.1.min.js"></script>
<script src="<?= base_url(); ?>assets/frontend/js/BackToTop.js"></script>
<script>
    // Select all links with hashes
    $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function(event) {
            // On-page links
            if (
                location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                location.hostname == this.hostname
            ) {
                // Figure out element to scroll to
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                    // Only prevent default if animation is actually gonna happen
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1000, function() {
                        // Callback after animation
                        // Must change focus!
                        var $target = $(target);
                        $target.focus();
                        if ($target.is(":focus")) { // Checking if the target was focused
                            return false;
                        } else {
                            $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                            $target.focus(); // Set focus again
                        };
                    });
                }
            }
        });
</script>
<!-- <script src="https://code.highcharts.com/highcharts.js"></script>
<script type="text/javascript">
    Highcharts.chart('mg', {
        data: {
            table: 'datatable'
        },
        chart: {
            type: 'column'
        },
        title: {
            text: 'Air Quality History'
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Weather Conditions'
            }
        },
        tooltip: {
            formatter: function() {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.point.y + ' ' + this.point.name.toLowerCase();
            }
        }
    });
</script> -->
<!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="<?= base_url(); ?>assets/frontend/js/bootstrap.min.js"></script>
</body>

</html>