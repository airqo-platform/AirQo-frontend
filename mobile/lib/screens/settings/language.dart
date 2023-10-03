// ignore_for_file: use_build_context_synchronously

import 'package:app/constants/constants.dart';
import 'package:app/themes/colors.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../../constants/language_contants.dart';
import '../../main_common.dart';
import '../../models/language.dart';
import '../offline_banner.dart';

class LanguageList extends StatefulWidget {
  const LanguageList({super.key});

  @override
  State<LanguageList> createState() => _LanguageListState();
}

class _LanguageListState extends State<LanguageList> {
  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(
          AppLocalizations.of(context)!.about,
        ),
        body: AppSafeArea(
          child: Center(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: DropdownButton<Language>(
                    underline: const SizedBox(),
                    icon: Icon(
                      size: 30,
                      Icons.language,
                      color: CustomColors.appColorBlue,
                    ),
                    onChanged: (Language? language) async {
                      if (language != null) {
                        Locale locale = await setLocale(language.languageCode);
                        AirQoApp.setLocale(context, locale);
                      }
                    },
                    items: Language.languageList()
                        .map<DropdownMenuItem<Language>>(
                          (e) => DropdownMenuItem<Language>(
                            value: e,
                            child: InkWell(
                              child: Text(e.name),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
  }
}
