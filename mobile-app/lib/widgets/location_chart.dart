import 'package:app/models/chartData.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class LocationBarChart extends StatelessWidget {
  LocationBarChart(this.seriesList);

  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;

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

}
