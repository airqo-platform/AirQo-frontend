<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/leaflet.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/dist/MarkerCluster.Default.css">
<link rel="stylesheet" href="<?= base_url(); ?>assets/leaflet/leaflet.fullscreen.css">
<script src="<?= base_url(); ?>assets/leaflet/leaflet.js"></script>
<script src="<?= base_url(); ?>assets/code/highcharts.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/series-label.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/exporting.js"></script>
<script src="<?= base_url(); ?>assets/code/modules/export-data.js"></script>
<script src="<?= base_url(); ?>assets/leaflet/leaflet.markercluster-src.js"></script>
<style>
.buz-para{
	font-size:1.8em; 
	line-height: normal;
}
/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {

}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {

}

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {

}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {

}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {

} 
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
<div class="w3l-index-block1">
	<div class="content py-5">
		<div class="container">
			
		</div>
	</div>
</div>

<section class="w3l-index-block3">
	<div class="section-info py-5">
		<div class="container py-md-5">
			<div class="row cwp17-two align-items-center">
				<div class="col-md-6 cwp17-text" style="border-right: 1px solid #cdcdcd; padding: 20px;">
					<p class="text-justify">
						AirQo is Africa's leading air quality monitoring, research and analytics network. We use low cost technologies and AI to close the gaps in air quality data across the continent. Work with us to find data-driven solutions to your air quality challenges
					</p>
				</div>
				<div class="col-md-6 cwp17-text" style="padding-left: 50px;">
					<form method="POST" action="#">
						<div class="input-group">
							<input type="text" id="search-value" name="search" class="form-control" placeholder="Search your town, City, District..." required>
							<button class="btn btn-default " name="submit"> <i class="fa fa-search"></i> </button>
						</div>
					</form>
					<div style="position:relative; z-index: 999;">
						<div class="hide" id="search-results" style="position:absolute; overflow-x: hidden; height: 200px;"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<div class="w3l-index-block1">
     <div class="content py-0">
          <div class="container">
               <div class="row align-items-center py-md-0 py-0">
                    <div class="col-md-12 content-left pt-md-0 pt-0">
                        <div id="leafletmap" style="position: relative; width: 100%; height:650px; border:1px solid #999 !important; z-index:0; background-color: rgb(38, 38, 38);"></div>              
                    </div>
               </div>
               <div class="col-md-12 content-left pt-md-0 pt-5">
                    <p class="mt-3 mb-md-5 mb-4">
                        <b>AQI Key</b>
                    </p>
                    <div class="container">
                        <div class="row">
                            <div class="card col-md-2 text-center" style="background-color: #45e50d; color: #000;">
                                <img src="<?= base_url(); ?>assets/images/face_good.png" style="width: 20px;" /> Good (0-12)
                            </div>
                            <div class="card col-md-2 text-center" style="background-color: #f8fe28; color: #000;">
                                <img src="<?= base_url(); ?>assets/images/face_moderate.png" style="width: 20px;" /> Moderate (12.1 - 35.4)
                            </div>
                            <div class="card col-md-2 text-center" style="background-color: #ee8310; color: #fff;">
                                <img src="<?= base_url(); ?>assets/images/face_unhealthy.png" style="width: 20px;" /> Unhealthy for sensitive groups (35.6 - 55.4)
                            </div>
                            <div class="card col-md-2 text-center" style="background-color: #fe0000; color: #fff;">
                                <img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" style="width: 20px;" /> Unhealthy (55.5 - 150.4)
                            </div>
                            <div class="card col-md-2 text-center" style="background-color: #8639c0; color: #fff;">
                                <img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" style="width: 20px;" /> Very Unhealthy (150.5 - 250.4)
                            </div>
                            <div class="card col-md-2 text-center" style="background-color: #81202e; color: #fff;">
                                <img src="<?= base_url(); ?>assets/images/face_hazardous.png" style="width: 20px;" /> Hazardous (250.5 - 500.4)
                            </div>
                        </div>
                    </div>
                    <p class="mt-3 mb-md-5 mb-4">
                        <b>PM<sub>2.5</sub> - Particulate Matter</b>
                    </p>
                </div>
               <div class="clear"></div>
          </div>
     </div>
</div>

<!--<div class="w3l-index-block1">
     <div class="content py-5">
          <div class="container">
               <div class="row align-items-center py-md-5 py-3">
                    <div class="col-md-12 content-left pt-md-0 pt-5">
                        <p class="mt-3 mb-md-5 mb-4">
                            <b>AQI Key</b>
                        </p>
                        <div class="container">
                            <div class="row">
                                <div class="card col-md-2 text-center" style="background-color: #45e50d; color: #000;">
                                    <img src="<?= base_url(); ?>assets/images/face_good.png" style="width: 20px;" /> Good (0-12)
                                </div>
                                <div class="card col-md-2 text-center" style="background-color: #f8fe28; color: #000;">
                                    <img src="<?= base_url(); ?>assets/images/face_moderate.png" style="width: 20px;" /> Moderate (12.1 - 35.4)
                                </div>
                                <div class="card col-md-2 text-center" style="background-color: #ee8310; color: #fff;">
                                    <img src="<?= base_url(); ?>assets/images/face_unhealthy.png" style="width: 20px;" /> Unhealthy for sensitive groups (35.6 - 55.4)
                                </div>
                                <div class="card col-md-2 text-center" style="background-color: #fe0000; color: #fff;">
                                    <img src="<?= base_url(); ?>assets/images/face_unhealthy1.png" style="width: 20px;" /> Unhealthy (55.5 - 150.4)
                                </div>
                                <div class="card col-md-2 text-center" style="background-color: #8639c0; color: #fff;">
                                    <img src="<?= base_url(); ?>assets/images/face_vunhealthy.png" style="width: 20px;" /> Very Unhealthy (150.5 - 250.4)
                                </div>
                                <div class="card col-md-2 text-center" style="background-color: #81202e; color: #fff;">
                                    <img src="<?= base_url(); ?>assets/images/face_hazardous.png" style="width: 20px;" /> Hazardous (250.5 - 500.4)
                                </div>
                            </div>
                        </div>
                        <p class="mt-3 mb-md-5 mb-4">
                            <b>PM<sub>2.5</sub> - Particulate Matter</b>
                        </p>
                    </div>
               </div>
               <div class="clear"></div>
          </div>
     </div>
