import 'package:airqo_app/screens/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:flutter_localizations/flutter_localizations.dart';

import 'config/languages/CustomLocalizations.dart';

void main() {
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
  ));
  runApp(AirqoApp());
}

class AirqoApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {

    return MaterialApp(

      localizationsDelegates: [
        const CustomLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: [
        const Locale('en',),
        const Locale('es', ''),
        const Locale('lg', ''),
      ],
      localeResolutionCallback: (locale, supportedLocales){

        for(var supportedLocale in supportedLocales){
          if(supportedLocale.languageCode == locale!.languageCode) {
            return supportedLocale;
          }
        }

        return supportedLocales.first;

      },
      title: 'Airqo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomePage(),
    );
  }
}


class AirqoApps extends StatelessWidget {
  @override
  Widget build(BuildContext context) {

    return MaterialApp(

      localizationsDelegates: [
        const CustomLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: [
        const Locale('en',),
        const Locale('es', ''),
        const Locale('lg', ''),
      ],
      localeResolutionCallback: (locale, supportedLocales){

        for(var supportedLocale in supportedLocales){
          if(supportedLocale.languageCode == locale!.languageCode) {
            return supportedLocale;
          }
        }

        return supportedLocales.first;


      },
      title: 'Airqo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: HomePage(),
    );
  }
}