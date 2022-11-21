import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:visibility_detector/visibility_detector.dart';

class InsightsLoadingWidget extends StatelessWidget {
  const InsightsLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  SizedContainerLoadingAnimation(
                    height: 32,
                    width: 70,
                    radius: 8.0,
                  ),
                  Spacer(),
                  SizedContainerLoadingAnimation(
                    height: 32,
                    width: 32,
                    radius: 8.0,
                  ),
                ],
              ),
              const SizedBox(
                height: 12,
              ),
              const ContainerLoadingAnimation(height: 290.0, radius: 8.0),
              const SizedBox(
                height: 16,
              ),
              const ContainerLoadingAnimation(
                height: 60,
                radius: 8.0,
              ),
              const SizedBox(
                height: 32,
              ),
              const SizedContainerLoadingAnimation(
                height: 32,
                width: 216,
                radius: 8.0,
              ),
              const SizedBox(
                height: 16,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 128,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  left: index == 0 ? 12.0 : 6.0,
                  right: index == (4 - 1) ? 12.0 : 6.0,
                ),
                child: const SizedContainerLoadingAnimation(
                  width: 304,
                  height: 128,
                  radius: 8.0,
                ),
              );
            },
            itemCount: 4,
          ),
        ),
      ],
    );
  }
}

class InsightsNoData extends StatelessWidget {
  const InsightsNoData({super.key, required this.frequency});
  final Frequency frequency;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            'Failed to load insights.\nTry again later',
            style: CustomTextStyle.headline7(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(
            height: 20,
          ),
          OutlinedButton(
            onPressed: () {
              switch (frequency) {
                case Frequency.daily:
                  context
                      .read<DailyInsightsBloc>()
                      .add(LoadInsights(frequency: frequency));
                  break;
                case Frequency.hourly:
                  context
                      .read<HourlyInsightsBloc>()
                      .add(LoadInsights(frequency: frequency));
                  break;
              }
            },
            style: OutlinedButton.styleFrom(
              shape: const CircleBorder(),
              padding: const EdgeInsets.all(24),
            ),
            child: Text(
              'Refresh',
              style: TextStyle(color: CustomColors.appColorBlue),
            ),
          ),
        ],
      ),
    );
  }
}

class InsightsFailedWidget extends StatelessWidget {
  const InsightsFailedWidget({super.key, required this.frequency});
  final Frequency frequency;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: OutlinedButton(
        onPressed: () {
          switch (frequency) {
            case Frequency.daily:
              context
                  .read<DailyInsightsBloc>()
                  .add(LoadInsights(frequency: frequency));
              break;
            case Frequency.hourly:
              context
                  .read<HourlyInsightsBloc>()
                  .add(LoadInsights(frequency: frequency));
              break;
          }
        },
        style: OutlinedButton.styleFrom(
          shape: const CircleBorder(),
          padding: const EdgeInsets.all(24),
        ),
        child: Text(
          'Refresh',
          style: TextStyle(color: CustomColors.appColorBlue),
        ),
      ),
    );
  }
}

