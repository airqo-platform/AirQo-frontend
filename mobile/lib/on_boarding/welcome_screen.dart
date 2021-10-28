import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/phone_signup_screen.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';

class WelcomeScreen extends StatefulWidget {
  @override
  WelcomeScreenState createState() => WelcomeScreenState();
}

class WelcomeScreenState extends State<WelcomeScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 48, 24.0, 0),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(
              height: 45,
            ),
            const Text(
              'Welcome to',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 32,
                  color: Colors.black),
            ),
            Text(
              'AirQo',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 32,
                  color: ColorConstants.appColorBlue),
            ),
            const SizedBox(
              height: 21,
            ),
            welcomeSection(
                'Save your favorite places',
                'Keep track of air quality in locations that matter to you',
                const Color(0xffFBC110),
                'assets/icon/onboarding_fav.svg'),
            const SizedBox(
              height: 22,
            ),
            welcomeSection(
                'New experiences for You',
                'Access analytics and content curated just for you',
                const Color(0xff9492B8),
                ''),
            const SizedBox(
              height: 22,
            ),
            welcomeSection(
                'Know your air on the go',
                'An easy way to plan your outdoor activities to minimise'
                    ' excessive exposure to bad air quality ',
                const Color(0xff55B7A1),
                ''),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.only(bottom: 96.0),
              child: GestureDetector(
                onTap: () {
                  Navigator.pushAndRemoveUntil(context,
                      MaterialPageRoute(builder: (context) {
                    return PhoneSignupScreen(false);
                  }), (r) => false);
                },
                child: nextButton('Let’s go', ColorConstants.appColorBlue),
              ),
            ),
          ]),
        ),
      ),
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return PhoneSignupScreen(false);
      }));
    });
  }

  @override
  void initState() {
    super.initState();
    // initialize();
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

  Widget welcomeSection(
    String header,
    String body,
    Color color,
    String svg,
  ) {
    return ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0, right: 40),
        leading: svg == ''
            ? CircleAvatar(
                backgroundColor: color,
              )
            : SvgPicture.asset(
                svg,
                height: 40,
                width: 40,
              ),
        title: Text(
          header,
          style: const TextStyle(
              fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            body,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.5)),
          ),
        ));
  }
}
