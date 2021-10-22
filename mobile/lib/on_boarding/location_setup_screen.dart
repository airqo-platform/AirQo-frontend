import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/setup_complete_screeen.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class LocationSetupScreen extends StatefulWidget {
  @override
  LocationSetupScreenState createState() => LocationSetupScreenState();
}

class LocationSetupScreenState extends State<LocationSetupScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: Center(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            const SizedBox(
              height: 140,
            ),
            locationIcon(143.0, 143.0),
            const SizedBox(
              height: 52,
            ),
            const Text(
              'Enable locations',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black),
            ),
            const SizedBox(
              height: 8,
            ),
            const Text(
              'Allow AirQo to send you location air '
              'quality\n update for your work place, home',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.black),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () {
                LocationService().getLocation().then((value) => {
                      Navigator.pushAndRemoveUntil(context,
                          MaterialPageRoute(builder: (context) {
                        return SetUpCompleteScreen();
                      }), (r) => false)
                    });
              },
              child: nextButton('Allow location', ColorConstants.appColorBlue),
            ),
            const SizedBox(
              height: 20,
            ),
            GestureDetector(
              onTap: () {
                Navigator.pushAndRemoveUntil(context,
                    MaterialPageRoute(builder: (context) {
                  return SetUpCompleteScreen();
                }), (r) => false);
              },
              child: Text(
                'No, thanks',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.appColorBlue),
              ),
            ),
            const SizedBox(
              height: 58,
            ),
          ]),
        ),
      ),
    ));
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }
}
