import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:flutter/material.dart';

import '../../services/local_storage.dart';
import '../../services/rest_api.dart';
import '../../themes/colors.dart';

class SetUpCompleteScreen extends StatefulWidget {
  const SetUpCompleteScreen({super.key});

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CustomColors.appBodyColor,
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
                style: _setUpCompleteTextStyle(),
              ),
              Text(
                'Breathe',
                textAlign: TextAlign.center,
                style: _setUpCompleteTextStyle()?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> initialize() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.complete);
    Future.delayed(const Duration(seconds: 4), _goToHome);
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Future<bool> onWillPop() {
    _goToHome();

    return Future.value(false);
  }

  void _goToHome() {
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) {
            return const HomePage();
          },
        ),
        (r) => false,
      );
    }
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeEmail() async {
    try {
      final profile = await Profile.getProfile();
      await AirqoApiClient().sendWelcomeMessage(profile);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  TextStyle? _setUpCompleteTextStyle() {
    return Theme.of(context).textTheme.bodyText1?.copyWith(
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.normal,
          fontSize: 48,
          height: 56 / 48,
          letterSpacing: 16 * -0.022,
        );
  }
}
