import 'package:app/constants/config.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/predict.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/recomendation.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'custom_shimmer.dart';
import 'custom_widgets.dart';

class InsightsTabView extends StatefulWidget {
  final PlaceDetails placeDetails;
  final bool daily;

  const InsightsTabView(this.placeDetails, this.daily, {Key? key})
      : super(key: key);

  @override
  _InsightsTabViewState createState() => _InsightsTabViewState();
}

class _InsightsTabViewState extends State<InsightsTabView> {
  String _viewDay = 'today';
  String _pollutant = 'pm2.5';
  bool _showHeartAnimation = false;
  List<Recommendation> _recommendations = [];
  final DBHelper _dbHelper = DBHelper();
  final GlobalKey _globalKey = GlobalKey();
  final CustomAuth _customAuth = CustomAuth();
  final String _toggleToolTipText = 'Customize your air quality analytics '
      'with a single click ';
  final GlobalKey _toggleToolTipKey = GlobalKey();

  InsightsChartData? _selectedMeasurement;
  String _lastUpdated = '';
  bool _hasMeasurements = false;

  List<charts.Series<InsightsChartData, String>> _dailyPm2_5ChartData = [];
  List<charts.Series<InsightsChartData, String>> _hourlyPm2_5ChartData = [];

  List<charts.Series<InsightsChartData, String>> _dailyPm10ChartData = [];
  List<charts.Series<InsightsChartData, String>> _hourlyPm10ChartData = [];

  AirqoApiClient? _airqoApiClient;
  List<charts.TickSpec<String>> _hourlyStaticTicks = [];

  final String _forecastToolTipText = 'This icon turns blue when the selected '
      'bar on the graph is forecast.';
  final String _infoToolTipText = 'Tap this icon to understand what air '
      'quality analytics mean';

