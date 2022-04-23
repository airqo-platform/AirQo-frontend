import 'package:animations/animations.dart';
import 'package:app/auth/phone_auth_widget.dart';
import 'package:app/on_boarding/location_setup_screen.dart';
import 'package:app/on_boarding/notifications_setup_screen.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/on_boarding/setup_complete_screeen.dart';
import 'package:app/on_boarding/welcome_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

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
        child: _renderWidget(),
      ),
    );
  }

  Future<void> initialize() async {
    await _appService.dbHelper.deleteNonFavPlacesInsights();

    var isLoggedIn = _appService.isLoggedIn();

    var nextPage =
        (await _appService.preferencesHelper.getOnBoardingPage()).toLowerCase();

    Future.delayed(const Duration(seconds: 2), _updateWidget);

    /// TODO add loading indicator to all onboarding pages
    Future.delayed(const Duration(seconds: 6), () {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        if (!isLoggedIn) {
          return const WelcomeScreen();
        } else {
          switch (nextPage) {
            case 'signup':
              return const PhoneSignUpWidget();
            case 'profile':
              return const ProfileSetupScreen();
            case 'notification':
              return const NotificationsSetupScreen();
            case 'location':
              return const LocationSetupScreen();
            case 'complete':
              return const SetUpCompleteScreen();
            case 'home':
              return const HomePage();
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
    initialize();
  }

  Widget logoWidget() {
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

  Widget taglineWidget() {
    return AnimatedOpacity(
      opacity: _visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      // The green box must be a child of the AnimatedOpacity widget.
      child: Center(
        child: Stack(alignment: AlignmentDirectional.center, children: [
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
                .headline4
                ?.copyWith(color: Colors.white),
          ),
        ]),
      ),
    );
  }

  Widget _renderWidget() {
    return _widgetId == 0 ? logoWidget() : taglineWidget();
  }

  void _updateWidget() {
    setState(() {
      _visible = true;
      _widgetId = _widgetId == 0 ? 1 : 0;
    });
  }
}
