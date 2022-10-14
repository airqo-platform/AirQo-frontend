import 'dart:io';

import 'package:app/screens/on_boarding/splash_screen.dart';
import 'package:app/services/hive_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/notification_service.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'blocs/feedback/feedback_bloc.dart';
import 'blocs/map/map_bloc.dart';
import 'blocs/nearby_location/nearby_location_bloc.dart';
import 'blocs/search/search_bloc.dart';
import 'constants/config.dart';
import 'firebase_options.dart';
import 'themes/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  await Future.wait([
    HiveService.initialize(),
    SystemProperties.setDefault(),
    NotificationService.listenToNotifications(),
    dotenv.load(fileName: Config.environmentFile),
    // initializeBackgroundServices()
  ]);

  HttpOverrides.global = AppHttpOverrides();

  if (kReleaseMode) {
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    await SentryFlutter.init(
      (options) {
        options
          ..dsn = Config.sentryDsn
          ..enableOutOfMemoryTracking = true
          ..tracesSampleRate = 1.0;
      },
      appRunner: () => runApp(
        const AirQoApp(),
      ),
    );
  } else {
    runApp(const AirQoApp());
  }
}

class AirQoApp extends StatelessWidget {
  const AirQoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        BlocProvider(
          create: (BuildContext context) => SearchBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => FeedbackBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => NearbyLocationBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MapBloc(),
        ),
      ],
      builder: (context, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: kReleaseMode ? false : true,
          navigatorObservers: [
            FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
            SentryNavigatorObserver(),
          ],
          title: 'AirQo',
          theme: customTheme(),
          home: const SplashScreen(),
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
