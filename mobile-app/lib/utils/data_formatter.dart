import 'package:app/models/chartData.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';

List<charts.Series<TimeSeriesData, DateTime>> forecastChartData(
    List<Predict> predictions) {
  var data = <TimeSeriesData>[];

  for (var prediction in predictions) {
    try {
      final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');
      final timeZoneOffset = DateTime.now().timeZoneOffset;
      final dateTime = DateTime.parse(
          formatter.parse(prediction.time).add(timeZoneOffset).toString());
      data.add(TimeSeriesData(dateTime, prediction.getValue()));
    } catch (e) {
      print(e);
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

List<charts.Series<TimeSeriesData, DateTime>> historicalChartData(
    List<HistoricalMeasurement> measurements, String pollutant) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    try {
      final dateTime = DateTime.parse(measurement.time);
      if (pollutant.trim().toLowerCase() == 'pm2.5') {
        data.add(TimeSeriesData(dateTime, measurement.getPm2_5Value()));
      } else {
        data.add(TimeSeriesData(dateTime, measurement.getPm10Value()));
      }
    } catch (e) {
      print(e);
    }
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Historical',
      colorFn: (TimeSeriesData series, _) {
        if (pollutant.trim().toLowerCase() == 'pm2.5') {
          return pmToChartColor(series.value.toDouble(), 'pm2.5');
        } else {
          return pmToChartColor(series.value.toDouble(), 'pm10');
        }
      },
      domainFn: (TimeSeriesData data, _) => data.time,
      measureFn: (TimeSeriesData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}
