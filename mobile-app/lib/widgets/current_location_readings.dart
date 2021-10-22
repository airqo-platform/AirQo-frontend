import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/pollutants_container.dart';
import 'package:app/widgets/weather_container.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'forecast_chart.dart';
import 'health_recommendation.dart';
import 'measurements_chart.dart';

class CurrentLocationCard extends StatelessWidget {
  final Measurement measurementData;

  final List<HistoricalMeasurement> historicalData;
  final List<Predict> forecastData;

  CurrentLocationCard(
      {Key? key,
      required this.measurementData,
      required this.historicalData,
      required this.forecastData})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(0),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 10, right: 10),
            child: Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              elevation: 10,
              child: Padding(
                padding: const EdgeInsets.all(5.0),
                child: titleSection(context),
              ),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 10, right: 10),
            child: PollutantsSection(measurementData),
          ),
          const SizedBox(
            height: 10,
          ),
          HealthRecommendationSection(
            measurement: measurementData,
          ),
          const SizedBox(
            height: 10,
          ),
          if (measurementData.hasWeatherData())
            Padding(
              padding: const EdgeInsets.only(left: 10, right: 10),
              child: WeatherSection(
                measurementData,
              ),
            ),
          const SizedBox(
            height: 10,
          ),
          if (historicalData.isNotEmpty) historySection(),
          if (forecastData.isNotEmpty) forecastSection(),
          SizedBox(
            height: 300.0,
            child: Padding(
              padding: const EdgeInsets.only(left: 10, right: 10),
              child: mapSection(measurementData),
            ),
          ),
        ],
      ),
    );
  }

  Widget footerSection(context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          GestureDetector(
            onTap: () {
              viewDetails(context, measurementData);
            },
            child: Text(
                'Last updated: ${dateToString(measurementData.time, true)}',
                style: TextStyle(
                  color: ColorConstants.appColor,
                  fontSize: 12,
                )),
          ),
          const Spacer(),
          TextButton(
            onPressed: () {
              shareMeasurement(measurementData);
            },
            child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(5),
                ),
                color: Colors.white,
                child: Padding(
                    padding: const EdgeInsets.all(5),
                    child: Icon(
                      Icons.share_outlined,
                      color: ColorConstants.appColor,
                    ))),
          ),
        ],
      ),
    );
  }

  Widget forecastSection() {
    var data = forecastChartData(forecastData);
    return ForecastBarChart(data, 'Forecast');
  }

  Widget historySection() {
    return MeasurementsBarChart(historicalData, 'History');
  }

  Widget titleSection(context) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            viewDetails(context, measurementData);
          },
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        color: pm2_5ToColor(measurementData.getPm2_5Value()),
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                          child: Row(
                            children: [
                              Container(
                                  constraints:
                                      const BoxConstraints(maxWidth: 200),
                                  child: Text(
                                      '${measurementData.site.getUserLocation()}',
                                      softWrap: true,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                          color: pm2_5TextColor(
                                              measurementData.getPm2_5Value()),
                                          fontWeight: FontWeight.bold))),
                            ],
                          ),
                        )),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
                      child: Text(pmToString(measurementData.getPm2_5Value()),
                          style: TextStyle(
                              fontSize: 15,
                              color: ColorConstants.appColor,
                              fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.fromLTRB(0.0, 0.0, 10.0, 0.0),
                child: Column(
                  children: [
                    Text(
                      '${measurementData.getPm2_5Value()}',
                      style: TextStyle(
                          color: ColorConstants.appColor,
                          fontSize: 20,
                          fontWeight: FontWeight.bold),
                    ),
                    const Text(
                      'PM2.5',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
        footerSection(context)
      ],
    );
  }

  Future<void> viewDetails(context, Measurement measurement) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(measurement: measurement);
    }));
  }
}