</div>-->

<div class="w3l-index-block1">
	<div class="content py-3">
		<div class="container">
			<div class="row align-items-center py-md-5 py-3">
				<div class="col-md-6 content-photo mt-md-5 mt-5">
					<img src="<?= base_url(); ?>assets/update/images/home-phone.png" width="600" class="img-fluid pull-right" alt="main image">
				</div>
				<div class="col-md-6 content-left pt-md-5 pt-5">
					<h1 style="color:#3067e2; font-family:'Raleway Bold'; font-size:3em; line-height: 2em;">Know your Air</h1>
					<p class="mt-3 mb-md-5 mb-4 text-justify" style="font-size:1.5em; line-height: normal;">
						The first step towards improving air quality
						is being able to monitor it, quantify prevailing 
						pollution levels while identifying sources, to inform 
						mitigation actions for individuals and policymakers.
					</p>
					<hr>
					<br>
					<h1 style="color:#3067e2; font-family:'Raleway Bold'; font-size:3em; line-height: 1em;">Know your Air in locations that matter to you</h1>
					<br>
					<br>
					<h2>Download the <span style="font-family:'Raleway SemiBold';">AirQo</span> App today.</h2>
					<br><br>
					<div class="row">
						<div class="col-md-6" style="padding: 15px;">
							<a href=<?= APPLE_APP_LINK; ?> target="_blank">
								<img src="<?= base_url(); ?>assets/images/download2.png" style="height: 100px; width: 100%" class="img-fluid">
							</a>
						</div>
						<div class="col-md-6" style="padding: 15px;">
							<a href=<?= ANDROID_APP_LINK; ?> target="_blank">
								<img src="<?= base_url(); ?>assets/images/download1.png" style="height: 100px; width: 100%" class="img-fluid">
							</a>
						</div>
					</div>
				</div>
				
			</div>
			<!-- <div class="clear"></div> -->
		</div>
	</div>
</div>


<section class="w3l-index-block1" style="background-color: #fff !important;">
	<div class="partners py-5">
		<div class="container py-lg-5">
			<div class="heading text-left">
				<h2 style="font-size: 2.5em;"><span style="font-family:'Raleway SemiBold';">AirQo</span> is supported by</h2>
			</div>
			<div class="row" style="padding-top: 3em; padding-bottom: 3em;">
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/makerere_logo.png" class="img-fluid" alt="">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/googleorg.png" class="img-fluid" alt="">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/embassy.png" class="img-fluid" alt="">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/epsrc.png" class="img-fluid">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/nfr.png" class="img-fluid">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/world-bank.png" class="img-fluid">
				</div>
				<div class="col-md-2">
					<img src="<?= base_url(); ?>assets/images/partners/wehubit.png" class="img-fluid">
				</div>
			</div>
		</div>
	</div>
</section>

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
		if (parseFloat(days) > 2) {
			return '#808080';
		}
		return color;
	}

	var grayNodeText = function(days, color) {
		if (parseFloat(days) > 2) {
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
		var map = L.map('leafletmap', {dragging: true}).setView([0.328015, 32.595011], 8);
		map.addControl(new L.Control.Fullscreen());
		if (L.Browser.mobile) {
			map.scrollWheelZoom.disable();
		}
		// map.scrollWheelZoom.disable();

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: ''
		}).addTo(map);

		$.ajax({
			type: 'POST',
			url: '<?= site_url("Apis/airqoPlacesCached"); ?>',
			data: {
				api: "<?= getenv('API_KEY'); ?>"
			},
			dataType: 'json',
			beforeSend: function() {

			},
			success: function(data) {
				var nodes = data.nodes;
				//  console.log(nodes);
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
								html: '<div style="background-color:' + grayNode(numberOfDays(nodes[i].time), '#00e400') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 10px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + '">Good</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 12.1 && nodes[i].field2 <= 35.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ffff00') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#000') + ';">Moderate</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 35.6 && nodes[i].field2 <= 55.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ff7e00') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">Unhealthy for Sensitive Groups</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 55.5 && nodes[i].field2 <= 150.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#ff0000') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">Unhealthy</td>' +
								'</tr>' +
								'</table>');

						}).addTo(map);
					} else if (nodes[i].field2 >= 150.5 && nodes[i].field2 <= 250.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#8f3f97') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">Very Unhealthy</td>' +
								'</tr>' +
								'</table>');
						}).addTo(map);
					} else if (nodes[i].field2 >= 250.5 && nodes[i].field2 <= 500.4) {
						var marker = L.marker([nodes[i].lat, nodes[i].lng], {
							icon: new L.DivIcon({
								className: 'custom-airqo-icon',
								html: '<div style="background-color: ' + grayNode(numberOfDays(nodes[i].time), '#7e0023') + ' !important;" class="marker-pin"></div><span class="marker-number" style="color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';"><b>' + Math.round(nodes[i].field2) + '</b></span>',
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
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">' + nodes[i].field2 + '<br/>PM<sub>2.5</sub></td>' +
								'<td style="padding:10px 0px 10px 0px; color: ' + grayNodeText(numberOfDays(nodes[i].time), '#fff') + ';">Harzadous</td>' +
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