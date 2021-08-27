import 'package:app/constants/app_constants.dart';
import 'package:app/utils/help.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';

class PollutantsCard extends StatelessWidget {


  PollutantsCard(this.name, this.value, this.type);

  final String name;
  final double value;
  final String type;


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

class PollutantsCard2 extends StatelessWidget {


  PollutantsCard2(this.name, this.value, this.type);

  final String name;
  final double value;
  final String type;


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
      child:Card(
        color: Colors.white,
          elevation: 20,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(name, style:
                    TextStyle(
                        fontSize: 20, color: ColorConstants().appColor,
                      fontWeight: FontWeight.bold,
                    ),),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(1.0),
                  child: Text('${value.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 17,  color: ColorConstants().appColor,
                      fontWeight: FontWeight.bold,
                  ),),
                ),
              ],
            ),
          )),
    );
  }
}
