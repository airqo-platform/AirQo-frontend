import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'notifications_setup_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  @override
  ProfileSetupScreenState createState() => ProfileSetupScreenState();
}

class ProfileSetupScreenState extends State<ProfileSetupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          const SizedBox(
            height: 42,
          ),
          const Text(
            'Great! What’s your name?',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
          const SizedBox(
            height: 42,
          ),
          inputField('Enter your name  '),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return NotificationsSetupScreen();
              }));
            },
            child: nextButton('Let’s go'),
          ),
          const SizedBox(
            height: 20,
          ),
          signUpOptions(context),
          const SizedBox(
            height: 36,
          ),
        ]),
      ),
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 8), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return ProfileSetupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }
}
