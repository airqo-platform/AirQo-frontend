import 'package:app/constants/app_constants.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/predict.dart';
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
  final PlaceDetails placeDetails;
  final bool daily;
  final dynamic callBackFn;
  final String pollutant;

  const InsightsCard(
      this.placeDetails, this.callBackFn, this.pollutant, this.daily,
      {Key? key})
      : super(key: key);

  @override
  _InsightsCardState createState() => _InsightsCardState();
}

class _InsightsCardState extends State<InsightsCard> {
  List<HistoricalMeasurement> measurements = [];
  InsightsChartData? selectedMeasurement;
  List<charts.Series<dynamic, DateTime>> chartData = [];
  List<charts.Series<dynamic, String>> dailyChartData = [];
  List<charts.Series<dynamic, String>> hourlyChartData = [];
  final ScrollController _scrollController = ScrollController();
  AirqoApiClient? _airqoApiClient;
  String viewDay = 'today';

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
                                  selectedMeasurement!.time, widget.daily),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.black.withOpacity(0.3)),
                            ),
                            Text(
                              widget.placeDetails.getName(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              widget.placeDetails.getLocation(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.black.withOpacity(0.3)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      insightsAvatar(
                          context, selectedMeasurement!, 64, widget.pollutant),
                    ],
                  ),
                  widget.daily
                      ? dailyChart()
                      : SingleChildScrollView(
                          controller: _scrollController,
                          scrollDirection: Axis.horizontal,
                          child: hourlyChart()),
                  const SizedBox(
                    height: 13.0,
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width / 2),
                          child: Text(
                            dateToString(
                                selectedMeasurement!.time.toString(), false),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 8,
                                color: Colors.black.withOpacity(0.3)),
                          )),
                      const SizedBox(
                        width: 8.0,
                      ),
                      SvgPicture.asset(
                        'assets/icon/loader.svg',
                        semanticsLabel: 'loader',
                        height: 8,
                        width: 8,
                      ),
                    ],
                  ),
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
                  Visibility(
                    visible: selectedMeasurement!.available,
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width / 2.5),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color:
                              selectedMeasurement!.time.isAfter(DateTime.now())
                                  ? ColorConstants.appColorPaleBlue
                                  : widget.pollutant == 'pm2.5'
                                      ? pm2_5ToColor(selectedMeasurement!.value)
                                          .withOpacity(0.4)
                                      : pm10ToColor(selectedMeasurement!.value)
                                          .withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: Text(
                        widget.pollutant == 'pm2.5'
                            ? pm2_5ToString(selectedMeasurement!.value)
                            : pm10ToString(selectedMeasurement!.value),
                        maxLines: 1,
                        textAlign: TextAlign.start,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: selectedMeasurement!.time
                                  .isAfter(DateTime.now())
                              ? ColorConstants.appColorBlue
                              : widget.pollutant == 'pm2.5'
                                  ? pm2_5TextColor(selectedMeasurement!.value)
                                  : pm10TextColor(selectedMeasurement!.value),
                        ),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: !selectedMeasurement!.available,
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color: ColorConstants.greyColor.withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: Text(
                        'Not Available',
                        maxLines: 1,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: ColorConstants.darkGreyColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(
                    width: 8,
                  ),
                  Visibility(
                      visible: selectedMeasurement!.available,
                      child: GestureDetector(
                        onTap: () {
                          pmInfoDialog(context, selectedMeasurement!.value);
                        },
                        child: SvgPicture.asset(
                          'assets/icon/info_icon.svg',
                          semanticsLabel: 'Pm2.5',
                          height: 20,
                          width: 20,
                        ),
                      )),
                  const Spacer(),
                  Row(
                    children: [
                      Container(
                          height: 10,
                          width: 10,
                          decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: selectedMeasurement!.time
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
      width: widget.pollutant == 'pm2.5'
          ? MediaQuery.of(context).size.width * 2
          : MediaQuery.of(context).size.width,
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
              } on Error catch (e) {
                debugPrint(e.toString());
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

  Widget dailyChart() {
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      height: 150,
      child: charts.BarChart(
        dailyChartData,
        animate: true,
        defaultRenderer: charts.BarRendererConfig<String>(
            strokeWidthPx: 0, stackedBarPaddingPx: 0),
        defaultInteractions: true,
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
              } on Error catch (e) {
                debugPrint(e.toString());
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
      ),
    );
  }

  Future<void> getForecast(int deviceNumber, value) async {
    var predictions = await _airqoApiClient!.fetchForecast(deviceNumber);

    if (predictions.isNotEmpty) {
      var predictedValues = Predict.getMeasurements(
          predictions, widget.placeDetails.siteId, deviceNumber, true);
      var combined = value..addAll(predictedValues);

      setState(() {
        measurements = combined;
        hourlyChartData = insightsHourlyChartData(
            combined, widget.pollutant, widget.placeDetails);
      });
    }
  }

  Future<void> getMeasurements() async {
    await _airqoApiClient!
        .fetchSiteHistoricalMeasurements(
            widget.placeDetails.siteId, widget.daily)
        .then((value) => {
              if (value.isNotEmpty && mounted)
                {
                  setState(() {
                    selectedMeasurement =
                        InsightsChartData.historicalDataToInsightsData(
                            value.first, widget.pollutant, widget.placeDetails);
                    if (widget.daily) {
                      setState(() {
                        measurements = value;
                        dailyChartData = insightsDailyChartData(
                            value, widget.pollutant, widget.placeDetails);
                      });
                    } else {
                      setState(() {
                        measurements = value;
                        hourlyChartData = insightsHourlyChartData(
                            value, widget.pollutant, widget.placeDetails);
                      });

                      if (widget.pollutant == 'pm2.5') {
                        getForecast(value.first.deviceNumber, value);
                      }
                    }
                  }),
                }
            });
  }

  Widget hourlyChart() {
    return SizedBox(
      width: MediaQuery.of(context).size.width * 2.7,
      height: 150,
      child: charts.BarChart(
        hourlyChartData,
        animate: true,
        defaultRenderer: charts.BarRendererConfig<String>(
            strokeWidthPx: 0, stackedBarPaddingPx: 0),
        defaultInteractions: true,
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
              } on Error catch (e) {
                debugPrint(e.toString());
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
      ),
    );
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    getMeasurements();
    super.initState();
  }

  void updateUI(InsightsChartData insightsChartData) {
    widget.callBackFn(insightsChartData);
    setState(() {
      selectedMeasurement = insightsChartData;
    });
    var time = insightsChartData.time;

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
