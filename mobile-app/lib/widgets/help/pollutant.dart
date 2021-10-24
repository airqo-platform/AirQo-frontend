import 'package:app/constants/app_constants.dart';
import 'package:app/models/pollutant.dart';
import 'package:app/screens/web_view.dart';
import 'package:flutter/material.dart';

class PollutantDialog extends StatelessWidget {
  final Pollutant pollutant;

  PollutantDialog(this.pollutant);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: ColorConstants.appBodyColor,
      child: Padding(
          padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  children: [whatIs()],
                ),
              ),
              reference()
            ],
          )),
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
              style: ElevatedButton.styleFrom(primary: ColorConstants.appColor),
              onPressed: () {
                openUrl(Links.whoUrl);
              },
              child: const Text('Source: World Health Organisation',
                  softWrap: true,
                  style: TextStyle(
                      height: 1.5,
                      color: Colors.white,
                      fontWeight: FontWeight.bold
                      // letterSpacing: 1.0
                      )))
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
            child: RichText(
              text: TextSpan(
                children: <TextSpan>[
                  TextSpan(
                    text: 'What is PM',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.appColor
                        // letterSpacing: 1.0
                        ),
                  ),
                  TextSpan(
                    text: '${pollutant.pollutant}',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.appColor),
                  ),
                  TextSpan(
                    text: ', it’s sources and what are the effects',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: ColorConstants.appColor
                        // letterSpacing: 1.0
                        ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text('${pollutant.description}',
                softWrap: true,
                style: TextStyle(
                  height: 1.7,
                  color: ColorConstants.appColor,
                  fontWeight: FontWeight.w500,
                  // letterSpacing: 1.0
                )),
          ),
        ],
      ),
    );
  }
}
