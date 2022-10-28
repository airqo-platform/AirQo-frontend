import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

import '../../services/local_storage.dart';
import '../../themes/colors.dart';
import 'on_boarding_widgets.dart';

class SetUpCompleteScreen extends StatefulWidget {
  const SetUpCompleteScreen({super.key});

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(),
      body: WillPopScope(
          onWillPop: _onWillPop,
          child: AppSafeArea(
            widget: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
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
          )),
    );
  }

  Future<void> _initialize() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.complete);
    Future.delayed(const Duration(seconds: 4), _goToHome);
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<bool> _onWillPop() {
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
