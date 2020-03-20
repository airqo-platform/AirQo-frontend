<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/leaflet.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.Default.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/leaflet.fullscreen.css">
<script src="<?= base_url(); ?>assets/leaflet/leaflet.js"></script>
<!-- <script src="https://code.highcharts.com/highcharts.js"></script> -->
<!-- <script src="https://code.highcharts.com/modules/pareto.js"></script> -->
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>
<script src="<?= base_url(); ?>assets/leaflet/leaflet.markercluster-src.js"></script>
<!-- <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script> -->
<!-- PM Particulate Matter -->
<style>
	.map-scroll:before {
		content: 'Use ctrl + scroll to zoom the map';
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 999;
		font-size: 34px;
	}

	.map-scroll:after {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		content: '';
		background: #00000061;
		z-index: 999;
	}

	/* Main container */
	.overlay-image {
		position: relative;
		width: 100%;
	}

	/* Original image */
	.overlay-image .image {
		display: block;
		width: 50px;
		height: 50px;
	}

	/* Original text overlay */
	.overlay-image .text {
		color: #fff;
		font-size: 12px;
		line-height: 1.5em;
		/* text-shadow: 1px 1px 1px #999; */
		text-align: center;
		position: absolute;
		top: 50%;
		left: 100%;
		transform: translate(60%, -40%);
		width: 100%;
	}

	.mycluster {
		width: 40px;
		height: 40px;
		transform: translate3d(558px, 302px, 0px);
		background-color: rgba(48, 103, 226, 1);
		text-align: center;
		font-size: 12px;
		border-radius: 50%;
		padding-top: 10px;
		color: #fff;
		outline: 5px solid rgba(48, 103, 226, 0.3);
		-moz-outline-radius: 60%;
	}

	/* .custom-popup .leaflet-popup-content-wrapper {
			font-size: 16px;
			line-height: 24px;
			border-radius: 0px;
		}

		.custom-popup .leaflet-popup-content-wrapper a {
			color: rgba(255, 255, 255, 0.1);
		}

		.custom-popup .leaflet-popup-tip-container {
			width: 30px;
			height: 15px;
			border: 2px solid green;
		}

		.custom-popup .leaflet-popup-tip {
			background: transparent;
			border: none;
			box-shadow: none;
		} */

	.marker-pin {
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 50%;
		position: absolute;
		transform: rotate(-45deg);
		/* border: 2px solid #fff; */
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
	}

	.marker-pin::after {
		content: '';
		width: 30px;
		height: 30px;
		margin: 0px 1px 1px 1px;
		/* background: #fff; */
		/* border: 2px solid #fff; */
		position: absolute;
		border-radius: 50%;
	}

	.custom-airqo-icon span {
		position: absolute;
		width: 22px;
		font-size: 12px;
		left: 0;
		right: 0;
		margin: 12px 0px 0px 4px;
		text-align: center;
	}
</style>



