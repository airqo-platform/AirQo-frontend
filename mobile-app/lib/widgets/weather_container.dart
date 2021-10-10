import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class WeatherSection extends StatelessWidget {
  final Measurement measurement;

  WeatherSection(this.measurement);

  @override
  Widget build(BuildContext context) {
    return Card(
        elevation: 5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        child: Container(
          padding: const EdgeInsets.all(5),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text(
                'Weather Data',
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
                  if (measurement.temperature.value != -0.10)
                    Column(
                      children: [
                        FaIcon(
                          FontAwesomeIcons.temperatureHigh,
                          color: ColorConstants.appColor,
                        ),
                        const Text('TEMPERATURE'),
                        Text(
                          '${measurement.temperature.value}\u2103',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        )
                      ],
                    ),
                  if (measurement.humidity.value != -0.10)
                    Column(
                      children: [
                        FaIcon(
                          FontAwesomeIcons.water,
                          color: ColorConstants.appColor,
                        ),
                        const Text('HUMIDITY'),
                        Text(
                          '${measurement.getHumidityValue()}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        )
                      ],
                    ),
                ],
              ),
            ],
          ),
        ));
  }
}
