import 'dart:io';

import 'package:app/app_config.dart';
import 'package:app/screens/on_boarding/splash_screen.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'blocs/map/map_bloc.dart';
import 'blocs/nearby_location/nearby_location_bloc.dart';
import 'blocs/search/search_bloc.dart';
import 'themes/app_theme.dart';

class AirQoApp extends StatelessWidget {
  AirQoApp({
    Key? key,
  }) : super(key: key);
  final FirebaseAnalytics analytics = FirebaseAnalytics.instance;

  @override
  Widget build(BuildContext context) {
    var config = AppConfig.of(context);

    return MultiProvider(
      providers: [
        BlocProvider(
          create: (BuildContext context) => SearchBloc(),
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
