import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/location_chart.dart';
import 'package:app/widgets/pollutantCard.dart';
import 'package:app/widgets/pollutantContainer.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:share/share.dart';
import 'package:flutter/foundation.dart';

class PlaceDetailsPage extends StatefulWidget {

  PlaceDetailsPage({Key? key, required this.device}) : super(key: key);

  final Device device;

  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState();
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {

  bool isFavourite = false;
  var locationData;
  var response;
  var dbHelper = DBHelper();


  @override
  void initState() {
    getDetails();
    super.initState();

  }


  Future<void> checkFavourite() async {

    if(locationData != null){
      var isFav = await DBHelper().checkFavouritePlace(locationData.locationDetails.channelID);

      setState(() {
        isFavourite = isFav;

      });
    }

  }

  Future<void> updatePlace() async {

    if(isFavourite){
      await DBHelper().updateFavouritePlace(locationData.locationDetails, true);
    }

  }

  Future<void> updateFavouritePlace() async {

    var place;
      if(isFavourite){
        place = await DBHelper().updateFavouritePlace(locationData.locationDetails, false);
      }
      else{
        place = await DBHelper().updateFavouritePlace(locationData.locationDetails, true);
      }

      setState(() {
        locationData.locationDetails = place;
        isFavourite = locationData.locationDetails.favourite;
      });

      if(isFavourite){
        await showSnackBar2(context,
            '${locationData.locationDetails.siteName} has been added to your favourite places');
      }
      else{
        await showSnackBar2(context,
            '${locationData.locationDetails.siteName} has been removed from favourite places');
      }
  }

  Future<void> getDetails() async {

    await localFetch();

    try{

      var measurement =
      await AirqoApiClient(context)
          .fetchDeviceMeasurements(widget.device);

      setState(() {
        locationData = measurement;
      });

      if(locationData != null){
        await checkFavourite();
        await updatePlace();
      }

    }
    catch (e) {
      print('Getting device events error: $e');

      var message = 'Sorry, information is not available';
      // await showSnackBar(context, message);

      setState(() {
        response = message;
      });

    }
  }

  Future<void> localFetch() async {

    try{

      var measurements =
      await DBHelper().getMeasurement(widget.device.channelID);

      if(measurements != null){

        setState(() {
          locationData = measurements;
        });

        if(locationData != null){
          await checkFavourite();
        }
      }



    }
    on Error catch (e) {
      print('Getting device events locally error: $e');

    }
  }

  void updateView(Measurement measurement){

    setState(() {
      locationData = measurement;
    });

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(appName),
        // actions: [
        //   IconButton(
        //     icon: const Icon(
        //       Icons.share_outlined,
        //     ),
        //     onPressed: () {
        //       Share.share('https://airqo.net', subject: 'Makerere!');
        //     },
        //   ),
        //   IconButton(
        //     icon: const Icon(
        //       Icons.info_outline_rounded,
        //     ),
        //     onPressed: () {
        //       Navigator.push(
        //         context,
        //         MaterialPageRoute<void>(
        //           builder: (BuildContext context) => AQI_Dialog(),
        //           fullscreenDialog: true,
        //         ),
        //       );
        //     },
        //   ),
        // ],
      ),
      body: locationData != null ? Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(pmToImage(locationData.pm2_5.value)),
            fit: BoxFit.cover,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
          children: <Widget>[
            // FutureBuilder(
            //   future: apiClient.fetchHourlyMeasurements(''),
            //   builder: (context, snapshot) {
            //     if (snapshot.hasError){
            //       return Container(
            //         padding: const EdgeInsets.all(16.0),
            //         child: Text('${snapshot.error.toString()}')
            //       );
            //     }
            //     print(snapshot.data);
            //     var results = snapshot.data as  List<Hourly>;
            //
            //     var pm2_5ChartData = createPm2_5ChartData(results);
            //     return PM2_5BarChart(pm2_5ChartData);
            //     },
            // ),

            // Name
            Padding(
              padding: const EdgeInsets.fromLTRB(8.0, 20.0, 8.0, 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [

                  Expanded(
                    child: GestureDetector(
                      onTap: (){
                        print('editing');
                      },
                      child: RichText(
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        text: TextSpan(
                          style: const TextStyle(
                            fontSize: 20 ,
                            color: appColor,
                            fontWeight: FontWeight.bold,
                          ),
                          text: '${widget.device.siteName} ',
                          children: <TextSpan>[
                            TextSpan(
                              text: String.fromCharCode(0xe169),
                              style: const TextStyle(
                                fontSize: 15,
                                fontFamily: 'MaterialIcons',
                                color: appColor,
                              ),
                            )
                          ],
                        ),
                      ),
                    )
                  ),
                ],
              ),
            ),

            // card section
            Padding(
              padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
              child: cardSection(locationData),
            ),

            // Pollutants
            // Padding(
            //   padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
            //   child: PollutantsContainer(locationData),
            // ),

            PollutantsContainer(locationData),

            // SingleChildScrollView(
            //     scrollDirection: Axis.horizontal,
            //     child: Container(
            //       width: 500,
            //       height: 200,
            //       padding: const EdgeInsets.all(8),
            //       child:  LocationBarChart(),
            //     )
            // ),

            // Historical Data
            FutureBuilder(
                future: AirqoApiClient(context)
                    .fetchMeasurementsByDate(DateFormat('yyyy-MM-dd')
                    .format(DateTime.now()), widget.device.name),
                builder: (context, snapshot) {

                  if (snapshot.hasData){

                    var results = snapshot.data as List<Measurement>;

                    if(results.isEmpty){
                      return Center(
                        child: Container(
                          padding: const EdgeInsets.all(16.0),
                          child: const Text('Sorry, data for last 24 hours is not available...',
                            softWrap: true,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      );

                    }

                    var formattedData = createChartData(results);

                    return  SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Container(
                          width: 500,
                          height: 200,
                          padding: const EdgeInsets.all(8),
                          child:  LocationBarChart(formattedData),
                        )
                    );

                    // return LocationBarChart(formattedData);
                  }

                  else{
                    return Center( child: Container(
                      padding: const EdgeInsets.all(16.0),
                      child: const CircularProgressIndicator(),
                    ));
                  }
                }),

            // Map
            Container(
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 50),
                constraints:  const BoxConstraints.expand(height: 300.0),
                child: mapSection(locationData)
            ),


            // LocationBarChart(),
          ],
        ),

      )
          :
      response != null ? Center(child: Text(response),)
          : const Center(child: CircularProgressIndicator(),),
      floatingActionButton: locationData != null ? ExpandableFab(
        distance: 112.0,
        children: [
          ActionButton(
            onPressed: updateFavouritePlace,
            icon: isFavourite ?
            const Icon(
              Icons.favorite,
              color: Colors.red,
            )
            :
            const Icon(
              Icons.favorite_border_outlined,
            ) ,
          ),
          ActionButton(
            onPressed: () {
              Share.share('Checkout the air quality of '
                  '${locationData.locationDetails.siteName} '
                  'at https://www.airqo.net',
                  subject: 'Airqo, ${locationData.locationDetails.siteName}!');
            },
            icon: const Icon(Icons.share_outlined),
          ),
          ActionButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute<void>(
                  builder: (BuildContext context) => AQI_Dialog(),
                  fullscreenDialog: true,
                ),
              );
            },
            icon: const Icon(Icons.info_outline_rounded),
          ),
        ],
      ) : null,
    );
  }

  Widget mapSection(Measurement measurement) {

    final _markers = <String, Marker>{};

    final marker = Marker(
      markerId: MarkerId(measurement.channelID.toString()),
      icon: pmToMarkerPoint(measurement.pm2_5.value),
      position: LatLng((measurement.locationDetails.latitude),
          measurement.locationDetails.longitude),
    );
    _markers[measurement.channelID.toString()] = marker;

    return
      Padding(
          padding: const EdgeInsets.all(8.0),
          child :
          Card(
              child: GoogleMap(
                compassEnabled: false,
                mapType: MapType.normal,
                myLocationButtonEnabled: false,
                myLocationEnabled: false,
                rotateGesturesEnabled: false,
                tiltGesturesEnabled: false,
                mapToolbarEnabled: false,
                initialCameraPosition: CameraPosition(
                  target: LatLng(measurement.locationDetails.latitude,
                      measurement.locationDetails.longitude),
                  zoom: 13,
                ),
                markers: _markers.values.toSet(),
      )
    ));
  }

  Widget cardSection(Measurement measurement) {

    return Padding(padding: const EdgeInsets.all(8.0),
        child : Card(
            child:
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [

                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
                    child: Container(
                        padding: const EdgeInsets.all(5.0),
                        decoration: BoxDecoration(
                            color: pmToColor(measurement.pm2_5.value),
                            border: Border.all(
                              color:  pmToColor(measurement.pm2_5.value),
                            ),
                            borderRadius: const BorderRadius.all(Radius.circular(10))
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(0, 5, 0, 5),
                              child: Image.asset(pmToEmoji(measurement.pm2_5.value),
                                height: 40,
                                width: 40,
                              ),
                            ),

                            Text(
                              measurement.pm2_5.value.toString(),
                              style: const TextStyle(
                                color: Colors.black54,
                                fontWeight: FontWeight.bold,
                                fontSize: 20,

                              ),
                            ),
                            Text( pmToString(measurement.pm2_5.value),
                            ),
                          ],
                        )
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.fromLTRB(0, 5, 0, 0),
                    child: Text(
                        'Last updated : ${dateToString(locationData.time)}',

                        style: const TextStyle(
                          fontSize: 11,
                          color: appColor,
                          fontWeight: FontWeight.w300,
                          fontStyle: FontStyle.italic,
                        )
                    ),
                  ),


                ],
              ),
            )

    ));
  }

  Widget airqoLogo() {
    return Center( child : Image.asset(
      'assets/icon/airqo_logo.png',
      height: 50,
      width: 50,
    ));
  }


  Widget headerSection(String image, String body) {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Image.asset(
              image,
              height: 40,
              width: 40,
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Text(body,
                  softWrap: true,
                  style: const TextStyle(
                    height: 1.2,
                    // letterSpacing: 1.0
                  )),
            ),
          )
        ],
      ),
    );
  }

}





