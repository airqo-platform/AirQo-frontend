import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/enum_constants.dart';
import '../../models/insights.dart';
import '../../themes/colors.dart';
import '../../utils/pm.dart';

class InsightsGraph extends StatelessWidget {
  const InsightsGraph(
      {Key? key,
      required this.pm2_5ChartData,
      required this.pm10ChartData,
      required this.pollutant,
      required this.frequency,
      required this.onBarSelection})
      : super(key: key);
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
                frequency == Frequency.daily ? 5 : 3),
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
                  final value = model.selectedDatum[0].index;
                  if (value != null) {
                    onBarSelection(model.selectedSeries[0].data[value]);
                  }
                } catch (exception, stackTrace) {
                  debugPrint(
                      '${exception.toString()}\n${stackTrace.toString()}');
                }
              }
            })
          ],
          domainAxis: _yAxisScale(frequency == Frequency.daily
              ? _dailyStaticTicks()
              : _hourlyStaticTicks()),
          primaryMeasureAxis: _xAxisScale(),
        ),
      );
    });
  }

  List<charts.TickSpec<String>> _dailyStaticTicks() {
    final dailyTicks = <charts.TickSpec<String>>[];
    final daysList = <String>['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (final day in daysList) {
      dailyTicks.add(charts.TickSpec(day,
          label: day,
          style: charts.TextStyleSpec(
              color: charts.ColorUtil.fromDartColor(CustomColors.greyColor))));
    }

    return dailyTicks;
  }

  List<charts.TickSpec<String>> _hourlyStaticTicks() {
    final hourlyTicks = <charts.TickSpec<String>>[];
    final labels = <int>[0, 6, 12, 18];

    for (var i = 0; i <= 24; i++) {
      if (labels.contains(i)) {
        hourlyTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color:
                    charts.ColorUtil.fromDartColor(CustomColors.greyColor))));
      } else {
        hourlyTicks.add(charts.TickSpec(i.toString().length == 1 ? '0$i' : '$i',
            label: i.toString().length == 1 ? '0$i' : '$i',
            style: charts.TextStyleSpec(
                color: charts.ColorUtil.fromDartColor(Colors.transparent))));
      }
    }
    return hourlyTicks;
  }

  charts.NumericAxisSpec _xAxisScale() {
    return charts.NumericAxisSpec(
      tickProviderSpec: charts.StaticNumericTickProviderSpec(
        <charts.TickSpec<double>>[
          charts.TickSpec<double>(0,
              style: charts.TextStyleSpec(
                  color:
                      charts.ColorUtil.fromDartColor(CustomColors.greyColor))),
          charts.TickSpec<double>(125,
              style: charts.TextStyleSpec(
                  color:
                      charts.ColorUtil.fromDartColor(CustomColors.greyColor))),
          charts.TickSpec<double>(250,
              style: charts.TextStyleSpec(
                  color:
                      charts.ColorUtil.fromDartColor(CustomColors.greyColor))),
          charts.TickSpec<double>(375,
              style: charts.TextStyleSpec(
                  color:
                      charts.ColorUtil.fromDartColor(CustomColors.greyColor))),
          charts.TickSpec<double>(500,
              style: charts.TextStyleSpec(
                  color:
                      charts.ColorUtil.fromDartColor(CustomColors.greyColor))),
        ],
      ),
    );
  }

  charts.OrdinalAxisSpec _yAxisScale(List<charts.TickSpec<String>> ticks) {
    return charts.OrdinalAxisSpec(
        tickProviderSpec: charts.StaticOrdinalTickProviderSpec(ticks));
  }
}

class InsightsAvatar extends StatelessWidget {
  const InsightsAvatar(
      {Key? key,
      required this.measurement,
      required this.size,
      required this.pollutant})
      : super(key: key);
  final Insights measurement;
  final double size;
  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    if (measurement.empty) {
      return Container(
        height: size,
        width: size,
        decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: CustomColors.greyColor,
            border: Border.all(color: Colors.transparent)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Spacer(),
            SvgPicture.asset(
              pollutant == Pollutant.pm2_5
                  ? 'assets/icon/PM2.5.svg'
                  : 'assets/icon/PM10.svg',
              semanticsLabel: 'Pm2.5',
              height: 6,
              width: 32.45,
              color: CustomColors.darkGreyColor,
            ),
            Text(
              '--',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.robotoMono(
                fontStyle: FontStyle.normal,
                fontSize: 32,
                color: CustomColors.darkGreyColor,
              ),
            ),
            SvgPicture.asset(
              'assets/icon/unit.svg',
              semanticsLabel: 'UNit',
              height: 6,
              width: 32,
              color: CustomColors.darkGreyColor,
            ),
            const Spacer(),
          ],
        ),
      );
    }
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: measurement.forecast
              ? CustomColors.appColorBlue.withOpacity(0.24)
              : pollutant == Pollutant.pm2_5
                  ? pollutantValueColor(
                      value: measurement.getChartValue(pollutant),
                      pollutant: Pollutant.pm2_5)
                  : pollutantValueColor(
                      value: measurement.getChartValue(pollutant),
                      pollutant: Pollutant.pm10),
          border: Border.all(color: Colors.transparent)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SvgPicture.asset(
            pollutant == Pollutant.pm2_5
                ? 'assets/icon/PM2.5.svg'
                : 'assets/icon/PM10.svg',
            semanticsLabel: 'Pm2.5',
            height: 6,
            width: 32.45,
            color: measurement.forecast
                ? CustomColors.appColorBlue
                : pollutant == Pollutant.pm2_5
                    ? pollutantTextColor(
                        value: measurement.getChartValue(pollutant),
                        pollutant: Pollutant.pm2_5)
                    : pollutantTextColor(
                        value: measurement.getChartValue(pollutant),
                        pollutant: Pollutant.pm10),
          ),
          Text(
            measurement.getChartValue(pollutant).toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
              fontStyle: FontStyle.normal,
              fontWeight: FontWeight.bold,
              height: 1,
              fontSize: 32,
              color: measurement.forecast
                  ? CustomColors.appColorBlue
                  : pollutant == Pollutant.pm2_5
                      ? pollutantTextColor(
                          value: measurement.getChartValue(pollutant),
                          pollutant: Pollutant.pm2_5)
                      : pollutantTextColor(
                          value: measurement.getChartValue(pollutant),
                          pollutant: Pollutant.pm10),
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'UNit',
            height: 6,
            width: 32,
            color: measurement.forecast
                ? CustomColors.appColorBlue
                : pollutant == Pollutant.pm2_5
                    ? pollutantTextColor(
                        value: measurement.getChartValue(pollutant),
                        pollutant: Pollutant.pm2_5)
                    : pollutantTextColor(
                        value: measurement.getChartValue(pollutant),
                        pollutant: Pollutant.pm10),
          ),
        ],
      ),
    );
  }
}
