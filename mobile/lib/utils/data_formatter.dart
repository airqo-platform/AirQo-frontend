import 'package:app/constants/app_constants.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/place_details.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

charts.Color getChartBarColor(HistoricalMeasurement series, pollutant) {
  if (series.formattedTime.isAfter(DateTime.now())) {
    return charts.ColorUtil.fromDartColor(ColorConstants.appColorPaleBlue);
  }
  return pmToChartColor(series.getPm2_5Value(), pollutant);
}

charts.Color getInsightsChartBarColor(InsightsChartData series) {
  if (!series.available) {
    return charts.ColorUtil.fromDartColor(ColorConstants.greyColor);
  }

  if (series.time.isAfter(DateTime.now())) {
    return charts.ColorUtil.fromDartColor(ColorConstants.appColorPaleBlue);
  }
  return pmToChartColor(series.value, series.pollutant);
}

List<charts.Series<HistoricalMeasurement, DateTime>> insightsChartData(
    List<HistoricalMeasurement> measurements, String pollutant) {
  var data = <HistoricalMeasurement>[];

  for (var measurement in measurements) {
    try {
      var updatedValue = measurement;
      final dateTime = DateTime.parse(measurement.time);
      updatedValue.formattedTime = dateTime;
      data.add(updatedValue);
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  if (pollutant == 'pm2.5') {
    return [
      charts.Series<HistoricalMeasurement, DateTime>(
        id: 'Historical',
        colorFn: (HistoricalMeasurement series, _) =>
            getChartBarColor(series, 'pm2.5'),
        domainFn: (HistoricalMeasurement data, _) => data.formattedTime,
        measureFn: (HistoricalMeasurement data, _) => data.getPm2_5Value(),
        // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
        // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
        data: data,
        // displayName: 'Historical',
      )
    ];
  }

  return [
    charts.Series<HistoricalMeasurement, DateTime>(
      id: 'Historical',
      colorFn: (HistoricalMeasurement series, _) =>
          getChartBarColor(series, 'pm10'),
      domainFn: (HistoricalMeasurement data, _) => data.formattedTime,
      measureFn: (HistoricalMeasurement data, _) => data.getPm10Value(),
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Historical',
    )
  ];
}

List<charts.Series<InsightsChartData, String>> insightsDailyChartData(
    List<HistoricalMeasurement> measurements,
    String pollutant,
    PlaceDetails placeDetails) {
  var data = InsightsChartData.getDailyInsightsData(
      measurements, pollutant, placeDetails);

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
    List<HistoricalMeasurement> measurements,
    String pollutant,
    PlaceDetails placeDetails) {
  var data = InsightsChartData.getHourlyInsightsData(
      measurements, pollutant, placeDetails);

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