<!-- cards section -->
<div class="buzen-card-section from-top" id="buzen-card-section">
	<div class="container">

		<div class="row">
			<div class="modal" id="popup" tabindex="1" role="dialog" style="z-index: 999999999999;">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header" style="background-color: #3067e2;">
							<h2 class="modal-title"><img src="<?php echo base_url(); ?>assets/images/logo.png" style="width: 100px !important;"></h2>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true" style="color: #fff;">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<h3 class="text-center" style="font-family: OpenSansLight;">We are launching in</h3>
							<h2 class="text-center" style="font-family: OpenSansLight;" id="countdown"></h2>
						</div>
						<div class="modal-footer">
							<a href="<?= site_url('airqo-launch'); ?>" type="button" class="btn btn-block btn-primary">View More!</a>
							<!-- <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> -->
						</div>
					</div>
				</div>
			</div>
			<!-- Know your air header -->
			<div class="col-md-8 col-lg-8 col-sm-8 col-xs-12">
				<div class="buzen-header">
					<h4 style="font-weight: 300 !important;"><b>Know your air</b></h4>
					<h5>AirQo is the leading air quality data monitoring, analysis and modelling platform in East Africa. Collaborate with us as we use data to achieve clean air for all African cities</h5>
				</div>
			</div>
			<!-- End of know your air header -->
			<!-- Search field -->
			<div class="col-md-4 col-lg-4 col-sm-4 col-xs-12">
				<div class="buzen-logo" id="buzen-logo">
					<div class="container">
						<div class="row">
							<div class="">
								<form method="POST" action="#">
									<input type="text" id="search-value" name="search" class="form-control" placeholder="Search your town, City, District..." required>
									<button class="btn btn-default " name="submit"> <i class="fa fa-search"></i> </button>
								</form>
								<div style="position:relative; z-index: 999;">
									<div class="hide" id="search-results" style="position:absolute; overflow-x: hidden; height: 200px;"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- End of search field -->
		</div>
	</div>

	<div class="container">
		<div class="row">

			<!-- Map container -->
			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
				<div class="panel panel-default" style="padding-top: 0px !important; padding-bottom: 0px !important;">
					<div class="buzen-map-section">
						<div id="contact" style="position: relative; width: 100%; bottom: 0; padding-right: 0px !important; padding-left: 0px !important;" class="google-maps google-maps-responsive col-lg-12  col-sm-12 col-xs-12">
							<div id="leafletmap" style="position: relative; width: 100%; height:480px; border:1px solid #999 !important;">
							</div>
						</div>
					</div>
				</div>
			</div>
			<div>&nbsp;</div>
			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
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

			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
				<hr>
				<h4>AirQo is supported by</h4>
				<hr>
				<div class="row">
					<div class="col-sm-12 col-md-9 col-lg-9 col-xl-9">
						<img src="<?= base_url(); ?>assets/images/partners/googleorg.png" style="width:160px !important; padding-top: 20px;" alt="">
						<img src="<?= base_url(); ?>assets/images/partners/embassy.png" style="width:160px !important; padding-top: 20px;" alt="">
						<img src="<?= base_url(); ?>assets/images/partners/epsrc.png" style="width:160px !important; padding-top: 20px;" alt="">
						<img src="<?= base_url(); ?>assets/images/partners/nfr.png" style="width:160px !important; padding-top: 20px;" alt="">
						<img src="<?= base_url(); ?>assets/images/partners/world-bank.png" style="width:160px !important; padding-top: 0px;" alt="">
					</div>

					<div class="col-md-3">
						<div class="row">
							<h4><b>Download AirQo now</b></h4>
							<h5>know the air in locations that matter to you</h5>
							<a href="https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8" target="_blank">
								<img style="width: 140px !important;" src="<?= base_url(); ?>assets/images/appstore.png">
							</a>
							<a href="https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp" target="_blank">
								<img style="width:140px !important;" src="<?= base_url(); ?>assets/images/playstore.png">
							</a>
						</div>
					</div>
				</div>
			</div>
			<!-- <div class="col-md-12">
				
				
			</div> -->
			<!-- End of map container -->
		</div>
	</div>

</div>

