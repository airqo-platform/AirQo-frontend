import 'package:app/models/chartData.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class DashboardBarChart extends StatefulWidget {
  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;
  final String header;

  DashboardBarChart(this.seriesList, this.header);

  @override
  _DashboardBarChartState createState() => _DashboardBarChartState();
}

class _DashboardBarChartState extends State<DashboardBarChart> {
  var display = null;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: <Widget>[
          Container(
            height: 150,
            padding: const EdgeInsets.fromLTRB(5, 10, 5, 10),
            child: charts.TimeSeriesChart(
              widget.seriesList,
              animate: true,
              defaultRenderer: charts.BarRendererConfig<DateTime>(
                  strokeWidthPx: 0, stackedBarPaddingPx: 0),
              defaultInteractions: true,
              domainAxis: const charts.DateTimeAxisSpec(
                  tickProviderSpec: charts.DayTickProviderSpec(increments: [1]),
                  tickFormatterSpec: charts.AutoDateTimeTickFormatterSpec(
                    day: charts.TimeFormatterSpec(
                        format: 'EEE, hh a',
                        transitionFormat: 'EEE, hh a',
                        noonFormat: 'EEE, hh a'),
                  )),
              behaviors: [
                // charts.SeriesLegend(
                //   position: charts.BehaviorPosition.top,
                //   horizontalFirst: false,
                //   desiredMaxRows: 2,
                //   cellPadding: EdgeInsets.only(right: 4.0, bottom: 4.0),
                // ),
                charts.DomainHighlighter(),
                charts.SelectNearest(
                    eventTrigger: charts.SelectionTrigger.tapAndDrag),
                // charts.LinePointHighlighter(
                //   symbolRenderer: CustomCircleSymbolRenderer(size: size),
                // ),
              ],
              selectionModels: [
                charts.SelectionModelConfig(
                    changedListener: (charts.SelectionModel model) {
                  if (model.hasDatumSelection) {
                    try {
                      setState(() {
                        display = {
                          'time': (model.selectedSeries[0]
                                  .domainFn(model.selectedDatum[0].index))
                              .toString(),
                          'value': double.parse((model.selectedSeries[0]
                                  .measureFn(model.selectedDatum[0].index))
                              .toString())
                        };
                      });
                    } on Error catch (e) {
                      print(e);
                    }
                  }
                })
              ],
              primaryMeasureAxis: const charts.NumericAxisSpec(
                  tickProviderSpec:
                      charts.BasicNumericTickProviderSpec(desiredTickCount: 5)),
            ),
          )
        ],
      ),
    );
  }
}
