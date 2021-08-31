import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutantCard.dart';
import 'package:flutter/material.dart';

class PollutantsContainer extends StatelessWidget {
  final Measurement measurement;

  PollutantsContainer(this.measurement);

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
        color: Colors.white54,
        child: Padding(
          padding: const EdgeInsets.all(5.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text(
                'Pollutants',
                // CustomLocalizations.of(context)!.title,
                softWrap: true,
                style: TextStyle(
                    fontSize: 17,
                    color: ColorConstants().appColor,
                    fontWeight: FontWeight.bold),
              ),
              Padding(
                padding: const EdgeInsets.all(5.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    if (measurement.getPm2_5Value() != null)
                      PollutantsCard('PM 2.5', measurement.getPm2_5Value(),
                          '${PollutantConstants.pm2_5}'),
                    if (measurement.getPm10Value() != null)
                      PollutantsCard('PM 10', measurement.getPm10Value(),
                          '${PollutantConstants.pm10}'),
                  ],
                ),
              )
            ],
          ),
        ));
  }
}
