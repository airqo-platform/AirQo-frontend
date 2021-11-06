import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/models/historical_measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

List<charts.Series<TimeSeriesData, DateTime>> forecastChartData(
    List<Predict> predictions) {
  var data = <TimeSeriesData>[];

  var offSet = DateTime.now().timeZoneOffset.inHours;

  for (var prediction in predictions) {
    try {
      final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');

      final dateTime =
          DateTime.parse(formatter.parse(prediction.time).toString())
              .add(Duration(hours: offSet));

      data.add(TimeSeriesData(dateTime, prediction.value));
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Forecast',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble(), 'pm2.5'),
      domainFn: (TimeSeriesData data, _) => data.time,
      measureFn: (TimeSeriesData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}

charts.Color getChartBarColor(HistoricalMeasurement series, pollutant) {
  if (series.formattedTime.isAfter(DateTime.now())) {
    return charts.ColorUtil.fromDartColor(ColorConstants.appColorPaleBlue);
  }
  return pmToChartColor(series.getPm2_5Value(), pollutant);
}

List<charts.Series<TimeSeriesData, DateTime>> historicalChartData(
    List<HistoricalMeasurement> measurements) {
  var data = <TimeSeriesData>[];

  var offSet = DateTime.now().timeZoneOffset.inHours;

  for (var measurement in measurements) {
    try {
      final dateTime =
          DateTime.parse(measurement.time).add(Duration(hours: offSet));
      data.add(TimeSeriesData(dateTime, measurement.getPm2_5Value()));
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Historical',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble(), 'pm2.5'),
      domainFn: (TimeSeriesData data, _) => data.time,
      measureFn: (TimeSeriesData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
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
