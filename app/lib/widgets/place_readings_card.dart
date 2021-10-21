import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/readings_dashboard.dart';
import 'package:app/widgets/tips.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

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

class PlaceReadingsCard extends StatefulWidget {
  final Site site;

  final List<HistoricalMeasurement> historicalData;

  PlaceReadingsCard(
    this.site,
    this.historicalData, {
    Key? key,
  }) : super(key: key);

  @override
  _PlaceReadingsCardState createState() =>
      _PlaceReadingsCardState(site, historicalData);
}

class _PlaceReadingsCardState extends State<PlaceReadingsCard> {
  final List<charts.Series> gaugeSeriesList = _createSampleData();
  final List<charts.Series<TimeSeriesData, DateTime>> graphSeriesList =
      createData();

  final Site site;
  List<HistoricalMeasurement> historicalData = [];
  Color pmColor = ColorConstants.appColorBlue;
  var gaugeValue;
  List<Widget> tips = [];

  _PlaceReadingsCardState(this.site, this.historicalData);

  @override
  Widget build(BuildContext context) {
    return ListView(
      shrinkWrap: true,
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(10.0, 0.0, 8.0, 8.0),
          decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(5.0))),
          child: Column(
            children: [titleSection(), graphSection(), footerSection()],
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        const Text(
          'Wellness & Health tips',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        const SizedBox(
          height: 4,
        ),
        ListView(
          shrinkWrap: true,
          children: tips,
        )
      ],
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
                shareLocation(site);
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
              await DBHelper().updateFavouritePlaces(site).then((value) => {
                    if (value)
                      {
                        showSnackBar(
                            context,
                            '${site.getName()}'
                            ' has been added to your favourite places')
                      }
                    else
                      {
                        showSnackBar(
                            context,
                            '${site.getName()}'
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

  Widget gaugeChart() {
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
                '$gaugeValue',
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
    var graphSeriesList = historicalChartData(historicalData);
    return ReadingsBarChart(graphSeriesList, 'History', setHeader);
  }

  @override
  void initState() {
    if (historicalData.isNotEmpty) {
      var measurement = historicalData[historicalData.length - 1];
      tips = createTips(measurement.getPm2_5Value());
      gaugeValue = measurement.getPm2_5Value();
      pmColor = pm2_5ToColor(measurement.getPm2_5Value());
    } else {
      gaugeValue = '';
    }
    super.initState();
  }

  void setHeader(var pmValue) {
    try {
      var value = double.parse(pmValue.toString());
      setState(() {
        pmColor = pm2_5ToColor(value);
        gaugeValue = value;
        tips = createTips(value);
      });
    } catch (e) {
      gaugeValue = 0.0;
      pmColor = pm2_5ToColor(0.0);
      print(e);
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
                    color: pmColor.withOpacity(0.1),
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
                                color: pmColor.withOpacity(0.5),
                                shape: BoxShape.circle),
                          ),
                          Container(
                            height: 6,
                            width: 6,
                            decoration: BoxDecoration(
                                color: pmColor, shape: BoxShape.circle),
                          ),
                        ],
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Expanded(
                        child: Text('${site.getName()}',
                            softWrap: true,
                            maxLines: 1,
                            textAlign: TextAlign.start,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 12,
                                color: pm2_5TextColor(
                                    historicalData[0].getPm2_5Value()),
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                )),
            Text(pmToString(gaugeValue),
                softWrap: true,
                maxLines: 2,
                textAlign: TextAlign.start,
                overflow: TextOverflow.ellipsis,
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))
          ],
        )),
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
            pmToChartColor(series.colorValue.toDouble(), 'pm2.5'),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}
