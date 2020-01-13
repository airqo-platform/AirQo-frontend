<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/leaflet.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.Default.css">
<script src="<?= base_url(); ?>assets/leaflet/leaflet.js"></script>
<!-- <script src="https://code.highcharts.com/highcharts.js"></script> -->
<!-- <script src="https://code.highcharts.com/modules/pareto.js"></script> -->
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>
<script src="<?= base_url(); ?>assets/leaflet/leaflet.markercluster-src.js"></script>
<!-- <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script> -->
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
</style>
<!-- cards section -->
<div class="buzen-card-section from-top" id="buzen-card-section">
	<div class="container">
		<div class="row">
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
									<input type="text" id="search-value" name="search" class="form-control" placeholder="Your town, City, District..." required>
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
			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
				<div class="">
					<div class="">
						<h4>Key</h4>
						<button style="background-color: #45e50d; color: #000;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_good.png" class="pull-left" style="width: 20px;" /><b><small>Good<br>(0 - 12)</small></b></button>
						<button style="background-color: #f8fe28; color: #000;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_moderate.png" class="pull-left" style="width: 20px;" /><b><small>Moderate<br>(12.1 - 35.4)</small></b></button>
						<button style="background-color: #ee8310; color: #fff;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_unhealthy.png" class="pull-left" style="width: 20px;" /><b><small>Unhealthy<br>(35.6 - 55.4)</small></b></button>
						<button style="background-color: #fe0000; color: #fff;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" class="pull-left" style="width: 20px;" /><b><small>Unhealthy<br>(55.5 - 150.4)</small></b></button>
						<button style="background-color: #8639c0; color: #fff;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" class="pull-left" style="width: 20px;" /><b><small>Very Unhealthy<br>(150.5 - 250.4)</small></b></button>
						<button style="background-color: #81202e; color: #fff;" type="button" class="btn col-md-2 col-sm-12 col-xs-12" style="margin: 1px !important;"><img src="<?= base_url(); ?>assets/images/face_hazardous.png" class="pull-left" style="width: 20px;" /><b><small>Hazardous<br>(250.5 - 500.4)</small></b></button>
						<p>PM<sub>2.5</sub> - Particle Matter</p>
					</div>
				</div>
			</div>
			<div class="col-md-12 col-lg-12 col-sm-12 col-xs-12">
				<h4>Download AirQo now</h4>
				<h5>know the air in locations that matter to you</h5>
				<a href="https://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091?mt=8" target="_blank">
					<img class="left" style="width:150px;" src="<?= base_url(); ?>assets/images/appstore.png">
				</a>
				<a href="https://play.google.com/store/apps/details?id=com.buzen.contract.airqoapp" target="_blank">
					<img class="right" style="width:150px;" src="<?= base_url(); ?>assets/images/playstore.png">
				</a>
			</div>
			<!-- <div class="col-md-12">
				
				
			</div> -->
			<!-- End of map container -->
		</div>
	</div>

</div>

<script>
	$(window).load(function() {
		var map = L.map('leafletmap').setView([0.328015, 32.595011], 7);
		if (L.Browser.mobile) {
			map.scrollWheelZoom.disable();
			// console.log('is mobile');
		}

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: ''
		}).addTo(map);

		$.ajax({
			type: 'POST',
			url: '<?= site_url("Apis/airqoPlacesCached"); ?>',
			data: {
				api: "<AIRQO_CONNECTION_API_KEY>"
			},
			dataType: 'json',
			beforeSend: function() {

			},
			success: function(data) {
				var nodes = data.nodes;
				// console.log(nodes);
				var markers = L.markerClusterGroup();

				for (let i = 0; i < nodes.length; i++) {
					var customPopup = ' <table class="table table-striped" style="width: 300px !important;">' +
										'<tr>' +
											'<th>' +
												'<b>' + nodes[i].name + '</b><br>' +
												'<b><small>' + nodes[i].an_type + '</small></<b>' +
											'</th>' +
										'</tr>' +
										'<tr>' +
											'<td class="vcolor text-center"></td>' +
										'</tr>' +
										'<tr>' +
											'<td>Last Refreshed: '+ new Date(nodes[i].time) +'<br><a href="<?= site_url('node/'); ?>'+nodes[i].churl+'">More Details</a></td>' +
										'</tr>' +
									'</table>';

					if (nodes[i].field2 >= 0 && nodes[i].field2 <= 12) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-good.png" />' +
									'<div class="text" style="color: #000 !important;">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							
							$('.vcolor').html( '<table class="" style="background:rgb(35,155,86) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_good.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 10px 10px 0px;">Good</td>' +   
												'</tr>' +
											'</table>');
						});
						markers.addLayer(marker);
					} else if (nodes[i].field2 >= 12.1 && nodes[i].field2 <= 35.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-moderate.png" />' +
									'<div class="text" style="color: #000 !important;">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html( '<table class="" style="background:rgb(249,220,9) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_moderate.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 0px 10px 0px;">Moderate</td>' +   
												'</tr>' +
											'</table>');
						});
						markers.addLayer(marker);
					} else if (nodes[i].field2 >= 35.6 && nodes[i].field2 <= 55.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-unhealthy.png" />' +
									'<div class="text">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html( '<table class="" style="background:rgb(243,156,18) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_unhealthy.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">Unhealthy</td>' +   
												'</tr>' +
											'</table>');
						});
						markers.addLayer(marker);
					} else if (nodes[i].field2 >= 55.5 && nodes[i].field2 <= 150.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-unhealthy-1.png" />' +
									'<div class="text">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html( '<table class="" style="background:rgb(243,22,55) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">Unhealthy</td>' +   
												'</tr>' +
											'</table>');

						});
						markers.addLayer(marker);
					} else if (nodes[i].field2 >= 150.5 && nodes[i].field2 <= 250.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-very-unhealthy.png" />' +
									'<div class="text">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html( '<table class="" style="background:rgb(124,71,181) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">Very Unhealthy</td>' +   
												'</tr>' +
											'</table>');
						});
						markers.addLayer(marker);
					} else if (nodes[i].field2 >= 250.5 && nodes[i].field2 <= 500.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'my-div-icon',
								html: '<div class="overlay-image">' +
									'<img class="image" src="<?= base_url(); ?>assets/images/marker-hazardous.png" />' +
									'<div class="text">' + Math.round(nodes[i].field2) + '</div>' +
									'</div>'
							})
						}).bindPopup(customPopup, {
							width: 400,
							height: 150
						}).on('mouseover click', function(e) {
							this.openPopup();
							$('.vcolor').html( '<table class="" style="background:rgb(147,11,21) !important; width: 100%;">'+
												'<tr>'+
														'<td style="padding:10px 0px 10px 10px;"><img src="<?= base_url(); ?>assets/images/face_hazardous.png" class="img-responsive" style="width: 20px;" /></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +   
														'<td style="padding:10px 0px 10px 0px; color: #fff;">Harzadous</td>' +   
												'</tr>' +
											'</table>');
						});
						markers.addLayer(marker);
					}
				}

				map.addLayer(markers);
			}
		});
	});
</script>