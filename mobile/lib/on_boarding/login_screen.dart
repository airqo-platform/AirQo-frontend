import 'package:app/on_boarding/email_auth_widget.dart';
import 'package:app/on_boarding/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  String _loginOption = 'phone';
  DateTime? _exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: _loginOption == 'phone'
                ? PhoneAuthWidget(false, changeOption, 'login')
                : EmailAuthWidget(false, changeOption, 'login')));
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
                        visible: _loginOption == 'phone',
                        child: PhoneAuthWidget(false, changeOption, 'login'),
                      ),
                      Visibility(
                        visible: _loginOption == 'email',
                        child: EmailAuthWidget(false, changeOption, 'login'),
                      ),
                    ],
                  ),
                ))));
  }

  void changeOption(String value) {
    setState(() {
      _loginOption = value;
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

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(true);
  }
}
