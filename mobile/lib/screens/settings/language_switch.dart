import 'package:app/constants/constants.dart';
import 'package:app/main_common.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../../constants/language_contants.dart';
import '../../themes/colors.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:restart_app/restart_app.dart';

class LanguageList extends StatefulWidget {
  const LanguageList({Key? key}) : super(key: key);

  @override
  LanguageListState createState() => LanguageListState();
}

class LanguageListState extends State<LanguageList> {
  String? selectedLanguageCode;

  @override
  void initState() {
    super.initState();
    _loadSelectedLanguage().then((value) {
      setState(() {
        selectedLanguageCode = value;
      });
    });
  }

  Future<bool> languageDialog(BuildContext context, Language language) {
    return showCupertinoDialog<bool>(
      context: context,
      builder: (BuildContext context) => CupertinoAlertDialog(
        title: Text(
          AppLocalizations.of(context)!.confirm,
          style: TextStyle(
            color: CustomColors.appColorBlue,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          textAlign: TextAlign.center,
          style: TextStyle(
            color: CustomColors.appColorBlack,
          ),
          AppLocalizations.of(context)!
              .doYouWantToSwitchToLanguage(language.name),
        ),
        actions: [
          CupertinoDialogAction(
            child: Text(
              style: TextStyle(
                color: CustomColors.appColorBlue,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              AppLocalizations.of(context)!.ok,
            ),
            onPressed: () async {
              Locale locale = await setLocale(language.languageCode);
              await AirQoApp.setLocale(context, locale);
              Navigator.pop(context, true);
              //await Restart.restartApp();
            },
          ),
          // CupertinoDialogAction(
          //   child: Text(
          //     style: TextStyle(
          //       color: CustomColors.appColorBlue,
          //       fontSize: 16,
          //       fontWeight: FontWeight.w600,
          //     ),
          //     AppLocalizations.of(context)!.cancel,
          //   ),
          //   onPressed: () {
          //     Navigator.pop(context, false);
          //   },
          // ),
        ],
      ),
      barrierDismissible: true,
    ).then((value) => value ?? false);
  }

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(
          AppLocalizations.of(context)!.selectLanguage,
        ),
        body: AppSafeArea(
          child: Container(
            height: MediaQuery.of(context).size.height * 0.6,
            decoration: BoxDecoration(
              color: CustomColors.appBodyColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 15),
              child: ListView.builder(
                itemCount: Language.languageList().length,
                itemBuilder: (context, index) {
                  final language = Language.languageList()[index];
                  return Column(
                    children: [
                      AnimatedPadding(
                        duration: const Duration(milliseconds: 100),
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        curve: Curves.easeIn,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: ListTile(
                            selectedColor: CustomColors.appColorBlue,
                            trailing:
                                selectedLanguageCode == language.languageCode
                                    ? Icon(
                                        Icons.check,
                                        color: CustomColors.aqiGreenTextColor,
                                      )
                                    : null,
                            leading: Padding(
                              padding: const EdgeInsets.fromLTRB(0, 9, 8, 8),
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(4),
                                  color: CustomColors.appBodyColor,
                                ),
                                child: language.flag,
                              ),
                            ),
                            title: Text(language.name),
                            onTap: () async {
                              final shouldChangeLanguage =
                                  await languageDialog(context, language);
                              if (shouldChangeLanguage) {
                                await _saveSelectedLanguage(
                                    language.languageCode);
                                setState(() {
                                  selectedLanguageCode = language.languageCode;
                                });
                              }
                            },
                          ),
                        ),
                      ),
                      Divider(
                        height: 1,
                        thickness: 0,
                        color: CustomColors.appBodyColor,
                      )
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Future<void> _saveSelectedLanguage(String languageCode) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('language', languageCode);
}

Future<String?> _loadSelectedLanguage() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('language');
}
