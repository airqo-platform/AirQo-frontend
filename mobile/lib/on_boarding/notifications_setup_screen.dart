import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';

import 'location_setup_screen.dart';

class NotificationsSetupScreen extends StatefulWidget {
  final bool enableBackButton;

  const NotificationsSetupScreen(this.enableBackButton, {Key? key})
      : super(key: key);

  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  DateTime? exitTime;
  final NotificationService _notificationService = NotificationService();
  late AppService _appService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
        padding: const EdgeInsets.only(top: 58),
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          onBoardingNotificationIcon(),
          const SizedBox(
            height: 52,
          ),
          const Text(
            'Know your air \nin real time',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
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
            child: GestureDetector(
              onTap: () {
                _notificationService.allowNotifications().then((value) => {
                      Navigator.pushAndRemoveUntil(context,
                          MaterialPageRoute(builder: (context) {
                        return LocationSetupScreen(widget.enableBackButton);
                      }), (r) => false)
                    });
              },
              child: nextButton('Yes, keep me updated', Config.appColorBlue),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          GestureDetector(
            onTap: () {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return LocationSetupScreen(widget.enableBackButton);
              }), (r) => false);
            },
            child: Text(
              'No, thanks',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Config.appColorBlue),
            ),
          ),
          const SizedBox(
            height: 58,
          ),
        ]),
      ),
    ));
  }

  @override
  void initState() {
    _appService = AppService(context);
    updateOnBoardingPage();
    super.initState();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper.updateOnBoardingPage('notification');
  }
}
