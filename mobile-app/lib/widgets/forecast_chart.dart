import 'package:app/constants/app_constants.dart';
import 'package:app/models/chartData.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';

class ForecastBarChart extends StatefulWidget {
  final List<charts.Series<TimeSeriesData, DateTime>> seriesList;

  ForecastBarChart(this.seriesList);

  @override
  _ForecastBarChartState createState() => _ForecastBarChartState();
}

class _ForecastBarChartState extends State<ForecastBarChart> {
  var display = null;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: ColorConstants().appColor,
      elevation: 20,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        color: Colors.white,
        height: 300,
        padding: const EdgeInsets.fromLTRB(12, 10, 5, 10),
        child: Column(
          children: <Widget>[
            Center(
              child: Text(
                '24 hour Forecast',
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
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Spacer(
                            flex: 1,
                          ),
                          Text(
                            chartDateToString(display['time']),
                            softWrap: true,
                            style: TextStyle(color: ColorConstants().appColor),
                          ),
                          const Spacer(
                            flex: 1,
                          ),
                          Text(
                            display['value'].toString(),
                            softWrap: true,
                            style: TextStyle(color: ColorConstants().appColor),
                          ),
                          const Spacer(
                            flex: 1,
                          ),
                        ],
                      ),
                      Text(
                        pmToString(display['value']).replaceAll('\n', ' '),
                        softWrap: true,
                        style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            color: ColorConstants().appColor),
                      ),
                    ],
                  )),
            Expanded(
              child: charts.TimeSeriesChart(
                widget.seriesList,
                animate: true,
                defaultRenderer: charts.BarRendererConfig<DateTime>(),
                defaultInteractions: true,
                domainAxis: const charts.DateTimeAxisSpec(
                    tickProviderSpec:
                        charts.DayTickProviderSpec(increments: [1]),
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
                    tickProviderSpec: charts.BasicNumericTickProviderSpec(
                        desiredTickCount: 7)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
