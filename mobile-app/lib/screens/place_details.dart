import 'package:flutter/material.dart';

class PlaceDetailsPage extends StatefulWidget {
  @override
  _PlaceDetailsPageState createState() => _PlaceDetailsPageState();
}

class _PlaceDetailsPageState extends State<PlaceDetailsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Airqo'),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.share_outlined,
            ),
            onPressed: () {

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

      ),
    );
  }

}
