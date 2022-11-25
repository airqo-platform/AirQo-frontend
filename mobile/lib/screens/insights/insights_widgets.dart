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

class AnalyticsGraph extends StatelessWidget {
  const AnalyticsGraph({
    super.key,
    required this.pm2_5ChartData,
    required this.pm10ChartData,
    required this.pollutant,
    required this.frequency,
    required this.onBarSelection,
  });
  final List<charts.Series<Insights, String>> pm2_5ChartData;
  final List<charts.Series<Insights, String>> pm10ChartData;
  final Pollutant pollutant;
  final Frequency frequency;
  final Function(Insights) onBarSelection;

  @override
  Widget build(BuildContext context) {
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
                changedListener: (charts.SelectionModel<String> model) {
                  if (model.hasDatumSelection) {
                    try {
                      final value = model.selectedDatum.first.index;
                      if (value != null) {
                        onBarSelection(
                          model.selectedSeries.first.data[value] as Insights,
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
            color: pollutantColor,
          ),
          AutoSizeText(
            value,
            maxLines: 1,
            style: CustomTextStyle.insightsAvatar(
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

class HealthTipsSection extends StatelessWidget {
  const HealthTipsSection({
    super.key,
    required this.healthtips,
  });

  final List<HealthTip> healthtips;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: healthtips.isEmpty ? 0 : 128,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) {
          return Padding(
            padding: EdgeInsets.only(
              left: index == 0 ? 12.0 : 6.0,
              right: index == (healthtips.length - 1) ? 12.0 : 6.0,
            ),
            child: HealthTipContainer(healthtips[index]),
          );
        },
        itemCount: healthtips.length,
      ),
    );
  }
}

class InsightsActionBar extends StatefulWidget {
  const InsightsActionBar({
    super.key,
    required this.airQualityReading,
    required this.shareKey,
  });

  final AirQualityReading airQualityReading;
  final GlobalKey shareKey;

  @override
  State<InsightsActionBar> createState() => _InsightsActionBarState();
}

class _InsightsActionBarState extends State<InsightsActionBar> {
  bool _showHeartAnimation = false;
  bool _shareLoading = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
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
                _updateFavPlace();
              },
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

  void _updateFavPlace() {
    setState(() => _showHeartAnimation = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _showHeartAnimation = false);
      }
    });

    context
        .read<AccountBloc>()
        .add(UpdateFavouritePlace(widget.airQualityReading));
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