  final GlobalKey _forecastToolTipKey = GlobalKey();
  final GlobalKey _infoToolTipKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: Config.appColorBlue,
      onRefresh: () async {},
      child: Container(
          color: Config.appBodyColor,
          child: ListView(
            // crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const SizedBox(
                height: 18,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16, left: 16),
                child: Row(
                  children: [
                    Visibility(
                      visible: _hasMeasurements,
                      child: Text(
                        'AIR QUALITY'.toUpperCase(),
                        style: TextStyle(
                            fontSize: 12, color: Colors.black.withOpacity(0.3)),
                      ),
                    ),
                    Visibility(
                      visible: !_hasMeasurements,
                      child: textLoadingAnimation(18, 70),
                    ),
                    const Spacer(),
                    Visibility(
                      visible: !_hasMeasurements,
                      child: sizedContainerLoadingAnimation(32, 32, 8.0),
                    ),
                    Visibility(
                      visible: _hasMeasurements,
                      child: GestureDetector(
                        onTap: togglePollutant,
                        child: Container(
                          height: 32,
                          width: 32,
                          padding: const EdgeInsets.all(6.0),
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  const BorderRadius.all(Radius.circular(8.0)),
                              border: Border.all(color: Colors.transparent)),
                          child: SvgPicture.asset(
                            'assets/icon/toggle_icon.svg',
                            semanticsLabel: 'Toggle',
                            height: 16,
                            width: 20,
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(
                height: 20,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16, left: 16),
                child: RepaintBoundary(
                  key: _globalKey,
                  child: insightsGraph(),
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              Visibility(
                visible: !_hasMeasurements,
                child: Padding(
                  padding: const EdgeInsets.only(right: 16, left: 16),
                  child: containerLoadingAnimation(70.0, 8.0),
                ),
              ),
              Visibility(
                visible: _hasMeasurements,
                child: Padding(
                  padding: const EdgeInsets.only(right: 16, left: 16),
                  child: Container(
                    padding: const EdgeInsets.all(21.0),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0)),
                        border: Border.all(color: Colors.transparent)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        GestureDetector(
                          onTap: () {
                            shareGraph(
                                context, _globalKey, widget.placeDetails);
                          },
                          child: iconTextButton(
                              SvgPicture.asset(
                                'assets/icon/share_icon.svg',
                                semanticsLabel: 'Share',
                                color: Config.greyColor,
                              ),
                              'Share'),
                        ),
                        const SizedBox(
                          width: 60,
                        ),
                        Consumer<PlaceDetailsModel>(
                          builder: (context, placeDetailsModel, child) {
                            return GestureDetector(
                              onTap: () async {
                                updateFavPlace();
                              },
                              child: iconTextButton(getHeartIcon(), 'Favorite'),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(
                height: 36,
              ),
              Visibility(
                visible: (_viewDay == 'today' || _viewDay == 'tomorrow') &&
                    _recommendations.isEmpty,
                child: Padding(
                    padding: const EdgeInsets.only(right: 16, left: 16),
                    child: Row(
                      children: [
                        textLoadingAnimation(20, 185),
                      ],
                    )),
              ),
              if (_viewDay == 'today' || _viewDay == 'tomorrow')
                Visibility(
                  visible: _recommendations.isNotEmpty,
                  child: Padding(
                    padding: const EdgeInsets.only(right: 16, left: 16),
                    child: Text(
                      _viewDay == 'today'
                          ? 'Today’s health tips'
                          : 'Tomorrow’s health tips',
                      textAlign: TextAlign.left,
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              const SizedBox(
                height: 11,
              ),
              Visibility(
                visible: (_viewDay == 'today' || _viewDay == 'tomorrow') &&
                    _recommendations.isNotEmpty,
                child: SizedBox(
                  height: 128,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding:
                              const EdgeInsets.only(left: 16.0, right: 8.0),
                          child: recommendationContainer(
                              _recommendations[index], context),
                        );
                      } else if (index == (_recommendations.length - 1)) {
                        return Padding(
                          padding:
                              const EdgeInsets.only(left: 8.0, right: 16.0),
                          child: recommendationContainer(
                              _recommendations[index], context),
                        );
                      } else {
                        return Padding(
                          padding: const EdgeInsets.only(left: 8.0, right: 8.0),
                          child: recommendationContainer(
                              _recommendations[index], context),
                        );
                      }
                    },
                    itemCount: _recommendations.length,
                  ),
                ),
              ),
              Visibility(
                visible: (_viewDay == 'today' || _viewDay == 'tomorrow') &&
                    _recommendations.isEmpty,
                child: SizedBox(
                  height: 128,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      const SizedBox(
                        width: 16,
                      ),
                      sizedContainerLoadingAnimation(128.0, 304, 16.0),
                      const SizedBox(
                        width: 16,
                      ),
                      sizedContainerLoadingAnimation(128.0, 304, 16.0),
                      const SizedBox(
                        width: 16,
                      ),
                      sizedContainerLoadingAnimation(128.0, 304, 16.0),
                      const SizedBox(
                        width: 16,
                      ),
                      sizedContainerLoadingAnimation(128.0, 304, 16.0),
                      const SizedBox(
                        width: 16,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(
                height: 11,
              ),
            ],
          )),
    );
  }

  Widget getHeartIcon() {
    if (_showHeartAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset('assets/lottie/animated_heart.json',
            repeat: false, reverse: false, animate: true, fit: BoxFit.cover),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        if (PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces, widget.placeDetails)) {
          return SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 16.67,
            width: 16.67,
          );
        }
        return SvgPicture.asset(
          'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
  }

  @override
  void initState() {
    _initialize();
    super.initState();
  }

  Widget insightsGraph() {
    if (!_hasMeasurements) {
      return containerLoadingAnimation(290.0, 8.0);
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
                                  _selectedMeasurement!.time, widget.daily),
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
                      GestureDetector(
                        onTap: () {
                          showTipText(_infoToolTipText, _infoToolTipKey,
                              context, () {}, false);
                        },
                        child: insightsAvatar(
                            context, _selectedMeasurement!, 64, _pollutant),
                      )
                    ],
                  ),
                  widget.daily ? _dailyChart() : _hourlyChart(),
                  const SizedBox(
                    height: 13.0,
                  ),
                  // Visibility(
                  //   visible: widget.daily,
                  //   child: _hourlyChart(),
                  // ),
                  Visibility(
                    visible: widget.daily,
                    child: const SizedBox(
                      height: 13.0,
                    ),
                  ),
                  Visibility(
                    visible: !widget.daily,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                            constraints: BoxConstraints(
                                maxWidth:
                                    MediaQuery.of(context).size.width / 2),
                            child: Text(
                              _lastUpdated,
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
                  GestureDetector(
                    onTap: () {
                      showTipText(_infoToolTipText, _infoToolTipKey, context,
                          () {}, false);
                    },
                    child: Visibility(
                      visible: _selectedMeasurement!.available,
                      child: Container(
                        padding:
                            const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                        constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width / 2),
                        decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(40.0)),
                            color: _selectedMeasurement!.time
                                    .isAfter(DateTime.now())
                                ? Config.appColorPaleBlue
                                : _pollutant == 'pm2.5'
                                    ? pm2_5ToColor(_selectedMeasurement!.value)
                                        .withOpacity(0.4)
                                    : pm10ToColor(_selectedMeasurement!.value)
                                        .withOpacity(0.4),
                            border: Border.all(color: Colors.transparent)),
                        child: Text(
                          _pollutant == 'pm2.5'
                              ? pm2_5ToString(_selectedMeasurement!.value)
                              : pm10ToString(_selectedMeasurement!.value),
                          maxLines: 1,
                          textAlign: TextAlign.start,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 14,
                            color: _selectedMeasurement!.time
                                    .isAfter(DateTime.now())
                                ? Config.appColorBlue
                                : _pollutant == 'pm2.5'
                                    ? pm2_5TextColor(
                                        _selectedMeasurement!.value)
                                    : pm10TextColor(
                                        _selectedMeasurement!.value),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: !_selectedMeasurement!.available,
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color: Config.greyColor.withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: Text(
                        'Not Available',
                        maxLines: 1,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: Config.darkGreyColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(
                    width: 8,
                  ),
                  Visibility(
                      visible: _selectedMeasurement!.available,
                      child: GestureDetector(
                        onTap: () {
                          pmInfoDialog(context, _selectedMeasurement!.value);
                        },
                        child: SvgPicture.asset(
                          'assets/icon/info_icon.svg',
                          semanticsLabel: 'Pm2.5',
                          height: 20,
                          width: 20,
                          key: _infoToolTipKey,
                        ),
                      )),
                  const Spacer(),
                  Row(
                    children: [
                      Container(
                          height: 10,
                          width: 10,
                          key: _forecastToolTipKey,
                          decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _selectedMeasurement!.time
                                      .isAfter(DateTime.now())
                                  ? Config.appColorBlue
                                  : Config.appColorPaleBlue,
                              border: Border.all(color: Colors.transparent))),
                      const SizedBox(
                        width: 8.0,
                      ),
                      GestureDetector(
                        onTap: () {
                          showTipText(_forecastToolTipText, _forecastToolTipKey,
                              context, () {}, false);
                        },
                        child: Text(
                          'Forecast',
                          style: TextStyle(
                              fontSize: 12, color: Config.appColorBlue),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ));
  }

  void togglePollutant() {
    setState(() {
      _pollutant = _pollutant == 'pm2.5' ? 'pm10' : 'pm2.5';
    });
  }

  void updateFavPlace() async {
    setState(() {
      _showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () async {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _dbHelper.updateFavouritePlaces(
        widget.placeDetails, context, _customAuth.getId());
  }

  Widget _dailyChart() {
    var staticTicks = <charts.TickSpec<String>>[];
    var daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (var day in daysList) {
      staticTicks.add(charts.TickSpec(day,
          label: day,
          style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(Config.greyColor))));
    }

    return SizedBox(
      width: MediaQuery.of(context).size.width,
      height: 150,
      child: charts.BarChart(
        _pollutant == 'pm2.5' ? _dailyPm2_5ChartData : _dailyPm10ChartData,
        animate: true,
        defaultRenderer: charts.BarRendererConfig<String>(
            strokeWidthPx: 0, stackedBarPaddingPx: 0),
        defaultInteractions: true,
        behaviors: [
          charts.LinePointHighlighter(
              showHorizontalFollowLine:
                  charts.LinePointHighlighterFollowLineType.none,
              showVerticalFollowLine:
                  charts.LinePointHighlighterFollowLineType.nearest),
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
                  _updateUI(model.selectedSeries[0].data[value]);
                }
              } on Error catch (e) {
                debugPrint(e.toString());
              }
            }
          })
        ],
        domainAxis: charts.OrdinalAxisSpec(
            tickProviderSpec:
                charts.StaticOrdinalTickProviderSpec(staticTicks)),
        primaryMeasureAxis: charts.NumericAxisSpec(
          tickProviderSpec: charts.StaticNumericTickProviderSpec(
            <charts.TickSpec<double>>[
              charts.TickSpec<double>(0,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(125,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(250,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(375,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(500,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _fetchHourlyMeasurements() async {
    var dbMeasurements =
        await _dbHelper.getInsightsChartData(widget.placeDetails.getName());
    if (dbMeasurements.isNotEmpty) {
      var hourlyMeasurements = dbMeasurements
          .where((element) => element.frequency == 'hourly')
          .toList();
      var pm25Data = hourlyMeasurements
          .where((element) => element.pollutant == 'pm2.5')
          .toList();
      var pm10Data = hourlyMeasurements
          .where((element) => element.pollutant == 'pm10')
          .toList();
      setState(() {
        _hourlyPm2_5ChartData = insightsHourlyChartData(
            [], 'pm2.5', widget.placeDetails, pm25Data, []);
        _hourlyPm10ChartData = insightsHourlyChartData(
            [], 'pm10', widget.placeDetails, pm10Data, []);
      });
    } else {
      setState(() {
        _hourlyPm2_5ChartData =
            insightsHourlyChartData([], 'pm2.5', widget.placeDetails, [], []);
        _hourlyPm10ChartData =
            insightsHourlyChartData([], 'pm10', widget.placeDetails, [], []);
      });
    }

    var measurements = await _airqoApiClient!.fetchSiteHistoricalMeasurements(
        widget.placeDetails.siteId, widget.daily);

    if (!mounted) {
      return;
    }

    if (measurements.isEmpty) {
      return;
    }

    setState(() {
      _hourlyPm10ChartData = insightsHourlyChartData(
          measurements, 'pm10', widget.placeDetails, [], measurements);
      _hourlyPm2_5ChartData = insightsHourlyChartData(
          measurements, 'pm2.5', widget.placeDetails, [], measurements);
    });
  }

  Future<void> _fetchMeasurements() async {
    var measurements = await _airqoApiClient!.fetchSiteHistoricalMeasurements(
        widget.placeDetails.siteId, widget.daily);

    if (widget.daily) {
      var siteTodayMeasurements =
          await _dbHelper.getSiteLatestMeasurements(widget.placeDetails.siteId);
      if (siteTodayMeasurements != null) {
        var relatedDate = DateTime.parse(siteTodayMeasurements.time);
        var hour = relatedDate.hour.toString().length >= 2
            ? relatedDate.hour.toString()
            : '0${relatedDate.hour}';
        siteTodayMeasurements.time =
            '${DateFormat('yyyy-MM-dd').format(relatedDate)}T$hour:00:00Z';
        measurements
          ..removeWhere((element) {
            return relatedDate.day == DateTime.parse(element.time).day;
          })
          ..add(siteTodayMeasurements.toHistorical());
      }
    }

    if (!mounted) {
      return;
    }

    if (measurements.isEmpty && _hasMeasurements) {
      return;
    }

    if (widget.daily) {
      setState(() {
        _dailyPm2_5ChartData = insightsDailyChartData(
            measurements, 'pm2.5', widget.placeDetails, [], measurements);
        _dailyPm10ChartData = insightsDailyChartData(
            measurements, 'pm10', widget.placeDetails, [], measurements);
      });

      if (_pollutant == 'pm2.5') {
        await _setSelectedMeasurement(_dailyPm2_5ChartData);
      } else {
        await _setSelectedMeasurement(_dailyPm10ChartData);
      }

      await _saveMeasurements(_dailyPm2_5ChartData.first.data);
      await _saveMeasurements(_dailyPm2_5ChartData.first.data);
    } else {
      setState(() {
        _hourlyPm10ChartData = insightsHourlyChartData(
            measurements, 'pm10', widget.placeDetails, [], measurements);
      });
      if (measurements.isNotEmpty) {
        await _getForecast(measurements.first.deviceNumber, measurements);
      } else {
        setState(() {
          _hourlyPm2_5ChartData = insightsHourlyChartData(
              measurements, 'pm2.5', widget.placeDetails, [], measurements);
        });
        if (_pollutant == 'pm2.5') {
          await _setSelectedMeasurement(_hourlyPm2_5ChartData);
        } else {
          await _setSelectedMeasurement(_hourlyPm10ChartData);
        }
      }
    }
  }

  Future<void> _getDBMeasurements() async {
    var measurements =
        await _dbHelper.getInsightsChartData(widget.placeDetails.getName());
    if (measurements.isEmpty) {
      return;
    }
    await _setMeasurements(measurements);
  }

  Future<void> _getForecast(
      int deviceNumber, List<HistoricalMeasurement> measurements) async {
    var predictions = await _airqoApiClient!.fetchForecast(deviceNumber);

    if (!mounted) {
      return;
    }

    if (predictions.isEmpty) {
      setState(() {
        _hourlyPm2_5ChartData = insightsHourlyChartData(
            measurements, 'pm2.5', widget.placeDetails, [], measurements);
      });
    } else {
      var combinedMeasurements = <HistoricalMeasurement>[...measurements];
      var predictedValues = Predict.getMeasurements(
          predictions, widget.placeDetails.siteId, deviceNumber);

      for (var measurement in measurements) {
        predictedValues.removeWhere((predict) =>
            (DateTime.parse(predict.time).hour <=
                DateTime.parse(measurement.time).hour) ||
            (DateTime.parse(predict.time).day !=
                DateTime.parse(measurement.time).day));
      }
      combinedMeasurements.addAll(predictedValues);

      if (mounted) {
        setState(() {
          _hourlyPm2_5ChartData = insightsHourlyChartData(combinedMeasurements,
              'pm2.5', widget.placeDetails, [], measurements);
          _hasMeasurements = true;
        });
      }
    }

    if (mounted) {
      if (_pollutant == 'pm2.5') {
        await _setSelectedMeasurement(_hourlyPm2_5ChartData);
      } else {
        await _setSelectedMeasurement(_hourlyPm10ChartData);
      }

      await _saveMeasurements(_hourlyPm2_5ChartData.first.data);
      await _saveMeasurements(_hourlyPm10ChartData.first.data);
    }
  }

  void _getHourlyTicks() {
    setState(() {
      _hourlyStaticTicks = [];
    });
    var staticTicks = <charts.TickSpec<String>>[];
    for (var i = 0; i <= 24; i++) {
      if ((i == 0) || (i == 6) || (i == 12) || (i == 18)) {
        staticTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(Config.greyColor))));
      } else {
        staticTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(Colors.transparent))));
      }
    }
    setState(() {
      _hourlyStaticTicks = staticTicks;
    });
  }

  Widget _hourlyChart() {
    _getHourlyTicks();
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      height: 150,
      child: charts.BarChart(
        _pollutant == 'pm2.5' ? _hourlyPm2_5ChartData : _hourlyPm10ChartData,
        animate: true,
        defaultRenderer: charts.BarRendererConfig<String>(
            strokeWidthPx: 0, stackedBarPaddingPx: 0),
        defaultInteractions: true,
        behaviors: [
          charts.LinePointHighlighter(
              showHorizontalFollowLine:
                  charts.LinePointHighlighterFollowLineType.none,
              showVerticalFollowLine:
                  charts.LinePointHighlighterFollowLineType.nearest),
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
                  _updateUI(model.selectedSeries[0].data[value]);
                }
              } on Error catch (e) {
                debugPrint(e.toString());
              }
            }
          })
        ],
        // domainAxis: const charts.OrdinalAxisSpec(
        //     showAxisLine: true,
        //     renderSpec: charts.NoneRenderSpec()
        // ),
        domainAxis: charts.OrdinalAxisSpec(
            tickProviderSpec:
                charts.StaticOrdinalTickProviderSpec(_hourlyStaticTicks)),

        primaryMeasureAxis: charts.NumericAxisSpec(
          tickProviderSpec: charts.StaticNumericTickProviderSpec(
            <charts.TickSpec<double>>[
              charts.TickSpec<double>(0,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(125,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(250,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(375,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
              charts.TickSpec<double>(500,
                  style: charts.TextStyleSpec(
                      color: charts.ColorUtil.fromDartColor(Config.greyColor))),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    _airqoApiClient = AirqoApiClient(context);
    await _getDBMeasurements();
    await _fetchMeasurements();
  }

  Future<void> _saveMeasurements(
      List<InsightsChartData> insightsChartData) async {
    await _dbHelper.insertInsightsChartData(insightsChartData);
  }

  Future<void> _setMeasurements(
      List<InsightsChartData> insightsChartData) async {
    if (insightsChartData.isEmpty || !mounted) {
      return;
    }

    try {
      if (widget.daily) {
        var dailyMeasurements = insightsChartData
            .where((element) => element.frequency == 'daily')
            .toList();
        var pm25Data = dailyMeasurements
            .where((element) => element.pollutant == 'pm2.5')
            .toList();
        var pm10Data = dailyMeasurements
            .where((element) => element.pollutant == 'pm10')
            .toList();
        setState(() {
          _dailyPm2_5ChartData = insightsDailyChartData(
              [], 'pm2.5', widget.placeDetails, pm25Data, []);
          _dailyPm10ChartData = insightsDailyChartData(
              [], 'pm10', widget.placeDetails, pm10Data, []);
        });

        if (_pollutant == 'pm2.5') {
          await _setSelectedMeasurement(_dailyPm2_5ChartData);
        } else {
          await _setSelectedMeasurement(_dailyPm10ChartData);
        }
      } else {
        var hourlyMeasurements = insightsChartData
            .where((element) => element.frequency == 'hourly')
            .toList();
        var pm25Data = hourlyMeasurements
            .where((element) => element.pollutant == 'pm2.5')
            .toList();
        var pm10Data = hourlyMeasurements
            .where((element) => element.pollutant == 'pm10')
            .toList();
        setState(() {
          _hourlyPm2_5ChartData = insightsHourlyChartData(
              [], 'pm2.5', widget.placeDetails, pm25Data, []);
          _hourlyPm10ChartData = insightsHourlyChartData(
              [], 'pm10', widget.placeDetails, pm10Data, []);
        });
        if (_pollutant == 'pm2.5') {
          await _setSelectedMeasurement(_hourlyPm2_5ChartData);
        } else {
          await _setSelectedMeasurement(_hourlyPm10ChartData);
        }
      }
    } catch (e) {
      debugPrint(e.toString());
      return;
    }

    _updateSelectedMeasurement(_selectedMeasurement!);
    if (_lastUpdated == '') {
      setState(() {
        _lastUpdated = dateToString(_selectedMeasurement!.time.toString());
      });
    }
  }

  Future<void> _setSelectedMeasurement(
      List<charts.Series<InsightsChartData, String>> chartData) async {
    try {
      if (chartData.isEmpty) {
        throw Exception('Chart data is empty');
      }

      var lastAvailable = chartData.first.data
          .where((element) => element.available && !element.isForecast);
      if (lastAvailable.isEmpty) {
        lastAvailable = chartData.first.data;
      }
      setState(() {
        _selectedMeasurement = lastAvailable.last;
      });

      _updateSelectedMeasurement(_selectedMeasurement!);

      if (_lastUpdated == '') {
        setState(() {
          _lastUpdated = dateToString(_selectedMeasurement!.time.toString());
        });
      }

      setState(() {
        _hasMeasurements = true;
      });

      // if (widget.daily) {
      //   await _fetchHourlyMeasurements();
      // }
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      debugPrint(stackTrace.toString());
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  void _updateSelectedMeasurement(InsightsChartData insightsChartData) {
    var time = insightsChartData.time;
    var tomorrow = DateTime.now().add(const Duration(days: 1));
    if (insightsChartData.available) {
      setState(() {
        _recommendations = getHealthRecommendations(insightsChartData.value);
      });
      if (time.day == DateTime.now().day) {
        setState(() {
          _viewDay = 'today';
        });
      } else if (time.day == tomorrow.day) {
        setState(() {
          _viewDay = 'tomorrow';
        });
      } else {
        setState(() {
          _viewDay = '';
        });
      }
    } else {
      setState(() {
        _viewDay = '';
        _recommendations = [];
      });
    }
    // if (widget.daily) {
    //   _fetchHourlyMeasurements();
    // }
  }

  void _updateUI(InsightsChartData insightsChartData) {
    _updateSelectedMeasurement(insightsChartData);
    setState(() {
      _selectedMeasurement = insightsChartData;
    });
    if (_lastUpdated == '') {
      setState(() {
        _lastUpdated =
            _selectedMeasurement!.time.weekday == DateTime.now().weekday
                ? dateToString(_selectedMeasurement!.time.toString())
                : 'Updated today';
      });
    }
    var time = insightsChartData.time;

    if (time.day == DateTime.now().day) {
      setState(() {
        _viewDay = 'today';
      });
    } else if ((time.month == DateTime.now().month) &&
        (time.day + 1) == DateTime.now().day) {
      setState(() {
        _viewDay = 'tomorrow';
      });
    }
  }
}
