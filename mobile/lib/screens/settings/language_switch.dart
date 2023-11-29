import 'package:app/constants/constants.dart';
import 'package:app/main_common.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/colors.dart';
import 'package:app/blocs/blocs.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';

class LanguageList extends StatefulWidget {
  const LanguageList({super.key});

  @override
  LanguageListState createState() => LanguageListState();
}

class LanguageListState extends State<LanguageList> {
  String? selectedLanguageCode;

  @override
  void initState() {
    super.initState();
    _initialize();
    _loadSelectedLanguage().then((value) {
      setState(() {
        selectedLanguageCode = value;
      });
    });
  }

  Future<void> _initialize() async {
    context.read<KyaBloc>().add(const ClearKya());
    context.read<KyaBloc>().add(const ClearQuizzes());
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
                              await _saveSelectedLanguage(
                                language.languageCode,
                              );
                              Locale locale =
                                  await setLocale(language.languageCode);
                              setState(() {
                                selectedLanguageCode = language.languageCode;
                              });
                              context.read<KyaBloc>().add(const ClearKya());
                              context.read<KyaBloc>().add(const ClearQuizzes());
                              await AirQoApp.setLocale(context, locale);
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
  final prefs = await SharedPreferencesHelper.instance;
  await prefs.setString('language', languageCode);
}

Future<String?> _loadSelectedLanguage() async {
  final prefs = await SharedPreferencesHelper.instance;
  return prefs.getString('language');
}
