import 'dart:async';

import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/on_boarding/setup_complete_screeen.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../auth/phone_auth_widget.dart';
import '../home_page.dart';
import 'introduction_screen.dart';
import 'location_setup_screen.dart';
import 'notifications_setup_screen.dart';
import 'on_boarding_widgets.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen(this.initialLink, {super.key});
  final PendingDynamicLinkData? initialLink;

  @override
  State<SplashScreen> createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  int _widgetId = 0;
  bool _visible = false;
  late StreamSubscription<PendingDynamicLinkData> _dynamicLinkSubscription;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageTransitionSwitcher(
        duration: const Duration(seconds: 3),
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
        child: _widgetId == 0
            ? const LogoWidget()
            : TaglineWidget(visible: _visible),
      ),
    );
  }

  Future<void> _initialize() async {
    context.read<FeedbackBloc>().add(const InitializeFeedback());
    context.read<SettingsBloc>().add(const InitializeSettings());
    context.read<AccountBloc>().add(const LoadAccountInfo());
    context.read<KyaBloc>().add(const RefreshKya());
    context.read<AnalyticsBloc>().add(const RefreshAnalytics());
    context.read<FavouritePlaceBloc>().add(const RefreshFavouritePlaces());
    context.read<NotificationBloc>().add(const RefreshNotifications());
    context.read<HourlyInsightsBloc>().add(const DeleteOldInsights());
    context.read<DashboardBloc>().add(const RefreshDashboard(reload: true));
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

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _proceedWithSplashAnimation() async {
    final isLoggedIn = CustomAuth.isLoggedIn();

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
              if (!isLoggedIn) {
                return const IntroductionScreen();
              } else {
                switch (nextPage) {
                  case OnBoardingPage.signup:
                    return const PhoneSignUpWidget();
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
    setState(
      () {
        _visible = true;
        _widgetId = _widgetId == 0 ? 1 : 0;
      },
    );
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
              'Breathe\nClean.',
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

class LogoWidget extends StatelessWidget {
  const LogoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icon/splash_image.svg',
              semanticsLabel: 'Share',
              // height: 118,
              // width: 81,
            ),
          ],
        ),
      ),
    );
  }
}
