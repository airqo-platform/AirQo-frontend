import 'package:app/constants/app_constants.dart';
import 'package:app/screens/help_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

class PollutantCard extends StatelessWidget {
  final String name;
  final double value;
  final String type;
  final String source;

  PollutantCard(this.name, this.value, this.type, this.source);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        openDialog(context);
      },
      child: Card(
          color: Colors.white,
          elevation: 20,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 20,
                    color: ColorConstants.appColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Padding(
                    padding: const EdgeInsets.all(1.0),
                    child: RichText(
                      text: TextSpan(
                        style: DefaultTextStyle.of(context).style,
                        children: <TextSpan>[
                          TextSpan(
                            text: '${value.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 17,
                              color: ColorConstants.appColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: ' µg/m\u00B3',
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColor,
                            ),
                          )
                        ],
                      ),
                    )),
              ],
            ),
          )),
    );
  }

  Widget getHelpTab() {
    if (type == PollutantConstant.pm2_5) {
      return const HelpPage(initialIndex: 1);
    } else if (type == PollutantConstant.pm10) {
      return const HelpPage(initialIndex: 2);
    } else {
      return const HelpPage(initialIndex: 0);
    }
  }

  void openDialog(context) {
    if (type == PollutantConstant.pm2_5) {
      infoDialog(context, PollutantBio.pm2_5);
    } else if (type == PollutantConstant.pm10) {
      infoDialog(context, PollutantBio.pm10);
    } else {
      return;
    }
  }
}

class RecommendationCard extends StatelessWidget {
  final String name;
  final double value;
  final String type;
  String source = '';

  RecommendationCard(this.name, this.value, this.type, this.source);

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
            borderRadius: BorderRadius.circular(10),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 20,
                    color: ColorConstants.appColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(1.0),
                  child: Text(
                    '${value.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 17,
                      color: ColorConstants.appColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (source != '')
                  Text(
                    'Source: Tahmo',
                    style: TextStyle(
                      fontSize: 8,
                      color: ColorConstants.appColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
          )),
    );
  }

  Widget getHelpTab() {
    if (type == PollutantConstant.pm2_5) {
      return const HelpPage(initialIndex: 1);
    } else if (type == PollutantConstant.pm10) {
      return const HelpPage(initialIndex: 2);
    } else {
      return const HelpPage(initialIndex: 0);
    }
  }
}
