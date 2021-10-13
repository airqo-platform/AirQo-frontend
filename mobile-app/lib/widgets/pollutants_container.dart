import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutant_card.dart';
import 'package:flutter/material.dart';

class PollutantsSection extends StatelessWidget {
  final Measurement measurement;

  PollutantsSection(this.measurement);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Text(
          'Pollutants',
          softWrap: true,
          style: TextStyle(
              fontSize: 20,
              color: ColorConstants.appColor,
              fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10.0),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            if (measurement.getPm2_5Value() != -0.10)
              PollutantCard('PM2.5', measurement.getPm2_5Value(),
                  '${PollutantConstant.pm2_5}', ''),
            if (measurement.getPm10Value() != -0.10)
              PollutantCard('PM10', measurement.getPm10Value(),
                  '${PollutantConstant.pm10}', ''),
          ],
        ),
      ],
    ));
  }
}
