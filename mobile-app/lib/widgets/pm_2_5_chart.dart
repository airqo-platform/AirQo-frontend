import 'package:app/utils/data_formatter.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class PM2_5BarChart extends StatelessWidget {
  final List<charts.Series<Pm2_5TimeSeries, DateTime>> chartData;

  PM2_5BarChart(this.chartData);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Expanded(
                child: charts.TimeSeriesChart(
                  chartData,
                  animate: true,
                  defaultRenderer: charts.BarRendererConfig<DateTime>(),
                  defaultInteractions: false,
                  behaviors: [
                    charts.SelectNearest(),
                    charts.DomainHighlighter()
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
