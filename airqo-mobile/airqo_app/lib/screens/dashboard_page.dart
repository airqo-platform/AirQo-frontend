import 'package:airqo_app/widgets/air_quality.dart';
import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(

      child: ListView(
        children: <Widget>[
          AirQualityCard(),
          AirQualityCard(),
          AirQualityCard(),
          AirQualityCard(),
          AirQualityCard(),
          AirQualityCard(),
        ],
      ),
    );
  }
}
