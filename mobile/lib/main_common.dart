import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/screens/on_boarding/splash_screen.dart';
import 'package:app/screens/web_view_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

class AirQoApp extends StatelessWidget {
  const AirQoApp(this.initialLink, {super.key});

  final PendingDynamicLinkData? initialLink;

  @override
  Widget build(BuildContext context) {
    final config = AppConfig.of(context);

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(
          create: (context) => AirqoApiClient(),
        ),
        BlocProvider(
          create: (BuildContext context) => SearchBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => SearchFilterBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => SearchPageCubit(),
        ),
        BlocProvider(
          create: (BuildContext context) => WebViewLoadingCubit(),
        ),
        BlocProvider(
          create: (BuildContext context) => MapSearchBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => FeedbackBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => InsightsBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => KyaBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => FavouritePlaceBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => LocationHistoryBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => NotificationBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => NearbyLocationBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => ProfileBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => AuthCodeBloc(
            RepositoryProvider.of<AirqoApiClient>(context),
          ),
        ),
        BlocProvider(
          create: (BuildContext context) => KyaProgressCubit(),
        ),
        BlocProvider(
          create: (BuildContext context) => PhoneAuthBloc(
            RepositoryProvider.of<AirqoApiClient>(context),
          ),
        ),
        BlocProvider(
          create: (BuildContext context) => EmailAuthBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MapBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => SettingsBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => DashboardBloc(),
        ),
      ],
      child: MaterialApp(
        navigatorKey: navigatorKey,
        navigatorObservers: [
          FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
        ],
        title: config.appTitle,
        theme: customTheme(),
        home: SplashScreen(initialLink),
      ),
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
  HydratedBloc.storage = await HydratedStorage.build(
    storageDirectory: await getApplicationDocumentsDirectory(),
  );

  PlatformDispatcher.instance.onError = (error, stack) {
    logException(error, stack);

    return true;
  };

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    logException(details, null);
  };

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return kDebugMode ? ErrorWidget(details.exception) : const ErrorPage();
  };

  await Future.wait([
    SystemProperties.setDefault(),
    dotenv.load(fileName: Config.environmentFile),
    HiveService().initialize(),
  ]);

  HttpOverrides.global = AppHttpOverrides();

  EquatableConfig.stringify = true;
}
