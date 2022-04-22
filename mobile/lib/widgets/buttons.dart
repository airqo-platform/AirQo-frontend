import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/firebase_service.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../auth/phone_auth_widget.dart';
import '../models/event.dart';

Widget cancelOption(BuildContext context) {
  return GestureDetector(
    onTap: () {
      Navigator.pop(context, false);
    },
    child: Text(
      'Cancel',
      textAlign: TextAlign.center,
      style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Config.appColorBlue),
    ),
  );
}

Widget containerBackButton(String text, Color buttonColor) {
  return Container(
    height: 48,
    width: 120,
    padding: const EdgeInsets.all(13),
    decoration: BoxDecoration(
        color: buttonColor,
        borderRadius: const BorderRadius.all(Radius.circular(8.0))),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          text,
          textAlign: TextAlign.center,
          style: TextStyle(color: Config.appColorBlue, fontSize: 14),
        ),
      ],
    ),
  );
}

Widget containerNextButton(String text, Color buttonColor) {
  return Container(
    height: 48,
    width: 120,
    padding: const EdgeInsets.all(13),
    decoration: BoxDecoration(
        color: buttonColor,
        borderRadius: const BorderRadius.all(Radius.circular(8.0))),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 14),
        ),
        const SizedBox(
          width: 11,
        ),
        SvgPicture.asset(
          'assets/icon/next_arrow.svg',
          semanticsLabel: 'Share',
          height: 17.42,
          width: 10.9,
        ),
      ],
    ),
  );
}

Widget loginOptions({required BuildContext context}) {
  var tween = Tween<double>(begin: 0, end: 1);
  return Column(
    children: [
      GestureDetector(
        onTap: () {
          Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    const PhoneSignUpWidget(enableBackButton: false),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false);
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Don\'t have an account',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .caption
                    ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
            const SizedBox(
              width: 2,
            ),
            Text('Sign up',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .caption
                    ?.copyWith(color: Config.appColorBlue))
          ],
        ),
      ),
      const SizedBox(
        height: 8,
      ),
      proceedAsGuest(context: context),
    ],
  );
}

Widget nextButton(String text, Color buttonColor) {
  return Container(
    height: 48,
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: buttonColor,
        borderRadius: const BorderRadius.all(Radius.circular(8.0))),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          text,
          style: const TextStyle(
              color: Colors.white, fontSize: 14, letterSpacing: 16 * -0.022),
        ),
        const SizedBox(
          width: 11,
        ),
        SvgPicture.asset(
          'assets/icon/next_arrow.svg',
          semanticsLabel: 'Share',
          height: 17.42,
          width: 10.9,
        ),
      ],
    ),
  );
}

Widget onBoardingLocationIcon() {
  return Stack(
    alignment: AlignmentDirectional.center,
    children: [
      Image.asset(
        'assets/icon/floating_bg.png',
        fit: BoxFit.fitWidth,
        width: double.infinity,
      ),
      Image.asset(
        'assets/icon/enable_location_icon.png',
        height: 221,
      ),
      // SvgPicture.asset(
      //   'assets/icon/enable_location_icon.svg',
      // ),
    ],
  );
}

Widget onBoardingNotificationIcon() {
  return Stack(
    alignment: AlignmentDirectional.center,
    children: [
      Image.asset(
        'assets/icon/floating_bg.png',
        fit: BoxFit.fitWidth,
        width: double.infinity,
      ),
      SvgPicture.asset(
        'assets/icon/enable_notifications_icon.svg',
        height: 221,
      ),
    ],
  );
}

Widget proceedAsGuest({required BuildContext context}) {
  return GestureDetector(
    onTap: () {
      CloudAnalytics().logEvent(AnalyticsEvent.browserAsAppGuest, false);
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    },
    child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Proceed as',
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .caption
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
        const SizedBox(
          width: 2,
        ),
        Text('Guest',
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .caption
                ?.copyWith(color: Config.appColorBlue))
      ],
    ),
  );
}

Widget signButton({required String text, required BuildContext context}) {
  return Container(
      height: 48,
      constraints:
          const BoxConstraints(minWidth: double.infinity, maxHeight: 48),
      decoration: BoxDecoration(
          color: const Color(0xff8D8D8D).withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Center(
          child: Padding(
        padding: const EdgeInsets.fromLTRB(0, 16, 0, 16),
        child: AutoSizeText(text,
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .caption
                ?.copyWith(color: Config.appColorBlue)),
      )));
}

Widget signUpOptions({required BuildContext context}) {
  var tween = Tween<double>(begin: 0, end: 1);
  return Column(
    children: [
      GestureDetector(
        onTap: () {
          Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    const PhoneLoginWidget(
                  enableBackButton: false,
                  phoneNumber: '',
                ),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false);
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Already have an account',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .caption
                    ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
            const SizedBox(
              width: 2,
            ),
            Text('Log in',
                textAlign: TextAlign.center,
                style: Theme.of(context)
                    .textTheme
                    .caption
                    ?.copyWith(color: Config.appColorBlue))
          ],
        ),
      ),
      const SizedBox(
        height: 8,
      ),
      proceedAsGuest(context: context),
    ],
  );
}
