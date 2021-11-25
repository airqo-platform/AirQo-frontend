import 'package:animations/animations.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/on_boarding/welcome_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  int _widgetId = 0;
  final CustomAuth _customAuth = CustomAuth();
  bool _visible = false;
  final DBHelper _dbHelper = DBHelper();
  AirqoApiClient? _airqoApiClient;
  final CloudStore _cloudStore = CloudStore();

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
    _getLatestMeasurements();
    _loadKya();
    _loadNotifiers();
    Future.delayed(const Duration(seconds: 2), () async {
      _updateWidget();
    });

    await _customAuth.isFirstUse().then((value) => {
          Future.delayed(const Duration(seconds: 5), () async {
            await Navigator.pushAndRemoveUntil(context,
                MaterialPageRoute(builder: (context) {
              if (value) {
                return const WelcomeScreen();
              } else {
                return const HomePage();
              }
            }), (r) => false);
          }),
        });
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    initialize();
    super.initState();
  }

  Widget logoWidget() {
    return Container(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icon/airqo_home.svg',
              semanticsLabel: 'Share',
              height: 118,
              width: 81,
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
          const Text(
            'Breathe\nClean.',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 48, color: Colors.white),
          ),
        ]),
      ),
    );
  }

  void _getLatestMeasurements() {
    try {
      _airqoApiClient!.fetchLatestMeasurements().then((value) => {
            if (value.isNotEmpty) {_dbHelper.insertLatestMeasurements(value)}
          });
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  void _loadKya() async {
    var kyas = await _cloudStore.getKya(_customAuth.getId());
    await _dbHelper.insertKyas(kyas);
  }

  void _loadNotifiers() {
    Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
    Provider.of<NotificationModel>(context, listen: false).loadNotifications();
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