<script src="<?= base_url(); ?>assets/leaflet/Leaflet.fullscreen.min.js"></script>
<script>
	var numberOfDays = function(date) {
		// To set two dates to two variables 
		var date1 = new Date(date);
		var currentDate = new Date();

		// To calculate the time difference of two dates 
		var Difference_In_Time = currentDate.getTime() - date1.getTime();

		// To calculate the no. of days between two dates 
		var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

		return Difference_In_Days <= 0 ? 0 : Difference_In_Days;

	}

	var grayNode = function(days, color) {
		if(parseFloat(days) > 2) {
			return '#808080';
		}
		return color;
	}

	var grayNodeText = function(days, color) {
		if(parseFloat(days) > 2) {
			return '#fff';
		}
		return color;
	}

	function timeSince(date) {
		let minute = 60;
		let hour = minute * 60;
		let day = hour * 24;
		let month = day * 30;
		let year = day * 365;

		let suffix = ' ago';

		let elapsed = Math.floor((Date.now() - date) / 1000);

		if (elapsed < minute) {
			return 'just now';
		}

		// get an array in the form of [number, string]
		let a = elapsed < hour && [Math.floor(elapsed / minute), 'minute'] ||
			elapsed < day && [Math.floor(elapsed / hour), 'hour'] ||
			elapsed < month && [Math.floor(elapsed / day), 'day'] ||
			elapsed < year && [Math.floor(elapsed / month), 'month'] || [Math.floor(elapsed / year), 'year'];

		// pluralise and append suffix
		return a[0] + ' ' + a[1] + (a[0] === 1 ? '' : 's') + suffix;
	}

	$(window).load(function() {
		var map = L.map('leafletmap').setView([0.328015, 32.595011], 7);
		map.addControl(new L.Control.Fullscreen());
		if (L.Browser.mobile) {
			map.scrollWheelZoom.disable();
		}

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: ''
		}).addTo(map);

		$.ajax({
			type: 'POST',
			url: '<?= site_url("Apis/airqoPlacesCached"); ?>',
			data: {
				api: "AQ_9ec70a070c75E6af14FCca86/0621d1D83"
			},
			dataType: 'json',
			beforeSend: function() {

			},
			success: function(data) {
				var nodes = data.nodes;
				// console.log(nodes);
				// var markers = L.markerClusterGroup();

				for (let i = 0; i < nodes.length; i++) {
					var customPopup = ' <table class="table table-striped" style="width: 300px !important;">' +
						'<tr>' +
						'<th>' +
						'<b>' + nodes[i].name + '</b><br>' +
						'<b><small>' + nodes[i].location + '</small></<b>' +
						'</th>' +
						'</tr>' +
						'<tr>' +
						'<td class="vcolor text-center"></td>' +
						'</tr>' +
						'<tr>' +
						'<td>Last Refreshed: ' + timeSince(new Date(nodes[i].time)) + '<br><a href="<?= site_url('node/'); ?>' + nodes[i].churl + '">More Details</a></td>' +
						'</tr>' +
						'</table>';

						

					if (nodes[i].field2 >= 0 && nodes[i].field2 <= 12) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color:' + grayNode(numberOfDays(nodes[i].time), '#00e400') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background:' + grayNode(numberOfDays(nodes[i].time), '#00e400') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_good.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 10px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +'">Good</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 12.1 && nodes[i].field2 <= 35.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ffff00') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background:' + grayNode(numberOfDays(nodes[i].time), '#ffff00') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_moderate.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#000') +';">Moderate</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 35.6 && nodes[i].field2 <= 55.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ff7e00') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background: ' + grayNode(numberOfDays(nodes[i].time), '#ff7e00') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_unhealthy.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">Unhealthy for Sensitive Groups</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 55.5 && nodes[i].field2 <= 150.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ff0000') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background:' + grayNode(numberOfDays(nodes[i].time), '#ff0000') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">Unhealthy</td>' +
								'</tr>' +
								'</table>');

						}).addTo(map);
					} else if (nodes[i].field2 >= 150.5 && nodes[i].field2 <= 250.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#8f3f97') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background: ' + grayNode(numberOfDays(nodes[i].time), '#8f3f97') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">Very Unhealthy</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 250.5 && nodes[i].field2 <= 500.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#7e0023') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
								iconSize: [30, 42],
								iconAnchor: [15, 42],
								popupAnchor: [0, -30]
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150,
							closeButton: false,
							keepInView: true
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html('<table class="" style="background: ' + grayNode(numberOfDays(nodes[i].time), '#7e0023') + ' !important; width: 100%;">' +
								'<tr>' +
								'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_hazardous.png" class="img-responsive" style="width: 20px;" /></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: '+ grayNodeText(numberOfDays(nodes[i].time), '#fff') +';">Harzadous</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
						// markers.addLayer(marker);
					}
				}

				// map.addLayer(markers);
			}
		});
	});
</script>