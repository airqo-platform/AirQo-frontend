import 'package:app/constants/app_constants.dart';
import 'package:app/models/device.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/date.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/widgets/aqi_index.dart';
import 'package:app/widgets/expanding_action_button.dart';
import 'package:app/widgets/location_chart.dart';
import 'package:flutter/material.dart';
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
  String response = 'Getting location data, please wait';
  var dbHelper = DBHelper();


  @override
  void initState() {
    getDetails();
    super.initState();

  }


  Future<void> checkFavourite() async {

    if(locationData != null){
      var isFav = await DBHelper().checkFavouritePlace(locationData.channelID);

      setState(() {
        isFavourite = isFav;

      });
    }

  }

  Future<void> updateFavouritePlace() async {

    var place;
      if(isFavourite){
        place = await DBHelper().updateFavouritePlace(locationData, false);
      }
      else{
        place = await DBHelper().updateFavouritePlace(locationData, true);
      }

      setState(() {
        locationData = place;
        isFavourite = locationData.favourite;
      });

      if(isFavourite){
        await showSnackBar(context,
            '${locationData.address} has been added to your favourite places');
      }
      else{
        await showSnackBar(context,
            '${locationData.address} has been removed from favourite places');
      }


  }

  Future<void> getDetails() async {

    try{

      var measurement =
      await AirqoApiClient(context)
          .fetchDeviceMeasurements(widget.device.channelID);

      measurement.setAddress(widget.device.siteName);
      measurement.setStatus(pmToString(measurement.pm2_5.value));
      measurement.setChannelId(widget.device.channelID);

      setState(() {
        locationData = measurement;
      });

      if(locationData != null){
        await checkFavourite();
      }

    }
    on Error catch (e) {
      print('Getting device events error: $e');

      var message = 'Sorry, information is not available';
      await showSnackBar(context, message);

      setState(() {
        response = message;
      });

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

            Padding(
              padding: const EdgeInsets.fromLTRB(8.0, 15.0, 8.0, 8.0),
              child: Center(child: Text(

                  widget.device.siteName,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 16,
                      color: appColor,
                      fontWeight: FontWeight.bold,
                  )
              ),) ,
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Center(child: Text(
                  dateToString(locationData.time),
                  style: const TextStyle(
                    color: appColor,
                    fontWeight: FontWeight.w300,
                    fontStyle: FontStyle.italic,
                  )
              ),) ,
            ),
            SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Container(
                  width: 500,
                  height: 200,
                  padding: const EdgeInsets.all(8),
                  child:  LocationBarChart(),
                )
            )
            // LocationBarChart(),
          ],
        ),
      ) : Center(child: Text(response),),
      floatingActionButton: locationData != null ? ExpandableFab(
        distance: 112.0,
        children: [
          ActionButton(
            onPressed: () {
              // setState(() {
              //   isFavourite = !isFavourite;
              // });

              updateFavouritePlace();
            },
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
              Share.share('https://airqo.net', subject: 'Makerere!');
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

