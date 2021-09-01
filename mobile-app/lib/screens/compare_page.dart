import 'package:app/constants/app_constants.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/widgets/compare_chart.dart';
import 'package:flutter/material.dart';

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
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(0, 4, 0, 0),
        child: ListView(
          children: <Widget>[formInput(), const Text('Comparing places')],
        ),
      ),
    );
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
                  icon: Icon(Icons.compare_arrows,
                      color: ColorConstants().appColor),
                  splashColor: ColorConstants().appColor,
                  onPressed: () {
                    // setShareIcon(true);
                  }),
              // displayShareIcon ?
              IconButton(
                  icon: Icon(
                    Icons.share_outlined,
                    color: ColorConstants().appColor,
                  ),
                  splashColor: ColorConstants().appColor,
                  onPressed: () {})
              //     :
              // const Placeholder(),
            ],
          )
        ],
      ),
    ));
  }

  Widget graphDisplay() {
    return LocationCompareChart();
  }

  // Widget lineDisplay() {
  //   return LocationBarChart();
  // }

  @override
  void initState() {
    apiClient = AirqoApiClient(context);
    super.initState();
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

  void setShareIcon(value) {
    setState(() {
      displayShareIcon = value;
    });
  }
}
