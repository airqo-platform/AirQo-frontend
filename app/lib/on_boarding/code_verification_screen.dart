import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class CodeVerificationScreen extends StatefulWidget {
  @override
  CodeVerificationScreenState createState() => CodeVerificationScreenState();
}

class CodeVerificationScreenState extends State<CodeVerificationScreen> {
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
                    'Now enter the code',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 24,
                        color: Colors.black),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Text(
                    'Enter the 4 digits code sent to your email, to '
                    '\nverify your account',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.6)),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Container(
                    padding: EdgeInsets.all(28),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        optField(0, context, setCode),
                        optField(1, context, setCode),
                        optField(2, context, setCode),
                        optField(3, context, setCode)
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 24,
                  ),
                  Text(
                    'The code should arrive with in 5 sec.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 12, color: Colors.black.withOpacity(0.5)),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushAndRemoveUntil(context,
                          MaterialPageRoute(builder: (context) {
                        return ProfileSetupScreen();
                      }), (r) => false);
                    },
                    child: nextButton('Next'),
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
        return CodeVerificationScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }

  void setCode(value, position) {
    switch (position) {
      case 0:
        setState(() {});
    }
  }
}
