import 'package:app/constants/app_constants.dart';
import 'package:app/screens/help_page.dart';
import 'package:flutter/material.dart';

class PollutantCard extends StatelessWidget {

  final String name;
  final double value;
  final String type;

  PollutantCard(this.name, this.value, this.type);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (BuildContext context) => getHelpTab(),
            fullscreenDialog: true,
          ),
        );
      },
      child: Card(
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
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 20,
                        color: ColorConstants().appColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(1.0),
                  child: Text(
                    '${value.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 17,
                      color: ColorConstants().appColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          )),
    );
  }

  Widget getHelpTab(){
    if(type == PollutantConstants.pm2_5){
      return const HelpPage(initialIndex: 1);
    }
    else if(type == PollutantConstants.pm10){
      return const HelpPage(initialIndex: 2);
    }
    else{
      return const HelpPage(initialIndex: 0);
    }
  }

}
