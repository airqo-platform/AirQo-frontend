import 'dart:async';
import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';


class MapPage extends StatefulWidget {
  @override
  State<MapPage> createState() => MapPageState();
}

class MapPageState extends State<MapPage> {

  bool _showInfoWindow = false;
  final Map<String, Marker> _markers = {};
  var windowProperties;
  var dbHelper = DBHelper();


  late BitmapDescriptor markerIcon;
  final Map<String, BitmapDescriptor> _markerIcons = {};
  List<String> markerColors = ['good', 'moderate', 'sensitive', 'unhealthy',
    'very unhealthy', 'hazardous'];


  @override
  void initState() {
    _showInfoWindow = false;
    super.initState();
    // setCustomMarkers();
  }

  void setCustomMarkers() async {

    for(var i = 0; i < markerColors.length; i++){

      var color = markerColors[i];

      // var markerIcon = await BitmapDescriptor.fromAssetImage(
      //     const ImageConfiguration(size: Size(3, 3)),
      //     'assets/images/happy_face.png');

      var markerIcon = BitmapDescriptor.defaultMarker;

      switch(color) {
        case 'good':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
          break;

        case 'moderate':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
        break;

        case 'sensitive':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
          break;

        case 'unhealthy':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
          break;

        case 'very unhealthy':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(285);
          break;

        case 'hazardous':
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueMagenta);
          break;

        default:
          markerIcon = BitmapDescriptor.defaultMarker;
          break;
      }

      _markerIcons[color] = markerIcon;

    }

  }

  void setWindow(Measurement measurement){
    setState(() {
      _showInfoWindow = true;
      windowProperties = measurement;
    });
  }


  Future<void> _onMapCreated(GoogleMapController controller) async {

    await _getMeasurements();

  }

  Future<void> _getMeasurements() async {

    await localFetch();

    var measurements = <Measurement>[];

    try {

      measurements = await getMeasurements();
    }
    on SocketException {
      var message = 'You are working offline, please connect to internet';
      await showSnackBar(context, message);
    }
    on TimeoutException {
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);

    } on Error catch (e) {
      print('Get Latest events error: $e');
    }

    if (measurements.isNotEmpty){
      setMeasurements(measurements);
      await dbHelper.insertLatestMeasurements(measurements);
    }

  }

  Future<void> _refreshMeasurements() async {

    try {

      var measurements = await getMeasurements();

      if (measurements.isNotEmpty){
        setMeasurements(measurements);

        var message = 'Update Complete';
        await showSnackBar(context, message);

        await dbHelper.insertLatestMeasurements(measurements);

      }

    }
    on SocketException {
      var message = 'You are working offline, please connect to internet';
      await showSnackBar(context, message);
    }
    on TimeoutException {
      var message = 'Connection timeout, please check your internet connection';
      await showSnackBar(context, message);

    } on Error catch (e) {
      print('Update Latest events error: $e');
    }


  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body:
      Stack(
        children: [
          GoogleMap(
            compassEnabled: false,
            onMapCreated: _onMapCreated,
            mapType: MapType.normal,
            myLocationButtonEnabled: false,
            myLocationEnabled: false,
            rotateGesturesEnabled: false,
            tiltGesturesEnabled: false,
            mapToolbarEnabled: false,
            initialCameraPosition: const CameraPosition(
              target: LatLng(0.3318118, 32.5694503),
              zoom: 2,
            ),
            markers: _markers.values.toSet(),
            onTap: (_){
              _showInfoWindow = false;
            },
          ),

          Positioned(
            top: 30,
              child:
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_outlined,
                        color: Color(0xff5f1ee8)
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  ),
                  Visibility (
                    visible: _showInfoWindow,
                    child:
                    windowProperties != null ?

                    infoWindow() :

                    Card(
                        child:
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            children: [
                              Center(
                                child: Text(appName, softWrap: true),
                              ),
                            ],
                          ),
                        )
                    ),

                  ),
                ],
              )
          ),

          Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child:
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  IconButton(
                    iconSize: 30.0,
                    icon: const Icon(
                        Icons.refresh_outlined,
                        color: Color(0xff5f1ee8)
                    ),
                    onPressed: _refreshMeasurements,
                  ),
                ],
              )
          ),
        ],
      )
    );
  }

  Future<void> localFetch() async {

    var measurements = await dbHelper.getLatestMeasurements();

    if(measurements.isNotEmpty){
      setMeasurements(measurements);
    }

  }

  void setMeasurements(List<Measurement> measurements) {

    setState(() {
      _showInfoWindow = false;
      _markers.clear();
      for (final measurement in measurements) {

        var bitmapDescriptor;

        var pm2_5  = measurement.pm2_5.value;

        if(pm2_5 >= 0 && pm2_5 <= 50){ //good
          bitmapDescriptor = BitmapDescriptor
              .defaultMarkerWithHue(BitmapDescriptor.hueGreen);
        }
        else if(pm2_5 >= 51 && pm2_5 <= 100){ //moderate
          bitmapDescriptor = BitmapDescriptor
              .defaultMarkerWithHue(BitmapDescriptor.hueYellow);
        }
        else if(pm2_5 >= 101 && pm2_5 <= 150){ //sensitive
          bitmapDescriptor = BitmapDescriptor
              .defaultMarkerWithHue(BitmapDescriptor.hueOrange);
        }
        else if(pm2_5 >= 151 && pm2_5 <= 200){ // unhealthy
          bitmapDescriptor = BitmapDescriptor
              .defaultMarkerWithHue(BitmapDescriptor.hueRed);
        }
        else if(pm2_5 >= 201 && pm2_5 <= 300){ // very unhealthy
          bitmapDescriptor = BitmapDescriptor.defaultMarkerWithHue(285);
        }
        else if(pm2_5 >= 301){ // hazardous
          bitmapDescriptor = BitmapDescriptor
              .defaultMarkerWithHue(BitmapDescriptor.hueMagenta);
        }
        else{
          bitmapDescriptor = BitmapDescriptor.defaultMarker;
        }

        final marker = Marker(
          markerId: MarkerId(measurement.channelID.toString()),
          icon: bitmapDescriptor,
          position: LatLng((measurement.location.latitude.value),
              measurement.location.longitude.value),
          infoWindow: InfoWindow(
            title: measurement.channelID.toString(),
            // snippet: node.location,
          ),
          onTap: (){
            setWindow(measurement);
          },
        );
        _markers[measurement.channelID.toString()] = marker;
      }
    });

  }

  Widget infoWindow(){
    return Card(
        child:
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              const Center(
                child: Text(appName, softWrap: true),
              ),
              Center(
                child: Text(windowProperties.pm2_5.value.toString(), softWrap: true),
              )
            ],
          ),
        )
    );
  }
}
