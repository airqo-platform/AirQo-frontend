import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';

import '../themes/colors.dart';

charts.Color insightsChartBarColor(
    GraphInsightData series, Pollutant pollutant) {
  if (series.empty) {
    return charts.ColorUtil.fromDartColor(
      CustomColors.greyColor,
    );
  } else if (series.forecast) {
    return charts.ColorUtil.fromDartColor(
      CustomColors.appColorBlue.withOpacity(0.5),
    );
  } else {
    return pollutant.chartColor(series.chartValue(pollutant));
  }
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

List<GraphInsightData> formatData(
  List<GraphInsightData> data,
  Frequency frequency,
) {
  data.sort(
    (x, y) {
      if (frequency == Frequency.daily) {
        return x.time.weekday.compareTo(y.time.weekday);
      }

      return x.time.compareTo(y.time);
    },
  );

  return data;
}

List<List<charts.Series<GraphInsightData, String>>> insightsChartData(
  List<GraphInsightData> insights,
  Pollutant pollutant,
  Frequency frequency,
) {
  final data = <GraphInsightData>[...insights];

  final insightsGraphs = <List<charts.Series<GraphInsightData, String>>>[];

  if (frequency == Frequency.hourly) {
    while (data.isNotEmpty) {
      final earliestDate = data.reduce((value, element) {
        if (value.time.isBefore(element.time)) {
          return value;
        }

        return element;
      }).time;

      var filteredDates = data
          .where((element) => element.time.day == earliestDate.day)
          .toList();

      if (filteredDates.length < 24) {
        filteredDates = fillMissingData(filteredDates, frequency);
      }

      filteredDates.take(24);

      insightsGraphs.add([
        charts.Series<GraphInsightData, String>(
          id: '${const Uuid().v4()}-${earliestDate.day}',
          colorFn: (GraphInsightData series, _) =>
              insightsChartBarColor(series, pollutant),
          domainFn: (GraphInsightData data, _) {
            final hour = data.time.hour;

            return hour.toString().length == 1 ? '0$hour' : '$hour';
          },
          measureFn: (GraphInsightData data, _) => data.chartValue(pollutant),
          data: formatData(
            filteredDates,
            frequency,
          ),
        ),
      ]);
      data.removeWhere(
        (element) => element.time.day == earliestDate.day,
      );
    }
  } else {
    while (data.isNotEmpty) {
      var earliestDate = data.reduce((value, element) {
        if (value.time.isBefore(element.time)) {
          return value;
        }

        return element;
      }).time;

      final dateRanges = <DateTime>[];
      var filteredDates = <GraphInsightData>[];

      while (dateRanges.length != 7) {
        dateRanges.add(earliestDate);
        earliestDate = earliestDate.add(const Duration(days: 1));
      }

      filteredDates
        ..addAll(
          data.where((element) => dateRanges.contains(element.time)).toList(),
        )
        ..take(7);

      if (filteredDates.length < 7) {
        filteredDates = fillMissingData(filteredDates, frequency);
      }

      data.removeWhere((element) => dateRanges.contains(element.time));

      insightsGraphs.add([
        charts.Series<GraphInsightData, String>(
          id: '${const Uuid().v4()}-${earliestDate.weekday}',
          colorFn: (GraphInsightData series, _) =>
              insightsChartBarColor(series, pollutant),
          domainFn: (GraphInsightData data, _) =>
              DateFormat('EEE').format(data.time),
          measureFn: (GraphInsightData data, _) => data.chartValue(pollutant),
          data: formatData(filteredDates, frequency),
        ),
      ]);
    }
  }

  return insightsGraphs;
}

List<charts.Series<GraphInsightData, String>> miniInsightsChartData(
  List<GraphInsightData> insights,
  Pollutant pollutant,
) {
  var data = <GraphInsightData>[...insights];

  if (data.length < 24) {
    data = fillMissingData(data, Frequency.hourly);
  }

  data.take(24);

  return <charts.Series<GraphInsightData, String>>[
    charts.Series<GraphInsightData, String>(
      id: '${const Uuid().v4()}-${data.first.time.day}',
      colorFn: (GraphInsightData series, _) =>
          insightsChartBarColor(series, pollutant),
      domainFn: (GraphInsightData data, _) {
        final hour = data.time.hour;

        return hour.toString().length == 1 ? '0$hour' : '$hour';
      },
      measureFn: (GraphInsightData data, _) => data.chartValue(pollutant),
      data: formatData(
        data,
        Frequency.hourly,
      ),
    ),
  ];
}

List<GraphInsightData> fillMissingData(
  List<GraphInsightData> data,
  Frequency frequency,
) {
  final insights = <GraphInsightData>[...data];

  switch (frequency) {
    case Frequency.daily:
      final referenceInsight = data.first;

      var startDate = DateTime.now().getFirstDateOfCalendarMonth();
      final lastDayOfCalendar = DateTime.now().getLastDateOfCalendarMonth();

      while (startDate.isBefore(lastDayOfCalendar)) {
        final checkDate = insights
            .where(
              (element) =>
                  (element.time.day == startDate.day) &&
                  (element.time.month == startDate.month),
            )
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            GraphInsightData(
              time: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              empty: true,
              forecast: false,
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

      var startDate = referenceInsight.time
          .getDateOfFirstDayOfWeek()
          .getDateOfFirstHourOfDay();
      final lastDayOfWeek = referenceInsight.time
          .getDateOfLastDayOfWeek()
          .getDateOfLastHourOfDay();

      while (startDate.isBefore(lastDayOfWeek)) {
        final checkDate = insights
            .where((element) =>
                (element.time.hour == startDate.hour) &&
                (element.time.day == startDate.day))
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            GraphInsightData(
              time: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              empty: true,
              forecast: false,
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
