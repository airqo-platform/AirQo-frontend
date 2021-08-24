import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class HourlyBarChart extends StatefulWidget {
  HourlyBarChart(this.seriesList);

  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;

  @override
  _HourlyBarChartState createState() => _HourlyBarChartState();
}

class _HourlyBarChartState extends State<HourlyBarChart> {
  var display = null;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      height: 300,
      padding: const EdgeInsets.fromLTRB(12, 20, 5, 20),
      child: Column(
        children: <Widget>[
          Center(
            child: Text(
              '48 hour History',
              softWrap: true,
              style: TextStyle(
                  fontSize: 17,
                  color: ColorConstants().appColor,
                  fontWeight: FontWeight.bold),
            ),
          ),
          if (display != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Text(
                    dateToEnglishString(display['time']),
                    softWrap: true,
                    style: TextStyle(color: ColorConstants().appColor),
                  ),
                  Text(
                    display['value'].toString(),
                    softWrap: true,
                    style: TextStyle(color: ColorConstants().appColor),
                  ),
                  Text(
                    pmToString(display['value']),
                    softWrap: true,
                    style: TextStyle(color: ColorConstants().appColor),
                  ),
                ],
              ),
            ),
          Expanded(
            child: charts.TimeSeriesChart(
              widget.seriesList,
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
                      charts.BasicNumericTickProviderSpec(desiredTickCount: 7)),
            ),
          )
        ],
      ),
    );
  }
}
