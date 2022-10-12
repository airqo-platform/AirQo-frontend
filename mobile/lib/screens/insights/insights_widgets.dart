import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../blocs/insights/insights_bloc.dart';
import '../../services/hive_service.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../utils/date.dart';
import '../../utils/pm.dart';
import '../../widgets/buttons.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';
import '../../widgets/dialogs.dart';
import '../../widgets/recommendation.dart';
import '../../widgets/tooltip.dart';

class AnalyticsGraph extends StatelessWidget {
  const AnalyticsGraph({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      final activeIndex = state.activeChartIndex;
      final insights = state.frequency == Frequency.daily
          ? state.dailyInsights
          : state.hourlyInsights;

      if (insights.isEmpty) {
        return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
      }

      if (state.pollutant == Pollutant.pm2_5 &&
          !insights.keys.toList().contains(Pollutant.pm2_5)) {
        return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
      } else if (state.pollutant == Pollutant.pm10 &&
          !insights.keys.toList().contains(Pollutant.pm10)) {
        return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
      }

      final data = state.pollutant == Pollutant.pm2_5
          ? insights[Pollutant.pm2_5]![activeIndex]
          : insights[Pollutant.pm10]![activeIndex];

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
                cornerStrategy: charts.ConstCornerStrategy(
                  state.frequency == Frequency.daily ? 5 : 3,
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
                  changedListener: (charts.SelectionModel model) {
                    if (model.hasDatumSelection) {
                      try {
                        final value = model.selectedDatum[0].index;
                        if (value != null) {
                          context.read<InsightsBloc>().add(
                                UpdateSelectedInsight(
                                  model.selectedSeries[0].data[value],
                                ),
                              );
                        }
                      } catch (exception, stackTrace) {
                        debugPrint(
                          '${exception.toString()}\n${stackTrace.toString()}',
                        );
                      }
                    }
                  },
                ),
              ],
              domainAxis: _yAxisScale(
                state.frequency.staticTicks(),
              ),
              primaryMeasureAxis: _xAxisScale(),
            ),
          );
        },
      );
    });
  }

  charts.NumericAxisSpec _xAxisScale() {
    return charts.NumericAxisSpec(
      tickProviderSpec: charts.StaticNumericTickProviderSpec(
        <charts.TickSpec<double>>[
          charts.TickSpec<double>(
            0,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            125,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            250,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(CustomColors.greyColor),
            ),
          ),
          charts.TickSpec<double>(
            375,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            500,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  charts.OrdinalAxisSpec _yAxisScale(List<charts.TickSpec<String>> ticks) {
    return charts.OrdinalAxisSpec(
      tickProviderSpec: charts.StaticOrdinalTickProviderSpec(ticks),
    );
  }
}

class AnalyticsGraphV1 extends StatelessWidget {
  const AnalyticsGraphV1({
    super.key,
    required this.pm2_5ChartData,
    required this.pm10ChartData,
    required this.pollutant,
    required this.frequency,
  });
  final List<charts.Series<Insights, String>> pm2_5ChartData;
  final List<charts.Series<Insights, String>> pm10ChartData;
  final Pollutant pollutant;
  final Frequency frequency;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      if (state.selectedInsight == null) {
        return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
      }

      return LayoutBuilder(
        builder: (BuildContext buildContext, BoxConstraints constraints) {
          return SizedBox(
            width: MediaQuery.of(buildContext).size.width - 50,
            height: 150,
            child: charts.BarChart(
              pollutant == Pollutant.pm2_5 ? pm2_5ChartData : pm10ChartData,
              animate: true,
              defaultRenderer: charts.BarRendererConfig<String>(
                strokeWidthPx: 20,
                stackedBarPaddingPx: 0,
                cornerStrategy: charts.ConstCornerStrategy(
                  frequency == Frequency.daily ? 5 : 3,
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
                  changedListener: (charts.SelectionModel model) {
                    if (model.hasDatumSelection) {
                      try {
                        final value = model.selectedDatum[0].index;
                        if (value != null) {
                          context.read<InsightsBloc>().add(
                                UpdateSelectedInsight(
                                  model.selectedSeries[0].data[value],
                                ),
                              );
                        }
                      } catch (exception, stackTrace) {
                        debugPrint(
                          '${exception.toString()}\n${stackTrace.toString()}',
                        );
                      }
                    }
                  },
                ),
              ],
              domainAxis: _yAxisScale(
                frequency.staticTicks(),
              ),
              primaryMeasureAxis: _xAxisScale(),
            ),
          );
        },
      );
    });
  }

  charts.NumericAxisSpec _xAxisScale() {
    return charts.NumericAxisSpec(
      tickProviderSpec: charts.StaticNumericTickProviderSpec(
        <charts.TickSpec<double>>[
          charts.TickSpec<double>(
            0,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            125,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            250,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(CustomColors.greyColor),
            ),
          ),
          charts.TickSpec<double>(
            375,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
          charts.TickSpec<double>(
            500,
            style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(
                CustomColors.greyColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  charts.OrdinalAxisSpec _yAxisScale(List<charts.TickSpec<String>> ticks) {
    return charts.OrdinalAxisSpec(
      tickProviderSpec: charts.StaticOrdinalTickProviderSpec(ticks),
    );
  }
}

class InsightsAvatar extends StatelessWidget {
  const InsightsAvatar({
    super.key,
    required this.measurement,
    required this.size,
    required this.pollutant,
  });
  final Insights measurement;
  final double size;
  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    final containerColor = measurement.empty
        ? CustomColors.greyColor
        : pollutant == Pollutant.pm2_5
            ? Pollutant.pm2_5.color(measurement.chartValue(pollutant))
            : Pollutant.pm10.color(
                measurement.chartValue(pollutant),
              );

    final pollutantColor = measurement.empty
        ? CustomColors.darkGreyColor
        : pollutant == Pollutant.pm2_5
            ? Pollutant.pm2_5
                .textColor(value: measurement.chartValue(pollutant))
            : Pollutant.pm10.textColor(
                value: measurement.chartValue(pollutant),
              );

    final valueColor = measurement.empty
        ? CustomColors.darkGreyColor
        : pollutant == Pollutant.pm2_5
            ? Pollutant.pm2_5
                .textColor(value: measurement.chartValue(pollutant))
            : Pollutant.pm10.textColor(
                value: measurement.chartValue(pollutant),
              );

    final value = measurement.empty
        ? '--'
        : measurement.chartValue(pollutant).toStringAsFixed(0);

    final unitColor = measurement.empty
        ? CustomColors.darkGreyColor
        : pollutant == Pollutant.pm2_5
            ? Pollutant.pm2_5
                .textColor(value: measurement.chartValue(pollutant))
            : Pollutant.pm10.textColor(
                value: measurement.chartValue(pollutant),
              );

    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: containerColor,
        border: Border.all(color: Colors.transparent),
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
            color: pollutantColor,
          ),
          AutoSizeText(
            value,
            maxLines: 1,
            style: CustomTextStyle.insightsAvatar(
              context: context,
              pollutant: pollutant,
              value: measurement.chartValue(pollutant),
            )?.copyWith(
              color: valueColor,
              fontSize: 32,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 6,
            width: 32,
            color: unitColor,
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class InsightsGraph extends StatelessWidget {
  InsightsGraph({Key? key}) : super(key: key);

  final GlobalKey _forecastToolTipKey = GlobalKey();
  final GlobalKey _infoToolTipKey = GlobalKey();
  final ItemScrollController _itemScrollController = ItemScrollController();

  Future<void> _scrollToChart(
    ItemScrollController controller,
    int index,
    List<List<charts.Series<Insights, String>>> data,
    Duration? duration,
  ) async {
    if (controller.isAttached) {
      await controller.scrollTo(
        index: index,
        duration: duration ?? const Duration(seconds: 1),
        curve: Curves.easeInOutCubic,
      );
    } else {
      Future.delayed(
        const Duration(milliseconds: 100),
        () {
          if (!controller.isAttached) {
            return;
          }
          controller.scrollTo(
            index: index,
            duration: duration ?? const Duration(seconds: 1),
            curve: Curves.easeInOutCubic,
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      if (state.selectedInsight == null) {
        return const ContainerLoadingAnimation(height: 290.0, radius: 8.0);
      }

      return Container(
        padding: const EdgeInsets.only(top: 12, bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(
            Radius.circular(8.0),
          ),
          border: Border.all(color: Colors.transparent),
        ),
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
                              insightsChartTitleDateTimeToString(
                                state.selectedInsight?.time ?? DateTime.now(),
                                state.frequency,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  CustomTextStyle.bodyText4(context)?.copyWith(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.3),
                              ),
                            ),
                            AutoSizeText(
                              state.airQualityReading?.name ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  CustomTextStyle.headline8(context)?.copyWith(
                                color: CustomColors.appColorBlack,
                              ),
                            ),
                            AutoSizeText(
                              state.airQualityReading?.location ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style:
                                  Theme.of(context).textTheme.caption?.copyWith(
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
                          measurement: state.selectedInsight!,
                          size: 64,
                          pollutant: state.pollutant,
                        ),
                      ),
                    ],
                  ),
                  Visibility(
                    visible: state.frequency == Frequency.daily,
                    child: SizedBox(
                      height: 160,
                      child: ScrollablePositionedList.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount:
                            state.dailyInsights[Pollutant.pm2_5]?.length ?? 0,
                        itemBuilder: (context, index) {
                          return VisibilityDetector(
                            key: Key(
                              index.toString(),
                            ),
                            onVisibilityChanged:
                                (VisibilityInfo visibilityInfo) {
                              if ((visibilityInfo.visibleFraction > 0.3)) {
                                context
                                    .read<InsightsBloc>()
                                    .add(UpdateActiveIndex(index));
                              }

                              if (state.activeChartIndex != index) {
                                _scrollToChart(
                                  _itemScrollController,
                                  state.activeChartIndex,
                                  state.dailyInsights[Pollutant.pm2_5]!,
                                  null,
                                );
                              }
                            },
                            child: const AnalyticsGraph(),
                          );
                        },
                        itemScrollController: _itemScrollController,
                      ),
                    ),
                  ),
                  Visibility(
                    visible: state.frequency == Frequency.hourly,
                    child: SizedBox(
                      height: 160,
                      child: ScrollablePositionedList.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount:
                            state.hourlyInsights[Pollutant.pm2_5]?.length ?? 0,
                        itemBuilder: (context, index) {
                          return VisibilityDetector(
                            key: Key(
                              index.toString(),
                            ),
                            onVisibilityChanged:
                                (VisibilityInfo visibilityInfo) {
                              if ((visibilityInfo.visibleFraction > 0.3)) {
                                context
                                    .read<InsightsBloc>()
                                    .add(UpdateActiveIndex(index));
                                _scrollToChart(
                                  _itemScrollController,
                                  index,
                                  state.hourlyInsights[Pollutant.pm2_5]!,
                                  null,
                                );
                              }
                            },
                            child: const AnalyticsGraph(),
                          );
                        },
                        itemScrollController: _itemScrollController,
                      ),
                    ),
                  ),

                  // TODO
                  // if (frequency == Frequency.daily)
                  //   miniChartsMap[selectedMiniChart] == null
                  //       ? const SizedBox()
                  //       : miniChartsMap[selectedMiniChart] as Widget,
                  Visibility(
                    visible: state.frequency == Frequency.daily,
                    child: const SizedBox(
                      height: 13.0,
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
                          state.selectedInsight?.lastUpdated(state.frequency) ??
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

            const Divider(
              color: Color(0xffC4C4C4),
            ),

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
                      visible: !state.selectedInsight!.empty,
                      child: Container(
                        padding:
                            const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width / 2,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.all(
                            Radius.circular(40.0),
                          ),
                          color: state.pollutant == Pollutant.pm2_5
                              ? Pollutant.pm2_5
                                  .color(
                                    state.selectedInsight!
                                        .chartValue(state.pollutant),
                                  )
                                  .withOpacity(0.4)
                              : Pollutant.pm10
                                  .color(
                                    state.selectedInsight!
                                        .chartValue(state.pollutant),
                                  )
                                  .withOpacity(0.4),
                          border: Border.all(color: Colors.transparent),
                        ),
                        child: AutoSizeText(
                          state.pollutant == Pollutant.pm2_5
                              ? Pollutant.pm2_5
                                  .stringValue(
                                    state.selectedInsight!
                                        .chartValue(state.pollutant),
                                  )
                                  .trimEllipsis()
                              : Pollutant.pm10
                                  .stringValue(
                                    state.selectedInsight!
                                        .chartValue(state.pollutant),
                                  )
                                  .trimEllipsis(),
                          maxLines: 1,
                          maxFontSize: 14,
                          textAlign: TextAlign.start,
                          overflow: TextOverflow.ellipsis,
                          style: CustomTextStyle.button2(context)?.copyWith(
                            color: state.pollutant == Pollutant.pm2_5
                                ? Pollutant.pm2_5.textColor(
                                    value: state.selectedInsight!
                                        .chartValue(state.pollutant),
                                    graph: true,
                                  )
                                : Pollutant.pm10.textColor(
                                    value: state.selectedInsight!
                                        .chartValue(state.pollutant),
                                    graph: true,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Visibility(
                    visible: state.selectedInsight!.empty,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10.0,
                        vertical: 2.0,
                      ),
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.all(
                          Radius.circular(40.0),
                        ),
                        color: CustomColors.greyColor.withOpacity(0.4),
                        border: Border.all(color: Colors.transparent),
                      ),
                      child: Text(
                        'Not Available',
                        maxLines: 1,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: CustomColors.darkGreyColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(
                    width: 8,
                  ),
                  Visibility(
                    visible: !state.selectedInsight!.empty,
                    child: GestureDetector(
                      onTap: () {
                        pmInfoDialog(
                          context,
                          state.selectedInsight!.chartValue(state.pollutant),
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
                  const Spacer(),
                  Row(
                    children: [
                      Container(
                        height: 10,
                        width: 10,
                        key: _forecastToolTipKey,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: state.selectedInsight!.forecast
                              ? CustomColors.appColorBlue
                              : CustomColors.appColorBlue.withOpacity(0.24),
                          border: Border.all(color: Colors.transparent),
                        ),
                      ),
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
                            fontSize: 12,
                            color: CustomColors.appColorBlue,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }
}

class HealthTipsSection extends StatelessWidget {
  const HealthTipsSection({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      final selectedInsight = state.selectedInsight;

      if (selectedInsight == null ||
          !(selectedInsight.time.isToday() ||
              selectedInsight.time.isTomorrow())) {
        return const SizedBox();
      }

      final recommendations =
          getHealthRecommendations(selectedInsight.pm2_5, state.pollutant);

      return ListView(
        physics: const NeverScrollableScrollPhysics(),
        shrinkWrap: true,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
            child: Text(
              selectedInsight.time.isToday()
                  ? 'Today’s health tips'
                  : 'Tomorrow’s health tips',
              textAlign: TextAlign.left,
              style: CustomTextStyle.headline7(context),
            ),
          ),
          const SizedBox(
            height: 16,
          ),
          SizedBox(
            height: recommendations.isEmpty ? 0 : 128,
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
    });
  }
}

class InsightsToggleBar extends StatelessWidget {
  const InsightsToggleBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      final insights = state.frequency == Frequency.daily
          ? state.dailyInsights
          : state.hourlyInsights;

      return Row(
        children: [
          Visibility(
              visible: insights.isEmpty,
              child: const TextLoadingAnimation(
                height: 18,
                width: 70,
              )),
          Visibility(
            visible: insights.isNotEmpty,
            child: Text(
              'AIR QUALITY',
              style: Theme.of(context).textTheme.caption?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.3),
                  ),
            ),
          ),
          const Spacer(),
          Visibility(
            visible: insights.isEmpty,
            child: const SizedContainerLoadingAnimation(
              height: 32,
              width: 32,
              radius: 8.0,
            ),
          ),
          Visibility(
            visible: insights.isNotEmpty,
            child: PopupMenuButton(
              padding: EdgeInsets.zero,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(4.0),
                ),
              ),
              onSelected: (value) => context
                  .read<InsightsBloc>()
                  .add(SwitchPollutant(pollutant: value)),
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
              itemBuilder: (BuildContext context) => <PopupMenuEntry>[
                PopupMenuItem(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  value: Pollutant.pm2_5,
                  child: ListOption(
                    pollutantName: '2.5',
                    pollutant: Pollutant.pm2_5,
                    varyingPollutant: state.pollutant,
                  ),
                ),
                PopupMenuItem(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  value: Pollutant.pm10,
                  child: ListOption(
                    pollutantName: '10',
                    pollutant: Pollutant.pm10,
                    varyingPollutant: state.pollutant,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    });
  }
}

class InsightsActionBar extends StatefulWidget {
  const InsightsActionBar({
    super.key,
    required this.shareKey,
  });

  final GlobalKey shareKey;

  @override
  State<InsightsActionBar> createState() => _InsightsActionBarState();
}

class _InsightsActionBarState extends State<InsightsActionBar> {
  bool _showHeartAnimation = false;
  bool _shareLoading = false;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InsightsBloc, InsightsState>(builder: (context, state) {
      final insights = state.frequency == Frequency.daily
          ? state.dailyInsights
          : state.hourlyInsights;

      if (insights.isEmpty) {
        return const ContainerLoadingAnimation(height: 70.0, radius: 8.0);
      }

      final airQualityReading = state.airQualityReading;

      if (airQualityReading == null) {
        return const SizedBox();
      }

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
                onTap: () async {
                  _updateFavPlace(airQualityReading);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 21),
                  child: IconTextButton(
                    iconWidget: HeartIcon(
                      showAnimation: _showHeartAnimation,
                      airQualityReading: airQualityReading,
                    ),
                    text: 'Favorite',
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    });
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

  void _updateFavPlace(AirQualityReading airQualityReading) async {
    if (!Hive.box<FavouritePlace>(HiveBox.favouritePlaces)
        .keys
        .contains(airQualityReading.placeId)) {
      setState(() => _showHeartAnimation = true);
      Future.delayed(const Duration(seconds: 2), () {
        setState(() => _showHeartAnimation = false);
      });
    }

    await HiveService.updateFavouritePlaces(airQualityReading);
  }
}

class ListOption extends StatelessWidget {
  const ListOption({
    super.key,
    required this.pollutantName,
    required this.pollutant,
    required this.varyingPollutant,
  });
  final String pollutantName;
  final Pollutant pollutant;
  final Pollutant varyingPollutant;

  @override
  Widget build(BuildContext context) {
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
        textColor: varyingPollutant == pollutant
            ? CustomColors.appColorBlue
            : CustomColors.appColorBlack,
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
