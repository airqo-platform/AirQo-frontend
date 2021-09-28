import 'package:app/models/chartData.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
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

      data.add(TimeSeriesData(dateTime, prediction.value.ceil()));
    } catch (e) {
      print(e);
    }
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Forecast',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble()),
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
    List<HistoricalMeasurement> measurements) {
  var data = <TimeSeriesData>[];

  var offSet = DateTime.now().timeZoneOffset.inHours;

  for (var measurement in measurements) {
    try {
      final dateTime =
          DateTime.parse(measurement.time).add(Duration(hours: offSet));
      data.add(TimeSeriesData(dateTime, measurement.getPm2_5Value().ceil()));
    } catch (e) {
      print(e);
    }
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Historical',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble()),
      domainFn: (TimeSeriesData data, _) => data.time,
      measureFn: (TimeSeriesData data, _) => data.value,
      // measureLowerBoundFn: (TimeSeriesData data, _) => data.value - 5,
      // measureUpperBoundFn: (TimeSeriesData data, _) => data.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}
