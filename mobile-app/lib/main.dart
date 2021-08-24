import 'package:app/config/providers/LocalProvider.dart';
import 'package:app/screens/home_page_v2.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config/languages/CustomLocalizations.dart';
import 'config/languages/lg_intl.dart';
import 'config/providers/ThemeProvider.dart';
import 'config/themes/dark_theme.dart';
import 'config/themes/light_theme.dart';
import 'constants/app_constants.dart';
import 'on_boarding/onBoarding_page.dart';
import 'screens/home_page.dart';

Future<void> main() async {
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    systemNavigationBarColor: appColor,
    statusBarColor: Colors.transparent,
    // statusBarBrightness: Brightness.light,
    // statusBarIconBrightness:Brightness.light ,
    // systemNavigationBarDividerColor: appColor,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  WidgetsFlutterBinding.ensureInitialized();

  // runApp(AirQoApp());

  final prefs = await SharedPreferences.getInstance();
  final themeController = ThemeController(prefs);

  runApp(AirQoApp(themeController: themeController));
}

class AirQoApp extends StatelessWidget {
  // @override
  // Widget build(BuildContext context) {
  //
  //   return MultiProvider(
  //     providers: [
  //       ChangeNotifierProvider(create: (_) => LocaleProvider()),
  //       ChangeNotifierProvider(create: (_) => ThemeProvider()),
  //     ],
  //     builder: (context, child) {
  //       final provider = Provider.of<LocaleProvider>(context);
  //       final themeProvider = Provider.of<ThemeProvider>(context);
  //       // themeProvider.loadActiveThemeData(context);
  //       // Provider.of<ThemeProvider>(context)
  //       //     .loadActiveThemeData(context);
  //       return MaterialApp(
  //         localizationsDelegates: [
  //           CustomLocalizations.delegate,
  //           GlobalMaterialLocalizations.delegate,
  //           GlobalWidgetsLocalizations.delegate,
  //           GlobalCupertinoLocalizations.delegate,
  //           LgMaterialLocalizations.delegate,
  //         ],
  //         // supportedLocales: L10n.all,
  //         // localeResolutionCallback: (locale, supportedLocales) {
  //         //   for (var supportedLocale in supportedLocales) {
  //         //     if (supportedLocale.languageCode.toLowerCase().trim() ==
  //         //         locale!.languageCode.toLowerCase().trim()) {
  //         //       return supportedLocale;
  //         //     }
  //         //   }
  //         //   return supportedLocales.first;
  //         // },
  //         supportedLocales: [const Locale('en'), const Locale('lg')],
  //         locale: provider.locale,
  //         title: appName,
  //         // theme: lightTheme(),
  //         theme: themeProvider.getTheme(),
  //         home: SplashScreen(),
  //       );
  //     },
  //   );
  // }

  const AirQoApp({Key? key, required this.themeController}) : super(key: key);

  @override
  Widget build(BuildContext context) {

    return AnimatedBuilder(
      animation: themeController,
      builder: (context, _) {
        return ThemeControllerProvider(
          controller: themeController,
          child: MultiProvider(
            providers: [
              ChangeNotifierProvider(create: (_) => LocaleProvider()),
            ],
            builder: (context, child) {
              final provider = Provider.of<LocaleProvider>(context);

              return MaterialApp(
                localizationsDelegates: [
                  CustomLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                  LgMaterialLocalizations.delegate,
                ],
                // supportedLocales: L10n.all,
                // localeResolutionCallback: (locale, supportedLocales) {
                //   for (var supportedLocale in supportedLocales) {
                //     if (supportedLocale.languageCode.toLowerCase().trim() ==
                //         locale!.languageCode.toLowerCase().trim()) {
                //       return supportedLocale;
                //     }
                //   }
                //   return supportedLocales.first;
                // },
                supportedLocales: [const Locale('en'), const Locale('lg')],
                locale: provider.locale,
                title: appName,
                theme: _buildCurrentTheme(),
                home: SplashScreen(),
              );
            },
          ),
          // child: MaterialApp(
          //   localizationsDelegates: [
          //     CustomLocalizations.delegate,
          //     GlobalMaterialLocalizations.delegate,
          //     GlobalWidgetsLocalizations.delegate,
          //     GlobalCupertinoLocalizations.delegate,
          //     LgMaterialLocalizations.delegate,
          //   ],
          //   // supportedLocales: L10n.all,
          //   // localeResolutionCallback: (locale, supportedLocales) {
          //   //   for (var supportedLocale in supportedLocales) {
          //   //     if (supportedLocale.languageCode.toLowerCase().trim() ==
          //   //         locale!.languageCode.toLowerCase().trim()) {
          //   //       return supportedLocale;
          //   //     }
          //   //   }
          //   //   return supportedLocales.first;
          //   // },
          //   supportedLocales: [const Locale('en'), const Locale('lg')],
          //   locale: Provider.of<LocaleProvider>(context).locale,
          //   title: appName,
          //   theme: _buildCurrentTheme(),
          //   home: SplashScreen(),
          // ),
        );
      },
    );
  }
  
  final ThemeController themeController;
  
  ThemeData _buildCurrentTheme() {
    switch (themeController.currentTheme) {
      case 'dark':
        return darkTheme();
      case 'light':
        return lightTheme();
      default:
        return lightTheme();
    }
  }
}

class SplashScreen extends StatefulWidget {
  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    checkFirstUse();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
            color: appColor,
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )),
      ),
    );
  }

  Future checkFirstUse() async {

    try {
      var db = await DBHelper().initDB();
      await DBHelper().createDefaultTables(db);
    } catch (e) {
      print(e);
    }

    var prefs = await SharedPreferences.getInstance();
    var isFirstUse = prefs.getBool(firstUse) ?? true;
    // var isFirstUse =  true;

    if (isFirstUse) {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return OnBoardingPage();
      }));
    } else {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
            return HomePageV2();
          }), (r) => false);
    }
  }
}