class HourlyAnalyticsGraph extends StatelessWidget {
  const HourlyAnalyticsGraph({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HourlyInsightsBloc, InsightsState>(
      builder: (context, state) {
        if (!state.historicalCharts.keys.toList().contains(state.pollutant)) {
          return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
        }

        final data = state
            .historicalCharts[state.pollutant]![state.historicalChartIndex];

        return LayoutBuilder(
          builder: (BuildContext buildContext, BoxConstraints constraints) {
            return SizedBox(
              width: MediaQuery.of(buildContext).size.width - 50,
              height: 150,
              child: charts.BarChart(
                data,
                animate: true,
                defaultRenderer: charts.BarRendererConfig<String>(
                  strokeWidthPx: 20,
                  stackedBarPaddingPx: 0,
                  cornerStrategy: const charts.ConstCornerStrategy(
                    3,
                  ),
                ),
                defaultInteractions: true,
                behaviors: [
                  charts.LinePointHighlighter(
                    showHorizontalFollowLine:
                        charts.LinePointHighlighterFollowLineType.none,
                    showVerticalFollowLine:
                        charts.LinePointHighlighterFollowLineType.nearest,
                  ),
                  charts.DomainHighlighter(),
                  charts.SelectNearest(
                    eventTrigger: charts.SelectionTrigger.tapAndDrag,
                  ),
                ],
                selectionModels: [
                  charts.SelectionModelConfig(
                    changedListener: (charts.SelectionModel model) async {
                      try {
                        final value = model.selectedDatum.first.index;
                        if (value != null) {
                          context.read<HourlyInsightsBloc>().add(
                                UpdateSelectedInsight(
                                  model.selectedSeries.first.data[value]
                                      as ChartData,
                                ),
                              );
                        }
                      } catch (exception, stackTrace) {
                        await logException(exception, stackTrace);
                      }
                    },
                  ),
                ],
                domainAxis: chartsYAxisScale(
                  Frequency.hourly.staticTicks(),
                ),
                primaryMeasureAxis: chartsXAxisScale(),
              ),
            );
          },
        );
      },
    );
  }
}

class ForecastAnalyticsGraph extends StatelessWidget {
  const ForecastAnalyticsGraph({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HourlyInsightsBloc, InsightsState>(
      builder: (context, state) {
        if (!state.forecastCharts.keys.toList().contains(Pollutant.pm2_5) ||
            state.forecastCharts[Pollutant.pm2_5]!.isEmpty) {
          return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
        }

        final data =
            state.forecastCharts[Pollutant.pm2_5]![state.forecastChartIndex];

        return LayoutBuilder(
          builder: (BuildContext buildContext, BoxConstraints constraints) {
            return SizedBox(
              width: MediaQuery.of(buildContext).size.width - 50,
              height: 150,
              child: charts.BarChart(
                data,
                animate: true,
                defaultRenderer: charts.BarRendererConfig<String>(
                  strokeWidthPx: 20,
                  stackedBarPaddingPx: 0,
                  cornerStrategy: const charts.ConstCornerStrategy(
                    3,
                  ),
                ),
                defaultInteractions: true,
                behaviors: [
                  charts.LinePointHighlighter(
                    showHorizontalFollowLine:
                        charts.LinePointHighlighterFollowLineType.none,
                    showVerticalFollowLine:
                        charts.LinePointHighlighterFollowLineType.nearest,
                  ),
                  charts.DomainHighlighter(),
                  charts.SelectNearest(
                    eventTrigger: charts.SelectionTrigger.tapAndDrag,
                  ),
                ],
                selectionModels: [
                  charts.SelectionModelConfig(
                    changedListener: (charts.SelectionModel model) async {
                      try {
                        final value = model.selectedDatum.first.index;
                        if (value != null) {
                          context.read<HourlyInsightsBloc>().add(
                                UpdateSelectedInsight(
                                  model.selectedSeries.first.data[value]
                                      as ChartData,
                                ),
                              );
                        }
                      } catch (exception, stackTrace) {
                        await logException(exception, stackTrace);
                      }
                    },
                  ),
                ],
                domainAxis: chartsYAxisScale(
                  Frequency.hourly.staticTicks(),
                ),
                primaryMeasureAxis: chartsXAxisScale(),
              ),
            );
          },
        );
      },
    );
  }
}

class MiniHourlyAnalyticsGraph extends StatelessWidget {
  const MiniHourlyAnalyticsGraph({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DailyInsightsBloc, InsightsState>(
      builder: (context, state) {
        if (!state.miniInsightsCharts.keys.toList().contains(state.pollutant)) {
          return const SizedBox();
        }

        final data = state.miniInsightsCharts[state.pollutant];

        return LayoutBuilder(
          builder: (BuildContext buildContext, BoxConstraints constraints) {
            return SizedBox(
              width: MediaQuery.of(buildContext).size.width - 50,
              height: 150,
              child: charts.BarChart(
                data!,
                animate: true,
                defaultRenderer: charts.BarRendererConfig<String>(
                  strokeWidthPx: 20,
                  stackedBarPaddingPx: 0,
                  cornerStrategy: const charts.ConstCornerStrategy(
                    3,
                  ),
                ),
                defaultInteractions: true,
                behaviors: [
                  charts.LinePointHighlighter(
                    showHorizontalFollowLine:
                        charts.LinePointHighlighterFollowLineType.none,
                    showVerticalFollowLine:
                        charts.LinePointHighlighterFollowLineType.nearest,
                  ),
                  charts.DomainHighlighter(),
                  charts.SelectNearest(
                    eventTrigger: charts.SelectionTrigger.tapAndDrag,
                  ),
                ],
                domainAxis: chartsYAxisScale(
                  Frequency.hourly.staticTicks(),
                ),
                primaryMeasureAxis: chartsXAxisScale(),
              ),
            );
          },
        );
      },
    );
  }
}

class DailyAnalyticsGraph extends StatelessWidget {
  const DailyAnalyticsGraph({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DailyInsightsBloc, InsightsState>(
      builder: (context, state) {
        if (!state.historicalCharts.keys.toList().contains(state.pollutant)) {
          return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
        }

        final data = state
            .historicalCharts[state.pollutant]![state.historicalChartIndex];

        return LayoutBuilder(
          builder: (BuildContext buildContext, BoxConstraints constraints) {
            return SizedBox(
              width: MediaQuery.of(buildContext).size.width - 50,
              height: 150,
              child: charts.BarChart(
                data,
                animate: true,
                defaultRenderer: charts.BarRendererConfig<String>(
                  strokeWidthPx: 20,
                  stackedBarPaddingPx: 0,
                  cornerStrategy: const charts.ConstCornerStrategy(
                    5,
                  ),
                ),
                defaultInteractions: true,
                behaviors: [
                  charts.LinePointHighlighter(
                    showHorizontalFollowLine:
                        charts.LinePointHighlighterFollowLineType.none,
                    showVerticalFollowLine:
                        charts.LinePointHighlighterFollowLineType.nearest,
                  ),
                  charts.DomainHighlighter(),
                  charts.SelectNearest(
                    eventTrigger: charts.SelectionTrigger.tapAndDrag,
                  ),
                ],
                selectionModels: [
                  charts.SelectionModelConfig(
                    changedListener: (charts.SelectionModel model) async {
                      try {
                        final value = model.selectedDatum.first.index;
                        if (value != null) {
                          context.read<DailyInsightsBloc>().add(
                                UpdateSelectedInsight(
                                  model.selectedSeries.first.data[value]
                                      as ChartData,
                                ),
                              );
                        }
                      } catch (exception, stackTrace) {
                        await logException(exception, stackTrace);
                      }
                    },
                  ),
                ],
                domainAxis: chartsYAxisScale(
                  Frequency.daily.staticTicks(),
                ),
                primaryMeasureAxis: chartsXAxisScale(),
              ),
            );
          },
        );
      },
    );
  }
}

class InsightsAvatar extends StatelessWidget {
  const InsightsAvatar({
    super.key,
    required this.insights,
    required this.size,
    required this.pollutant,
  });
  final ChartData insights;
  final double size;
  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: insights.chartAvatarContainerColor(pollutant),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            pollutant.svg,
            semanticsLabel: 'Pm2.5',
            height: 6,
            width: 32.45,
            color: insights.chartAvatarValueColor(pollutant),
          ),
          AutoSizeText(
            insights.chartAvatarValue(pollutant),
            maxLines: 1,
            style: CustomTextStyle.insightsAvatar(
              pollutant: pollutant,
              value: insights.chartValue(pollutant),
            )?.copyWith(
              color: insights.chartAvatarValueColor(pollutant),
              fontSize: 32,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 6,
            width: 32,
            color: insights.chartAvatarValueColor(pollutant),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class HourlyInsightsGraph extends StatefulWidget {
  const HourlyInsightsGraph({super.key});

  @override
  State<HourlyInsightsGraph> createState() => _HourlyInsightsGraphState();
}

class _HourlyInsightsGraphState extends State<HourlyInsightsGraph> {
  final GlobalKey _infoToolTipKey = GlobalKey();
  bool scrollToToday = true;

  final ItemScrollController _itemScrollController = ItemScrollController();
  final ItemScrollController _forecastScrollController = ItemScrollController();

  void _jumpToChart() {
    final state = context.read<HourlyInsightsBloc>().state;

    if (state.isShowingForecast) {
      return;
    }

    context.read<HourlyInsightsBloc>().add(const SetScrolling(true));

    final chartIndex =
        context.read<HourlyInsightsBloc>().state.historicalChartIndex;

    _itemScrollController.jumpTo(
      index: chartIndex,
    );
    setState(() => scrollToToday = false);
    context.read<HourlyInsightsBloc>().add(const SetScrolling(false));
  }

  Future<void> _scrollToChart({Duration? duration}) async {
    final state = context.read<HourlyInsightsBloc>().state;

    if (state.isShowingForecast) {
      return;
    }

    final data = state.historicalCharts[state.pollutant];

    if (data == null) {
      return;
    }

    context.read<HourlyInsightsBloc>().add(const SetScrolling(true));

    ChartData selectedInsight =
        data[state.historicalChartIndex].first.data.first;
    final airQualityReading = state.airQualityReading;

    if (airQualityReading != null) {
      selectedInsight = data[state.historicalChartIndex].first.data.firstWhere(
            (element) =>
                element.dateTime.hour == airQualityReading.dateTime.hour,
            orElse: () => selectedInsight,
          );
    }

    context
        .read<HourlyInsightsBloc>()
        .add(UpdateSelectedInsight(selectedInsight));

    duration ??= const Duration(milliseconds: 500);

    if (_itemScrollController.isAttached) {
      await _itemScrollController
          .scrollTo(
        index: state.historicalChartIndex,
        duration: duration,
        curve: Curves.easeInToLinear,
      )
          .whenComplete(() {
        context.read<HourlyInsightsBloc>().add(const SetScrolling(false));
      });
    } else {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollToChart(duration: const Duration(milliseconds: 1));
      });
    }
  }

  Future<void> _scrollToForecastChart({Duration? duration}) async {
    final state = context.read<HourlyInsightsBloc>().state;

    if (!state.isShowingForecast) {
      return;
    }

    final data = state.forecastCharts[state.pollutant];

    if (data == null) {
      return;
    }

    context.read<HourlyInsightsBloc>().add(const SetScrolling(true));

    final ChartData selectedInsight =
        data[state.forecastChartIndex].first.data.first;
    context
        .read<HourlyInsightsBloc>()
        .add(UpdateSelectedInsight(selectedInsight));

    duration ??= const Duration(milliseconds: 500);

    if (!_forecastScrollController.isAttached) {
      await _scrollToForecastChart(duration: duration);

      return;
    }

    if (_forecastScrollController.isAttached) {
      await _forecastScrollController
          .scrollTo(
        index: context.read<HourlyInsightsBloc>().state.forecastChartIndex,
        duration: duration,
        curve: Curves.easeInToLinear,
      )
          .whenComplete(() {
        context.read<HourlyInsightsBloc>().add(const SetScrolling(false));
      });
    } else {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollToForecastChart(duration: const Duration(milliseconds: 1));
      });
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _jumpToChart();
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HourlyInsightsBloc, InsightsState>(
      builder: (context, state) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(
              Radius.circular(8.0),
            ),
            border: Border.all(color: Colors.transparent),
          ),
          child: Column(
            children: [
              MultiBlocListener(
                listeners: [
                  BlocListener<HourlyInsightsBloc, InsightsState>(
                    listenWhen: (previous, current) {
                      return previous.historicalChartIndex !=
                          current.historicalChartIndex;
                    },
                    listener: (context, listenerState) {
                      _scrollToChart();
                    },
                  ),
                  BlocListener<HourlyInsightsBloc, InsightsState>(
                    listenWhen: (previous, current) {
                      return previous.forecastChartIndex !=
                          current.forecastChartIndex;
                    },
                    listener: (context, listenerState) {
                      _scrollToForecastChart();
                    },
                  ),
                ],
                child: Container(),
              ),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AutoSizeText(
                                chartTitleDateTimeTitle(
                                  state.selectedInsight?.dateTime ??
                                      DateTime.now(),
                                  state.frequency,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.bodyText4(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack
                                      .withOpacity(0.3),
                                ),
                              ),
                              AutoSizeText(
                                state.airQualityReading?.name ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.headline8(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack,
                                ),
                              ),
                              AutoSizeText(
                                state.airQualityReading?.location ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context)
                                    .textTheme
                                    .caption
                                    ?.copyWith(
                                      color: CustomColors.appColorBlack
                                          .withOpacity(0.3),
                                    ),
                              ),
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
                          child: InsightsAvatar(
                            insights: state.selectedInsight!,
                            size: 64,
                            pollutant: state.pollutant,
                          ),
                        ),
                      ],
                    ),
                    Visibility(
                      visible: !state.isShowingForecast,
                      child: SizedBox(
                        height: 160,
                        child: ScrollablePositionedList.builder(
                          physics: const BouncingScrollPhysics(),
                          scrollDirection: Axis.horizontal,
                          itemCount:
                              state.historicalCharts[state.pollutant]?.length ??
                                  0,
                          itemBuilder: (context, index) {
                            return VisibilityDetector(
                              key: Key(
                                index.toString(),
                              ),
                              onVisibilityChanged:
                                  (VisibilityInfo visibilityInfo) {
                                if (!state.scrollingGraphs &&
                                    visibilityInfo.visibleFraction > 0.3 &&
                                    state.historicalChartIndex != index &&
                                    !scrollToToday) {
                                  context
                                      .read<HourlyInsightsBloc>()
                                      .add(UpdateInsightsActiveIndex(index));
                                }
                              },
                              child: const HourlyAnalyticsGraph(),
                            );
                          },
                          itemScrollController: _itemScrollController,
                        ),
                      ),
                    ),
                    Visibility(
                      visible: state.forecastCharts.isNotEmpty &&
                          state.isShowingForecast,
                      child: SizedBox(
                        height: 160,
                        child: ScrollablePositionedList.builder(
                          physics: const BouncingScrollPhysics(),
                          scrollDirection: Axis.horizontal,
                          itemCount:
                              state.forecastCharts[state.pollutant]?.length ??
                                  0,
                          itemBuilder: (context, index) {
                            return VisibilityDetector(
                              key: Key(
                                index.toString(),
                              ),
                              onVisibilityChanged:
                                  (VisibilityInfo visibilityInfo) {
                                if (!state.scrollingGraphs &&
                                    visibilityInfo.visibleFraction > 0.3 &&
                                    state.forecastChartIndex != index) {
                                  context.read<HourlyInsightsBloc>().add(
                                        UpdateForecastInsightsActiveIndex(
                                          index,
                                        ),
                                      );
                                }
                              },
                              child: const ForecastAnalyticsGraph(),
                            );
                          },
                          itemScrollController: _forecastScrollController,
                        ),
                      ),
                    ),
                    Visibility(
                      visible: state.selectedInsight
                              ?.lastUpdated(state.frequency)
                              .isNotEmpty ??
                          true,
                      child: const SizedBox(
                        height: 13.0,
                      ),
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width / 2,
                          ),
                          child: Text(
                            state.selectedInsight
                                    ?.lastUpdated(state.frequency) ??
                                '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 8,
                              color: Colors.black.withOpacity(0.3),
                            ),
                          ),
                        ),
                        const SizedBox(
                          width: 8.0,
                        ),
                        MiniLoadingIndicator(
                          loading:
                              state.insightsStatus == InsightsStatus.refreshing,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Divider(
                  color: Color(0xffC4C4C4),
                ),
              ),

