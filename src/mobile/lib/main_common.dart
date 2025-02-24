import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/screens/on_boarding/splash_screen.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/screens/web_view_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/custom_localisationspcm.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:app/utils/custom_localisation.dart';

class AirQoApp extends StatefulWidget {
  const AirQoApp(this.initialLink, {super.key, required this.locale});

  final PendingDynamicLinkData? initialLink;

  final Locale locale;

  @override
  State<AirQoApp> createState() => _AirQoAppState();
  static Future<void> setLocale(BuildContext context, Locale newLocale) async {
    _AirQoAppState? state = context.findAncestorStateOfType<_AirQoAppState>();
    state?.setLocale(newLocale);
  }
}

class _AirQoAppState extends State<AirQoApp> {
  Locale? _locale;

  void setLocale(Locale locale) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        _locale = locale;
      });
    });
  }

  @override
  void didChangeDependencies() {
    getLocale().then((locale) => {setLocale(locale)});
    super.didChangeDependencies();
  }

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
          create: (BuildContext context) => InternetConnectionBannerCubit(),
        ),
        BlocProvider(
          create: (BuildContext context) => WebViewLoadingCubit(),
        ),
        BlocProvider(
          create: (BuildContext context) => CurrentQuizQuestionCubit(),
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
          create: (BuildContext context) => PhoneAuthBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => EmailAuthBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => EmailVerificationBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => PhoneVerificationBloc(),
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
        BlocProvider(
          create: (BuildContext context) => SearchHistoryBloc(),
        ),
      ],
      child: MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          LgMaterialLocalizations.delegate,
          LgCupertinoLocalizations.delegate,
          LgWidgetsLocalizations.delegate,
          PcmMaterialLocalizations.delegate,
          PcmCupertinoLocalizations.delegate,
          PcmWidgetsLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en'), //English
          Locale('fr'), //French
          Locale('pt'), //Portuguese
          Locale('sw'), //Swahili
          Locale('lg'), //Luganda
          Locale('pcm') //pidgin
        ],
        navigatorKey: navigatorKey,
        navigatorObservers: [
          FirebaseAnalyticsObserver(analytics: FirebaseAnalytics.instance),
        ],
        title: config.appTitle,
        theme: customTheme(),
        locale: _locale,
        home: OfflineBanner(
          child: SplashScreen(widget.initialLink),
        ),
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
    logException(error, stack, fatal: true);

    return true;
  };

  FlutterError.onError = (details) {
    if (kDebugMode) {
      FlutterError.dumpErrorToConsole(details);
    } else {
      logException(details, null, fatal: true);
    }
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
