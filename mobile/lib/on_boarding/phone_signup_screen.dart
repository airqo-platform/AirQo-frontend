import 'package:app/on_boarding/verify_code_screen.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'email_signup_screen.dart';

class PhoneSignupScreen extends StatefulWidget {
  @override
  PhoneSignupScreenState createState() => PhoneSignupScreenState();
}

class PhoneSignupScreenState extends State<PhoneSignupScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: Container(
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          const SizedBox(
            height: 42,
          ),
          const Text(
            'Ok! What’s your mobile\nnumber?',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
          const SizedBox(
            height: 4,
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
          // Row(
          //   children: <Widget>[
          //
          //     countryDropDown('Sign'),
          //     const SizedBox(width: 16,),
          //     Flexible(
          //       child: TextField(
          //         decoration: InputDecoration(
          //           focusedBorder: OutlineInputBorder(
          //             borderSide: BorderSide(
          //                 color: ColorConstants.appColorBlue, width: 1.0),
          //             borderRadius: BorderRadius.circular(10.0),
          //           ),
          //           enabledBorder: OutlineInputBorder(
          //             borderSide: BorderSide(
          //                 color: ColorConstants.appColorBlue, width: 1.0),
          //             borderRadius: BorderRadius.circular(10.0),
          //           ),
          //           hintText: '+256(0) 701000000',
          //         ),
          //       ),
          //     ),
          //   ],
          // ),
          phoneInputField('701000000'),
          const SizedBox(
            height: 36,
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return EmailSignupScreen();
              }));
            },
            child: signButton('Sign up with email instead'),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return VerifyCodeScreen();
              }));
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
        return PhoneSignupScreen();
      }));
    });
  }

  @override
  void initState() {
    // initialize();
    super.initState();
  }
}