              // footer
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GraphAQILabel(
                    selectedInsight: state.selectedInsight,
                    pollutant: state.pollutant,
                  ),
                  Visibility(
                    visible: state.forecastCharts.isNotEmpty,
                    child: InkWell(
                      onTap: () => context
                          .read<HourlyInsightsBloc>()
                          .add(const ToggleForecastData()),
                      child: Ink(
                        color: CustomColors.appColorBlue,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          children: [
                            Container(
                              height: 10,
                              width: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: state.isShowingForecast
                                    ? CustomColors.appColorBlue
                                    : CustomColors.appColorBlue
                                        .withOpacity(0.24),
                                border: Border.all(color: Colors.transparent),
                              ),
                            ),
                            const SizedBox(
                              width: 8.0,
                            ),
                            Text(
                              'Forecast',
                              style: TextStyle(
                                fontSize: 12,
                                color: CustomColors.appColorBlue,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class DailyInsightsGraph extends StatefulWidget {
  const DailyInsightsGraph({super.key});

  @override
  State<DailyInsightsGraph> createState() => _DailyInsightsGraphState();
}

class _DailyInsightsGraphState extends State<DailyInsightsGraph> {
  final GlobalKey _infoToolTipKey = GlobalKey();
  bool scrollToToday = true;

  final ItemScrollController _itemScrollController = ItemScrollController();

  void _jumpToChart() {
    context.read<DailyInsightsBloc>().add(const SetScrolling(true));

    final chartIndex =
        context.read<DailyInsightsBloc>().state.historicalChartIndex;

    _itemScrollController.jumpTo(
      index: chartIndex,
    );
    setState(() => scrollToToday = false);
    context.read<DailyInsightsBloc>().add(const SetScrolling(false));
  }

  Future<void> _scrollToChart({Duration? duration}) async {
    final state = context.read<DailyInsightsBloc>().state;

    final data = state.historicalCharts[state.pollutant];

    if (data == null) {
      return;
    }

    context.read<DailyInsightsBloc>().add(const SetScrolling(true));

    ChartData selectedInsight =
        data[state.historicalChartIndex].first.data.first;
    final airQualityReading = state.airQualityReading;

    if (airQualityReading != null) {
      selectedInsight = data[state.historicalChartIndex].first.data.firstWhere(
            (element) => element.dateTime.day == airQualityReading.dateTime.day,
            orElse: () => selectedInsight,
          );
    }

    context
        .read<DailyInsightsBloc>()
        .add(UpdateSelectedInsight(selectedInsight));

    duration ??= const Duration(milliseconds: 500);

    if (!_itemScrollController.isAttached) {
      await _scrollToChart(duration: duration);

      return;
    }

    if (_itemScrollController.isAttached) {
      await _itemScrollController
          .scrollTo(
        index: state.historicalChartIndex,
        duration: duration,
        curve: Curves.easeInToLinear,
      )
          .whenComplete(() {
        context.read<DailyInsightsBloc>().add(const SetScrolling(false));
      });
    } else {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollToChart(duration: const Duration(milliseconds: 1));
      });
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _jumpToChart();
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DailyInsightsBloc, InsightsState>(
      builder: (context, state) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(
              Radius.circular(8.0),
            ),
            border: Border.all(color: Colors.transparent),
          ),
          child: Column(
            children: [
              MultiBlocListener(
                listeners: [
                  BlocListener<DailyInsightsBloc, InsightsState>(
                    listenWhen: (previous, current) {
                      return previous.historicalChartIndex !=
                          current.historicalChartIndex;
                    },
                    listener: (context, listenerState) {
                      _scrollToChart();
                    },
                  ),
                ],
                child: Container(),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AutoSizeText(
                                chartTitleDateTimeTitle(
                                  state.selectedInsight?.dateTime ??
                                      DateTime.now(),
                                  state.frequency,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.bodyText4(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack
                                      .withOpacity(0.3),
                                ),
                              ),
                              AutoSizeText(
                                state.airQualityReading?.name ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.headline8(context)
                                    ?.copyWith(
                                  color: CustomColors.appColorBlack,
                                ),
                              ),
                              AutoSizeText(
                                state.airQualityReading?.location ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context)
                                    .textTheme
                                    .caption
                                    ?.copyWith(
                                      color: CustomColors.appColorBlack
                                          .withOpacity(0.3),
                                    ),
                              ),
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
                          child: InsightsAvatar(
                            insights: state.selectedInsight!,
                            size: 64,
                            pollutant: state.pollutant,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      height: 160,
                      child: ScrollablePositionedList.builder(
                        physics: const BouncingScrollPhysics(),
                        scrollDirection: Axis.horizontal,
                        itemCount:
                            state.historicalCharts[state.pollutant]?.length ??
                                0,
                        itemBuilder: (context, index) {
                          return VisibilityDetector(
                            key: Key(
                              index.toString(),
                            ),
                            onVisibilityChanged:
                                (VisibilityInfo visibilityInfo) {
                              if (!state.scrollingGraphs &&
                                  visibilityInfo.visibleFraction > 0.3 &&
                                  state.historicalChartIndex != index &&
                                  !scrollToToday) {
                                context
                                    .read<DailyInsightsBloc>()
                                    .add(UpdateInsightsActiveIndex(index));
                              }
                            },
                            child: const DailyAnalyticsGraph(),
                          );
                        },
                        itemScrollController: _itemScrollController,
                      ),
                    ),
                    const MiniHourlyAnalyticsGraph(),
                    Visibility(
                      visible: state.selectedInsight
                              ?.lastUpdated(state.frequency)
                              .isNotEmpty ??
                          true,
                      child: const SizedBox(
                        height: 13.0,
                      ),
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width / 2,
                          ),
                          child: Text(
                            state.selectedInsight
                                    ?.lastUpdated(state.frequency) ??
                                '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 8,
                              color: Colors.black.withOpacity(0.3),
                            ),
                          ),
                        ),
                        const SizedBox(
                          width: 8.0,
                        ),
                        MiniLoadingIndicator(
                          loading:
                              state.insightsStatus == InsightsStatus.refreshing,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Divider(
                  color: Color(0xffC4C4C4),
                ),
              ),
              GraphAQILabel(
                selectedInsight: state.selectedInsight,
                pollutant: state.pollutant,
              ),
            ],
          ),
        );
      },
    );
  }
}

class GraphAQILabel extends StatelessWidget {
  GraphAQILabel({
    super.key,
    required this.selectedInsight,
    required this.pollutant,
  });
  final GlobalKey _infoToolTipKey = GlobalKey();
  final ChartData? selectedInsight;
  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    final decoration = selectedInsight!.available
        ? BoxDecoration(
            borderRadius: const BorderRadius.all(
              Radius.circular(40.0),
            ),
            color: pollutant == Pollutant.pm2_5
                ? Pollutant.pm2_5
                    .color(
                      selectedInsight!.chartValue(pollutant),
                    )
                    .withOpacity(0.4)
                : Pollutant.pm10
                    .color(
                      selectedInsight!.chartValue(pollutant),
                    )
                    .withOpacity(0.4),
            border: Border.all(color: Colors.transparent),
          )
        : BoxDecoration(
            borderRadius: const BorderRadius.all(
              Radius.circular(40.0),
            ),
            color: CustomColors.greyColor.withOpacity(0.4),
            border: Border.all(color: Colors.transparent),
          );

