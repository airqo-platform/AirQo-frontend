<!--buzen-logo-->
<div class="buzen-logo" id="buzen-logo">
	<div class="container">
		<div class="row">
			<div class="col-sm-12 col-md-12 col-lg-12">
				<form method="POST" action="#">
					<input type="text" id="search-value" name="search" class="form-control" placeholder="Your town, City, District..." required>
					<button class="btn btn-default pull-right" name="submit"> <i class="fa fa-search"></i> </button>
				</form>
				<br>
				<div class="hide" id="search-results">

				</div>
			</div>
		</div>
	</div>
</div>
<!--buzen-logo-->

<div class="buzen-header">
	<div class="container">
		<div class="row">
			<p class="top-header"> <b><?= $node['an_name']; ?></b></p>
		</div>
	</div>
</div>
<div class="buzen-current-projects all-projects">
	<div class="container">
		<div class="project-big-tile">
			<div class="myrow">
				<div class="row">
					<p>Chart:</p>
					<div id="chartdiv" style="width: 100%; height: 500px;"></div>
					<script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
					<script src="https://www.amcharts.com/lib/3/serial.js"></script>
					<script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
					<script src="https://www.amcharts.com/lib/3/plugins/export/export.min.js"></script>

					<link href="https://www.amcharts.com/lib/3/plugins/export/export.css" media="all" rel="stylesheet" type="text/css" />
					<script src="https://www.amcharts.com/lib/3/plugins/dataloader/dataloader.min.js"></script>
					<script src="https://www.amcharts.com/lib/3/themes/light.js"></script>

					<script>
						var chart = AmCharts.makeChart("chartdiv", {
							"type": "serial",
							"theme": "light",
							"marginRight": 40,
							"marginLeft": 40,
							"marginTop": 0,
							"autoMarginOffset": 20,
							"mouseWheelZoomEnabled": true,
							"dataDateFormat": "YYYY-MM-DD HH:NN:ss ZZ",

							"dataLoader": {
								"url": "https://thingspeak.com/channels/<?= $node['an_channel_id']; ?>/field/2.csv?timezone=Africa%2FNairobi&average=hourly&days=3",
								// 		"url": "https://thingspeak.com/channels/318099/field/2.csv?timezone=Africa%2FNairobi",
								"format": "csv",
								"showCurtain": true,
								"showErrors": true,
								"async": true,
								"reload": 100,
								"timestamp": true,
								"delimiter": ",",
								"useColumnNames": true,
								"complete": function(chart) {
									// iterate thorugh all graphs and check if they have
									// fillColorsFunction set
									for (i = 0; i < chart.graphs.length; i++) {
										var graph = chart.graphs[i];
										if (graph.fillColorsFunction !== undefined) {
											// iterate thorugh all of the data and add color
											graph.fillColorsField = graph.valueField + "FillColor";
											for (var x = 0; x < chart.dataProvider.length; x++) {
												var dp = chart.dataProvider[x];
												//remove outliers
												if (dp[graph.valueField] > 1000) {
													dp[graph.valueField] = 500;
												}
												if (dp[graph.valueField] < 0) {
													dp[graph.valueField] = 0;
												}

												//end of remove outliers
												dp[graph.fillColorsField] = graph.fillColorsFunction.call(this, dp[graph.valueField]);
											}
										}
									}
								}
							},
							"valueAxes": [{
								"gridAlpha": 0.1,
								"dashLength": 0,
								"stackType": "regular"
							}],
							"gridAboveGraphs": true,
							"startDuration": 1,
							"graphs": [{
								"id": "g1",
								"balloonText": "[[category]]: <b>[[value]] PM2.5 ug/m3</b>",
								"fillAlphas": 0.8,
								"lineAlpha": 0.2,
								"fillColorsFunction": changeColour,
								"type": "column",
								//	"columnWidth": 1,
								//	"fixedColumnWidth": 15,
								"title": "PM 2.5",
								//	"columnThickness": 20,
								"valueField": "field2",
								//	 "balloon":{
								//          "drop":true
								//    }
							}],


							//Creates a cursor for the chart which follows the mouse movements.
							"chartCursor": {
								"pan": true,
								"valueLineEnabled": true,
								"valueLineBalloonEnabled": false,
								"cursorAlpha": 1,
								"cursorColor": "#258cbb",
								"limitToGraph": "g1",
								"valueLineAlpha": 0.2,
								//	"oneBalloonOnly": true,
								"valueZoomable": true
							},

							"chartScrollbar": {
								"graph": "g1",
								"oppositeAxis": false,
								"offset": 62,
								"scrollbarHeight": 40,
								"backgroundAlpha": 0,
								"selectedBackgroundAlpha": 1,
								"selectedBackgroundColor": "#888888",
								"graphFillAlpha": 0,
								"graphLineAlpha": 0.5,
								"selectedGraphFillAlpha": 1,
								"autoGridCount": true,
								"tabIndex": 1,

								"color": "#AAAAAA"
							},
							///
							"categoryField": "created_at",
							"categoryAxis": {
								"gridPosition": "start",
								"gridAlpha": 0,
								"tickPosition": "start",
								"labelRotation": 45,
								"parseDates": true,
								"dashLength": 1,
								"minorGridEnabled": true,
								"minPeriod": "mm",
								"title": "Date"
							},

							"valueAxes": [{
								"position": "left",
								"title": "PM concentration"
							}],
							/*  "legend": {
            		"enabled": true,
            		"useGraphSettings": true,
            		"align":"center",
            
            	}, */
							"titles": [{
								"id": "Title-1",
								"size": 15,
								"text": "Current Air Quality in (<?= $node['an_name']; ?>)"
							}],

							"export": {
								"enabled": true
							},
						});

						function changeColour(value) {
							var colour;
							if (0 <= value && value <= 11.8) {
								colour = "#239B56";
							} else if (11.9 <= value && value <= 35.2) {
								colour = "#F9DC09";
							} else if (35, 3 <= value && value <= 55.2) {
								colour = "#F39C12";
							} else if (55.3 <= value && value <= 149.5) {
								colour = "#F31637";
							} else if (149.6 <= value && value <= 249.9) {
								colour = "#7C47B5";
							} else if (value > 250) {
								colour = "#930B15";
							}
							return colour;
						}

						chart.addListener("rendered", zoomChart);
						zoomChart();

						function zoomChart() {
							//    chart.zoomToIndexes(chart.dataProvider.length -20, chart.dataProvider.length - 10);
							chart.zoomToIndexes(chartData.length - 40, chartData.length - 10);
						}
						////////
					</script>

					<p>Key:</p>
					<table style="background-color:#FFFFE0; color: #000;" class="table table-bordered table-stripped">
						<thead style="background-color: #3399CC; color: #fff;">
							<tr>
								<th>PM2.5 concentration mapping</th>
								<th>Classification</th>
								<th>Health Implications/Precaution statement.</th>
							</tr>
						</thead>
						<tbody>

							<tr>
								<td style="background-color:#239B56; color: #fff;">0 - 12</td>
								<td style="background-color:#239B56; color: #fff;">Good</td>
								<td style="background-color:#239B56; color: #fff;">Air quality is good for everyone.</td>
							</tr>
							<tr>
								<td style="background-color:#F9DC09; color: #fff;">12.1 - 35.4</td>
								<td style="background-color:#F9DC09; color: #fff;">Moderate</td>
								<td style="background-color:#F9DC09; color: #fff;"><b>Unusually sensitive people</b>: Consider reducing prolonged or heavy exertion.<br />
									<b>Everyone else</b>: Air pollution poses little or no risk.
								</td>
							</tr>
							<tr>
								<td style="background-color:#F39C12; color: #fff;">35.6 - 55.4</td>
								<td style="background-color:#F39C12; color: #fff;">Unhealthy for<br />
									sensitive groups</td>
								<td style="background-color:#F39C12; color: #fff;"><b>Sensitive groups</b>: Reduce prolonged or heavy exertion. It&#39;s OK to be active outside, but take more breaks and do less intense activities.<br />
									<b>People with asthma </b>should follow their asthma action plans and keep quick relief medicine handy.<br />
									<b>If you have heart disease</b>: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of<br />
									these, contact your heath care provider.
								</td>
							</tr>
							<tr>
								<td style="background-color:#F31637; color: #fff;">55.5 - 150.4</td>
								<td style="background-color:#F31637; color: #fff;">Unhealthy</td>
								<td style="background-color:#F31637; color: #fff;"><b>Sensitive groups</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling.<br />
									<b>Everyone else</b>: Reduce prolonged or heavy exertion. Take more breaks during all outdoor activities.
								</td>
							</tr>
							<tr>
								<td style="background-color:#7C47B5; color: #fff;">150.5 - 250.4</td>
								<td style="background-color:#7C47B5; color: #fff;">Very unhealthy</td>
								<td style="background-color:#7C47B5; color: #fff;"><b>Sensitive groups</b>: Avoid all physical activity outdoors. Move activities indoors or reschedule to a time when air quality is better.<br />
									<b>Everyone else</b>: Avoid prolonged or heavy exertion. Consider moving activities indoors or rescheduling to a time when air quality is better.<br />
									&nbsp;
								</td>
							</tr>
							<tr>
								<td style="background-color:#930B15; color: #fff;">250.5 - 500.4</td>
								<td style="background-color:#930B15; color: #fff;">Hazardous</td>
								<td style="background-color:#930B15; color: #fff;"><b>Everyone</b>: Avoid all physical activity outdoors.<br />
									<b>Sensitive groups</b>: Remain indoors and keep activity levels low. Follow tips for keeping particle levels low indoors.
								</td>
							</tr>
						</tbody>
					</table>
					<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 myProject">
						<div class="text-section">


						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>