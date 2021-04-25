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

  @override
  void initState() {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent
    ));
    super.initState();
  }

  final Map<String, Marker> _markers = {};

  Future<void> _onMapCreated(GoogleMapController controller) async {
    final nodes = await getNodes();

    setState(() {
      _markers.clear();
      for (final node in nodes.nodes) {
        final marker = Marker(
          markerId: MarkerId(node.channel_id),
          position: LatLng((double.tryParse(node.lat) ?? 0.3318118),
              double.tryParse(node.lng) ?? 32.5694503),
          infoWindow: InfoWindow(
            title: node.name,
            snippet: node.location,
          ),
        );
        _markers[node.name] = marker;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: GoogleMap(
        compassEnabled: false,
        onMapCreated: _onMapCreated,
        initialCameraPosition: const CameraPosition(
          target: LatLng(0.3318118, 32.5694503),
          zoom: 2,
        ),
        markers: _markers.values.toSet(),
      ),
    );
    // return GoogleMap(
    //   compassEnabled: false,
    //   onMapCreated: _onMapCreated,
    //   initialCameraPosition: const CameraPosition(
    //     target: LatLng(0.3318118, 32.5694503),
    //     zoom: 2,
    //   ),
    //   markers: _markers.values.toSet(),
    // );
  }
}
