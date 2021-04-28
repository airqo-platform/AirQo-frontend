import 'dart:async';

import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import 'package:flutter/services.dart';

class MapPage extends StatefulWidget {
  @override
  State<MapPage> createState() => MapPageState();
}

class MapPageState extends State<MapPage> {

  bool _isVisible = false;
  final Map<String, Marker> _markers = {};
  String windowProperties = '';

  late BitmapDescriptor markerIcon;
  final Map<String, BitmapDescriptor> _markerIcons = {};
  List<String> markerColors = ['good', 'moderate', 'sensitive', 'unhealthy',
    'very unhealthy', 'hazardous'];


  @override
  void initState() {
    super.initState();
    setCustomMarkers();
  }

  void setCustomMarkers() async {

    for(var i = 0; i < markerColors.length; i++){

      String color = markerColors[i];

      // var markerIcon = await BitmapDescriptor.fromAssetImage(
      //     const ImageConfiguration(size: Size(3, 3)),
      //     'assets/images/happy_face.png');

      var markerIcon = BitmapDescriptor
          .defaultMarkerWithHue(BitmapDescriptor.hueGreen);

      switch(color) {
        case "good":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
          break;

        case "moderate":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
        break;

        case "sensitive":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
          break;

        case "unhealthy":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
          break;

        case "very unhealthy":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(285);
          break;

        case "hazardous":
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(285);
          break;

        default:
          markerIcon = BitmapDescriptor.defaultMarkerWithHue(0);
          break;
      }

      _markerIcons[color] = markerIcon;

    }

  }

  void setWindow(String windowProperty){
    if( windowProperty.isNotEmpty){

      setState(() {
        _isVisible = true;
        windowProperties = windowProperty;
      });
    }

    else{
      setState(() {
        _isVisible = false;
        windowProperties = '';
      });
    }

  }


  Future<void> _onMapCreated(GoogleMapController controller) async {
    final measurements = await getMeasurements();

    setState(() {
      _markers.clear();
      for (final measurement in measurements) {

        var bitmapDescriptor = _markerIcons['sensitive']!;

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

            setWindow(measurement.channelID.toString());
          },
        );
        _markers[measurement.channelID.toString()] = marker;
      }
    });

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
              setWindow('');
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
                    visible: _isVisible,
                    child: Card(
                      child:
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            children: [
                              new Center(
                                child: new Text('Hello world', softWrap: true),
                              ),
                              new Center(
                                child: new Text(windowProperties, softWrap: true),
                              )
                            ],
                          ),
                        )
                    ),
                  ),
                ],
              )
          ),
        ],
      )
    );
  }
}
