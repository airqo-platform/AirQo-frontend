import 'package:app/models/series.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class ComparisonLineChart extends StatelessWidget {
  final List<charts.Series<dynamic, DateTime>> dataset;

  ComparisonLineChart(this.dataset);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      padding: EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Expanded(
                child: charts.TimeSeriesChart(
                  dataset,
                  animate: true,
                  defaultRenderer: new charts.LineRendererConfig(),
                  customSeriesRenderers: [
                    new charts.PointRendererConfig(
                        customRendererId: 'customPoint')
                  ],
                  dateTimeFactory: const charts.LocalDateTimeFactory(),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class LocationCompareChart extends StatelessWidget {
  final List<charts.Series<dynamic, DateTime>> seriesList = _createSampleData();
  final bool animate = false;

  //
  // LocationCompareChart(this.seriesList);

  // factory LocationCompareChart.withSampleData() {
  //   return new DateTimeComboLinePointChart(
  //     _createSampleData(),
  //     // animate: false,
  //   );
  // }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      padding: EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Expanded(
                child: charts.TimeSeriesChart(
                  seriesList,
                  animate: true,
                  defaultRenderer: new charts.LineRendererConfig(),
                  customSeriesRenderers: [
                    new charts.PointRendererConfig(
                        customRendererId: 'customPoint')
                  ],
                  dateTimeFactory: const charts.LocalDateTimeFactory(),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  /// Create one series with sample hard coded data.
  static List<charts.Series<ValueSeries, DateTime>> _createSampleData() {
    final desktopSalesData = [
      new ValueSeries(new DateTime(2017, 9, 19), 5),
      new ValueSeries(new DateTime(2017, 9, 26), 25),
      new ValueSeries(new DateTime(2017, 10, 3), 100),
      new ValueSeries(new DateTime(2017, 10, 10), 75),
    ];

    final tableSalesData = [
      new ValueSeries(new DateTime(2017, 9, 19), 10),
      new ValueSeries(new DateTime(2017, 9, 26), 50),
      new ValueSeries(new DateTime(2017, 10, 3), 200),
      new ValueSeries(new DateTime(2017, 10, 10), 150),
    ];

    final mobileSalesData = [
      new ValueSeries(new DateTime(2017, 9, 19), 80),
      new ValueSeries(new DateTime(2017, 9, 26), 80),
      new ValueSeries(new DateTime(2017, 10, 3), 0),
      new ValueSeries(new DateTime(2017, 10, 10), 100),
    ];

    return [
      new charts.Series<ValueSeries, DateTime>(
        id: 'Makerere',
        colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
        domainFn: (ValueSeries sales, _) => sales.time,
        measureFn: (ValueSeries sales, _) => sales.values,
        data: desktopSalesData,
      ),
      new charts.Series<ValueSeries, DateTime>(
        id: 'Kyambogo',
        colorFn: (_, __) => charts.MaterialPalette.red.shadeDefault,
        domainFn: (ValueSeries sales, _) => sales.time,
        measureFn: (ValueSeries sales, _) => sales.values,
        data: tableSalesData,
      ),
      new charts.Series<ValueSeries, DateTime>(
          id: 'Mobile',
          colorFn: (_, __) => charts.MaterialPalette.green.shadeDefault,
          domainFn: (ValueSeries sales, _) => sales.time,
          measureFn: (ValueSeries sales, _) => sales.values,
          data: mobileSalesData)
        // Configure our custom point renderer for this series.
        ..setAttribute(charts.rendererIdKey, 'customPoint'),
    ];
  }
}
