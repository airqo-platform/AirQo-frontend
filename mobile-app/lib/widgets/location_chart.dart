import 'package:app/models/chartData.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class LocationBarChart extends StatelessWidget {
  LocationBarChart(this.seriesList);

  final List<charts.Series<TimeSeriesSales, DateTime>> seriesList;

  @override
  Widget build(BuildContext context) {
    return charts.TimeSeriesChart(
      seriesList,
      animate: true,
      defaultRenderer: charts.BarRendererConfig<DateTime>(),
      defaultInteractions: false,
      behaviors: [charts.SelectNearest(), charts.DomainHighlighter()],
    );
  }

  // @override
  // Widget build(BuildContext context) {
  //   return Container(
  //     height: 400,
  //     padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
  //     child: Card(
  //       child: Padding(
  //         padding: const EdgeInsets.all(8.0),
  //         child: Column(
  //           children: <Widget>[
  //             Expanded(
  //               child: charts.TimeSeriesChart(
  //                 seriesList,
  //                 animate: true,
  //                 defaultRenderer: charts.BarRendererConfig<DateTime>(),
  //                 defaultInteractions: false,
  //                 behaviors: [
  //                   charts.SelectNearest(),
  //                   charts.DomainHighlighter()
  //                 ],
  //               ),
  //             )
  //           ],
  //         ),
  //       ),
  //     ),
  //   );
  // }

  /// Create one series with sample hard coded data.
  static List<charts.Series<TimeSeriesSales, DateTime>> _createSampleData() {
    final data = [
      new TimeSeriesSales(new DateTime(2017, 9, 1), 5),
      new TimeSeriesSales(new DateTime(2017, 9, 2), 5),
      new TimeSeriesSales(new DateTime(2017, 9, 3), 25),
      new TimeSeriesSales(new DateTime(2017, 9, 4), 100),
      new TimeSeriesSales(new DateTime(2017, 9, 5), 75),
      new TimeSeriesSales(new DateTime(2017, 9, 6), 88),
      new TimeSeriesSales(new DateTime(2017, 9, 7), 65),
      new TimeSeriesSales(new DateTime(2017, 9, 8), 91),
      new TimeSeriesSales(new DateTime(2017, 9, 9), 100),
      new TimeSeriesSales(new DateTime(2017, 9, 10), 111),
      new TimeSeriesSales(new DateTime(2017, 9, 11), 90),
      new TimeSeriesSales(new DateTime(2017, 9, 12), 50),
      new TimeSeriesSales(new DateTime(2017, 9, 13), 40),
      new TimeSeriesSales(new DateTime(2017, 9, 14), 30),
      new TimeSeriesSales(new DateTime(2017, 9, 15), 40),
      new TimeSeriesSales(new DateTime(2017, 9, 16), 50),
      new TimeSeriesSales(new DateTime(2017, 9, 17), 30),
      new TimeSeriesSales(new DateTime(2017, 9, 18), 35),
      new TimeSeriesSales(new DateTime(2017, 9, 19), 40),
      new TimeSeriesSales(new DateTime(2017, 9, 20), 32),
      new TimeSeriesSales(new DateTime(2017, 9, 21), 31),
    ];

    return [
      charts.Series<TimeSeriesSales, DateTime>(
        id: 'Location',
        colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
        domainFn: (TimeSeriesSales sales, _) => sales.time,
        measureFn: (TimeSeriesSales sales, _) => sales.sales,
        data: data,
      )
    ];
  }
}