    final text = selectedInsight!.available
        ? pollutant
            .stringValue(
              selectedInsight!.chartValue(pollutant),
            )
            .trimEllipsis()
        : 'Not Available';

    final textStyle = CustomTextStyle.button2(context)?.copyWith(
      color: selectedInsight!.available
          ? pollutant.textColor(
              value: selectedInsight!.chartValue(pollutant),
              graph: true,
            )
          : CustomColors.darkGreyColor,
      fontSize: 10,
    );

    return Container(
      padding: const EdgeInsets.only(left: 16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              if (selectedInsight!.available) {
                ToolTip(context, ToolTipType.info).show(
                  widgetKey: _infoToolTipKey,
                );
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10.0,
                vertical: 2.0,
              ),
              decoration: decoration,
              child: Text(
                text,
                maxLines: 1,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: textStyle,
              ),
            ),
          ),
          const SizedBox(
            width: 8,
          ),
          Visibility(
            visible: selectedInsight!.available,
            child: GestureDetector(
              onTap: () {
                pmInfoDialog(
                  context,
                  selectedInsight!.chartValue(pollutant),
                );
              },
              child: SvgPicture.asset(
                'assets/icon/info_icon.svg',
                semanticsLabel: 'Pm2.5',
                height: 20,
                width: 20,
                key: _infoToolTipKey,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class InsightsHealthTips extends StatefulWidget {
  const InsightsHealthTips({
    super.key,
    required this.insight,
    required this.pollutant,
  });
  final ChartData? insight;
  final Pollutant pollutant;

  @override
  State<InsightsHealthTips> createState() => _InsightsHealthTipsState();
}

class _InsightsHealthTipsState extends State<InsightsHealthTips> {
  List<Recommendation> recommendations = [];
  String title = '';

  @override
  void initState() {
    super.initState();
    if (widget.insight != null) {
      recommendations = getHealthRecommendations(
        widget.insight!.pm2_5,
        widget.pollutant,
      );
      title = widget.insight!.dateTime.isToday()
          ? 'Today’s health tips'
          : 'Tomorrow’s health tips';
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            title,
            textAlign: TextAlign.left,
            style: CustomTextStyle.headline7(context),
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        SizedBox(
          height: 128,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  left: index == 0 ? 12.0 : 6.0,
                  right: index == (recommendations.length - 1) ? 12.0 : 6.0,
                ),
                child: RecommendationContainer(recommendations[index]),
              );
            },
            itemCount: recommendations.length,
          ),
        ),
      ],
    );
  }
}

class InsightsToggleBar extends StatelessWidget {
  const InsightsToggleBar({
    Key? key,
    required this.frequency,
    required this.isEmpty,
    required this.pollutant,
    this.disablePm10 = false,
  }) : super(key: key);
  final bool isEmpty;
  final Frequency frequency;
  final Pollutant pollutant;
  final bool disablePm10;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          'AIR QUALITY',
          style: Theme.of(context).textTheme.caption?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.3),
              ),
        ),
        const Spacer(),
        PopupMenuButton(
          padding: EdgeInsets.zero,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(4.0),
            ),
          ),
          onSelected: (pollutant) {
            switch (frequency) {
              case Frequency.daily:
                context
                    .read<DailyInsightsBloc>()
                    .add(SwitchInsightsPollutant(pollutant));
                break;
              case Frequency.hourly:
                if (!disablePm10) {
                  context
                      .read<HourlyInsightsBloc>()
                      .add(SwitchInsightsPollutant(pollutant));
                }
                break;
            }
          },
          child: Container(
            height: 35,
            width: 35,
            padding: const EdgeInsets.all(6.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.all(
                Radius.circular(8.0),
              ),
              border: Border.all(
                color: Colors.transparent,
              ),
            ),
            child: SvgPicture.asset(
              'assets/icon/toggle_icon.svg',
              semanticsLabel: 'Toggle',
              height: 16,
              width: 20,
            ),
          ),
          itemBuilder: (BuildContext context) => <PopupMenuEntry<Pollutant>>[
            PopupMenuItem(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              value: Pollutant.pm2_5,
              child: PollutantToggleListOption(
                pollutantName: '2.5',
                pollutant: Pollutant.pm2_5,
                varyingPollutant: pollutant,
              ),
            ),
            PopupMenuItem(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              value: Pollutant.pm10,
              child: PollutantToggleListOption(
                  pollutantName: '10',
                  pollutant: Pollutant.pm10,
                  varyingPollutant: pollutant,
                  disablePm10: disablePm10),
            ),
          ],
        ),
      ],
    );
  }
}

