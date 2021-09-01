import 'package:app/constants/app_constants.dart';
import 'package:app/models/pollutant.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PollutantDialog extends StatelessWidget {

  PollutantDialog(this.pollutant);
  final Pollutant pollutant;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
      child: ListView(
        children: [whatIs(), source(), effects(), howToReduce()],
      ),
    );
  }

  Widget effects() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'What are the Harmful Effects '
                'of ${pollutant.pollutant}',
                softWrap: true,
                style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                    color: ColorConstants().appColor
                    // letterSpacing: 1.0
                    )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.effects}',
                softWrap: true,
                style: TextStyle(
                  height: 1.2,
                  color: ColorConstants().appColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget howToReduce() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'How Can I Reduce My Exposure to'
                ' ${pollutant.pollutant}',
                softWrap: true,
                style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                    color: ColorConstants().appColor
                    // letterSpacing: 1.0
                    )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.howToReduce}',
                softWrap: true,
                style: TextStyle(
                  height: 1.2,
                  color: ColorConstants().appColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget reference() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
              style:
                  ElevatedButton.styleFrom(primary: ColorConstants().appColor),
              onPressed: _launchURL,
              child: Text('Learn more about ${pollutant.pollutant}',
                  softWrap: true,
                  style: const TextStyle(
                      height: 1.5,
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold
                      // letterSpacing: 1.0
                      )))
        ],
      ),
    );
  }

  Widget source() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('Sources of ${pollutant.pollutant}',
                softWrap: true,
                style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                    color: ColorConstants().appColor
                    // letterSpacing: 1.0
                    )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.source}',
                softWrap: true,
                style: TextStyle(
                  height: 1.2,
                  color: ColorConstants().appColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Widget whatIs() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 2, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
                'What is ${pollutant.pollutant}, '
                'and how does it get into the air?',
                softWrap: true,
                style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                    color: ColorConstants().appColor
                    // letterSpacing: 1.0
                    )),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.description}',
                softWrap: true,
                style: TextStyle(
                  height: 1.2,
                  color: ColorConstants().appColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }

  Future<void> _launchURL() async {
    try {
      await canLaunch(Links().airqoReference)
          ? await launch(Links().airqoReference)
          : throw 'Could not launch reference,'
          ' try opening ${Links().airqoReference}';
    } on Error catch (e) {
      print(e);
    }
  }
}
