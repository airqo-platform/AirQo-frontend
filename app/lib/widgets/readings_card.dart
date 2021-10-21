import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/place_view.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
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
            pmToChartColor(series.colorValue.toDouble(), 'pm2.5'),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}

class ReadingsCard extends StatefulWidget {
  final Measurement measurementData;

  ReadingsCard(
    this.measurementData, {
    Key? key,
  }) : super(key: key);

  @override
  _ReadingsCardState createState() => _ReadingsCardState(measurementData);
}

class _ReadingsCardState extends State<ReadingsCard> {
  final List<charts.Series> gaugeSeriesList = _createSampleData();
  final List<charts.Series<TimeSeriesData, DateTime>> graphSeriesList =
      createData();

  final Measurement measurementData;
  List<HistoricalMeasurement> historicalData = [];

  _ReadingsCardState(this.measurementData);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10.0, 0.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(5.0))),
      child: Column(
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return PlaceView(measurementData.site);
              }));
            },
            child: titleSection(),
          ),
          graphSection(),
          footerSection()
        ],
      ),
    );
  }

  Widget footerSection() {
    return Padding(
      padding: const EdgeInsets.only(top: 4.0),
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
          const SizedBox(
            width: 8,
          ),
          Container(
            height: 36,
            padding: const EdgeInsets.only(left: 16, right: 16),
            decoration: BoxDecoration(
              color: ColorConstants.appColorBlue.withOpacity(0.2),
              borderRadius: const BorderRadius.all(Radius.circular(5.0)),
            ),
            child: GestureDetector(
              onTap: () {
                shareMeasurement(measurementData);
              },
              child: Center(
                child: Text('Share',
                    style: TextStyle(
                      color: ColorConstants.appColorBlue,
                      fontSize: 14,
                    )),
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () async {
              await DBHelper()
                  .updateFavouritePlaces(measurementData.site)
                  .then((value) => {
                        if (value)
                          {
                            showSnackBar(
                                context,
                                '${measurementData.site.getName()}'
                                ' has been added to your favourite places')
                          }
                        else
                          {
                            showSnackBar(
                                context,
                                '${measurementData.site.getName()}'
                                ' has been removed from your favourite places')
                          }
                      });
            },
            child: Container(
              height: 36,
              padding: const EdgeInsets.only(left: 16, right: 16),
              decoration: BoxDecoration(
                color: ColorConstants.appColorBlue.withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(5.0)),
              ),
              child: Center(
                  child: Row(
                children: [
                  Image.asset('assets/images/heart.png'),
                  const SizedBox(
                    width: 8,
                  ),
                  Text('Favorite ',
                      style: TextStyle(
                        color: ColorConstants.appColorBlue,
                        fontSize: 14,
                      )),
                ],
              )),
            ),
          ),
        ],
      ),
    );
  }

  Widget gaugeChart(Measurement measurement) {
    return Container(
      height: 110.0,
      width: 110.0,
      child: Stack(
        alignment: AlignmentDirectional.center,
        children: [
          charts.PieChart(
            gaugeSeriesList,
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
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '${measurement.getPm2_5Value()}',
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

  void getHistoricalMeasurements() async {
    try {
      await AirqoApiClient(context)
          .fetchSiteHistoricalMeasurements(measurementData.site)
          .then((value) => {
                if (value.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = value;
                        }),
                        DBHelper().insertSiteHistoricalMeasurements(
                            value, measurementData.site.id)
                      },
                  }
              });
    } catch (e) {
      print(e);
    }
  }

  Widget graphSection() {
    var graphSeriesList = historicalChartData(historicalData);
    return DashboardBarChart(graphSeriesList, 'Forecast');
  }

  @override
  void initState() {
    super.initState();
    localFetchHistoricalData();
    getHistoricalMeasurements();
  }

  void localFetchHistoricalData() async {
    try {
      await DBHelper()
          .getHistoricalMeasurements(measurementData.site.id)
          .then((measurements) => {
                if (measurements.isNotEmpty)
                  {
                    if (mounted)
                      {
                        setState(() {
                          historicalData = measurements;
                        })
                      }
                  }
              });
    } on Error catch (e) {
      print('Getting historical data locally error: $e');
    }
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
                    color: pm2_5ToColor(measurementData.getPm2_5Value())
                        .withOpacity(0.1),
                    borderRadius:
                        const BorderRadius.all(Radius.circular(15.0))),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8.0, 4.0, 8.0, 4.0),
                  child: Row(
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            height: 10,
                            width: 10,
                            decoration: BoxDecoration(
                                color: pm2_5ToColor(
                                        measurementData.getPm2_5Value())
                                    .withOpacity(0.5),
                                shape: BoxShape.circle),
                          ),
                          Container(
                            height: 6,
                            width: 6,
                            decoration: BoxDecoration(
                                color: pm2_5ToColor(
                                    measurementData.getPm2_5Value()),
                                shape: BoxShape.circle),
                          ),
                        ],
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Expanded(
                        child: Text('${measurementData.site.getName()}',
                            softWrap: true,
                            maxLines: 1,
                            textAlign: TextAlign.start,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 12,
                                color: pm2_5TextColor(
                                    measurementData.getPm2_5Value()),
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )),
            Text(pmToString(measurementData.getPm2_5Value()),
                softWrap: true,
                maxLines: 2,
                textAlign: TextAlign.start,
                overflow: TextOverflow.ellipsis,
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))
          ],
        )),
        gaugeChart(measurementData),
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
            pmToChartColor(series.colorValue.toDouble(), 'pm2.5'),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}
