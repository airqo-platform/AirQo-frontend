import 'package:app/on_boarding/email_auth_widget.dart';
import 'package:app/on_boarding/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

class SignupScreen extends StatefulWidget {
  final bool enableBackButton;

  const SignupScreen(this.enableBackButton, {Key? key}) : super(key: key);

  @override
  SignupScreenState createState() => SignupScreenState();
}

class SignupScreenState extends State<SignupScreen> {
  String _signUpOption = 'phone';
  DateTime? _exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: _signUpOption == 'phone'
                ? PhoneAuthWidget(
                    widget.enableBackButton, changeOption, 'signup')
                : EmailAuthWidget(
                    widget.enableBackButton, changeOption, 'signup')));
  }

  void changeOption(String value) {
    setState(() {
      _signUpOption = value;
    });
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

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
