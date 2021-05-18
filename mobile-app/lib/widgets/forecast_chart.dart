import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class ForecastBarChart extends StatelessWidget {
  ForecastBarChart(this.seriesList);

  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      height: 300,
      padding: const EdgeInsets.fromLTRB(12, 10, 5, 10),
      child: Column(
        children: <Widget>[
          const Center(
            child: Text(
              '24 hour Forecast',
              softWrap: true,
              style: TextStyle(
                  fontSize: 17, color: appColor, fontWeight: FontWeight.bold),
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
