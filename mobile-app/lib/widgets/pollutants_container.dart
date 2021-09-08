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
                if (measurement.getPm2_5Value() != null)
                  PollutantCard('PM 2.5', measurement.getPm2_5Value(),
                      '${PollutantConstants.pm2_5}'),
                const Spacer(
                  flex: 1,
                ),
                if (measurement.getPm10Value() != null)
                  PollutantCard('PM 10', measurement.getPm10Value(),
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
