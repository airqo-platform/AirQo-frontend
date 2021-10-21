import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutant_card.dart';
import 'package:flutter/material.dart';

class PollutantsSection extends StatelessWidget {
  final Measurement measurement;
  final String heading;

  PollutantsSection(this.measurement, this.heading);

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Text(
          heading,
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
              PollutantCard('2.5', measurement.getPm2_5Value(),
                  '${PollutantConstant.pm2_5}', ''),
            if (measurement.getPm10Value() != -0.10)
              PollutantCard('10', measurement.getPm10Value(),
                  '${PollutantConstant.pm10}', ''),
          ],
        ),
      ],
    ));
  }
}
