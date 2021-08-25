import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class HistoricalBarChart extends StatelessWidget {
  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;

  HistoricalBarChart(this.seriesList);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white54,
      height: 300,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
      child: Column(
        children: <Widget>[
          Center(
            child: Text(
              'Forecast',
              softWrap: true,
              style: TextStyle(
                  fontSize: 17,
                  color: ColorConstants().appColor,
                  fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: charts.TimeSeriesChart(
              seriesList,
              animate: true,
              defaultRenderer: charts.BarRendererConfig<DateTime>(),
              defaultInteractions: true,
              domainAxis: const charts.DateTimeAxisSpec(
                  tickProviderSpec: charts.DayTickProviderSpec(increments: [1]),
                  tickFormatterSpec: charts.AutoDateTimeTickFormatterSpec(
                    day: charts.TimeFormatterSpec(
                        format: 'EEE',
                        transitionFormat: 'EEE',
                        noonFormat: 'EEE'),
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
                    // setState(() {
                    //
                    // });
                    var textSelected = (model.selectedSeries[0]
                            .measureFn(model.selectedDatum[0].index))
                        .toString();
                    print(textSelected);
                  }
                })
              ],
              primaryMeasureAxis: const charts.NumericAxisSpec(
                  tickProviderSpec:
                      charts.BasicNumericTickProviderSpec(desiredTickCount: 7)),
            ),
          )
        ],
      ),
    );
  }
}
