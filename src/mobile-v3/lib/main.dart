import 'dart:async';
import 'package:airqo/core/utils/logging_bloc_observer.dart';
import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/bloc/forecast/forecast_bloc.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/repository/kya_repository.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/map/repository/map_repository.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/other/places/repository/google_places_repository.dart';
import 'package:airqo/src/app/other/theme/bloc/theme_bloc.dart';
import 'package:airqo/src/app/other/theme/repository/theme_repository.dart';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:airqo/src/app/shared/bloc/connectivity_bloc.dart';
import 'package:airqo/src/app/shared/pages/nav_page.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:airqo/src/app/shared/pages/no_internet_banner.dart';
import 'package:loggy/loggy.dart';
import 'core/utils/app_loggy_setup.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/other/language/services/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await CacheManager().initialize();

  const bool kReleaseMode = bool.fromEnvironment('dart.vm.product');
  AppLoggySetup.init(isDevelopment: !kReleaseMode);

  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    Object()
        .logError('Unhandled Flutter error', details.exception, details.stack);
  };

  await dotenv.load(fileName: ".env.prod");

  runZonedGuarded(
    () async {
      try {
        Object().logInfo('Application initialized successfully');

        Bloc.observer = LoggingBlocObserver();

        runApp(AirqoMobile(
          authRepository: AuthImpl(),
          userRepository: UserImpl(),
          kyaRepository: KyaImpl(),
          themeRepository: ThemeImpl(),
          mapRepository: MapImpl(),
          forecastRepository: ForecastImpl(),
          googlePlacesRepository: GooglePlacesImpl(),
          dashboardRepository: DashboardImpl(),
        ));
      } catch (e, stackTrace) {
        Object().logError('Failed to initialize application', e, stackTrace);
      }
    },
    (error, stackTrace) {
      Object().logError('Unhandled error in async code', error, stackTrace);
    },
  );
}

class AirqoMobile extends StatelessWidget {
  final AuthRepository authRepository;
  final ForecastRepository forecastRepository;
  final UserRepository userRepository;
  final MapRepository mapRepository;
  final ThemeRepository themeRepository;
  final KyaRepository kyaRepository;
  final GooglePlacesRepository googlePlacesRepository;
  final DashboardRepository dashboardRepository;

  const AirqoMobile({
    super.key,
    required this.authRepository,
    required this.mapRepository,
    required this.googlePlacesRepository,
    required this.kyaRepository,
    required this.themeRepository,
    required this.userRepository,
    required this.forecastRepository,
    required this.dashboardRepository,
  });

  @override
  Widget build(BuildContext context) {
    final connectivity = Connectivity();
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => AuthBloc(authRepository)..add(AppStarted()),
        ),
        BlocProvider(
          create: (context) => ForecastBloc(forecastRepository),
        ),
        BlocProvider(
          create: (context) => KyaBloc(kyaRepository),
        ),
        BlocProvider(
          create: (context) => GooglePlacesBloc(googlePlacesRepository),
        ),
        BlocProvider(
          create: (context) => UserBloc(userRepository),
        ),
        BlocProvider(
          create: (context) =>
              ThemeBloc(themeRepository)..add(ToggleTheme(false)),
        ),
        BlocProvider(
          create: (context) => DashboardBloc(dashboardRepository),
        ),
        BlocProvider(
          create: (context) => MapBloc(mapRepository)..add(LoadMap()),
        ),
        BlocProvider(
          create: (context) => ConnectivityBloc(connectivity),
        ),
        BlocProvider(
          create: (context) =>
              PasswordResetBloc(authRepository: authRepository),
        ),
        BlocProvider(
          create: (context) => LanguageBloc()..add(LoadLanguage()),
        ),
      ],
      child: BlocBuilder<LanguageBloc, LanguageState>(
        builder: (context, languageState) {
          Locale currentLocale = const Locale('en', '');
          if (languageState is LanguageLoaded) {
            currentLocale = Locale(languageState.languageCode, '');
          }

          return BlocBuilder<ThemeBloc, ThemeState>(
            builder: (context, themeState) {
              bool isLightTheme = themeState is ThemeLight;

              return MaterialApp(
                locale: currentLocale,
                supportedLocales: const [
                  Locale('en', ''),
                  Locale('fr', ''),
                  Locale('sw', ''),
                  // Locale('lg', ''),
                  Locale('pt', ''),
                ],
                localizationsDelegates: const [
                  AppLocalizations.delegate,
                  GlobalMaterialLocalizations.delegate,
                  GlobalWidgetsLocalizations.delegate,
                  GlobalCupertinoLocalizations.delegate,
                ],
                localeResolutionCallback: (locale, supportedLocales) {
                  for (var supportedLocale in supportedLocales) {
                    if (locale != null &&
                        supportedLocale.languageCode == locale.languageCode) {
                      return supportedLocale;
                    }
                  }
                  return supportedLocales.first;
                },
                debugShowCheckedModeBanner: false,
                theme: isLightTheme ? AppTheme.lightTheme : AppTheme.darkTheme,
                title: "AirQo",
                home: Decider(),
              );
            },
          );
        },
      ),
    );
  }
}

class Decider extends StatefulWidget {
  const Decider({super.key});

  @override
  State<Decider> createState() => _DeciderState();
}

class _DeciderState extends State<Decider> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ConnectivityBloc, ConnectivityState>(
      builder: (context, connectivityState) {
        logDebug('Current connectivity state: $connectivityState');
        return Stack(
          children: [
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, authState) {
                debugPrint("Current AuthState: $authState");

                if (authState is AuthLoading) {
                  return Scaffold(
                    body: const Center(child: CircularProgressIndicator()),
                  );
                }

                if (authState is GuestUser) {
                  return NavPage();
                }

                if (authState is AuthLoaded) {
                  context.read<UserBloc>().add(LoadUser());
                  return NavPage();
                }


                if (authState is AuthLoadingError) {
                  return Scaffold(
                    body: Center(child: Text('Error: ${authState.message}')),
                  );
                }

                return Scaffold(
                  body: const Center(child: CircularProgressIndicator()),
                );
              },
            ),
            if (connectivityState is ConnectivityOffline)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: NoInternetBanner(
                  onClose: () {
                    logInfo('No internet connection banner dismissed');
                    context
                        .read<ConnectivityBloc>()
                        .add(ConnectivityBannerDismissed());
                  },
                ),
              ),
          ],
        );
      },
    );
  }
}
