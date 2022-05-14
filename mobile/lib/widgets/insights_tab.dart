import 'package:app/constants/config.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/recommendation.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../models/enum_constants.dart';
import '../services/native_api.dart';
import '../themes/light_theme.dart';
import 'custom_shimmer.dart';
import 'custom_widgets.dart';

class InsightsTab extends StatefulWidget {
  final PlaceDetails placeDetails;
  final Frequency frequency;

  const InsightsTab(this.placeDetails, this.frequency, {Key? key})
      : super(key: key);

  @override
  _InsightsTabState createState() => _InsightsTabState();
}

class _InsightsTabState extends State<InsightsTab> {
  bool _isTodayHealthTips = true;
  Pollutant _pollutant = Pollutant.pm2_5;
  bool _showHeartAnimation = false;
  List<Recommendation> _recommendations = [];

  final GlobalKey _globalKey = GlobalKey();
  final String _toggleToolTipText = 'Customize your air quality analytics '
      'with a single click ';
  int _currentItem = 0;
  Insights? _selectedMeasurement;
  String _lastUpdated = '';
  bool _hasMeasurements = false;

  List<List<charts.Series<Insights, String>>> _dailyPm2_5ChartData = [];
  List<List<charts.Series<Insights, String>>> _hourlyPm2_5ChartData = [];

  List<List<charts.Series<Insights, String>>> _dailyPm10ChartData = [];
  List<List<charts.Series<Insights, String>>> _hourlyPm10ChartData = [];

  List<charts.TickSpec<String>> _hourlyStaticTicks = [];
  List<charts.TickSpec<String>> _dailyStaticTicks = [];
  bool scrolling = false;

  final GlobalKey _forecastToolTipKey = GlobalKey();
  final GlobalKey _infoToolTipKey = GlobalKey();
  final GlobalKey _toggleToolTipKey = GlobalKey();

  final ItemScrollController _itemScrollController = ItemScrollController();
  final AppService _appService = AppService();
  String _titleDateTime = '';

  Map<String, Widget> miniChartsMap = {};
  String selectedMiniChart = DateFormat('yyyy-MM-dd').format(DateTime.now());

  @override
  Widget build(BuildContext context) {
    return refreshIndicator(
        sliverChildDelegate: SliverChildBuilderDelegate((context, index) {
          return _pageItems()[index];
        }, childCount: _pageItems().length),
        onRefresh: _refreshPage);
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
    super.initState();
    _initialize();
  }

