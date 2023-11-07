import 'dart:async';
import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/on_boarding/setup_complete_screen.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../home_page.dart';
import '../phone_authentication/phone_auth_screen.dart';
import 'introduction_screen.dart';
import 'location_setup_screen.dart';
import 'notifications_setup_screen.dart';
import 'on_boarding_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen(this.initialLink, {super.key});
  final PendingDynamicLinkData? initialLink;

  @override
  State<SplashScreen> createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  bool _visible = false;
  late Future<void> _initializationFuture;
  late StreamSubscription<PendingDynamicLinkData> _dynamicLinkSubscription;

  @override
  void initState() {
    super.initState();
    _initializationFuture = _initialize();
  }

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.localeOf(context);
    AppService().setLocale(locale.languageCode);

    return FutureBuilder<void>(
      future: _initializationFuture,
      builder: (context, snapshot) {
        return Scaffold(
          body: PageTransitionSwitcher(
            duration: const Duration(seconds: 0),
            transitionBuilder: (
              child,
              animation,
              secondaryAnimation,
            ) {
              return SharedAxisTransition(
                animation: animation,
                secondaryAnimation: secondaryAnimation,
                transitionType: SharedAxisTransitionType.horizontal,
                child: child,
              );
            },
            child: _visible
                ? TaglineWidget(key: UniqueKey(), visible: true)
                : CustomPaint(
                    painter: SplashScreenPainter(), // Create a custom painter
                  ),
          ),
        );
      },
    );
  }

  Future<void> _initialize() async {
    context.read<FeedbackBloc>().add(InitializeFeedback(
          context.read<ProfileBloc>().state,
        ));
    context.read<SettingsBloc>().add(const InitializeSettings());
    context.read<ProfileBloc>().add(const SyncProfile());
    context.read<KyaBloc>().add(const ClearKya());
    context.read<KyaBloc>().add(const ClearQuizzes());
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
    context.read<NotificationBloc>().add(const SyncNotifications());
    context.read<DashboardBloc>().add(const RefreshDashboard(reload: true));
    context.read<SearchHistoryBloc>().add(const SyncSearchHistory());
    _dynamicLinkSubscription =
        FirebaseDynamicLinks.instance.onLink.listen((linkData) async {
      BuildContext? navigatorBuildContext = navigatorKey.currentContext;
      if (mounted && navigatorBuildContext != null) {
        await ShareService.navigateToSharedFeature(
          linkData: linkData,
          context: navigatorBuildContext,
        );
      }
    });

    _dynamicLinkSubscription.onError((error) async {
      await logException(error, null);
    });

    PendingDynamicLinkData? dynamicLinkData = widget.initialLink;
    if (dynamicLinkData != null) {
      BuildContext? navigatorBuildContext = navigatorKey.currentContext;
      if (mounted && navigatorBuildContext != null) {
        await ShareService.navigateToSharedFeature(
          linkData: dynamicLinkData,
          context: navigatorBuildContext,
        );
      } else {
        await _proceedWithSplashAnimation();
      }
    } else {
      await _proceedWithSplashAnimation();
    }
  }

  @override
  void dispose() {
    _dynamicLinkSubscription.cancel();
    super.dispose();
  }

  Future<void> _proceedWithSplashAnimation() async {
    final Profile profile = context.read<ProfileBloc>().state;

    final nextPage = getOnBoardingPageConstant(
      await SharedPreferencesHelper.getOnBoardingPage(),
    );

    await Future.delayed(const Duration(seconds: 1), _updateWidget);

    await Future.delayed(
      const Duration(seconds: 5),
      () {
        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) {
              if (!profile.isSignedIn) {
                return const IntroductionScreen();
              } else {
                switch (nextPage) {
                  case OnBoardingPage.signup:
                    return const PhoneSignUpScreen();
                  case OnBoardingPage.profile:
                    return const ProfileSetupScreen();
                  case OnBoardingPage.notification:
                    return const NotificationsSetupScreen();
                  case OnBoardingPage.location:
                    return const LocationSetupScreen();
                  case OnBoardingPage.complete:
                    return const SetUpCompleteScreen();
                  case OnBoardingPage.home:
                    return const HomePage();
                  default:
                    return const IntroductionScreen();
                }
              }
            }),
            (r) => false,
          );
        }
      },
    );
  }

  void _updateWidget() {
    if (!mounted) return;

    setState(
      () {
        _visible = true;
      },
    );
  }
}

class SplashScreenPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Paint a white background to match the native splash screen
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}

class TaglineWidget extends StatelessWidget {
  const TaglineWidget({super.key, required this.visible});

  final bool visible;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      // The green box must be a child of the AnimatedOpacity widget.
      child: Center(
        child: Stack(
          alignment: AlignmentDirectional.center,
          children: [
            Image.asset(
              'assets/images/splash-image.png',
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
              alignment: Alignment.center,
            ),
            Text(
              AppLocalizations.of(context)!.breatheClean,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
