import 'dart:io';

import 'package:app/models/notification.dart';
import 'package:app/providers/locale_provider.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_analytics/observer.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'constants/config.dart';
import 'languages/custom_localizations.dart';
import 'languages/lg_intl.dart';
import 'models/place_details.dart';
import 'on_boarding/spash_screen.dart';
import 'providers/theme_provider.dart';
import 'themes/dark_theme.dart';
import 'themes/light_theme.dart';

Future<void> main() async {
  HttpOverrides.global = AppHttpOverrides();
  await dotenv.load(fileName: Config.environmentFile);

  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    // statusBarColor: Config.appBodyColor,
    statusBarIconBrightness: Brightness.dark,
    systemNavigationBarDividerColor: Config.appBodyColor,
    // systemNavigationBarColor: Colors.transparent,
    systemNavigationBarColor: Config.appBodyColor,
    // statusBarBrightness: Brightness.light,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
      overlays: [SystemUiOverlay.bottom, SystemUiOverlay.top]);

  await Firebase.initializeApp();

  // await Firebase.initializeApp().then((value) => {
  //       FirebaseMessaging.onBackgroundMessage(
  //           NotificationService.backgroundNotificationHandler),
  //
  //       FirebaseMessaging.onMessage
  //           .listen(FbNotifications().foregroundMessageHandler)
  //     });

  // await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);

  final prefs = await SharedPreferences.getInstance();
  final themeController = ThemeController(prefs);

  if (kReleaseMode) {
    await SentryFlutter.init(
      (options) {
        options
          ..dsn = Config.sentryUrl
          ..tracesSampleRate = 1.0;
      },
      appRunner: () => runApp(AirQoApp(themeController: themeController)),
    );
  } else {
    runApp(AirQoApp(themeController: themeController));
  }
}

class AirQoApp extends StatelessWidget {
  final ThemeController themeController;
  final FirebaseAnalytics analytics = FirebaseAnalytics();

  AirQoApp({Key? key, required this.themeController}) : super(key: key);

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
              ChangeNotifierProvider(create: (context) => NotificationModel()),
              ChangeNotifierProvider(create: (context) => PlaceDetailsModel()),
            ],
            builder: (context, child) {
              final provider = Provider.of<LocaleProvider>(context);

              return MaterialApp(
                debugShowCheckedModeBanner: false,
                navigatorObservers: [
                  FirebaseAnalyticsObserver(analytics: analytics),
                  SentryNavigatorObserver(),
                ],
                localizationsDelegates: const [
                  CustomLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                  LgMaterialLocalizations.delegate,
                ],
                supportedLocales: const [Locale('en'), Locale('lg')],
                locale: provider.locale,
                title: Config.appName,
                theme: _buildCurrentTheme(),
                home: const SplashScreen(),
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