class InsightsActionBar extends StatefulWidget {
  const InsightsActionBar({
    super.key,
    required this.shareKey,
    required this.airQualityReading,
  });

  final GlobalKey shareKey;
  final AirQualityReading? airQualityReading;

  @override
  State<InsightsActionBar> createState() => _InsightsActionBarState();
}

class _InsightsActionBarState extends State<InsightsActionBar> {
  bool _showHeartAnimation = false;
  bool _shareLoading = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.all(color: Colors.transparent),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Expanded(
            child: _shareLoading
                ? const LoadingIcon(
                    radius: 10,
                  )
                : InkWell(
                    onTap: () async => _share(),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 21),
                      child: IconTextButton(
                        iconWidget: SvgPicture.asset(
                          'assets/icon/share_icon.svg',
                          color: CustomColors.greyColor,
                          semanticsLabel: 'Share',
                        ),
                        text: 'Share',
                      ),
                    ),
                  ),
          ),
          Expanded(
            child: InkWell(
              onTap: () async => _updateFavPlace(),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 21),
                child: IconTextButton(
                  iconWidget: HeartIcon(
                    showAnimation: _showHeartAnimation,
                    airQualityReading: widget.airQualityReading,
                  ),
                  text: 'Favorite',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _share() async {
    if (_shareLoading) {
      return;
    }
    setState(() => _shareLoading = true);
    final complete = await ShareService.shareWidget(
      buildContext: context,
      globalKey: widget.shareKey,
      imageName: 'airqo_air_quality_graph',
    );
    if (complete && mounted) {
      setState(() => _shareLoading = false);
    }
  }

  Future<void> _updateFavPlace() async {
    final airQualityReading = widget.airQualityReading;
    if (airQualityReading == null) {
      return;
    }

    setState(() => _showHeartAnimation = true);
    await Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _showHeartAnimation = false);
      }
    });

    context.read<AccountBloc>().add(UpdateFavouritePlace(airQualityReading));
  }
}

