import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

import 'dashboard_measurements.dart';

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

class ReadingsCard extends StatefulWidget {
  const ReadingsCard({Key? key}) : super(key: key);

  @override
  _ReadingsCardState createState() => _ReadingsCardState();
}

class _ReadingsCardState extends State<ReadingsCard> {
  final List<charts.Series> gaugeSeriesList = _createSampleData();
  final List<charts.Series<TimeSeriesData, DateTime>> graphSeriesList =
      createData();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10.0, 8.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(5.0))),
      child: Column(
        children: [titleSection(), graphSection(), footerSection()],
      ),
    );
  }

  Widget footerSection() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Container(
            height: 36,
            width: 36,
            decoration: BoxDecoration(
                color: ColorConstants.appColorBlue.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(5.0)),
            ),
            child: Icon(
              Icons.more_horiz_rounded,
              color: ColorConstants.appColorBlue,
            ),
          ),
          const SizedBox(width: 8,),
          Container(
            height: 36,
            padding: const EdgeInsets.only(left: 16, right: 16),
            decoration: BoxDecoration(
              color: ColorConstants.appColorBlue.withOpacity(0.2),
              borderRadius: const BorderRadius.all(Radius.circular(5.0)),
            ),
            child: Center(
              child: Text('Share',
                  style: TextStyle(
                    color: ColorConstants.appColorBlue,
                    fontSize: 14,
                  )),
            ),
          ),

          const Spacer(),
          Container(
            height: 36,
            padding: const EdgeInsets.only(left: 16, right: 16),
            decoration: BoxDecoration(
              color: ColorConstants.appColorBlue.withOpacity(0.2),
              borderRadius: const BorderRadius.all(Radius.circular(5.0)),
            ),
            child: Center(
              child: Row(
                children: [
                  Image.asset(
                    'assets/images/heart.png'),
                  const SizedBox(width: 8,),
                  Text('Favorite ',
                      style: TextStyle(
                        color: ColorConstants.appColorBlue,
                        fontSize: 14,
                      )),
                ],
              )
            ),
          ),
        ],
      ),
    );
  }

  Widget gaugeChart() {
    return Container(
      height: 110.0,
      width: 110.0,
      child: Stack(
        alignment: AlignmentDirectional.center,
        children: [
          charts.PieChart(
            gaugeSeriesList,
            animate: true,
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
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '98',
                style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
              ),
              Text('PM2.5',
                  style: TextStyle(
                    fontSize: 10,
                    color: ColorConstants.inactiveColor,
                  ))
            ],
          )
        ],
      ),
    );
  }

  Widget graphSection() {
    return DashboardBarChart(graphSeriesList, 'Forecast');
  }

  Widget titleSection() {
    return Row(
      children: [
        Expanded(
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
                decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: const BorderRadius.all(Radius.circular(15.0))),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8.0, 4.0, 8.0, 4.0),
                  child: Row(
                    children: [
                      // Icon(
                      //   Icons.location_on,
                      //   size: 15,
                      // ),
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            height: 10,
                            width: 10,
                            decoration: BoxDecoration(
                                color: Colors.red.withOpacity(0.5),
                                shape: BoxShape.circle
                            ),
                          ),

                          Container(
                            height: 6,
                            width: 6,
                            decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 2,),
                      const Expanded(
                        child: Text('KAWEMPE',
                            softWrap: true,
                            maxLines: 1,
                            textAlign: TextAlign.start,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 12,
                                color: Colors.red,
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )),
            const Text('High',
                softWrap: true,
                maxLines: 1,
                textAlign: TextAlign.start,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))
          ],
        )),
        const Expanded(
          child: Text(''),
        ),
        gaugeChart(),
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
