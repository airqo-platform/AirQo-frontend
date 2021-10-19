import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/phone_signup_screen.dart';
import 'package:app/widgets/buttons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class WelcomeScreen extends StatefulWidget {
  @override
  WelcomeScreenState createState() => WelcomeScreenState();
}

class WelcomeScreenState extends State<WelcomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 48, 24.0, 0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(
            height: 45,
          ),
          const Text(
            'Welcome to',
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 32, color: Colors.black),
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
              'Introducing Favorites',
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              const Color(0xffFBC110)),
          const SizedBox(
            height: 22,
          ),
          welcomeSection(
              'Personalised analytics',
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              const Color(0xff9492B8)),
          const SizedBox(
            height: 22,
          ),
          welcomeSection(
              'Learn about your air',
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              const Color(0xff55B7A1)),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.only(bottom: 96.0),
            child: GestureDetector(
              onTap: () {
                Navigator.pushAndRemoveUntil(context,
                    MaterialPageRoute(builder: (context) {
                  return PhoneSignupScreen();
                }), (r) => false);
              },
              child: nextButton('Let’s go', ColorConstants.appColorBlue),
            ),
          ),
        ]),
      ),
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return PhoneSignupScreen();
      }));
    });
  }

  @override
  void initState() {
    super.initState();
    // initialize();
  }

  Widget welcomeSection(String header, String body, Color color) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color,
      ),
      title: Text(
        header,
        style: const TextStyle(
            fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black),
      ),
      subtitle: Text(
        body,
        maxLines: 4,
        softWrap: true,
        style: const TextStyle(fontSize: 12, color: Colors.black),
      ),
    );
  }
}
