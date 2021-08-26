import 'package:app/constants/app_constants.dart';
import 'package:app/utils/help.dart';
import 'package:flutter/material.dart';

class PollutantsCard extends StatelessWidget {
  final String name;

  final double value;
  final String type;

  PollutantsCard(this.name, this.value, this.type);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (BuildContext context) => getHelpPage(type),
            fullscreenDialog: true,
          ),
        );
      },
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(name),
              Icon(Icons.help_outline_outlined,
                  color: ColorConstants().appColor, size: 10),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(1.0),
            child: Text('${value.toStringAsFixed(2)} µg/m\u00B3'),
          ),
        ],
      ),
    );
  }
}
