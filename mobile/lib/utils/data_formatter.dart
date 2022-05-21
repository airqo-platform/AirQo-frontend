import 'package:app/constants/config.dart';
import 'package:app/models/insights.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';

import '../models/enum_constants.dart';

charts.Color insightsChartBarColor(Insights series, Pollutant pollutant) {
  if (series.empty) {
    return charts.ColorUtil.fromDartColor(Config.greyColor);
  } else if (series.forecast) {
    return charts.ColorUtil.fromDartColor(Config.appColorBlue.withOpacity(0.5));
  } else {
    return pollutantChartValueColor(series.getChartValue(pollutant), pollutant);
  }
}

List<List<charts.Series<Insights, String>>> insightsChartData(
    List<Insights> insights, Pollutant pollutant, Frequency frequency) {
  var data = <Insights>[...insights];

  var insightsGraphs = <List<charts.Series<Insights, String>>>[];

  if (frequency == Frequency.hourly) {
    while (data.isNotEmpty) {
      var earliestDate = data.reduce((value, element) {
        if (value.time.isBefore(element.time)) {
          return value;
        }
        return element;
      }).time;

      var filteredDates = data
          .where((element) => element.time.day == earliestDate.day)
          .toList();

      if (filteredDates.length != 24) {
        filteredDates = patchMissingData(filteredDates, frequency, false);
      }

      insightsGraphs.add([
        charts.Series<Insights, String>(
          id: '${const Uuid().v4()}-${earliestDate.day}',
          colorFn: (Insights series, _) =>
              insightsChartBarColor(series, pollutant),
          domainFn: (Insights data, _) {
            var hour = data.time.hour;
            return hour.toString().length == 1 ? '0$hour' : '$hour';
          },
          measureFn: (Insights data, _) => data.getChartValue(pollutant),
          data: Insights.formatData(filteredDates, frequency),
        )
      ]);
      data.removeWhere((element) => element.time.day == earliestDate.day);
    }
  } else {
    while (data.isNotEmpty) {
      var earliestDate = data.reduce((value, element) {
        if (value.time.isBefore(element.time)) {
          return value;
        }
        return element;
      }).time;

      var dateRanges = <DateTime>[];
      var filteredDates = <Insights>[];

      while (dateRanges.length != 7) {
        dateRanges.add(earliestDate);
        earliestDate = earliestDate.add(const Duration(days: 1));
      }

      filteredDates.addAll(
          data.where((element) => dateRanges.contains(element.time)).toList());

      if (filteredDates.length != 7) {
        filteredDates = patchMissingData(filteredDates, frequency, false);
      }

      data.removeWhere((element) => dateRanges.contains(element.time));

      insightsGraphs.add([
        charts.Series<Insights, String>(
          id: '${const Uuid().v4()}-${earliestDate.weekday}',
          colorFn: (Insights series, _) =>
              insightsChartBarColor(series, pollutant),
          domainFn: (Insights data, _) => DateFormat('EEE').format(data.time),
          measureFn: (Insights data, _) => data.getChartValue(pollutant),
          data: Insights.formatData(filteredDates, frequency),
        )
      ]);
    }
  }

  return insightsGraphs;
}

List<Insights> patchMissingData(
    List<Insights> data, Frequency frequency, bool full) {
  var insights = <Insights>[...data];
  if (frequency == Frequency.daily && full) {
    var referenceInsight = data.first;

    var startDate = DateTime.now().getFirstDateOfCalendarMonth();
    var lastDayOfCalendar = DateTime.now().getLastDateOfCalendarMonth();

    while (startDate.isBefore(lastDayOfCalendar)) {
      var checkDate = insights
          .where((element) =>
              (element.time.day == startDate.day) &&
              (element.time.month == startDate.month))
          .toList();

      if (checkDate.isEmpty) {
        insights.add(Insights(
            startDate,
            referenceInsight.pm2_5,
            referenceInsight.pm10,
            true,
            false,
            referenceInsight.siteId,
            referenceInsight.frequency));
      }

      startDate = startDate.add(const Duration(days: 1));
    }
  } else if (frequency == Frequency.hourly && full) {
    var referenceInsight = data.first;

    var startDate = referenceInsight.time
        .getDateOfFirstDayOfWeek()
        .getDateOfFirstHourOfDay();
    var lastDayOfWeek =
        referenceInsight.time.getDateOfLastDayOfWeek().getDateOfLastHourOfDay();

    while (startDate.isBefore(lastDayOfWeek)) {
      var checkDate = insights
          .where((element) =>
              (element.time.hour == startDate.hour) &&
              (element.time.day == startDate.day))
          .toList();

      if (checkDate.isEmpty) {
        insights.add(Insights(
            startDate,
            referenceInsight.pm2_5,
            referenceInsight.pm10,
            true,
            false,
            referenceInsight.siteId,
            referenceInsight.frequency));
      }

      startDate = startDate.add(const Duration(hours: 1));
    }
  } else if (frequency == Frequency.hourly && !full) {
    var referenceInsight = data.first;

    var startDate = referenceInsight.time.getDateOfFirstHourOfDay();
    var lastDayOfWeek = referenceInsight.time.getDateOfLastHourOfDay();

    while (startDate.isBefore(lastDayOfWeek)) {
      var checkDate = insights
          .where((element) =>
              (element.time.hour == startDate.hour) &&
              (element.time.day == startDate.day))
          .toList();

      if (checkDate.isEmpty) {
        insights.add(Insights(
            startDate,
            referenceInsight.pm2_5,
            referenceInsight.pm10,
            true,
            false,
            referenceInsight.siteId,
            referenceInsight.frequency));
      }

      startDate = startDate.add(const Duration(hours: 1));
    }
  } else if (frequency == Frequency.daily && !full) {
    var referenceInsight = data.first;

    var startDate = referenceInsight.time.getDateOfFirstDayOfWeek();
    var lastDayOfWeek = referenceInsight.time.getDateOfLastDayOfWeek();

    while (startDate.isBefore(lastDayOfWeek)) {
      var checkDate = insights
          .where((element) =>
              (element.time.day == startDate.day) &&
              (element.time.month == startDate.month))
          .toList();

      if (checkDate.isEmpty) {
        insights.add(Insights(
            startDate,
            referenceInsight.pm2_5,
            referenceInsight.pm10,
            true,
            false,
            referenceInsight.siteId,
            referenceInsight.frequency));
      }

      startDate = startDate.add(const Duration(days: 1));
    }
  } else {
    return insights;
  }

  return Insights.formatData(insights, frequency);
}
