import 'package:app/constants/app_constants.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/site.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

import 'custom_shimmer.dart';
import 'custom_widgets.dart';

class InsightsCard extends StatefulWidget {
  final Site site;
  final callBackFn;
  final String pollutant;

  const InsightsCard(this.site, this.callBackFn, this.pollutant, {Key? key})
      : super(key: key);

  @override
  _InsightsCardState createState() =>
      _InsightsCardState(site, callBackFn, pollutant);
}

class _InsightsCardState extends State<InsightsCard> {
  final Site site;
  final String pollutant;
  List<HistoricalMeasurement> measurements = [];
  var selectedMeasurement;
  List<charts.Series<dynamic, DateTime>> chartData = [];
  final ScrollController _scrollController = ScrollController();
  String viewDay = 'today';
  final callBackFn;

  _InsightsCardState(this.site, this.callBackFn, this.pollutant);

  @override
  Widget build(BuildContext context) {
    if (measurements.isEmpty) {
      return loadingAnimation(300.0);
    }
    return Container(
        padding: const EdgeInsets.only(top: 12, bottom: 12),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(16.0)),
            border: Border.all(color: Colors.transparent)),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              chartDateTimeToString(
                                  selectedMeasurement.formattedTime),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.black.withOpacity(0.3)),
                            ),
                            Text(
                              '${site.getName()}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              '${site.getLocation()}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.black.withOpacity(0.3)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      insightsAvatar(
                          context, selectedMeasurement, 64, pollutant),
                    ],
                  ),

                  chart(),

                  // const SizedBox(height: 13.0,),
                  //
                  // Row(
                  //   mainAxisAlignment: MainAxisAlignment.start,
                  //   children: [
                  //     Text('Updated today at 08:44',
                  //       style: TextStyle(
                  //           fontSize: 8,
                  //           color: Colors.black.withOpacity(0.3)
                  //       ),),
                  //   ],
                  // ),
                ],
              ),
            ),

            const SizedBox(
              height: 8.0,
            ),

            const Divider(color: Color(0xffC4C4C4)),

            const SizedBox(
              height: 8.0,
            ),
            // footer
            Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                    decoration: BoxDecoration(
                        borderRadius:
                            const BorderRadius.all(Radius.circular(40.0)),
                        color: pm2_5ToColor(selectedMeasurement.getPm2_5Value())
                            .withOpacity(0.3),
                        border: Border.all(color: Colors.transparent)),
                    child: Text(
                      pmToString(selectedMeasurement.getPm2_5Value()),
                      maxLines: 1,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        color: pmToString(selectedMeasurement.getPm2_5Value())
                                    .trim()
                                    .toLowerCase() ==
                                'moderate'
                            ? Colors.black.withOpacity(0.5)
                            : pm2_5ToColor(selectedMeasurement.getPm2_5Value()),
                      ),
                    ),
                  ),
                  Container(
                    child: Row(
                      children: [
                        Container(
                            height: 10,
                            width: 10,
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: viewDay == 'tomorrow'
                                    ? ColorConstants.appColorBlue
                                    : ColorConstants.appColorDisabled,
                                border: Border.all(color: Colors.transparent))),
                        const SizedBox(
                          width: 8.0,
                        ),
                        Text(
                          'Forecast',
                          style: TextStyle(
                            fontSize: 12,
                            color: viewDay == 'tomorrow'
                                ? ColorConstants.appColorBlue
                                : ColorConstants.appColorDisabled,
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ));
  }

  Widget chart() {
    return SingleChildScrollView(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        child: Container(
          width: 1000,
          height: 150,
          child: charts.TimeSeriesChart(
            chartData,
            animate: true,
            defaultRenderer: charts.BarRendererConfig<DateTime>(
                strokeWidthPx: 0, stackedBarPaddingPx: 0),
            defaultInteractions: true,
            domainAxis: const charts.DateTimeAxisSpec(
                tickProviderSpec: charts.DayTickProviderSpec(increments: [1]),
                tickFormatterSpec: charts.AutoDateTimeTickFormatterSpec(
                  day: charts.TimeFormatterSpec(
                      format: 'hh a',
                      transitionFormat: 'hh a',
                      noonFormat: 'hh a'),
                )),
            behaviors: [
              // charts.SeriesLegend(
              //   position: charts.BehaviorPosition.top,
              //   horizontalFirst: false,
              //   desiredMaxRows: 2,
              //   cellPadding: const EdgeInsets.only(right: 4.0, bottom: 4.0),
              // ),
              charts.DomainHighlighter(),
              charts.SelectNearest(
                  eventTrigger: charts.SelectionTrigger.tapAndDrag),
              // charts.LinePointHighlighter(
              //   symbolRenderer: CustomCircleSymbolRenderer(size: size),
              // ),
            ],
            selectionModels: [
              charts.SelectionModelConfig(
                  changedListener: (charts.SelectionModel model) {
                if (model.hasDatumSelection) {
                  try {
                    var value = model.selectedDatum[0].index;
                    if (value != null) {
                      updateUI(model.selectedSeries[0].data[value]);
                    }
                    setState(() {});
                  } on Error catch (e) {
                    print(e);
                  }
                }
              })
            ],
            primaryMeasureAxis: const charts.NumericAxisSpec(
                tickProviderSpec:
                    charts.BasicNumericTickProviderSpec(desiredTickCount: 5)),
          ),
        ));
  }

  Future<void> getMeasurements() async {
    await AirqoApiClient(context)
        .fetchSiteHistoricalMeasurements(site)
        .then((value) => {
              if (value.isNotEmpty && mounted)
                {
                  setState(() {
                    selectedMeasurement = value.first;
                    measurements = value;
                    chartData = insightsChartData(measurements, pollutant);
                  }),
                }
            });
  }

  @override
  void initState() {
    getMeasurements();
    super.initState();
  }

  void updateUI(HistoricalMeasurement measurement) {
    callBackFn(measurement);
    setState(() {
      selectedMeasurement = measurement;
    });
    var time = DateTime.parse(measurement.time);

    if (time.day == DateTime.now().day) {
      setState(() {
        viewDay = 'today';
      });
    } else if ((time.month == DateTime.now().month) &&
        (time.day + 1) == DateTime.now().day) {
      setState(() {
        viewDay = 'tomorrow';
      });
    }
  }
}
