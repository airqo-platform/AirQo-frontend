import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/local_storage.dart';
import '../../services/notification_service.dart';
import '../../themes/app_theme.dart';
import '../../widgets/custom_shimmer.dart';
import 'location_setup_screen.dart';
import 'on_boarding_widgets.dart';

class NotificationsSetupScreen extends StatefulWidget {
  const NotificationsSetupScreen({Key? key}) : super(key: key);

  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Config.appBodyColor,
        body: WillPopScope(
          onWillPop: onWillPop,
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            const Spacer(),
            const OnBoardingNotificationIcon(),
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
                onTap: _allowNotifications,
                child: NextButton(
                    text: 'Yes, keep me updated',
                    buttonColor: Config.appColorBlue),
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
    _updateOnBoardingPage();
  }

  Future<void> _allowNotifications() async {
    loadingScreen(context);
    await NotificationService.allowNotifications().then((_) {
      Navigator.pop(context);
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const LocationSetupScreen();
      }), (r) => false);
    });
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
      return const HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  void _updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(
        OnBoardingPage.notification);
  }
}
