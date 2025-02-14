import 'dart:io';

import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/password_reset/forgot_password.dart';
import 'package:airqo/src/app/auth/pages/welcome_screen.dart';
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

import 'package:airqo/src/meta/utils/colors.dart';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:airqo/src/app/shared/pages/no_internet_banner.dart';
import 'package:loggy/loggy.dart';
import 'src/app/shared/repository/hive_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  Loggy.initLoggy(
    logPrinter: const PrettyPrinter(),
    logOptions: const LogOptions(
      LogLevel.all,
      stackTraceLevel: LogLevel.error,
    ),
  );
  await dotenv.load(fileName: ".env.prod");

  try {
    Directory dir = await getApplicationDocumentsDirectory();
    Hive.init(dir.path);

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
    logError('Failed to initialize application', e, stackTrace);
  }
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
  const AirqoMobile(
      {super.key,
      required this.authRepository,
      required this.mapRepository,
      required this.googlePlacesRepository,
      required this.kyaRepository,
      required this.themeRepository,
      required this.userRepository,
      required this.forecastRepository,
      required this.dashboardRepository});

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
        BlocProvider(create: (context) => PasswordResetBloc(authRepository: authRepository),
        )
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, state) {
          bool isLightTheme = state is ThemeLight;

          return MaterialApp(
            debugShowCheckedModeBanner: false,
            theme: isLightTheme ? AppTheme.lightTheme : AppTheme.darkTheme,
            // theme: isLightTheme ? ThemeData(
            //     splashColor: Colors.transparent,
            //     highlightColor: Colors.transparent,
            //     fontFamily: "Inter",
            //     useMaterial3: true,
            //     appBarTheme: AppBarTheme(
            //         scrolledUnderElevation: 0,
            //         elevation: 0,
            //         backgroundColor: Theme.of(context).scaffoldBackgroundColor),
            //     scaffoldBackgroundColor: Theme.of(context).scaffoldBackgroundColor,
            //     brightness: Brightness.light),
            title: "AirQo",
            home: Decider(),
          );
        },
      ),
    );
  }
}

class Decider extends StatefulWidget {
  @override
  _DeciderState createState() => _DeciderState();
}

class _DeciderState extends State<Decider> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ConnectivityBloc, ConnectivityState>(
      builder: (context, connectivityState) {
        logDebug('Current connectivity state: $connectivityState');
        return Stack(
          children: [
            FutureBuilder<String?>(
              future: HiveRepository.getData('token', HiveBoxNames.authBox),

              builder: (context, snapshot) {


                // Handle loading state
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Scaffold(
                    body: const Center(child: CircularProgressIndicator()),
                  );
                }
                if (snapshot.connectionState == ConnectionState.done) {
                  if (!snapshot.hasData) {
                    return WelcomeScreen();
                  } else {
                    return NavPage();
                  }
                } else {
                  return Scaffold(body: Center(child: Text('An Error occured.')));
                }
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

