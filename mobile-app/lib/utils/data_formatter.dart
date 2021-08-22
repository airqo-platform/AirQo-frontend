import 'package:app/models/chartData.dart';
import 'package:app/models/hourly.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/predict.dart';
import 'package:app/models/series.dart';
import 'package:app/utils/ui/pm.dart';
import 'package:app/widgets/location_chart.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Pm2_5TimeSeries {
  Pm2_5TimeSeries(this.time, this.pm2_5Value);

  final DateTime time;
  final double pm2_5Value;
}

List<charts.Series<Pm2_5TimeSeries, DateTime>> createPm2_5ChartData(
    List<Hourly> data) {
  var values = <Pm2_5TimeSeries>[];
  for (var value in data) {
    var time = value.time.replaceAll(' GMT', '');

    values.add(Pm2_5TimeSeries(DateTime.parse(time), value.pm2_5));
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

List<charts.Series<ValueSeries, DateTime>> createComaprisonData(
    List<Measurement> measurements) {
  var device_01 = 675740;
  var device_02 = 675801;

  var device_01_data = <ValueSeries>[];
  var device_02_data = <ValueSeries>[];
  var base_data = <ValueSeries>[];

  for (var measurement in measurements) {
    // var time = measurement.time.replaceAll('T', ' ');
    // time = time.substring(0, time.indexOf('.'));

    var time = measurement.time.substring(0, measurement.time.indexOf('.'));

    var date = DateTime.parse(time);

    // if (measurement.deviceNumber == device_01) {
    //   device_01_data.add(ValueSeries(date, measurement.pm2_5.value.ceil()));
    // } else {
    //   device_02_data.add(ValueSeries(date, measurement.pm2_5.value.ceil()));
    // }

    base_data.add(ValueSeries(date, 50));
  }

  return [
    charts.Series<ValueSeries, DateTime>(
      id: device_01.toString(),
      colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
      domainFn: (ValueSeries sales, _) => sales.time,
      measureFn: (ValueSeries sales, _) => sales.values,
      data: device_01_data,
    ),
    new charts.Series<ValueSeries, DateTime>(
      id: device_02.toString(),
      colorFn: (_, __) => charts.MaterialPalette.red.shadeDefault,
      domainFn: (ValueSeries sales, _) => sales.time,
      measureFn: (ValueSeries sales, _) => sales.values,
      data: device_02_data,
    ),
    new charts.Series<ValueSeries, DateTime>(
        id: 'Mobile',
        colorFn: (_, __) => charts.MaterialPalette.green.shadeDefault,
        domainFn: (ValueSeries sales, _) => sales.time,
        measureFn: (ValueSeries sales, _) => sales.values,
        data: base_data)
// Configure our custom point renderer for this series.
      ..setAttribute(charts.rendererIdKey, 'customPoint'),
  ];
}

List<charts.Series<TimeSeriesData, DateTime>> createChartData(
    List<Measurement> measurements) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    var time = measurement.time.substring(0, measurement.time.indexOf('.'));

    var date = DateTime.parse(time);

    data.add(TimeSeriesData(date, measurement.pm2_5.value.ceil()));
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

List<charts.Series<TimeSeriesData, DateTime>> historicalChartData(
    List<Measurement> measurements) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    var time = measurement.time.substring(0, measurement.time.indexOf('.'));

    var date = DateTime.parse(time);

    data.add(TimeSeriesData(date, measurement.pm2_5.value.ceil()));
  }

  return [
    charts.Series<TimeSeriesData, DateTime>(
      id: 'Historical',
      colorFn: (TimeSeriesData series, _) =>
          pmToChartColor(series.value.toDouble()),
      domainFn: (TimeSeriesData sales, _) => sales.time,
      measureFn: (TimeSeriesData sales, _) => sales.value,
      data: data,
    )
  ];
}

List<charts.Series<TimeSeriesData, DateTime>> hourlyChartData(
    List<Hourly> measurements) {
  var data = <TimeSeriesData>[];

  for (var measurement in measurements) {
    final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');
    final dateTime = formatter.parse(measurement.time);

    var date = DateTime.parse(dateTime.toString());

    data.add(TimeSeriesData(date, measurement.pm2_5.ceil()));
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

  for (var prediction in predictions) {
    final formatter = DateFormat('EEE, d MMM yyyy HH:mm:ss');
    final dateTime = formatter.parse(prediction.time);

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
