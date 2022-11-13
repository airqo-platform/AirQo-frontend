import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/extensions.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';

charts.Color historicalInsightsChartBarColor(
  ChartData series,
  Pollutant pollutant,
) {
  if (series.available) {
    return charts.ColorUtil.fromDartColor(
      CustomColors.greyColor,
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

List<List<charts.Series<ChartData, String>>> createChartsList(
  List<ChartData> insights,
  Pollutant pollutant,
  Frequency frequency,
) {
  final data = <ChartData>[...insights];

  final graphs = <List<charts.Series<ChartData, String>>>[];

  if (frequency == Frequency.hourly) {
    while (data.isNotEmpty) {
      final earliestDate = data.reduce((value, element) {
        if (value.dateTime.isBefore(element.dateTime)) {
          return value;
        }

        return element;
      }).dateTime;

      var filteredDates = data
          .where((element) => element.dateTime.day == earliestDate.day)
          .toList();

      if (filteredDates.length < 24) {
        filteredDates = fillMissingData(filteredDates, frequency);
      }

      filteredDates.take(24);

      graphs.add([
        charts.Series<ChartData, String>(
          id: '${const Uuid().v4()}-${earliestDate.day}',
          colorFn: (ChartData series, _) =>
              historicalInsightsChartBarColor(series, pollutant),
          domainFn: (ChartData data, _) {
            final hour = data.dateTime.hour;

            return hour.toString().length == 1 ? '0$hour' : '$hour';
          },
          measureFn: (ChartData data, _) => data.chartValue(pollutant),
          data: formatData(
            filteredDates,
            frequency,
          ),
        ),
      ]);
      data.removeWhere(
        (element) => element.dateTime.day == earliestDate.day,
      );
    }
  } else {
    while (data.isNotEmpty) {
      var earliestDate = data.reduce((value, element) {
        if (value.dateTime.isBefore(element.dateTime)) {
          return value;
        }

        return element;
      }).dateTime;

      final dateRanges = <DateTime>[];
      var filteredDates = <ChartData>[];

      while (dateRanges.length != 7) {
        dateRanges.add(earliestDate);
        earliestDate = earliestDate.add(const Duration(days: 1));
      }

      filteredDates
        ..addAll(
          data
              .where((element) => dateRanges.contains(element.dateTime))
              .toList(),
        )
        ..take(7);

      if (filteredDates.length < 7) {
        filteredDates = fillMissingData(filteredDates, frequency);
      }

      data.removeWhere((element) => dateRanges.contains(element.dateTime));

      graphs.add([
        charts.Series<ChartData, String>(
          id: '${const Uuid().v4()}-${earliestDate.weekday}',
          colorFn: (ChartData series, _) =>
              historicalInsightsChartBarColor(series, pollutant),
          domainFn: (ChartData data, _) =>
              DateFormat('EEE').format(data.dateTime),
          measureFn: (ChartData data, _) => data.chartValue(pollutant),
          data: formatData(filteredDates, frequency),
        ),
      ]);
    }
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
      colorFn: (ChartData series, _) =>
          historicalInsightsChartBarColor(series, pollutant),
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
