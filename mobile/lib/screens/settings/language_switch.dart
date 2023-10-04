// ignore_for_file: use_build_context_synchronously

import 'package:app/screens/offline_banner.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../../constants/language_contants.dart';
import '../../main_common.dart';
import '../../models/language.dart';
import '../../themes/colors.dart';

class LanguageList extends StatefulWidget {
  const LanguageList({Key? key}) : super(key: key);

  @override
  LanguageListState createState() => LanguageListState();
}

class LanguageListState extends State<LanguageList> {
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
                return Column(
                  children: [
                    AnimatedPadding(
                      duration: const Duration(milliseconds: 100),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      curve: Curves.easeIn,
                      child: Card(
                        margin: EdgeInsets.zero,
                        child: ListTile(
                          leading: Text(language.flagEmoji),
                          title: Text(language.name),
                          onTap: () async {
                            Locale locale =
                                await setLocale(language.languageCode);
                            AirQoApp.setLocale(context, locale);
                            Navigator.pop(context);
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
    );
  }
}
