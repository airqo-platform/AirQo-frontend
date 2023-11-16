import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../offline_banner.dart';
import 'location_setup_screen.dart';
import 'on_boarding_widgets.dart';

class NotificationsSetupScreen extends StatefulWidget {
  const NotificationsSetupScreen({super.key});

  @override
  NotificationsSetupScreenState createState() =>
      NotificationsSetupScreenState();
}

class NotificationsSetupScreenState extends State<NotificationsSetupScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: const OnBoardingTopBar(),
        body: WillPopScope(
          onWillPop: onWillPop,
          child: AppSafeArea(
            verticalPadding: 10,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),
                const OnBoardingNotificationIcon(),
                const SizedBox(
                  height: 26,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    AppLocalizations.of(context)!.knowYourAirInRealTime,
                    textAlign: TextAlign.center,
                    style: CustomTextStyle.headline7(context),
                  ),
                ),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    AppLocalizations.of(context)!
                        .getNotifiedWhenAirQualityIsGettingBetterOrWorse,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: NextButton(
                    text: AppLocalizations.of(context)!.yesKeepMeUpdated,
                    buttonColor: CustomColors.appColorBlue,
                    callBack: () async {
                      await _allowNotifications();
                    },
                  ),
                ),
                const SkipOnboardScreen(LocationSetupScreen()),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _updateOnBoardingPage();
  }

  Future<void> _allowNotifications() async {
    bool hasPermission =
        await PermissionService.checkPermission(AppPermission.notification);
    if (hasPermission && mounted) {
      await FirebaseMessaging.instance.subscribeToTopic("push-notifications");

      Profile profile = context.read<ProfileBloc>().state;
      context
          .read<ProfileBloc>()
          .add(UpdateProfile(profile.copyWith(notifications: hasPermission)));
      await Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const LocationSetupScreen();
          },
        ),
        (r) => false,
      );
      CloudAnalytics.logAllowNotification();
    } else {
      NotificationService.requestNotification(context, "onboarding");
    }
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(
        context,
        AppLocalizations.of(context)!.tapAgainToExit,
      );

      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }

  void _updateOnBoardingPage() async {
    await SharedPreferencesHelper.updateOnBoardingPage(
      OnBoardingPage.notification,
    );
  }
}
