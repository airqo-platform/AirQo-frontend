import 'package:app/auth/email_auth_widget.dart';
import 'package:app/auth/phone_auth_widget.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/custom_shimmer.dart';
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
  late AppService _appService;
  bool appLoading = false;
  late BuildContext dialogContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: _signUpOption == 'phone'
                ? PhoneAuthWidget(
                    enableBackButton: widget.enableBackButton,
                    changeOption: changeOption,
                    action: 'signup',
                    appLoading: showLoading,
                    phoneNumber: '')
                : EmailAuthWidget(
                    enableBackButton: widget.enableBackButton,
                    changeOption: changeOption,
                    action: 'signup',
                    appLoading: showLoading,
                    emailAddress: '',
                  )));
  }

  void changeOption(String value) {
    setState(() {
      _signUpOption = value;
    });
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    dialogContext = context;
    updateOnBoardingPage();
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

    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }

  void showLoading(bool loading) {
    if (loading) {
      loadingScreen(dialogContext);
    } else {
      Navigator.pop(dialogContext);
    }

    setState(() {
      appLoading = loading;
    });
  }

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper.updateOnBoardingPage('signup');
  }
}
