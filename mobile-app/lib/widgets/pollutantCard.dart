import 'package:app/constants/app_constants.dart';
import 'package:app/utils/ui/help.dart';
import 'package:flutter/material.dart';

class PollutantsCard extends StatelessWidget {

  PollutantsCard(this.name, this.value, this.type);

  final String name;
  final double value;
  final String type;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: (){
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
              const Icon(
                  Icons.help_outline_outlined,
                  color: appColor,
                  size: 10
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.all(1.0),
            child: Text('${value.toString()} µg/m3'),
          ),


        ],
      ),
    );
  }
}