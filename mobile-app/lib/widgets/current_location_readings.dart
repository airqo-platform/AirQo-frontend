import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/screens/place_details.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/pollutants_container.dart';
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
          Padding(
            padding: EdgeInsets.only(left: 10, right: 10),
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
            padding: EdgeInsets.only(left: 10, right: 10),
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
          if (historicalData.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(left: 10, right: 10),
              child: Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                elevation: 10,
                child: Padding(
                  padding: const EdgeInsets.all(5.0),
                  child: historySection(),
                ),
              ),
            ),
          if (forecastData.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(left: 10, right: 10),
              child: Card(
                elevation: 10,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: forecastSection(),
              ),
            ),
          SizedBox(
            height: 300.0,
            child: Padding(
              padding: EdgeInsets.only(left: 10, right: 10),
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
              viewDetails(context, measurementData.site);
            },
            child: Text(
                '${dateToString(measurementData.time, true)}'
                ', Local Time',
                style: TextStyle(
                  color: ColorConstants.appColor,
                  fontSize: 12,
                )),
          ),
          const Spacer(),
          // IconButton(
          //     onPressed: null,
          //     icon: Image.asset(
          //       'assets/images/heart.png',
          //     )),
          // TextButton(
          //   // style: ButtonStyle(
          //   //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
          //   // ),
          //   onPressed: () {},
          //   child: Card(
          //       elevation: 5,
          //       shape: RoundedRectangleBorder(
          //         borderRadius: BorderRadius.circular(5),
          //       ),
          //       color: Colors.white,
          //       child: Padding(
          //           padding: EdgeInsets.all(4),
          //           child: Icon(
          //             Icons.favorite,
          //             color: ColorConstants.red,
          //           ))),
          // ),
          TextButton(
            // style: ButtonStyle(
            //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
            // ),
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
    return DashboardBarChart(data, 'Forecast');
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
    return DashboardBarChart(formattedData, 'History');
  }

  Widget titleSection(context) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            viewDetails(context, measurementData.site);
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
                        color: pmToColor(measurementData.getPm2_5Value()),
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                          child: Row(
                            children: [
                              // Icon(
                              //   Icons.location_on,
                              //   color:
                              //       pmTextColor(measurementData.getPm2_5Value()),
                              // ),
                              Container(
                                  constraints:
                                      const BoxConstraints(maxWidth: 200),
                                  child: Text(
                                      '${measurementData.site.getUserLocation()}',
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
                    //       '${dateToString(
                    //       measurementData.time, true)}, Local Time',
                    //       style: TextStyle(
                    //         color: ColorConstants.appColor,
                    //         fontSize: 12,
                    //       )),
                    // )
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
                      'PM 2.5',
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

  Future<void> viewDetails(context, Site site) async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return PlaceDetailsPage(site: site);
    }));
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
