import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({Key? key}) : super(key: key);

  @override
  _KnowYourAirViewState createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  var favouritePlaces = <Measurement>[];

  @override
  Widget build(BuildContext context) {
    return Container(
        color: ColorConstants.appBodyColor,
        child: ListView.builder(
          itemBuilder: (context, index) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: tipWidget(
                context,
                'Actions You Can Take to '
                'Reduce Air Pollution'),
          ),
          itemCount: 1,
        ));
  }
}
