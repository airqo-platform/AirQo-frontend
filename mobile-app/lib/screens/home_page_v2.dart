import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/onBoarding_page.dart';
import 'package:app/screens/feedback_page.dart';
import 'package:app/screens/map_page.dart';
import 'package:app/screens/my_places.dart';
import 'package:app/screens/resources_page.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/screens/share_picture.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/share.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'dashboard_page.dart';

class HomePageV2 extends StatefulWidget {
  final String title = 'AirQo';

  @override
  _HomePageV2State createState() => _HomePageV2State();
}

class _HomePageV2State extends State<HomePageV2> {
  final PageController _pageCtrl = PageController(initialPage: 0);
  String title = appName;
  bool showAddPlace = true;
  DateTime? exitTime;
  final _faqsUrl = 'https://www.airqo.net/faqs';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: const TextStyle(color: Colors.white),),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.search,
            ),
            onPressed: () async {
              await showSearch(
                context: context,
                delegate: LocationSearch(),
              ).then((_) {
                setState(() {});
              });
            },
          ),
          PopupMenuButton<dynamic>(
            onSelected: (value) => {navigateToMenuItem(value)},
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              PopupMenuItem<String>(
                value: 'MyPlaces',
                child: ListTile(
                  leading: Icon(
                    Icons.favorite_outlined,
                    color: ColorConstants().appColor,
                  ),
                  title: const Text(
                    'MyPlaces',
                  ),
                ),
              ),
              PopupMenuItem<String>(
                value: 'AQI Index',
                child: ListTile(
                  leading: Icon(
                    Icons.info_outline_rounded,
                    color: ColorConstants().appColor,
                  ),
                  title: const Text(
                    'AQI Guide',
                  ),
                ),
              ),
              PopupMenuItem<String>(
                value: 'Faqs',
                child: ListTile(
                  leading: Icon(
                    Icons.help_outline_outlined,
                    color: ColorConstants().appColor,
                  ),
                  title: const Text(
                    'Faqs',
                  ),
                ),
              ),
              PopupMenuItem<String>(
                value: 'Feedback',
                child: ListTile(
                  leading: Icon(
                    Icons.feedback_outlined,
                    color: ColorConstants().appColor,
                  ),
                  title: const Text(
                    'Support',
                  ),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<String>(
                value: 'Share',
                child: ListTile(
                  leading: Icon(
                    Icons.share_outlined,
                    color: ColorConstants().appColor,
                  ),
                  title: const Text(
                    'Share',
                    // style: Theme.of(context).textTheme.headline1,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        child: Container(
          // height: 50,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              const Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(left: 28.0),
                icon:
                    Icon(Icons.home_outlined, color: ColorConstants().appColor),
                splashColor: ColorConstants().appColor,
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(0);
                  });
                },
              ),
              const Spacer(
                flex: 1,
              ),
              const Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(right: 28.0),
                icon: Icon(Icons.library_books_outlined,
                    color: ColorConstants().appColor),
                splashColor: ColorConstants().appColor,
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(3);
                  });
                },
              ),
              const Spacer(
                flex: 1,
              ),
            ],
          ),
        ),
      ),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: PageView(
          controller: _pageCtrl,
          onPageChanged: switchTitle,
          physics: const NeverScrollableScrollPhysics(),
          children: <Widget>[
            DashboardPage(),
            ResourcesPage(),
          ],
        ),
      ),
      floatingActionButton: Container(
        // height: 60.0,
        // width: 60.0,
        child: FittedBox(
          child: FloatingActionButton(
            backgroundColor: ColorConstants().appColor,
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return MapPage();
              }));
            },
            child: const Icon(
              Icons.public_sharp,
              color: Colors.white,
            ),
            // elevation: 5.0,
          ),
        ),
      ),
    );
  }

  Future<void> initialize() async {
    await _getLatestMeasurements();
    await _getHistoricalMeasurements();
    await _getDevices();
  }

  @override
  void initState() {
    _displayOnBoarding();
    initialize();
    super.initState();
  }

  void navigateToMenuItem(dynamic position) {
    var menuItem = position.toString();

    if (menuItem.trim().toLowerCase() == 'feedback') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return FeedbackPage();
      }));
    } else if (menuItem.trim().toLowerCase() == 'share') {
      shareApp();
    } else if (menuItem.trim().toLowerCase() == 'aqi index') {
      Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (BuildContext context) => AQI_Dialog(),
          fullscreenDialog: true,
        ),
      );
    } else if (menuItem.trim().toLowerCase() == 'faqs') {
      try {
        _launchURLFaqs();
      } catch (e) {
        print(e);
      }
    } else if (menuItem.trim().toLowerCase() == 'myplaces') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return const MyPlaces();
      }));
    } else if (menuItem.trim().toLowerCase() == 'settings') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    } else if (menuItem.trim().toLowerCase() == 'camera') {
      takePhoto();
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    }
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }

  void switchTitle(tile) {
    switch (tile) {
      case 0:
        setState(() {
          title = appName;
          showAddPlace = true;
        });
        break;
      case 1:
        setState(() {
          title = 'News Feed';
          showAddPlace = false;
        });
        break;
      default:
        setState(() {
          title = appName;
          showAddPlace = true;
        });
        break;
    }
  }

  Future<void> takePhoto() async {
    // Obtain a list of the available cameras on the device.
    final cameras = await availableCameras();

    // Get a specific camera from the list of available cameras.
    final firstCamera = cameras.first;

    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return TakePicture(
        camera: firstCamera,
      );
    }));
  }

  Future<void> _displayOnBoarding() async {
    var prefs = await SharedPreferences.getInstance();
    var isFirstUse = prefs.getBool(firstUse) ?? true;

    if (isFirstUse) {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return OnBoardingPage();
      }), (r) => false);
    }
  }

  Future<void> _getDevices() async {
    await AirqoApiClient(context).fetchDevices().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertDevices(value)}
        });
  }

  Future<void> _getHistoricalMeasurements() async {
    await AirqoApiClient(context)
        .fetchHistoricalMeasurements()
        .then((value) => {
              if (value.isNotEmpty)
                {DBHelper().insertHistoricalMeasurements(value)}
            });
  }

  Future<void> _getLatestMeasurements() async {
    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
  }

  void _launchURLFaqs() async => await canLaunch(_faqsUrl)
      ? await launch(_faqsUrl)
      : throw 'Could not launch feedback form, try opening $_faqsUrl';
}
