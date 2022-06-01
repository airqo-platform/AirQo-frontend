import 'dart:io';

import 'package:app/screens/on_boarding/splash_screen_v2.dart';
import 'package:app/services/hive_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/notification_service.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'constants/config.dart';
import 'firebase_options.dart';
import 'models/place_details.dart';
import 'themes/app_theme.dart';

void main() async {
  HttpOverrides.global = AppHttpOverrides();
  await dotenv.load(fileName: Config.environmentFile);

  WidgetsFlutterBinding.ensureInitialized();

  await HiveService.initialize();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  await SystemProperties.setDefault();

  await NotificationService.listenToNotifications();

  if (kReleaseMode) {
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    await SentryFlutter.init(
      (options) {
        options
          ..dsn = Config.sentryDsn
          ..enableOutOfMemoryTracking = true
          ..tracesSampleRate = 1.0;
      },
      appRunner: () => runApp(AirQoApp()),
    );
  } else {
    runApp(AirQoApp());
  }
}

class AirQoApp extends StatelessWidget {
  AirQoApp({Key? key}) : super(key: key);
  final FirebaseAnalytics analytics = FirebaseAnalytics.instance;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
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
          theme: customTheme(),
          home: const SplashScreenV2(),
        );
      },
    );
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
