import 'package:app/auth/login_screen.dart';
import 'package:app/auth/signup_screen.dart';
import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/firebase_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

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

Widget loginOptions(context) {
  var cloudAnalytics = CloudAnalytics();
  return Column(
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Don\'t have an account',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const SignupScreen(false);
              }), (r) => false);
            },
            child: Text(
              'Sign up',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Config.appColorBlue),
            ),
          )
        ],
      ),
      const SizedBox(
        height: 8,
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Proceed as',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              cloudAnalytics.logEvent(AnalyticsEvent.browserAsAppGuest);
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const HomePage();
              }), (r) => false);
            },
            child: Text(
              'Guest',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Config.appColorBlue),
            ),
          )
        ],
      ),
    ],
  );
}

Widget nextButton(String text, Color buttonColor) {
  return Container(
    height: 48,
    padding: const EdgeInsets.fromLTRB(0, 13, 0, 13),
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

Widget onBoardingLocationIcon() {
  return Stack(
    alignment: AlignmentDirectional.center,
    children: [
      Image.asset(
        'assets/icon/floating_bg.png',
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
      ),
      // SvgPicture.asset(
      //   'assets/icon/floating_bg.svg',
      //
      // ),
      SvgPicture.asset(
        'assets/icon/enable_notifications_icon.svg',
      ),
    ],
  );
}

Widget signButton(String text) {
  return Container(
    height: 48,
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
    constraints: const BoxConstraints(minWidth: double.infinity, maxHeight: 48),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(8.0))),
    child: Text(
      text,
      textAlign: TextAlign.center,
      style: TextStyle(color: Config.appColorBlue, fontSize: 12),
    ),
  );
}

Widget signUpOptions(BuildContext context) {
  var cloudAnalytics = CloudAnalytics();
  return Column(
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Already have an account',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const LoginScreen(phoneNumber: '', emailAddress: '');
              }), (r) => false);
            },
            child: Text(
              'Log in',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Config.appColorBlue),
            ),
          )
        ],
      ),
      const SizedBox(
        height: 8,
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Proceed as',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              cloudAnalytics.logEvent(AnalyticsEvent.browserAsAppGuest);
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const HomePage();
              }), (r) => false);
            },
            child: Text(
              'Guest',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Config.appColorBlue),
            ),
          )
        ],
      ),
    ],
  );
}
