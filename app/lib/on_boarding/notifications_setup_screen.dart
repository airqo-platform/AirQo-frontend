import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'location_setup_screen.dart';

class NotificationsSetupScreen extends StatefulWidget {
  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          const SizedBox(
            height: 140,
          ),
          notificationIcon(100.0, 100.0),
          const SizedBox(
            height: 52,
          ),
          const Text(
            'Keep me posted',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
          ),
          const SizedBox(
            height: 8,
          ),
          const Text(
            'Allow AirQo push notifications to'
            ' receive real-time air quality updates.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.black),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return LocationSetupScreen();
              }));
            },
            child: nextButton('Allow notifications'),
          ),
          const SizedBox(
            height: 20,
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return LocationSetupScreen();
              }));
            },
            child: Text(
              'Remind me later',
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
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 8), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return NotificationsSetupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }
}
