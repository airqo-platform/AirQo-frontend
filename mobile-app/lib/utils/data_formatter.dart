import 'package:app/models/chartData.dart';
import 'package:app/models/historicalMeasurement.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:intl/intl.dart';

List<charts.Series<TimeSeriesData, DateTime>> createChartData(
    List<Measurement> measurements) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    var time = measurement.time.substring(0, measurement.time.indexOf('.'));

    var date = DateTime.parse(time);

    data.add(TimeSeriesData(date, measurement.getPm2_5Value().ceil()));
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Location',
      colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
      domainFn: (TimeSeriesData sales, _) => sales.time,
      measureFn: (TimeSeriesData sales, _) => sales.value,
      data: data,
    )
  ];
}

List<charts.Series<Pm2_5TimeSeries, DateTime>> createPm2_5ChartData(
    List<HistoricalMeasurement> data) {
  var values = <Pm2_5TimeSeries>[];
  for (var value in data) {
    var time = value.time.replaceAll(' GMT', '');

    values.add(Pm2_5TimeSeries(DateTime.parse(time), value.getPm2_5Value()));
  }

  return [
    charts.Series<Pm2_5TimeSeries, DateTime>(
      id: 'Pm2_5',
      colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
      domainFn: (Pm2_5TimeSeries value, _) => value.time,
      measureFn: (Pm2_5TimeSeries value, _) => value.pm2_5Value,
      data: values,
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
      domainFn: (TimeSeriesData sales, _) => sales.time,
      measureFn: (TimeSeriesData sales, _) => sales.value,
      // measureLowerBoundFn: (TimeSeriesData sales, _) => sales.value - 5,
      // measureUpperBoundFn: (TimeSeriesData sales, _) => sales.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}

List<charts.Series<TimeSeriesData, DateTime>> hourlyChartData(
    List<HistoricalMeasurement> measurements) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');
    final dateTime = formatter.parse(measurement.time);

    var date = DateTime.parse(dateTime.toString());

    data.add(TimeSeriesData(date, measurement.getPm2_5Value().ceil()));
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Historical',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble()),
      domainFn: (TimeSeriesData sales, _) => sales.time,
      measureFn: (TimeSeriesData sales, _) => sales.value,
      // measureLowerBoundFn: (TimeSeriesData sales, _) => sales.value - 5,
      // measureUpperBoundFn: (TimeSeriesData sales, _) => sales.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}

List<charts.Series<TimeSeriesData, DateTime>> predictChartData(
    List<Predict> predictions) {
  var data = <TimeSeriesData>[];

  var offSet = DateTime.now().timeZoneOffset.inHours;

  for (var prediction in predictions) {
    final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');
    // final dateTime = formatter.parse(prediction.time);

    final dateTime = DateTime.parse(formatter.parse(prediction.time).toString())
        .add(Duration(hours: offSet));

    var date = DateTime.parse(dateTime.toString());

    data.add(TimeSeriesData(date, prediction.value.ceil()));
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Predictions',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble()),
      domainFn: (TimeSeriesData sales, _) => sales.time,
      measureFn: (TimeSeriesData sales, _) => sales.value,
      // measureLowerBoundFn: (TimeSeriesData sales, _) => sales.value - 5,
      // measureUpperBoundFn: (TimeSeriesData sales, _) => sales.value + 5,
      data: data,
      // displayName: 'Forecast',
    )
  ];
}

class Pm2_5TimeSeries {
  final DateTime time;

  final double pm2_5Value;

  Pm2_5TimeSeries(this.time, this.pm2_5Value);
}
