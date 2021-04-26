import 'package:app/widgets/location_chart.dart';
import 'package:flutter/material.dart';
import 'package:share/share.dart';

class PlaceDetailsPage extends StatefulWidget {
  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState();
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AirQo'),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.share_outlined,
            ),
            onPressed: () {
              Share.share('https://airqo.net', subject: 'Makerere!');
            },
          ),
          IconButton(
            icon: const Icon(
              Icons.info_outline_rounded,
            ),
            onPressed: () {

            },
          ),
        ],
      ),
      body: Container(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(0, 4, 0, 0),
          child: ListView(
            children: <Widget>[
              LocationBarChart(),

            ],
          ),
        ),
      ),
    );
  }

}
