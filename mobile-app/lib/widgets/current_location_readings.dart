import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'dashboard_measurements_chart.dart';
import 'health_recommendation.dart';

class CurrentLocationCard extends StatelessWidget {
  final Measurement measurementData;

  final List<HistoricalMeasurement> historicalData;
  final List<Predict> forecastData;
  final List<charts.Series> seriesList = _createSampleData();

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


          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 10,
            child: Padding(
              padding: const EdgeInsets.all(5.0),
              child: titleSection(),
            ),
          ),

          HealthRecommendationSection(
            measurement: measurementData,
          ),

          // if (historicalData.isNotEmpty)
          //   Card(
          //     shape: RoundedRectangleBorder(
          //       borderRadius: BorderRadius.circular(20),
          //     ),
          //     elevation: 10,
          //     child: Padding(
          //       padding: const EdgeInsets.all(5.0),
          //       child: historySection(),
          //     ),
          //   ),
          // if (forecastData.isNotEmpty)
          //   Card(
          //     elevation: 10,
          //     shape: RoundedRectangleBorder(
          //       borderRadius: BorderRadius.circular(20),
          //     ),
          //     child: forecastSection(),
          //   ),
        ],
      ),
    );
  }

  Widget footerSection() {
    return Padding(padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Text(
            '${dateToString(measurementData.time, true)}, Local Time',
            style: TextStyle(
              color: ColorConstants.appColor,
              fontSize: 12,
            )),
        const Spacer(),
        IconButton(onPressed: null, icon: Image.asset(
          'assets/images/heart.png',
        )),

        TextButton(
          // style: ButtonStyle(
          //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
          // ),
          onPressed: () {},
          child: Card(
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(5),
              ),
              color: ColorConstants.appColor,
              child: const Padding(
                padding: EdgeInsets.all(8),
                child: Text('SHARE',
                    style: TextStyle(fontSize: 13, color: Colors.white)),
              )),
        )
      ],
    ),
    );
    // return Row(
    //   crossAxisAlignment: CrossAxisAlignment.center,
    //   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
    //   children: [
    //     Text(
    //         '${dateToString(measurementData.time, true)}, Local Time',
    //         style: TextStyle(
    //           color: ColorConstants.appColor,
    //           fontSize: 12,
    //         )),
    //     const Spacer(),
    //     IconButton(onPressed: null, icon: Image.asset(
    //       'assets/images/heart.png',
    //     )),
    //
    //     TextButton(
    //       // style: ButtonStyle(
    //       //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
    //       // ),
    //       onPressed: () {},
    //       child: Card(
    //           elevation: 5,
    //           shape: RoundedRectangleBorder(
    //             borderRadius: BorderRadius.circular(5),
    //           ),
    //           color: ColorConstants.appColor,
    //           child: const Padding(
    //             padding: EdgeInsets.all(8),
    //             child: Text('SHARE',
    //                 style: TextStyle(fontSize: 13, color: Colors.white)),
    //           )),
    //     )
    //   ],
    // );
  }

  Widget forecastSection() {
    var data = forecastChartData(forecastData);
    return DashboardBarChart(data);
  }

  Widget gaugeChart() {
    return Container(
      height: 140.0,
      width: 140.0,
      child: charts.PieChart(
        seriesList,
        animate: false,
        defaultRenderer: charts.ArcRendererConfig(
          arcWidth: 3,
          startAngle: 4 / 5 * pi,
          arcLength: 7 / 5 * pi,
          strokeWidthPx: 0,
          // arcRendererDecorators: [new charts.ArcLabelDecorator(
          //   showLeaderLines: false,
          //   labelPosition: charts.ArcLabelPosition.inside,
          // )],
        ),
      ),
    );
  }

  Widget historySection() {
    var formattedData = historicalChartData(historicalData);
    return DashboardBarChart(formattedData);
  }

  Widget titleSection() {
    return Column(
      children: [
        // Card(
        //     elevation: 0,
        //     shape: RoundedRectangleBorder(
        //       borderRadius: BorderRadius.circular(10),
        //     ),
        //     color: pmToColor(measurementData.getPm2_5Value()),
        //     child: Padding(
        //       padding: const EdgeInsets.all(8),
        //       child: Column(
        //         children: [
        //           Text('${measurementData.site.getUserLocation()}',
        //               softWrap: true,
        //               maxLines: 2,
        //               textAlign: TextAlign.center,
        //               overflow: TextOverflow.ellipsis,
        //               style: TextStyle(
        //                   color: pmTextColor(measurementData.getPm2_5Value()),
        //                   fontWeight: FontWeight.bold)),
        //           if (measurementData.site.getUserLocation() !=
        //               measurementData.site.getName())
        //             Text('${measurementData.site.getName()}',
        //                 softWrap: true,
        //                 maxLines: 2,
        //                 textAlign: TextAlign.center,
        //                 overflow: TextOverflow.ellipsis,
        //                 style: TextStyle(
        //                     color: pmTextColor(measurementData.getPm2_5Value()),
        //                     fontWeight: FontWeight.bold)),
        //         ],
        //       ),
        //     )),
        Row(
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
                      color:
                      pmToColor(measurementData.getPm2_5Value()),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(5, 5, 10, 5),
                        child: Row(
                          children: [
                            Icon(
                              Icons.location_on,
                              color: pmTextColor(measurementData
                                  .getPm2_5Value()),
                            ),
                            Container(
                                constraints:
                                const BoxConstraints(maxWidth: 180),
                                child:
                                Text('${measurementData.site
                                    .getUserLocation()}',
                                    softWrap: true,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        color: pmTextColor(
                                            measurementData.getPm2_5Value()),
                                        fontWeight: FontWeight.bold))),
                          ],
                        ),
                      )),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
                    child: Text(pmToString(measurementData.getPm2_5Value()),
                        style: TextStyle(
                            fontSize: 20,
                            color: ColorConstants.appColor,
                            fontWeight: FontWeight.bold)),
                  ),
                  // Padding(
                  //   padding: const EdgeInsets.fromLTRB(5, 0.0, 0.0, 0.0),
                  //   child: Text(
                  //       '${dateToString(measurementData.time, true)}, Local Time',
                  //       style: TextStyle(
                  //         color: ColorConstants.appColor,
                  //         fontSize: 12,
                  //       )),
                  // )
                ],
              ),
            ),
            const Spacer(),
            Stack(
              alignment: AlignmentDirectional.center,
              children: [
                gaugeChart(),
                Column(
                  children: [
                    Text(
                      '${measurementData.getPm2_5Value()}',
                      style: TextStyle(
                          color: pmToColor(measurementData.getPm2_5Value()),
                          fontSize: 17,
                          fontWeight: FontWeight.bold),
                    ),
                    const Text(
                      'AQI',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey),
                    ),
                  ],
                )
              ],
            )
          ],
        ),
        if (historicalData.isNotEmpty)
          historySection(),
        if (forecastData.isNotEmpty)
          forecastSection(),
        footerSection()
      ],
    );
  }

  static List<charts.Series<GaugeSegment, String>> _createSampleData() {
    final data = [
      GaugeSegment('Good', 1, 6),
      GaugeSegment('Moderate', 1, 25),
      GaugeSegment('Sensitive', 1, 40),
      GaugeSegment('Unhealthy', 1, 100),
      GaugeSegment('Very Unhealthy', 1, 200),
      GaugeSegment('Hazardous', 1, 400),
    ];

    return [
      charts.Series<GaugeSegment, String>(
        id: 'Segments',
        colorFn: (GaugeSegment series, _) =>
            pmToChartColor(series.colorValue.toDouble()),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}

class GaugeSegment {
  final String segment;
  final int size;
  final int colorValue;

  GaugeSegment(this.segment, this.size, this.colorValue);

  static List<charts.Series<GaugeSegment, String>> createSampleData() {
    final data = [
      GaugeSegment('Good', 1, 6),
      GaugeSegment('Moderate', 1, 25),
      GaugeSegment('Sensitive', 1, 40),
      GaugeSegment('Unhealthy', 1, 100),
      GaugeSegment('Very Unhealthy', 1, 200),
      GaugeSegment('Hazardous', 1, 400),
    ];

    return [
      charts.Series<GaugeSegment, String>(
        id: 'Segments',
        colorFn: (GaugeSegment series, _) =>
            pmToChartColor(series.colorValue.toDouble()),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}
