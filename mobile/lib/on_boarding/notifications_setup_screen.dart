import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';
import 'location_setup_screen.dart';

class NotificationsSetupScreen extends StatefulWidget {
  const NotificationsSetupScreen({Key? key}) : super(key: key);

  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  DateTime? exitTime;

  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
        const Spacer(),
        onBoardingNotificationIcon(),
        const SizedBox(
          height: 26,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 40, right: 40),
          child: Text(
            'Know your air in real time',
            textAlign: TextAlign.center,
            style: CustomTextStyle.headline7(context),
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 40, right: 40),
          child: Text(
              'Get notified when air quality is getting better or worse',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyText1),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: GestureDetector(
            onTap: () {
              _appService.notificationService
                  .allowNotifications()
                  .then((value) => {
                        Navigator.pushAndRemoveUntil(context,
                            MaterialPageRoute(builder: (context) {
                          return const LocationSetupScreen();
                        }), (r) => false)
                      });
            },
            child: nextButton('Yes, keep me updated', Config.appColorBlue),
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(context,
                MaterialPageRoute(builder: (context) {
              return const LocationSetupScreen();
            }), (r) => false);
          },
          child: Text(
            'No, thanks',
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .caption
                ?.copyWith(color: Config.appColorBlue),
          ),
        ),
        const SizedBox(
          height: 40,
        ),
      ]),
    ));
  }

  @override
  void initState() {
    super.initState();
    updateOnBoardingPage();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper
        .updateOnBoardingPage(OnBoardingPage.notification);
  }
}
