import 'package:app/constants/config.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/firebase_service.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';

class ProceedAsGuest extends StatelessWidget {
  const ProceedAsGuest({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        await Future.wait([
          CloudAnalytics.logEvent(AnalyticsEvent.browserAsAppGuest, false),
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return const HomePage();
          }), (r) => false)
        ]);
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
}

class SignUpButton extends StatelessWidget {
  final String text;
  const SignUpButton({Key? key, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
}

class SignUpOptions extends StatelessWidget {
  const SignUpOptions({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var tween = Tween<double>(begin: 0, end: 1);
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                      const PhoneLoginWidget(),
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
        const ProceedAsGuest(),
      ],
    );
  }
}

class CancelOption extends StatelessWidget {
  const CancelOption({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
}

class LoginOptions extends StatelessWidget {
  const LoginOptions({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var tween = Tween<double>(begin: 0, end: 1);
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                      const PhoneSignUpWidget(),
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
        const ProceedAsGuest(),
      ],
    );
  }
}
