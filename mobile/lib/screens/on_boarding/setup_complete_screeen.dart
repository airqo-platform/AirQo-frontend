import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/firebase_service.dart';
import '../../services/local_storage.dart';

class SetUpCompleteScreen extends StatefulWidget {
  const SetUpCompleteScreen({Key? key}) : super(key: key);

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  DateTime? _exitTime;
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Config.appBodyColor,
        body: WillPopScope(
          onWillPop: onWillPop,
          child: Center(
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    'All Set!',
                    textAlign: TextAlign.center,
                    style: _textStyle(),
                  ),
                  Text(
                    'Breathe',
                    textAlign: TextAlign.center,
                    style: _textStyle()?.copyWith(color: Config.appColorBlue),
                  ),
                ]),
          ),
        ));
  }

  Future<void> initialize() async {
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        _updateOnBoardingPage(OnBoardingPage.home);
        return const HomePage();
      }), (r) => false);
    });
  }

  @override
  void initState() {
    super.initState();
    SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.complete);
    initialize();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeEmail() async {
    try {
      var userDetails = await CloudStore.getProfile();
      await _appService.apiClient.sendWelcomeMessage(userDetails);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  TextStyle? _textStyle() {
    return Theme.of(context).textTheme.bodyText1?.copyWith(
        fontWeight: FontWeight.bold,
        fontStyle: FontStyle.normal,
        fontSize: 48,
        height: 56 / 48,
        letterSpacing: 16 * -0.022);
  }

  Future<void> _updateOnBoardingPage(OnBoardingPage page) async {
    await Future.wait([
      _appService.postSignUpActions(context),
      SharedPreferencesHelper.updateOnBoardingPage(page)
    ]);
  }
}
