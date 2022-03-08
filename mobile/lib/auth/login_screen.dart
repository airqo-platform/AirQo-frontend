import 'package:app/auth/email_auth_widget.dart';
import 'package:app/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  final String phoneNumber;
  final String emailAddress;

  const LoginScreen(
      {Key? key, required this.phoneNumber, required this.emailAddress})
      : super(key: key);

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  late String _loginOption;
  DateTime? _exitTime;
  bool appLoading = false;
  late BuildContext dialogContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: _loginOption == 'phone'
                ? PhoneAuthWidget(
                    enableBackButton: false,
                    changeOption: changeOption,
                    action: 'login',
                    appLoading: showLoading,
                    phoneNumber: widget.phoneNumber)
                : EmailAuthWidget(
                    enableBackButton: false,
                    changeOption: changeOption,
                    action: 'login',
                    appLoading: showLoading,
                    emailAddress: widget.emailAddress)));
  }

  void changeOption(String value) {
    setState(() {
      _loginOption = value;
    });
  }

  @override
  void initState() {
    super.initState();
    dialogContext = context;
    _loginOption = widget.emailAddress != '' ? 'email' : 'phone';
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to cancel !');
      return Future.value(false);
    }

    if (appLoading) {
      Navigator.pop(dialogContext);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(true);
  }

  void showLoading(bool loading) {
    if (loading) {
      loadingScreen(dialogContext);
      setState(() {
        appLoading = loading;
      });
    } else if (!loading && appLoading) {
      Navigator.pop(dialogContext);
      setState(() {
        appLoading = loading;
      });
    } else {
      debugPrint('Error in loading dialog of login screen');
    }
  }
}
