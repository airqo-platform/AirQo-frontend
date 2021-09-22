import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:charts_flutter/flutter.dart' as charts;

class ReadingsCard extends StatefulWidget {
  const ReadingsCard({Key? key}) : super(key: key);

  @override
  _ReadingsCardState createState() => _ReadingsCardState();
}

class _ReadingsCardState extends State<ReadingsCard> {

  final List<charts.Series> seriesList = _createSampleData();

  static List<charts.Series<GaugeSegment, String>> _createSampleData() {
    final data = [
      GaugeSegment('Good', 1, 6),
      GaugeSegment('Moderate', 1, 25),
      GaugeSegment('Sensitive', 1, 40),
      GaugeSegment('Unhealthy', 1, 100),
      GaugeSegment('Very Unhealthy', 1, 200),
      GaugeSegment('Hazardous', 1, 400),
    ];

    return [
      charts.Series<GaugeSegment, String>(
        id: 'Segments',
        colorFn: (GaugeSegment series, _) =>
            pmToChartColor(series.colorValue.toDouble()),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10.0, 8.0, 8.0, 8.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(5.0))
      ),

      child: Column(
        children: [
          titleSection(),
          footerSection()
        ],
      ),
    );
  }
  Widget graphSection() {
    return Padding(padding: EdgeInsets.all(8.0),
      child:  Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
              'Local Time',
              style: TextStyle(
                color: ColorConstants.appColor,
                fontSize: 12,
              )),
          const Spacer(),
          IconButton(onPressed: null, icon: Image.asset(
            'assets/images/heart.png',
          )),

          OutlinedButton(onPressed: (){},
            style: OutlinedButton.styleFrom(
                backgroundColor: ColorConstants.appColorBlue
            ),
            child: Text('SHARE',
                style: TextStyle(fontSize: 13, color: Colors.white)
            ),),
          // TextButton(
          //   // style: ButtonStyle(
          //   //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
          //   // ),
          //   onPressed: () {},
          //   child: Card(
          //       elevation: 5,
          //       shape: RoundedRectangleBorder(
          //         borderRadius: BorderRadius.circular(5),
          //       ),
          //       color: ColorConstants.appColor,
          //       child: const Padding(
          //         padding: EdgeInsets.all(8),
          //         child: Text('SHARE',
          //             style: TextStyle(fontSize: 13, color: Colors.white)
          //         ),
          //       )),
          // )
        ],
      ),
    );

  }


  Widget titleSection() {
    return Row(
      children: [
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Container(
                decoration: const BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.all(Radius.circular(15.0))
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8.0, 4.0, 8.0, 4.0),
                  child: Row(
                    children: [
                      Icon(Icons.location_on,
                        size: 15,
                      ),
                      Expanded(child:    Text('Kawempe',
                          softWrap: true,
                          maxLines: 1,
                          textAlign: TextAlign.start,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.bold)),),


                    ],
                  ),
                )
            ),
            Text('High',
                softWrap: true,
                maxLines: 1,
                textAlign: TextAlign.start,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold))
          ],
        )),
        Expanded(
          child: Text(''),),
        gaugeChart(),
      ],
    );
  }

  Widget footerSection() {
    return           Padding(padding: EdgeInsets.all(8.0),
      child:  Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
              'Local Time',
              style: TextStyle(
                color: ColorConstants.appColor,
                fontSize: 12,
              )),
          const Spacer(),
          IconButton(onPressed: null, icon: Image.asset(
            'assets/images/heart.png',
          )),

          OutlinedButton(onPressed: (){},
            style: OutlinedButton.styleFrom(
                backgroundColor: ColorConstants.appColorBlue
            ),
            child: Text('SHARE',
                style: TextStyle(fontSize: 13, color: Colors.white)
            ),),
          // TextButton(
          //   // style: ButtonStyle(
          //   //   foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
          //   // ),
          //   onPressed: () {},
          //   child: Card(
          //       elevation: 5,
          //       shape: RoundedRectangleBorder(
          //         borderRadius: BorderRadius.circular(5),
          //       ),
          //       color: ColorConstants.appColor,
          //       child: const Padding(
          //         padding: EdgeInsets.all(8),
          //         child: Text('SHARE',
          //             style: TextStyle(fontSize: 13, color: Colors.white)
          //         ),
          //       )),
          // )
        ],
      ),
    );

  }

  Widget gaugeChart() {
    return Container(
      height: 100.0,
      width: 100.0,
      child: charts.PieChart(
        seriesList,
        animate: false,
        defaultRenderer: charts.ArcRendererConfig(
          arcWidth: 3,
          startAngle: 4 / 5 * pi,
          arcLength: 7 / 5 * pi,
          strokeWidthPx: 0,
          // arcRendererDecorators: [new charts.ArcLabelDecorator(
          //   showLeaderLines: false,
          //   labelPosition: charts.ArcLabelPosition.inside,
          // )],
        ),
      ),
    );
  }
}


class GaugeSegment {
  final String segment;
  final int size;
  final int colorValue;

  GaugeSegment(this.segment, this.size, this.colorValue);

  static List<charts.Series<GaugeSegment, String>> createSampleData() {
    final data = [
      GaugeSegment('Good', 1, 6),
      GaugeSegment('Moderate', 1, 25),
      GaugeSegment('Sensitive', 1, 40),
      GaugeSegment('Unhealthy', 1, 100),
      GaugeSegment('Very Unhealthy', 1, 200),
      GaugeSegment('Hazardous', 1, 400),
    ];

    return [
      charts.Series<GaugeSegment, String>(
        id: 'Segments',
        colorFn: (GaugeSegment series, _) =>
            pmToChartColor(series.colorValue.toDouble()),
        domainFn: (GaugeSegment segment, _) => segment.segment,
        measureFn: (GaugeSegment segment, _) => segment.size,
        data: data,
      )
    ];
  }
}