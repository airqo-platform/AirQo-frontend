import 'dart:io';

import 'package:app/screens/on_boarding/spash_screen.dart';
import 'package:app/services/hive_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/notifications_svc.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'constants/config.dart';
import 'firebase_options.dart';
import 'models/place_details.dart';
import 'providers/theme_provider.dart';
import 'themes/dark_theme.dart';
import 'themes/light_theme.dart';

void main() async {
  HttpOverrides.global = AppHttpOverrides();
  await dotenv.load(fileName: Config.environmentFile);

  WidgetsFlutterBinding.ensureInitialized();

  await HiveService.initialize();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  await SystemProperties.setDefault();

  if (Platform.isIOS) {
    FirebaseMessaging.onMessage.listen(NotificationService.notificationHandler);
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      // TODO: LOG EVENT
      var type = message.data['type'] ?? '';
      if (type == 'update') {
        // TODO: NAVIGATE TO FAV PLACES
        // TODO: LOG EVENT
      }
    });
  }
  final prefs = await SharedPreferences.getInstance();
  final themeController = ThemeController(prefs);

  if (kReleaseMode) {
    await SentryFlutter.init(
      (options) {
        options
          ..dsn = Config.sentryDsn
          ..enableOutOfMemoryTracking = true
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
  final FirebaseAnalytics analytics = FirebaseAnalytics.instance;

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
              ChangeNotifierProvider(create: (context) => PlaceDetailsModel()),
            ],
            builder: (context, child) {
              return MaterialApp(
                debugShowCheckedModeBanner: false,
                navigatorObservers: [
                  FirebaseAnalyticsObserver(analytics: analytics),
                  SentryNavigatorObserver(),
                ],
                title: 'AirQo',
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
