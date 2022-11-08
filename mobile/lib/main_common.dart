import 'dart:io';
import 'dart:ui';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/screens/on_boarding/splash_screen.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'utils/utils.dart';

class AirQoApp extends StatelessWidget {
  const AirQoApp({super.key});

  @override
  Widget build(BuildContext context) {
    final config = AppConfig.of(context);

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
          create: (BuildContext context) => SettingsBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => AuthCodeBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => PhoneAuthBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => EmailAuthBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MapBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => DashboardBloc(),
        ),
      ],
      builder: (context, child) {
        return MaterialApp(
          navigatorObservers: [
            FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
            SentryNavigatorObserver(),
          ],
          title: config.appTitle,
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

Future<void> initializeMainMethod() async {
  await Future.wait([
    SystemProperties.setDefault(),
    dotenv.load(fileName: Config.environmentFile),
    HiveService.initialize(),
    // NotificationService.listenToNotifications(),
    // initializeBackgroundServices()
  ]);

  HttpOverrides.global = AppHttpOverrides();

  PlatformDispatcher.instance.onError = (error, stack) {
    logException(error, stack);

    return true;
  };
}
