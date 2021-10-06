import 'package:app/on_boarding/phone_signup_screen.dart';
import 'package:app/on_boarding/verify_code_screen.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class EmailSignupScreen extends StatefulWidget {
  @override
  EmailSignupScreenState createState() => EmailSignupScreenState();
}

class EmailSignupScreenState extends State<EmailSignupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      padding: EdgeInsets.only(left: 24, right: 24),
      child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          const SizedBox(
            height: 42,
          ),
          const Text(
            'Ok! What’s your email?',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
          const SizedBox(
            height: 16,
          ),
          Text(
            'We’ll send you a verification code',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            height: 32,
          ),
          inputField('Enter your email'),
          const SizedBox(
            height: 34,
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return PhoneSignupScreen();
              }));
            },
            child: signButton('Sign up with a mobile number instead'),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return VerifyCodeScreen();
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
        return EmailSignupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }
}
