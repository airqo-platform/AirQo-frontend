import 'package:app/models/measurement.dart';
import 'package:app/on_boarding/welcome_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

class SplashScreen extends StatefulWidget {
  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen> {
  int _widgetId = 0;
  final CustomAuth _customAuth = CustomAuth();
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(seconds: 3),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: _renderWidget(),
      ),
    );
  }

  void initialize() {
    _getLatestMeasurements();
    _getFavPlaces();
    Future.delayed(const Duration(seconds: 2), () async {
      _updateWidget();
    });

    _customAuth.isFirstUse().then((value) => {
          Future.delayed(const Duration(seconds: 7), () async {
            await Navigator.pushAndRemoveUntil(context,
                MaterialPageRoute(builder: (context) {
              if (value) {
                return WelcomeScreen();
              } else {
                return HomePage();
              }
            }), (r) => false);
          }),
        });
  }

  @override
  void initState() {
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
      child: Container(
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
                  fontWeight: FontWeight.bold,
                  fontSize: 48,
                  color: Colors.white),
            ),
          ]),
        ),
      ),
    );
  }

  void _getFavPlaces() {
    Provider.of<MeasurementModel>(context, listen: false)
        .reloadFavouritePlaces();
  }

  void _getLatestMeasurements() {
    AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
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
