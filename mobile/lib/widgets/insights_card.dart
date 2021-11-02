import 'package:app/constants/app_constants.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/site.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'custom_shimmer.dart';
import 'custom_widgets.dart';

class InsightsCard extends StatefulWidget {
  final Site site;
  final bool daily;
  final callBackFn;
  final String pollutant;

  const InsightsCard(this.site, this.callBackFn, this.pollutant, this.daily,
      {Key? key})
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
      return loadingAnimation(290.0, 8.0);
    }
    return Container(
        padding: const EdgeInsets.only(top: 12, bottom: 12),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
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
                              insightsChartDateTimeToString(
                                  selectedMeasurement.formattedTime,
                                  widget.daily),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.black.withOpacity(0.3)),
                            ),
                            Text(
                              site.getName(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              site.getLocation(),
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

                  widget.daily
                      ? chart()
                      : SingleChildScrollView(
                          controller: _scrollController,
                          scrollDirection: Axis.horizontal,
                          child: chart())

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
              width: MediaQuery.of(context).size.width,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                    decoration: BoxDecoration(
                        borderRadius:
                            const BorderRadius.all(Radius.circular(40.0)),
                        color: selectedMeasurement.formattedTime
                                .isAfter(DateTime.now())
                            ? ColorConstants.appColorPaleBlue
                            : pollutant == 'pm2.5'
                                ? pm2_5ToColor(
                                        selectedMeasurement.getPm2_5Value())
                                    .withOpacity(0.4)
                                : pm10ToColor(
                                        selectedMeasurement.getPm10Value())
                                    .withOpacity(0.4),
                        border: Border.all(color: Colors.transparent)),
                    child: Text(
                      pmToString(selectedMeasurement.getPm2_5Value()),
                      maxLines: 1,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        color: selectedMeasurement.formattedTime
                                .isAfter(DateTime.now())
                            ? ColorConstants.appColorBlue
                            : pollutant == 'pm2.5'
                                ? pm2_5TextColor(
                                    selectedMeasurement.getPm2_5Value())
                                : pm10TextColor(
                                    selectedMeasurement.getPm10Value()),
                      ),
                    ),
                  ),
                  const SizedBox(
                    width: 8,
                  ),
                  GestureDetector(
                    onTap: () {
                      var measurement =
                          selectedMeasurement.getMeasurement(site);
                      pmInfoDialog(context, measurement);
                    },
                    child: SvgPicture.asset(
                      'assets/icon/info_icon.svg',
                      semanticsLabel: 'Pm2.5',
                      height: 20,
                      width: 20,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Container(
                          height: 10,
                          width: 10,
                          decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: selectedMeasurement.formattedTime
                                      .isAfter(DateTime.now())
                                  ? ColorConstants.appColorBlue
                                  : ColorConstants.appColorPaleBlue,
                              border: Border.all(color: Colors.transparent))),
                      const SizedBox(
                        width: 8.0,
                      ),
                      Text(
                        'Forecast',
                        style: TextStyle(
                            fontSize: 12, color: ColorConstants.appColorBlue),
                      )
                    ],
                  ),
                ],
              ),
            ),
          ],
        ));
  }

  Widget chart() {
    return SizedBox(
      width: MediaQuery.of(context).size.width * 2,
      height: 150,
      child: charts.TimeSeriesChart(
        chartData,
        animate: true,
        defaultRenderer: charts.BarRendererConfig<DateTime>(
            strokeWidthPx: 0, stackedBarPaddingPx: 0),
        defaultInteractions: true,
        domainAxis: widget.daily
            ? const charts.DateTimeAxisSpec(
                tickProviderSpec: charts.DayTickProviderSpec(increments: [1]),
                tickFormatterSpec: charts.AutoDateTimeTickFormatterSpec(
                    day: charts.TimeFormatterSpec(
                        format: 'EEE',
                        transitionFormat: 'EEE',
                        noonFormat: 'EEE')))
            : const charts.DateTimeAxisSpec(
                tickFormatterSpec: charts.AutoDateTimeTickFormatterSpec(
                    day: charts.TimeFormatterSpec(
                        format: 'hh a',
                        noonFormat: 'hh a',
                        transitionFormat: 'EEE, hh a'))),
        behaviors: [
          charts.DomainHighlighter(),
          charts.SelectNearest(
              eventTrigger: charts.SelectionTrigger.tapAndDrag),
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
          tickProviderSpec: charts.StaticNumericTickProviderSpec(
            <charts.TickSpec<double>>[
              charts.TickSpec<double>(0),
              charts.TickSpec<double>(125),
              charts.TickSpec<double>(250),
              charts.TickSpec<double>(375),
              charts.TickSpec<double>(500),
            ],
          ),
        ),
        // primaryMeasureAxis: const charts.NumericAxisSpec(
        //     tickProviderSpec:
        //         charts.BasicNumericTickProviderSpec(desiredTickCount: 5)),
      ),
    );
  }

  Future<void> getForecast(int deviceNumber, value) async {
    var predictions = await AirqoApiClient(context).fetchForecast(deviceNumber);

    if (predictions.isNotEmpty) {
      var predictedValues =
          Predict.getMeasurements(predictions, site.id, deviceNumber);
      var combined = value..addAll(predictedValues);

      setState(() {
        measurements = combined;
        chartData = insightsChartData(measurements, pollutant);
      });
    } else {
      setState(() {
        measurements = value;
        chartData = insightsChartData(measurements, pollutant);
      });
    }
  }

  Future<void> getMeasurements() async {
    await AirqoApiClient(context)
        .fetchSiteHistoricalMeasurements(site, widget.daily)
        .then((value) => {
              if (value.isNotEmpty && mounted)
                {
                  setState(() {
                    selectedMeasurement = value.first;
                    if (widget.daily) {
                      setState(() {
                        measurements = value;
                        chartData = insightsChartData(measurements, pollutant);
                      });
                    } else {
                      getForecast(selectedMeasurement.deviceNumber, value);
                    }
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
