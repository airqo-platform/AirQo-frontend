import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutantCard.dart';
import 'package:flutter/material.dart';

class PollutantCard extends StatelessWidget {
  PollutantCard(this.measurement);

  final Measurement measurement;

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Padding(
      padding: const EdgeInsets.all(5.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
            'Location Readings',
            // CustomLocalizations.of(context)!.title,
            softWrap: true,
            style: TextStyle(
                fontSize: 20,
                color: ColorConstants().appColor,
                fontWeight: FontWeight.bold),
          ),
          Padding(
            padding: const EdgeInsets.all(5.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(
                  flex: 1,
                ),
                if (measurement.pm2_5.calibratedValue != null)
                  PollutantsCard2('PM 2.5', measurement.pm2_5.calibratedValue,
                      '${PollutantConstants.pm2_5}'),
                const Spacer(
                  flex: 1,
                ),
                if (measurement.pm10.calibratedValue != null)
                  PollutantsCard2('PM 10', measurement.pm10.value,
                      '${PollutantConstants.pm10}'),
                const Spacer(
                  flex: 1,
                ),
              ],
            ),
          )
        ],
      ),
    ));
  }
}