class PollutantToggleListOption extends StatelessWidget {
  const PollutantToggleListOption({
    super.key,
    required this.pollutantName,
    required this.pollutant,
    required this.varyingPollutant,
    this.disablePm10 = false,
  });
  final String pollutantName;
  final Pollutant pollutant;
  final Pollutant varyingPollutant;
  final bool disablePm10;

  @override
  Widget build(BuildContext context) {
    Color textColor = varyingPollutant == pollutant
        ? CustomColors.appColorBlue
        : CustomColors.appColorBlack;

    if (disablePm10) {
      textColor = CustomColors.greyColor;
    }
    return ListTile(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(4.0),
        ),
      ),
      tileColor: varyingPollutant == pollutant
          ? CustomColors.pollutantToggleBgColor
          : Colors.white,
      title: PollutantToggle(
        text: pollutantName,
        textColor: textColor,
      ),
    );
  }
}

class PollutantToggle extends StatelessWidget {
  const PollutantToggle({
    super.key,
    required this.text,
    required this.textColor,
  });
  final String text;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        children: <TextSpan>[
          TextSpan(
            text: 'PM',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: textColor,
              height: 14 / 10,
            ),
          ),
          TextSpan(
            text: text,
            style: TextStyle(
              fontSize: 7,
              fontWeight: FontWeight.w800,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
