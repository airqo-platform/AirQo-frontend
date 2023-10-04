// ignore_for_file: use_build_context_synchronously

import 'package:app/screens/offline_banner.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../../constants/language_contants.dart';
import '../../main_common.dart';
import '../../models/language.dart';

class LanguageList extends StatefulWidget {
  const LanguageList({Key? key}) : super(key: key);

  @override
  _LanguageListState createState() => _LanguageListState();
}

class _LanguageListState extends State<LanguageList> {
  int selectedLanguageIndex = 0;
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(
          AppLocalizations.of(context)!.about,
        ),
        body: AppSafeArea(
          child: Center(
            child: ListView.builder(
              itemCount: Language.languageList().length,
              itemBuilder: (context, index) {
                final language = Language.languageList()[index];
                return SizedBox(
                  height: 60,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          ListTile(
                            title: Text(
                                "${language.flagEmoji} ${language.name}"), // Display the flag emoji
                            onTap: () async {
                              Locale locale =
                                  await setLocale(language.languageCode);
                              AirQoApp.setLocale(context, locale);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    AppLocalizations.of(context)!
                                        .languageChangedSuccessfully,
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            },
                          ),
                          const Spacer(),

                        ],
                      ),
                      const Divider(
                        height: 1,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

