import 'dart:io';

import 'package:app/providers/LocalProvider.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'constants/app_constants.dart';
import 'languages/CustomLocalizations.dart';
import 'languages/lg_intl.dart';
import 'on_boarding/onBoarding_page.dart';
import 'providers/ThemeProvider.dart';
import 'themes/dark_theme.dart';
import 'themes/light_theme.dart';

Future<void> main() async {
  HttpOverrides.global = AppHttpOverrides();

  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
    systemNavigationBarColor: ColorConstants.appColor,
    statusBarColor: Colors.white,
    statusBarBrightness: Brightness.dark,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: ColorConstants.appColor,
  ));

  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(
      NotificationService.backgroundMessageHandler);
  FirebaseMessaging.onMessage
      .listen(NotificationService.foregroundMessageHandler);
  FirebaseMessaging.onMessageOpenedApp
      .listen(NotificationService.foregroundMessageHandler);

  final prefs = await SharedPreferences.getInstance();
  final themeController = ThemeController(prefs);

  runApp(AirQoApp(themeController: themeController));
}

class AirQoApp extends StatelessWidget {
  final ThemeController themeController;

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
                debugShowCheckedModeBanner: false,
                localizationsDelegates: [
                  CustomLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                  LgMaterialLocalizations.delegate,
                ],
                supportedLocales: [const Locale('en'), const Locale('lg')],
                locale: provider.locale,
                title: '${AppConfig.name}',
                theme: _buildCurrentTheme(),
                home: SplashScreen(),
              );
            },
          ),
        );
      },
    );
  }

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

class AppHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

class SplashScreen extends StatefulWidget {
  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  bool measurementsReady = false;
  String error = '';

  @override
  Widget build(BuildContext context) {
    if (error == '') {
      return Scaffold(
          body: Container(
        color: Colors.white,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/icon/airqo_logo_tagline_transparent.png',
                height: 150,
                width: 150,
              ),
            ],
          ),
        ),
      ));
    } else {
      return Scaffold(
        body: Center(
          child: Container(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(error,
                      maxLines: 2,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 15,
                        color: ColorConstants.red,
                      )),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        primary: ColorConstants.appColor),
                    onPressed: reload,
                    child:
                        const Text('Try Again', style: TextStyle(fontSize: 15)),
                  )
                ],
              )),
        ),
      );
    }
  }

  Future<void> initialize() async {
    _getLatestMeasurements();
    Future.delayed(const Duration(seconds: 4), _checkFirstUse);
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  void reload() {
    setState(() {
      error = '';
    });
    _initDB().then((value) => {_checkFirstUse()});
  }

  Future _checkFirstUse() async {
    var prefs = await SharedPreferences.getInstance();
    var isFirstUse = prefs.getBool(PrefConstant.firstUse) ?? true;

    if (isFirstUse) {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return OnBoardingPage();
      }));
    } else {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return HomePage();
      }), (r) => false);
    }
  }

  void _getLatestMeasurements() async {
    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty)
            {
              DBHelper().insertLatestMeasurements(value).then((value) => {
                    if (mounted)
                      {
                        setState(() {
                          measurementsReady = true;
                        })
                      }
                  })
            }
        });
  }

  Future _initDB() async {
    try {
      await DBHelper().getLatestMeasurements().then((value) => {
            if (value.isNotEmpty && mounted)
              {
                setState(() {
                  measurementsReady = true;
                })
              },
            if (!measurementsReady)
              {
                _getLatestMeasurements(),
              },
          });
    } catch (e) {
      print(e);
    }
  }
}
