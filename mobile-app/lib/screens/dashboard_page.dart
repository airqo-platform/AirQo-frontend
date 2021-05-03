import 'package:app/widgets/air_quality_nav.dart';
import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(6, 6, 6, 6),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: <Widget>[
            AirQualityCard(),
            AirQualityCard(),
            AirQualityCard(),
            AirQualityCard(),
            AirQualityCard(),
            AirQualityCard(),
          ],
        ),
      ),
    );
  }
}
