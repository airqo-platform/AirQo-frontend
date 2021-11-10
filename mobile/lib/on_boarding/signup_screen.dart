import 'package:app/on_boarding/email_signup_widget.dart';
import 'package:app/on_boarding/phone_signup_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class SignupScreen extends StatefulWidget {
  final bool enableBackButton;

  const SignupScreen(this.enableBackButton, {Key? key}) : super(key: key);

  @override
  SignupScreenState createState() => SignupScreenState();
}

class SignupScreenState extends State<SignupScreen> {
  var signUpOption = 'phone';
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: signUpOption == 'phone'
                ? PhoneSignupWidget(widget.enableBackButton, changeOption)
                : EmailSignUpWidget(widget.enableBackButton, changeOption)));
  }

  Widget buildV1(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: Container(
                color: Colors.white,
                padding: const EdgeInsets.only(left: 24, right: 24),
                child: Center(
                  child: Column(
                    children: [
                      Visibility(
                        visible: signUpOption == 'phone',
                        child: PhoneSignupWidget(
                            widget.enableBackButton, changeOption),
                      ),
                      Visibility(
                        visible: signUpOption == 'email',
                        child: EmailSignUpWidget(
                            widget.enableBackButton, changeOption),
                      ),
                    ],
                  ),
                ))));
  }

  void changeOption(String value) {
    setState(() {
      signUpOption = value;
    });
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to cancel !');
      return Future.value(false);
    }

    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }
}
