// ignore_for_file: use_build_context_synchronously

import 'package:app/screens/offline_banner.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
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
  String? selectedLanguageCode;
  @override
  void initState() {
    super.initState();
    selectedLanguageCode = null;
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
            height: MediaQuery.of(context).size.height*0.6,
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
                        child: ListTile(
                          selectedColor: CustomColors.appColorBlue,
                          trailing:
                              selectedLanguageCode == language.languageCode
                                  ? Icon(
                                      Icons.check,
                                      color: CustomColors.appColorBlue,
                                    )
                                  : null,
                          leading: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                color: CustomColors.appBodyColor,
                              ),
                              child: Text(language.flagEmoji)),
                          title: Text(language.name),
                          onTap: () async {
                            await languageDialog(context, language);
                            // showSnackBar(
                            //   context,
                            //   AppLocalizations.of(context)!
                            //       .languageChangedSuccessfully(language.name),
                            // );
                            setState(() {
                              selectedLanguageCode = language.languageCode;
                            });
                          },
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

Future<dynamic> languageDialog(BuildContext context, Language language) {
  return showCupertinoDialog(
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
            AppLocalizations.of(context)!.yes,
          ),
          onPressed: () async {
            Locale locale = await setLocale(language.languageCode);
            await AirQoApp.setLocale(context, locale);
            Navigator.pop(context);
          },
        ),
        CupertinoDialogAction(
          child: Text(
            style: TextStyle(
              color: CustomColors.appColorBlue,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
            AppLocalizations.of(context)!.no,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ],
    ),
  );
}
