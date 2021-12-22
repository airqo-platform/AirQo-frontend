import 'package:app/constants/config.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/place_details.dart';
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
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import 'custom_shimmer.dart';
import 'custom_widgets.dart';

class InsightsTab extends StatefulWidget {
  final PlaceDetails placeDetails;
  final bool daily;

  const InsightsTab(this.placeDetails, this.daily, {Key? key})
      : super(key: key);

  @override
  _InsightsTabState createState() => _InsightsTabState();
}

class _InsightsTabState extends State<InsightsTab> {
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
  ScrollController _controller = ScrollController();

  Insights? _selectedMeasurement;
  String _lastUpdated = '';
  bool _hasMeasurements = false;

  List<List<charts.Series<Insights, String>>> _dailyPm2_5ChartData = [];
  List<List<charts.Series<Insights, String>>> _hourlyPm2_5ChartData = [];

  List<List<charts.Series<Insights, String>>> _dailyPm10ChartData = [];
  List<List<charts.Series<Insights, String>>> _hourlyPm10ChartData = [];

  AirqoApiClient? _airqoApiClient;
  List<charts.TickSpec<String>> _hourlyStaticTicks = [];
  List<charts.TickSpec<String>> _dailyStaticTicks = [];

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
              // Padding(
              //   padding: const EdgeInsets.only(right: 16, left: 16),
              //   child: RepaintBoundary(
              //     key: _globalKey,
              //     child: insightsGraph(),
              //   ),
              // ),
              Padding(
                padding: const EdgeInsets.only(right: 16, left: 16),
                child: insightsGraph(),
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
                        child: insightsTabAvatar(
                            context, _selectedMeasurement!, 64, _pollutant),
                      )
                    ],
                  ),
                  widget.daily
                      ? SizedBox(
                          height: 160,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            controller: _controller,
                            itemBuilder: (context, index) {
                              return _dailyChart(_dailyPm2_5ChartData[index],
                                  _dailyPm10ChartData[index]);
                            },
                            itemCount: _dailyPm2_5ChartData.toList().length,
                          ),
                        )
                      : SizedBox(
                          height: 160,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            controller: _controller,
                            itemBuilder: (context, index) {
                              return _hourlyChart(
                                  _hourlyPm2_5ChartData.toList()[index],
                                  _hourlyPm10ChartData.toList()[index]);
                            },
                            itemCount: _hourlyPm2_5ChartData.toList().length,
                          ),
                        ),

                  // widget.daily ?
                  // _dailyChart(_dailyPm2_5ChartData, _dailyPm10ChartData) :
                  // _hourlyChart(),
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
                      visible: !_selectedMeasurement!.isEmpty,
                      child: Container(
                        padding:
                            const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                        constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width / 2),
                        decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(40.0)),
                            color: _selectedMeasurement!.isForecast
                                ? Config.appColorPaleBlue
                                : _pollutant == 'pm2.5'
                                    ? pm2_5ToColor(_selectedMeasurement!
                                            .getChartValue(_pollutant))
                                        .withOpacity(0.4)
                                    : pm10ToColor(_selectedMeasurement!
                                            .getChartValue(_pollutant))
                                        .withOpacity(0.4),
                            border: Border.all(color: Colors.transparent)),
                        child: Text(
                          _pollutant == 'pm2.5'
                              ? pm2_5ToString(_selectedMeasurement!
                                  .getChartValue(_pollutant))
                              : pm10ToString(_selectedMeasurement!
                                  .getChartValue(_pollutant)),
                          maxLines: 1,
                          textAlign: TextAlign.start,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 14,
                            color: _selectedMeasurement!.isForecast
                                ? Config.appColorBlue
                                : _pollutant == 'pm2.5'
                                    ? pm2_5TextColor(_selectedMeasurement!
                                        .getChartValue(_pollutant))
                                    : pm10TextColor(_selectedMeasurement!
                                        .getChartValue(_pollutant)),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: _selectedMeasurement!.isEmpty,
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
                      visible: !_selectedMeasurement!.isEmpty,
                      child: GestureDetector(
                        onTap: () {
                          pmInfoDialog(context,
                              _selectedMeasurement!.getChartValue(_pollutant));
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
                              color: _selectedMeasurement!.isForecast
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

  void _createChartTicks() {
    setState(() {
      _hourlyStaticTicks = [];
      _dailyStaticTicks = [];
    });

    var hourlyTicks = <charts.TickSpec<String>>[];
    var labels = <int>[0, 6, 12, 18];

    for (var i = 0; i <= 24; i++) {
      if (labels.contains(i)) {
        hourlyTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(Config.greyColor))));
      } else {
        hourlyTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(Colors.transparent))));
      }
    }
    setState(() {
      _hourlyStaticTicks = hourlyTicks;
    });

    var dailyTicks = <charts.TickSpec<String>>[];
    var daysList = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (var day in daysList) {
      dailyTicks.add(charts.TickSpec(day,
          label: day,
          style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(Config.greyColor))));
    }
    setState(() {
      _dailyStaticTicks = dailyTicks;
    });
  }

  Widget _dailyChart(List<charts.Series<Insights, String>> pm2_5ChartData,
      List<charts.Series<Insights, String>> pm10ChartData) {
    return LayoutBuilder(
        builder: (BuildContext buildContext, BoxConstraints constraints) {
      return SizedBox(
        width: MediaQuery.of(buildContext).size.width - 50,
        height: 150,
        child: charts.BarChart(
          _pollutant == 'pm2.5' ? pm2_5ChartData : pm10ChartData,
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
                } on Error catch (exception, stackTrace) {
                  debugPrint(
                      '${exception.toString()}\n${stackTrace.toString()}');
                }
              }
            })
          ],
          domainAxis: charts.OrdinalAxisSpec(
              tickProviderSpec:
                  charts.StaticOrdinalTickProviderSpec(_dailyStaticTicks)),
          primaryMeasureAxis: charts.NumericAxisSpec(
            tickProviderSpec: charts.StaticNumericTickProviderSpec(
              <charts.TickSpec<double>>[
                charts.TickSpec<double>(0,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(125,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(250,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(375,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(500,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
              ],
            ),
          ),
        ),
      );
    });
  }

  Future<void> _fetchDBInsights() async {
    var frequency = widget.daily ? 'daily' : 'hourly';
    var insights =
        await _dbHelper.getInsights(widget.placeDetails.siteId, frequency);
    if (insights.isEmpty) {
      return;
    }
    await _setInsights(insights);
  }

  Future<void> _fetchInsights() async {
    var insights = await _airqoApiClient!
        .fetchSiteInsights(widget.placeDetails.siteId, widget.daily);

    if (insights.isEmpty || !mounted) {
      return;
    }

    await _setInsights(insights);
    await _saveInsights(insights, widget.daily);

    var frequencyInsights = await _airqoApiClient!
        .fetchSiteInsights(widget.placeDetails.siteId, !widget.daily);
    await _saveInsights(frequencyInsights, !widget.daily);
  }

  Widget _hourlyChart(List<charts.Series<Insights, String>> pm2_5ChartData,
      List<charts.Series<Insights, String>> pm10ChartData) {
    return LayoutBuilder(
        builder: (BuildContext buildContext, BoxConstraints constraints) {
      return SizedBox(
        width: MediaQuery.of(buildContext).size.width - 50,
        height: 150,
        child: charts.BarChart(
          _pollutant == 'pm2.5' ? pm2_5ChartData : pm10ChartData,
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
                } on Error catch (exception, stackTrace) {
                  debugPrint(
                      '${exception.toString()}\n${stackTrace.toString()}');
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
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(125,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(250,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(375,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
                charts.TickSpec<double>(500,
                    style: charts.TextStyleSpec(
                        color:
                            charts.ColorUtil.fromDartColor(Config.greyColor))),
              ],
            ),
          ),
        ),
      );
    });
  }

  Future<void> _initialize() async {
    _airqoApiClient = AirqoApiClient(context);
    _createChartTicks();
    await _fetchDBInsights();
    await _fetchInsights();
  }

  Future<void> _saveInsights(List<Insights> insights, bool daily) async {
    var frequency = daily ? 'daily' : 'hourly';
    await _dbHelper.insertInsights(
        insights, widget.placeDetails.siteId, frequency);
  }

  Future<void> _setInsights(List<Insights> insights) async {
    if (insights.isEmpty || !mounted) {
      return;
    }

    if (widget.daily) {
      var data = insights.where((element) => element.frequency == 'daily');
      setState(() {
        _dailyPm2_5ChartData =
            insightsChartData(List.from(data), 'pm2.5', 'daily');
        _dailyPm10ChartData =
            insightsChartData(List.from(data), 'pm10', 'daily');
        _selectedMeasurement = _dailyPm2_5ChartData.first.first.data.first;
        _hasMeasurements = true;
      });

      for (var element in _dailyPm2_5ChartData) {
        if (element.first.data.first.time == DateTime.now()) {
          _selectedMeasurement = element.first.data.last;
          setState(() {
            _controller = ScrollController(
                initialScrollOffset:
                    double.parse('${_dailyPm2_5ChartData.indexOf(element)}'));
          });
          break;
        }
      }

      if (_pollutant == 'pm2.5') {
        await _setSelectedMeasurement(_dailyPm2_5ChartData);
      } else {
        await _setSelectedMeasurement(_dailyPm10ChartData);
      }
    } else {
      var firstDay = DateTime.now().getFirstDateOfMonth();
      var lastDay = DateTime.now().getLastDateOfMonth();
      var data = insights.where((element) {
        var date = element.time;
        if (element.frequency == 'hourly' &&
            (date == firstDay ||
                date == lastDay ||
                date.isAfter(firstDay) ||
                date.isBefore(lastDay))) {
          return true;
        }
        return false;
      });
      setState(() {
        _hourlyPm2_5ChartData =
            insightsChartData(List.from(data), 'pm2.5', 'hourly');
        _hourlyPm10ChartData =
            insightsChartData(List.from(data), 'pm10', 'hourly');
        _selectedMeasurement = _hourlyPm2_5ChartData.first.first.data.first;
        _hasMeasurements = true;
      });

      Future.delayed(const Duration(seconds: 3), () {
        for (var element in _hourlyPm2_5ChartData) {
          if (element.first.data.first.time == DateTime.now()) {
            _selectedMeasurement = element.first.data.last;
            _controller.animateTo(
                double.parse('${_hourlyPm2_5ChartData.indexOf(element)}'),
                duration: const Duration(milliseconds: 300),
                curve: Curves.elasticOut);
            // setState(() {
            //   _controller = ScrollController(initialScrollOffset:
            //   double.parse('${_hourlyPm2_5ChartData.indexOf(element)}'));
            // });
            break;
          }
        }
      });
      // for(var element in _hourlyPm2_5ChartData){
      //   if(element.first.data.first.time == DateTime.now()){
      //     _selectedMeasurement = element.first.data.last;
      //     await _controller.animateTo(
      //         double.parse('${_hourlyPm2_5ChartData.indexOf(element)}'),
      //         duration: const Duration(milliseconds: 300),
      //         curve: Curves.elasticOut);
      //     // setState(() {
      //     //   _controller = ScrollController(initialScrollOffset:
      //     //   double.parse('${_hourlyPm2_5ChartData.indexOf(element)}'));
      //     // });
      //     break;
      //   }
      // }

      // var todayInsights = _hourlyPm2_5ChartData.toList().where((element) =>
      // element.first.data.first.time == DateTime.now());
      // print(todayInsights.toList().first.first.data.first.time);

      if (_pollutant == 'pm2.5') {
        await _setSelectedMeasurement(_hourlyPm2_5ChartData);
      } else {
        await _setSelectedMeasurement(_hourlyPm10ChartData);
      }
    }
  }

  Future<void> _setSelectedMeasurement(
      List<List<charts.Series<Insights, String>>> chartData) async {
    // try {
    //   if (chartData.isEmpty) {
    //     throw Exception('Chart data is empty');
    //   }
    //
    //   var lastAvailable = chartData.first.data
    //       .where((element) => !element.isEmpty && !element.isForecast);
    //   if (lastAvailable.isEmpty) {
    //     lastAvailable = chartData.first.data;
    //   }
    //   setState(() {
    //     _selectedMeasurement = lastAvailable.last;
    //   });
    //
    //   _updateSelectedMeasurement(_selectedMeasurement!);
    //
    //   if (_lastUpdated == '') {
    //     setState(() {
    //       _lastUpdated = dateToString(_selectedMeasurement!.time.toString());
    //     });
    //   }
    //
    //   setState(() {
    //     _hasMeasurements = true;
    //   });
    //
    //   // if (widget.daily) {
    //   //   await _fetchHourlyMeasurements();
    //   // }
    // } catch (exception, stackTrace) {
    //   debugPrint(exception.toString());
    //   debugPrint(stackTrace.toString());
    //   await Sentry.captureException(
    //     exception,
    //     stackTrace: stackTrace,
    //   );
    // }
  }

  void _updateSelectedMeasurement(Insights insightsChartData) {
    var time = insightsChartData.time;
    var tomorrow = DateTime.now().add(const Duration(days: 1));
    if (!insightsChartData.isEmpty) {
      setState(() {
        _recommendations = getHealthRecommendations(
            insightsChartData.getChartValue(_pollutant));
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

  void _updateUI(Insights insights) {
    _updateSelectedMeasurement(insights);
    setState(() {
      _selectedMeasurement = insights;
    });
    if (_lastUpdated == '') {
      setState(() {
        _lastUpdated =
            _selectedMeasurement!.time.weekday == DateTime.now().weekday
                ? dateToString(_selectedMeasurement!.time.toString())
                : 'Updated today';
      });
    }
    var time = insights.time;

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
