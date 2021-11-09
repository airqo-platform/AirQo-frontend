import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/signup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class EmailSignupScreen extends StatefulWidget {
  const EmailSignupScreen({Key? key}) : super(key: key);

  @override
  EmailSignupScreenState createState() => EmailSignupScreenState();
}

class EmailSignupScreenState extends State<EmailSignupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: Container(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 42,
                  ),
                  const Text(
                    'Sign up with your your\nemail',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: Colors.black),
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  Text(
                    'We’ll send you a verification code',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.6)),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  emailInputField('Enter your email'),
                  const SizedBox(
                    height: 34,
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return const SignupScreen(false);
                      }));
                    },
                    child: signButton('Sign up with a mobile number instead'),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return const HomePage();
                      }));
                    },
                    child: nextButton('Let’s go', ColorConstants.appColorBlue),
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
        return const EmailSignupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }
}