  Widget insightsGraph() {
    if (!_hasMeasurements) {
      return containerLoadingAnimation(height: 290.0, radius: 8.0);
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
                            AutoSizeText(
                              _titleDateTime,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: CustomTextStyle.bodyText4(context)
                                  ?.copyWith(
                                      color: Config.appColorBlack
                                          .withOpacity(0.3)),
                            ),
                            AutoSizeText(
                              widget.placeDetails.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: CustomTextStyle.headline8(context)
                                  ?.copyWith(color: Config.appColorBlack),
                            ),
                            AutoSizeText(widget.placeDetails.location,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context)
                                    .textTheme
                                    .caption
                                    ?.copyWith(
                                        color: Config.appColorBlack
                                            .withOpacity(0.3))),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          ToolTip(context, ToolTipType.info).show(
                            widgetKey: _infoToolTipKey,
                          );
                        },
                        child: insightsTabAvatar(
                            context, _selectedMeasurement!, 64, _pollutant),
                      )
                    ],
                  ),
                  widget.frequency == Frequency.daily
                      ? SizedBox(
                          height: 160,
                          child: ScrollablePositionedList.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _dailyPm2_5ChartData.length,
                            itemBuilder: (context, index) {
                              return VisibilityDetector(
                                  key: Key(index.toString()),
                                  onVisibilityChanged:
                                      (VisibilityInfo visibilityInfo) {
                                    if ((visibilityInfo.visibleFraction >
                                            0.3) &&
                                        (_currentItem != index)) {
                                      setState(() {
                                        _currentItem = index;
                                      });
                                      _scrollToChart(
                                          _itemScrollController,
                                          _currentItem,
                                          _dailyPm2_5ChartData,
                                          null);
                                    }
                                  },
                                  child: _insightsChart(
                                      pm2_5ChartData:
                                          _dailyPm2_5ChartData[index],
                                      cornerRadius: 5,
                                      pm10ChartData:
                                          _dailyPm10ChartData[index]));
                            },
                            itemScrollController: _itemScrollController,
                          ),
                        )
                      : SizedBox(
                          height: 160,
                          child: ScrollablePositionedList.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _hourlyPm2_5ChartData.length,
                            itemBuilder: (context, index) {
                              return VisibilityDetector(
                                  key: Key(index.toString()),
                                  onVisibilityChanged:
                                      (VisibilityInfo visibilityInfo) {
                                    if ((visibilityInfo.visibleFraction >
                                            0.3) &&
                                        (_currentItem != index)) {
                                      setState(() {
                                        _currentItem = index;
                                      });
                                      _scrollToChart(
                                          _itemScrollController,
                                          _currentItem,
                                          _hourlyPm2_5ChartData,
                                          null);
                                    }
                                  },
                                  child: _insightsChart(
                                    pm10ChartData: _hourlyPm10ChartData[index],
                                    cornerRadius: 3,
                                    pm2_5ChartData:
                                        _hourlyPm2_5ChartData[index],
                                  ));
                            },
                            itemScrollController: _itemScrollController,
                          ),
                        ),
                  if (widget.frequency == Frequency.daily)
                    miniChartsMap[selectedMiniChart] == null
                        ? const SizedBox()
                        : miniChartsMap[selectedMiniChart] as Widget,
                  Visibility(
                    visible: _lastUpdated.isNotEmpty,
                    child: const SizedBox(
                      height: 13.0,
                    ),
                  ),
                  Visibility(
                    visible: _lastUpdated.isNotEmpty,
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
                      ToolTip(context, ToolTipType.info).show(
                        widgetKey: _infoToolTipKey,
                      );
                    },
                    child: Visibility(
                      visible: !_selectedMeasurement!.empty,
                      child: Container(
                        padding:
                            const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                        constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width / 2),
                        decoration: BoxDecoration(
                            borderRadius:
                                const BorderRadius.all(Radius.circular(40.0)),
                            color: _selectedMeasurement!.forecast
                                ? Config.appColorPaleBlue
                                : _pollutant == Pollutant.pm2_5
                                    ? pm2_5ToColor(_selectedMeasurement!
                                            .getChartValue(_pollutant))
                                        .withOpacity(0.4)
                                    : pm10ToColor(_selectedMeasurement!
                                            .getChartValue(_pollutant))
                                        .withOpacity(0.4),
                            border: Border.all(color: Colors.transparent)),
                        child: AutoSizeText(
                            _pollutant == Pollutant.pm2_5
                                ? pm2_5ToString(_selectedMeasurement!
                                        .getChartValue(_pollutant))
                                    .trimEllipsis()
                                : pm10ToString(_selectedMeasurement!
                                        .getChartValue(_pollutant))
                                    .trimEllipsis(),
                            maxLines: 1,
                            maxFontSize: 14,
                            textAlign: TextAlign.start,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.button2(context)?.copyWith(
                              color: _selectedMeasurement!.forecast
                                  ? Config.appColorBlue
                                  : _pollutant == Pollutant.pm2_5
                                      ? pm2_5TextColor(_selectedMeasurement!
                                          .getChartValue(_pollutant))
                                      : pm10TextColor(_selectedMeasurement!
                                          .getChartValue(_pollutant)),
                            )),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: _selectedMeasurement!.empty,
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
                      visible: !_selectedMeasurement!.empty,
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
                              color: _selectedMeasurement!.forecast
                                  ? Config.appColorBlue
                                  : Config.appColorPaleBlue,
                              border: Border.all(color: Colors.transparent))),
                      const SizedBox(
                        width: 8.0,
                      ),
                      GestureDetector(
                        onTap: () {
                          ToolTip(context, ToolTipType.forecast).show(
                            widgetKey: _forecastToolTipKey,
                          );
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

  Future<void> loadMiniCharts(DateTime defaultSelection) async {
    var hourlyInsights = await _appService.dbHelper
        .getInsights(widget.placeDetails.siteId, Frequency.hourly);

    if (hourlyInsights.isNotEmpty) {
      while (hourlyInsights.isNotEmpty) {
        var randomValue = hourlyInsights.first;

        var relatedDates = hourlyInsights.where((element) {
          return element.time.day == randomValue.time.day &&
              element.time.month == randomValue.time.month;
        }).toList();

        var pm2_5ChartData =
            insightsChartData(relatedDates, Pollutant.pm2_5, Frequency.hourly)
                .first;

        var pm10ChartData =
            insightsChartData(relatedDates, Pollutant.pm10, Frequency.hourly)
                .first;

        miniChartsMap[DateFormat('yyyy-MM-dd').format(randomValue.time)] =
            _insightsChart(
                pm10ChartData: pm10ChartData,
                pm2_5ChartData: pm2_5ChartData,
                cornerRadius: 3);

        hourlyInsights.removeWhere((element) =>
            element.time.day == randomValue.time.day &&
            element.time.month == randomValue.time.month);
      }

      setState(() {
        selectedMiniChart = DateFormat('yyyy-MM-dd').format(defaultSelection);
      });
    }
  }

  Future<void> _scrollToChart(
      ItemScrollController controller,
      int index,
      List<List<charts.Series<Insights, String>>> data,
      Duration? duration) async {
    if (controller.isAttached) {
      updateTitleDateTime(data[index]);
      await controller.scrollTo(
          index: index,
          duration: duration ?? const Duration(seconds: 1),
          curve: Curves.easeInOutCubic);
    } else {
      Future.delayed(const Duration(milliseconds: 10), () {
        if (!controller.isAttached) {
          return;
        }
        updateTitleDateTime(data[index]);
        controller.scrollTo(
            index: index,
            duration: duration ?? const Duration(seconds: 1),
            curve: Curves.easeInOutCubic);
      });
    }
  }

  void togglePollutant() {
    setState(() {
      _pollutant =
          _pollutant == Pollutant.pm2_5 ? Pollutant.pm10 : Pollutant.pm2_5;
    });
  }

  void updateFavPlace() async {
    setState(() {
      _showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _appService.updateFavouritePlace(widget.placeDetails, context);
  }

  void updateTitleDateTime(List<charts.Series<Insights, String>> data) {
    var dateTime = data.first.data.first.time;

    setState(() {
      _titleDateTime =
          insightsChartTitleDateTimeToString(dateTime, widget.frequency);
    });

    var insights = data.first.data
        .where((element) => !element.empty && !element.forecast)
        .toList();

    /// Recommendations
    if (insights.isEmpty) {
      setState(() {
        _recommendations = [];
        _selectedMeasurement = data.first.data.first;
      });
      return;
    }

    var lastAvailableInsight = insights.reduce((value, element) {
      if (value.time.isAfter(element.time)) {
        return value;
      }
      return element;
    });

    if (dateTime.isToday()) {
      setState(() {
        _isTodayHealthTips = true;
        _recommendations =
            getHealthRecommendations(lastAvailableInsight.pm2_5, _pollutant);
      });
    } else if (dateTime.isTomorrow()) {
      setState(() {
        _isTodayHealthTips = false;
        _recommendations =
            getHealthRecommendations(lastAvailableInsight.pm2_5, _pollutant);
      });
    } else {
      setState(() {
        _recommendations = [];
      });
    }

    /// Auto select measurement
    setState(() {
      _selectedMeasurement = lastAvailableInsight;
    });
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

  Future<void> _fetchDBInsights() async {
    var insights = await _appService.dbHelper
        .getInsights(widget.placeDetails.siteId, widget.frequency);
    if (insights.isNotEmpty) {
      await _setInsights(insights);
    }
  }

  Future<void> _fetchInsights() async {
    var insights = await _appService.fetchInsights([widget.placeDetails.siteId],
        frequency: widget.frequency);

    if (!_hasMeasurements && insights.isNotEmpty) {
      await _setInsights(insights);
    }
  }

  Future<void> _initialize() async {
    _createChartTicks();
    await Future.wait([_fetchDBInsights(), _fetchInsights()]);
  }

  Widget _insightsChart(
      {required List<charts.Series<Insights, String>> pm2_5ChartData,
      required List<charts.Series<Insights, String>> pm10ChartData,
      required int cornerRadius}) {
    return LayoutBuilder(
        builder: (BuildContext buildContext, BoxConstraints constraints) {
      return SizedBox(
        width: MediaQuery.of(buildContext).size.width - 50,
        height: 150,
        child: charts.BarChart(
          _pollutant == Pollutant.pm2_5 ? pm2_5ChartData : pm10ChartData,
          animate: true,
          defaultRenderer: charts.BarRendererConfig<String>(
            strokeWidthPx: 20,
            stackedBarPaddingPx: 0,
            cornerStrategy: charts.ConstCornerStrategy(cornerRadius),
          ),
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
                } catch (exception, stackTrace) {
                  debugPrint(
                      '${exception.toString()}\n${stackTrace.toString()}');
                }
              }
            })
          ],
          domainAxis: _yAxisScale(widget.frequency == Frequency.daily
              ? _dailyStaticTicks
              : _hourlyStaticTicks),
          primaryMeasureAxis: _xAxisScale(),
        ),
      );
    });
  }

  List<Widget> _pageItems() {
    return [
      const SizedBox(
        height: 28,
      ),
      Padding(
        padding: const EdgeInsets.only(right: 16, left: 16),
        child: Row(
          children: [
            Visibility(
              visible: _hasMeasurements,
              child: Text(
                'AIR QUALITY',
                style: Theme.of(context)
                    .textTheme
                    .caption
                    ?.copyWith(color: Config.appColorBlack.withOpacity(0.3)),
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
        height: 12,
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
          child: containerLoadingAnimation(height: 70.0, radius: 8.0),
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
                borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                border: Border.all(color: Colors.transparent)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                  onTap: () {
                    ShareService.shareGraph(
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
        height: 32,
      ),
      Visibility(
        visible: _recommendations.isNotEmpty,
        child: Padding(
          padding: const EdgeInsets.only(right: 16, left: 16),
          child: Text(
            _isTodayHealthTips
                ? 'Today\'s health tips'
                : 'Tomorrow\'s health tips',
            textAlign: TextAlign.left,
            style: CustomTextStyle.headline7(context),
          ),
        ),
      ),
      const SizedBox(
        height: 16,
      ),
      Visibility(
        visible: _recommendations.isNotEmpty,
        child: SizedBox(
          height: 128,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemBuilder: (context, index) {
              if (index == 0) {
                return Padding(
                  padding: const EdgeInsets.only(left: 12.0, right: 6.0),
                  child:
                      recommendationContainer(_recommendations[index], context),
                );
              } else if (index == (_recommendations.length - 1)) {
                return Padding(
                  padding: const EdgeInsets.only(left: 6.0, right: 12.0),
                  child:
                      recommendationContainer(_recommendations[index], context),
                );
              } else {
                return Padding(
                  padding: const EdgeInsets.only(left: 6.0, right: 6.0),
                  child:
                      recommendationContainer(_recommendations[index], context),
                );
              }
            },
            itemCount: _recommendations.length,
          ),
        ),
      ),
      const SizedBox(
        height: 24,
      ),
    ];
  }

  Future<void> _refreshPage() async {
    await _appService.isConnected(context);
    var insights = await _appService.fetchInsights([widget.placeDetails.siteId],
        frequency: widget.frequency);

    insights.isNotEmpty
        ? await _setInsights(insights)
        : await _fetchDBInsights();
  }

  Future<void> _setInsights(List<Insights> insightsData) async {
    if (insightsData.isEmpty || !mounted) {
      return;
    }

    if (widget.frequency == Frequency.daily) {
      var firstDay = DateTime.now()
          .getFirstDateOfCalendarMonth()
          .getDateOfFirstHourOfDay();
      var lastDay =
          DateTime.now().getLastDateOfCalendarMonth().getDateOfLastHourOfDay();

      var dailyInsights = insightsData.where((element) {
        var date = element.time;
        if (date == firstDay ||
            date == lastDay ||
            (date.isAfter(firstDay) & date.isBefore(lastDay))) {
          return true;
        }
        return false;
      }).toList();

      setState(() {
        _dailyPm2_5ChartData =
            insightsChartData(dailyInsights, Pollutant.pm2_5, Frequency.daily);
        _dailyPm10ChartData =
            insightsChartData(dailyInsights, Pollutant.pm10, Frequency.daily);
        _selectedMeasurement = _dailyPm2_5ChartData.first.first.data.first;
        _hasMeasurements = true;
      });

      await _scrollToTodayChart();
      await loadMiniCharts(DateTime.now());
    } else {
      var firstDay =
          DateTime.now().getDateOfFirstDayOfWeek().getDateOfFirstHourOfDay();
      var lastDay =
          DateTime.now().getDateOfLastDayOfWeek().getDateOfLastHourOfDay();

      var hourlyInsights = insightsData.where((element) {
        var date = element.time;
        if (date == firstDay ||
            date == lastDay ||
            (date.isAfter(firstDay) & date.isBefore(lastDay))) {
          return true;
        }
        return false;
      }).toList();

      setState(() {
        _hourlyPm2_5ChartData = insightsChartData(
            hourlyInsights, Pollutant.pm2_5, Frequency.hourly);
        _hourlyPm10ChartData =
            insightsChartData(hourlyInsights, Pollutant.pm10, Frequency.hourly);
        _selectedMeasurement = _hourlyPm2_5ChartData.first.first.data.first;
        _hasMeasurements = true;
      });

      await _scrollToTodayChart();
    }
  }

  Future<void> _scrollToTodayChart() async {
    var referenceDate = widget.frequency == Frequency.daily
        ? DateTime.now().getDateOfFirstDayOfWeek()
        : DateTime.now();
    var data = widget.frequency == Frequency.daily
        ? _dailyPm2_5ChartData
        : _hourlyPm2_5ChartData;
    for (var element in data) {
      if (element.first.data.first.time.day == referenceDate.day &&
          element.first.data.first.time.month == referenceDate.month) {
        setState(() {
          _selectedMeasurement = element.first.data.last;
        });

        await _scrollToChart(_itemScrollController, data.indexOf(element), data,
            const Duration(microseconds: 1));
        break;
      }
    }
  }

  Future<void> _updateMiniChart(Insights insight) async {
    setState(() {
      selectedMiniChart = DateFormat('yyyy-MM-dd').format(insight.time);
    });

    if (miniChartsMap[selectedMiniChart] == null) {
      await loadMiniCharts(insight.time);
    }
  }

  void _updateUI(Insights insight) {
    setState(() {
      _selectedMeasurement = insight;
    });

    if (widget.frequency == Frequency.daily) {
      setState(() {
        _lastUpdated = insight.empty
            ? 'Not available'
            : insight.time.isToday()
                ? 'Updated Today'
                : 'Updated ${DateFormat('EEEE, d MMM').format(insight.time)}';
      });

      _updateMiniChart(insight);
    } else {
      setState(() {
        _lastUpdated = insight.empty
            ? 'Not available'
            : 'Updated ${DateFormat('hh:mm a').format(insight.time)}';
      });
    }
  }

  charts.NumericAxisSpec _xAxisScale() {
    return charts.NumericAxisSpec(
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
    );
  }

  charts.OrdinalAxisSpec _yAxisScale(List<charts.TickSpec<String>> ticks) {
    return charts.OrdinalAxisSpec(
        tickProviderSpec: charts.StaticOrdinalTickProviderSpec(ticks));
  }
}
