import 'package:animations/animations.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/on_boarding/setup_complete_screeen.dart';
import 'package:app/screens/on_boarding/welcome_screen.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/local_storage.dart';
import '../auth/phone_auth_widget.dart';
import 'location_setup_screen.dart';
import 'notifications_setup_screen.dart';
import 'on_boarding_widgets.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  int _widgetId = 0;
  bool _visible = false;
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.white,
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
        child: RenderWidget(
          visible: _visible,
          widgetId: _widgetId,
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    var isLoggedIn = _appService.isLoggedIn();
    if (isLoggedIn) {
      await _appService.postLoginActions(context);
    }

    var nextPage = getOnBoardingPageConstant(
        await SharedPreferencesHelper.getOnBoardingPage());

    Future.delayed(const Duration(seconds: 1), _updateWidget);

    /// TODO add loading indicator to all onboarding pages
    Future.delayed(const Duration(seconds: 5), () {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        if (!isLoggedIn) {
          return const WelcomeScreen();
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
              return const HomePage(refresh: false);
            default:
              return const WelcomeScreen();
          }
        }
      }), (r) => false);
    });

    await _appService.fetchData(context);
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  void _updateWidget() {
    setState(() {
      _visible = true;
      _widgetId = _widgetId == 0 ? 1 : 0;
    });
  }
}

class RenderWidget extends StatelessWidget {
  const RenderWidget({Key? key, required this.widgetId, required this.visible})
      : super(key: key);
  final int widgetId;
  final bool visible;

  @override
  Widget build(BuildContext context) {
    return widgetId == 0
        ? const LogoWidget()
        : TaglineWidget(
            visible: visible,
          );
  }
}
