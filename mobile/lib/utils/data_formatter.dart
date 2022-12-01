import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:uuid/uuid.dart';

charts.Color chartBarColor(
  ChartData series,
  Pollutant pollutant,
) {
  return series.available
      ? pollutant.chartColor(series.chartValue(pollutant))
      : charts.ColorUtil.fromDartColor(
          CustomColors.greyColor,
        );
}

charts.OrdinalAxisSpec chartsYAxisScale(List<charts.TickSpec<String>> ticks) {
  return charts.OrdinalAxisSpec(
    tickProviderSpec: charts.StaticOrdinalTickProviderSpec(ticks),
  );
}

charts.NumericAxisSpec chartsXAxisScale() {
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

List<ChartData> formatData(
  List<ChartData> data,
  Frequency frequency,
) {
  data.sort(
    (x, y) {
      if (frequency == Frequency.daily) {
        return x.dateTime.weekday.compareTo(y.dateTime.weekday);
      }

      return x.dateTime.compareTo(y.dateTime);
    },
  );

  return data;
}

List<List<charts.Series<ChartData, String>>> createChartsList({
  required List<ChartData> insights,
  required Pollutant pollutant,
  required Frequency frequency,
}) {
  final data = <ChartData>[...insights];

  final graphs = <List<charts.Series<ChartData, String>>>[];
  data.sort((x, y) => x.dateTime.compareTo(y.dateTime));

  int period;

  switch (frequency) {
    case Frequency.daily:
      period = 7;
      break;
    case Frequency.hourly:
      period = 24;
      break;
  }

  while (data.isNotEmpty) {
    List<ChartData> graphData = data.take(period).toList();

    data.removeWhere((element) => graphData.contains(element));

    graphs.add([
      charts.Series<ChartData, String>(
        id: graphData.first.toString(),
        colorFn: (ChartData series, _) => chartBarColor(series, pollutant),
        domainFn: (ChartData data, _) => data.chartDomainFn(),
        measureFn: (ChartData data, _) => data.chartValue(pollutant),
        data: graphData,
      ),
    ]);
  }

  return graphs;
}

List<charts.Series<ChartData, String>> miniInsightsChartData(
  List<ChartData> insights,
  Pollutant pollutant,
) {
  var data = <ChartData>[...insights];

  if (data.length < 24) {
    data = fillMissingData(data, Frequency.hourly);
  }

  data.take(24);

  return <charts.Series<ChartData, String>>[
    charts.Series<ChartData, String>(
      id: '${const Uuid().v4()}-${data.first.dateTime.day}',
      colorFn: (ChartData series, _) => chartBarColor(series, pollutant),
      domainFn: (ChartData data, _) {
        final hour = data.dateTime.hour;

        return hour.toString().length == 1 ? '0$hour' : '$hour';
      },
      measureFn: (ChartData data, _) => data.chartValue(pollutant),
      data: formatData(
        data,
        Frequency.hourly,
      ),
    ),
  ];
}

List<ChartData> fillMissingData(
  List<ChartData> data,
  Frequency frequency,
) {
  final insights = <ChartData>[...data];

  switch (frequency) {
    case Frequency.daily:
      final referenceInsight = data.first;

      var startDate = DateTime.now().getFirstDateOfCalendarMonth();
      final lastDayOfCalendar = DateTime.now().getLastDateOfCalendarMonth();

      while (startDate.isBefore(lastDayOfCalendar)) {
        final checkDate = insights
            .where(
              (element) =>
                  (element.dateTime.day == startDate.day) &&
                  (element.dateTime.month == startDate.month),
            )
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            ChartData(
              dateTime: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              available: true,
              siteId: referenceInsight.siteId,
              frequency: referenceInsight.frequency,
            ),
          );
        }

        startDate = startDate.add(
          const Duration(days: 1),
        );
      }
      break;
    case Frequency.hourly:
      final referenceInsight = data.first;

      var startDate = referenceInsight.dateTime
          .getDateOfFirstDayOfWeek()
          .getDateOfFirstHourOfDay();
      final lastDayOfWeek = referenceInsight.dateTime
          .getDateOfLastDayOfWeek()
          .getDateOfLastHourOfDay();

      while (startDate.isBefore(lastDayOfWeek)) {
        final checkDate = insights
            .where((element) =>
                (element.dateTime.hour == startDate.hour) &&
                (element.dateTime.day == startDate.day))
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            ChartData(
              dateTime: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              available: true,
              siteId: referenceInsight.siteId,
              frequency: referenceInsight.frequency,
            ),
          );
        }

        startDate = startDate.add(
          const Duration(hours: 1),
        );
      }
      break;
  }

  return formatData(insights, frequency);
}
