import 'package:app/constants/app_constants.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
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
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
        padding: const EdgeInsets.only(top: 58),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.center, children: [
          onBoardingNotificationIcon(),
          const SizedBox(
            height: 52,
          ),
          const Text(
            'Know your air \nin real time',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black),
          ),
          const SizedBox(
            height: 8,
          ),
          const Text(
            'Get notified when air quality is\ngetting better or worse ',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.black),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24),
            child:  GestureDetector(
              onTap: () {
                NotificationService().requestPermission().then((value) => {
                  Navigator.pushAndRemoveUntil(context,
                      MaterialPageRoute(builder: (context) {
                        return LocationSetupScreen();
                      }), (r) => false)
                });
                // Navigator.push(context, MaterialPageRoute(builder: (context) {
                //   return LocationSetupScreen();
                // }));
              },
              child: nextButton(
                  'Yes, keep me safe', ColorConstants.appColorBlue),
            ),
          ),

          const SizedBox(
            height: 20,
          ),
          GestureDetector(
            onTap: () {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                    return LocationSetupScreen();
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
