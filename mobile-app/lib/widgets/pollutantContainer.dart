import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutantCard.dart';
import 'package:flutter/material.dart';

class PollutantsContainer extends StatelessWidget {
  PollutantsContainer(this.measurement);

  final Measurement measurement;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
        color: Colors.white54,
        child: Padding(
          padding: const EdgeInsets.all(5.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              const Text(
                'Pollutants',
                // CustomLocalizations.of(context)!.title,
                softWrap: true,
                style: TextStyle(
                    fontSize: 17, color: appColor, fontWeight: FontWeight.bold),
              ),
              Padding(
                padding: const EdgeInsets.all(5.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    if (measurement.pm2_5.calibratedValue != null)
                      PollutantsCard('PM 2.5', measurement.pm2_5.calibratedValue,
                          '${PollutantConstants.pm2_5}'),
                    if (measurement.pm10.calibratedValue != null)
                      PollutantsCard('PM 10', measurement.pm10.calibratedValue,
                          '${PollutantConstants.pm10}'),
                  ],
                ),
              )
            ],
          ),
        ));
  }
}
