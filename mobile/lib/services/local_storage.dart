import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesHelper {
  static Future<String> getOnBoardingPage() async {
    final sharedPreferences = await SharedPreferences.getInstance();

    return sharedPreferences.getString(Config.prefOnBoardingPage) ?? 'welcome';
  }

  static Future<void> updateOnBoardingPage(
    OnBoardingPage currentBoardingPage,
  ) async {
    final sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setString(
      Config.prefOnBoardingPage,
      currentBoardingPage.toString(),
    );
  }
}
