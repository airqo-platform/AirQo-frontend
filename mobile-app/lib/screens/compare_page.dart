import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/data_formatter.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/widgets/compare_chart.dart';
import 'package:app/widgets/location_chart.dart';
import 'package:flutter/material.dart';
import 'package:charts_flutter/flutter.dart' as charts;

class ComparePage extends StatefulWidget {
  @override
  _ComparePageState createState() => _ComparePageState();
}

class _ComparePageState extends State<ComparePage> {
  final firstPlaceController = TextEditingController();
  final secondPlaceController = TextEditingController();
  bool displayShareIcon = false;

  var apiClient;

  @override
  void initState() {
    apiClient = AirqoApiClient(context);
  }

  void setShareIcon(value) {
    setState(() {
      displayShareIcon = value;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(0, 4, 0, 0),
        child: ListView(
          children: <Widget>[
            formInput(),
            // lineDisplay(),
            FutureBuilder(
                future: apiClient.fetchComparisonMeasurements(),
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: graphDisplay(),
                    );
                  } else if (snapshot.hasData) {
                    var data = snapshot.data as List<Measurement>;
                    List<charts.Series<dynamic, DateTime>> dataset =
                        createComaprisonData(data);

                    return ComparisonLineChart(dataset);
                  } else {
                    return Text('Computing');
                  }
                })
          ],
        ),
      ),
    );
  }

  Widget graphDisplay() {
    return LocationCompareChart();
  }

  // Widget lineDisplay() {
  //   return LocationBarChart();
  // }

  Widget formInput() {
    return SingleChildScrollView(
        child: Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
      child: Row(
        children: [
          Expanded(
              child: Column(
            children: [
              firstInput(),
              secondInput(),
            ],
          )),
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                  icon: Icon(Icons.compare_arrows, color: appColor),
                  splashColor: appColor,
                  onPressed: () {
                    // setShareIcon(true);
                  }),
              // displayShareIcon ?
              IconButton(
                  icon: Icon(
                    Icons.share_outlined,
                    color: appColor,
                  ),
                  splashColor: appColor,
                  onPressed: () {})
              //     :
              // const Placeholder(),
            ],
          )
        ],
      ),
    ));
  }

  Widget firstInput() {
    return TextFormField(
      controller: firstPlaceController,
      decoration: const InputDecoration(
        labelText: 'First Place',
        // helperText: 'Optional',
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Required';
        }
        return null;
      },
      onChanged: (value) {},
      textInputAction: TextInputAction.next,
    );
  }

  Widget secondInput() {
    return TextFormField(
      controller: secondPlaceController,
      decoration: const InputDecoration(
        labelText: 'Second Place',
      ),
      textInputAction: TextInputAction.done,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Required';
        }
        return null;
      },
    );
  }
}
