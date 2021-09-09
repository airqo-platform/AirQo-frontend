import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/pollutant_card.dart';
import 'package:flutter/material.dart';

class PollutantsSection extends StatelessWidget {
  final Measurement measurement;

  PollutantsSection(this.measurement);

  Widget builds(BuildContext context) {
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
                color: ColorConstants.appColor,
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
                if (measurement.getPm2_5Value() != 0.1)
                  PollutantCard('PM 2.5', measurement.getPm2_5Value(),
                      '${PollutantConstant.pm2_5}', ''),
                const Spacer(
                  flex: 1,
                ),
                if (measurement.getPm10Value() != 0.1)
                  PollutantCard('PM 10', measurement.getPm10Value(),
                      '${PollutantConstant.pm10}', ''),
                const Spacer(
                  flex: 1,
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(5.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(
                  flex: 1,
                ),
                if (measurement.humidity.value != 0.1)
                  PollutantCard('Humidity', measurement.humidity.value ,
                      '${PollutantConstant.humidity}', 'Tahmo'),
                const Spacer(
                  flex: 1,
                ),
                if (measurement.temperature.value != 0.1)
                  PollutantCard('Temperature', measurement.temperature.value,
                      '${PollutantConstant.temperature}', 'Tahmo'),
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
                softWrap: true,
                style: TextStyle(
                    fontSize: 20,
                    color: ColorConstants.appColor,
                    fontWeight: FontWeight.bold),
              ),
              SizedBox(
                height: 120.0,
                child: ListView(
                  physics: const ClampingScrollPhysics(),
                  shrinkWrap: true,
                  scrollDirection: Axis.horizontal,
                  children: [

                    if (measurement.getPm2_5Value() != 0.1)
                      PollutantCard('PM 2.5', measurement.getPm2_5Value(),
                          '${PollutantConstant.pm2_5}', ''),

                    if (measurement.humidity.value != 0.1)
                      PollutantCard('Humidity', measurement.humidity.value ,
                          '${PollutantConstant.humidity}', 'Tahmo'),

                    if (measurement.getPm10Value() != 0.1)
                      PollutantCard('PM 10', measurement.getPm10Value(),
                          '${PollutantConstant.pm10}', ''),

                    if (measurement.temperature.value != 0.1)
                      PollutantCard('Temperature',
                          measurement.temperature.value,
                          '${PollutantConstant.temperature}', 'Tahmo'),

                  ],
                ),
              ),
            ],
          ),
        ));

  }
}
