import 'package:app/constants/config.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/place_details.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/string_extension.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';

charts.Color getChartBarColor(HistoricalMeasurement series, pollutant) {
  if (series.formattedTime.isAfter(DateTime.now())) {
    return charts.ColorUtil.fromDartColor(Config.appColorPaleBlue);
  }
  return pmToChartColor(series.getPm2_5Value(), pollutant);
}

charts.Color getInsightsChartBarColor(InsightsChartData series) {
  if (!series.available) {
    return charts.ColorUtil.fromDartColor(Config.greyColor);
  }

  if (series.isForecast) {
    return charts.ColorUtil.fromDartColor(Config.appColorPaleBlue);
  }

  return pmToChartColor(series.value, series.pollutant);
}

charts.Color insightsChartBarColor(Insights series, String pollutant) {
  if (series.isEmpty) {
    return charts.ColorUtil.fromDartColor(Config.greyColor);
  }

  if (series.isForecast) {
    return charts.ColorUtil.fromDartColor(Config.appColorPaleBlue);
  }

  return pmToChartColor(series.getChartValue(pollutant), pollutant);
}

List<List<charts.Series<Insights, String>>> insightsChartData(
    List<Insights> insights, String pollutant, String frequency) {
  var data = <Insights>[...insights];

  var insightsGraphs = <List<charts.Series<Insights, String>>>[];

  if (frequency == 'hourly') {
    while (data.isNotEmpty) {
      var randomDate = data.first.time;
      var filteredDates =
          data.where((element) => element.time.day == randomDate.day).toList();
      insightsGraphs.add([
        charts.Series<Insights, String>(
          id: 'Insights ${pollutant.toTitleCase()} Chart data',
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
      data.removeWhere((element) => element.time.day == randomDate.day);
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

      data.removeWhere((element) => dateRanges.contains(element.time));

      insightsGraphs.add([
        charts.Series<Insights, String>(
          id: 'Insights ${pollutant.toTitleCase()} Chart data',
          colorFn: (Insights series, _) =>
              insightsChartBarColor(series, pollutant),
          domainFn: (Insights data, _) => DateFormat('EEE').format(data.time),
          measureFn: (Insights data, _) => data.getChartValue(pollutant),
          data: Insights.formatData(filteredDates, frequency),
        )
      ]);
    }

    // while(data.isNotEmpty){
    //   var randomDate = data.first.time;
    //   var filteredDates = data.where(
    //           (element) => element.time.day == randomDate.day).toList();
    //   insightsGraphs.add([
    //     charts.Series<Insights, String>(
    //       id: 'Insights ${pollutant.toTitleCase()} Chart data',
    //       colorFn: (Insights series, _) =>
    //           insightsChartBarColor(series, pollutant),
    //       domainFn: (Insights data, _) =>
    //           DateFormat('EEE').format(data.time),
    //       measureFn: (Insights data, _) => data.getChartValue(pollutant),
    //       data: filteredDates,
    //     )
    //   ]);
    //   data.removeWhere((element) => element.time.day == randomDate.day);
    // }
  }

  return insightsGraphs;
}

List<charts.Series<InsightsChartData, String>> insightsDailyChartData(
  List<HistoricalMeasurement> allMeasurements,
  String pollutant,
  PlaceDetails placeDetails,
  List<InsightsChartData> insightsChartData,
  List<HistoricalMeasurement> measurements,
) {
  var data = insightsChartData;
  if (data.isEmpty) {
    data = InsightsChartData.getDailyInsightsData(
        allMeasurements, pollutant, placeDetails, measurements);
  }

  return [
    charts.Series<InsightsChartData, String>(
      id: 'Insights Daily Chart data',
      colorFn: (InsightsChartData series, _) =>
          getInsightsChartBarColor(series),
      domainFn: (InsightsChartData data, _) =>
          DateFormat('EEE').format(data.time),
      measureFn: (InsightsChartData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Historical',
    )
  ];
}

List<charts.Series<InsightsChartData, String>> insightsHourlyChartData(
  List<HistoricalMeasurement> allMeasurements,
  String pollutant,
  PlaceDetails placeDetails,
  List<InsightsChartData> insightsChartData,
  List<HistoricalMeasurement> measurements,
) {
  var data = insightsChartData;
  if (data.isEmpty) {
    data = InsightsChartData.getHourlyInsightsData(
        allMeasurements, pollutant, placeDetails, measurements);
  }

  return [
    charts.Series<InsightsChartData, String>(
      id: 'Insights Hourly Chart data',
      colorFn: (InsightsChartData series, _) =>
          getInsightsChartBarColor(series),
      domainFn: (InsightsChartData data, _) {
        var hour = data.time.hour;
        return hour.toString().length == 1 ? '0$hour' : '$hour';
      },
      measureFn: (InsightsChartData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Historical',
    )
  ];
}
