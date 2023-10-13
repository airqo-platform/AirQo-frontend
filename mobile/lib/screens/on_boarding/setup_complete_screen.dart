import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';

import 'on_boarding_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SetUpCompleteScreen extends StatefulWidget {
  const SetUpCompleteScreen({super.key});

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: const OnBoardingTopBar(),
        body: WillPopScope(
          onWillPop: _onWillPop,
          child: AppSafeArea(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    AppLocalizations.of(context)!.allSet,
                    textAlign: TextAlign.center,
                    style: _setUpCompleteTextStyle(),
                  ),
                  Text(
                    AppLocalizations.of(context)!.breathe,
                    textAlign: TextAlign.center,
                    style: _setUpCompleteTextStyle()?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.complete);
    Future.delayed(const Duration(seconds: 3), () async {
      await _goToHome();
    });
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

  Future<void> _goToHome() async {
    if (mounted) {
      await Navigator.pushAndRemoveUntil(
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
    return Theme.of(context).textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.normal,
          fontSize: 48,
          height: 56 / 48,
          letterSpacing: 16 * -0.022,
        );
  }
}
