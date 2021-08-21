import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/onBoarding_page.dart';
import 'package:app/screens/feedback_page.dart';
import 'package:app/screens/map_page.dart';
import 'package:app/screens/my_places.dart';
import 'package:app/screens/resources_page.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/screens/share_picture.dart';
import 'package:app/utils/services/local_storage.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:app/utils/ui/share.dart';
import 'package:app/widgets/help/aqi_index.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'dashboard_page.dart';

const _faqsUrl = 'https://www.airqo.net/faqs';
const _url = 'https://forms.gle/oFjqpNoUKPY5ubAcA';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.search,
            ),
            onPressed: () async {
              await showSearch(
                context: context,
                delegate: LocationSearch(),
              ).then((value) {
                setState(() {});
              });
            },
          ),
          PopupMenuButton<dynamic>(
            onSelected: (value) => {navigateToMenuItem(value)},
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'MyPlaces',
                child: ListTile(
                  leading: Icon(
                    Icons.favorite_outlined,
                    color: appColor,
                  ),
                  title: Text(
                    'MyPlaces',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'AQI Index',
                child: ListTile(
                  leading: Icon(
                    Icons.info_outline_rounded,
                    color: appColor,
                  ),
                  title: Text(
                    'AQI Guide',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Faqs',
                child: ListTile(
                  leading: Icon(
                    Icons.help_outline_outlined,
                    color: appColor,
                  ),
                  title: Text(
                    'Faqs',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Feedback',
                child: ListTile(
                  leading: Icon(
                    Icons.feedback_outlined,
                    color: appColor,
                  ),
                  title: Text(
                    'Support',
                  ),
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'Share',
                child: ListTile(
                  leading: Icon(
                    Icons.share_outlined,
                    color: appColor,
                  ),
                  title: Text(
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
                icon: const Icon(Icons.home_outlined, color: appColor),
                splashColor: appColor,
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
                icon: const Icon(Icons.library_books_outlined, color: appColor),
                splashColor: appColor,
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
          onPageChanged: (int) {
            switchTitle(int);
            print('Page Changes to index $int');
          },
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
            backgroundColor: appColor,
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return MapPage();
              })).then((value) => setState(() {
                    _pageCtrl.jumpToPage(0);
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

  @override
  void initState() {
    _displayOnBoarding();
    _getMeasurements();
    _getDevices();

    super.initState();
  }

  void navigateToMenuItem(dynamic position) {
    var menuItem = position.toString();

    if (menuItem.trim().toLowerCase() == 'feedback') {
      // _launchURL();
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
      _launchURLFaqs();
      // Navigator.push(context, MaterialPageRoute(builder: (context) {
      //   return FaqsPage();
      // }));
    } else if (menuItem.trim().toLowerCase() == 'myplaces') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return const MyPlaces();
      })).then((value) {
        setState(() {});
      });
    } else if (menuItem.trim().toLowerCase() == 'settings') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      })).then((value) {
        setState(() {});
      });
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
      // final snackBar = const SnackBar(
      //   content: Text('Tap again to exit !'),
      //   backgroundColor: appColor,
      // );
      // ScaffoldMessenger.of(context).showSnackBar(snackBar);

      return Future.value(false);
    }
    return Future.value(true);
  }

  void switchTitle(int) {
    switch (int) {
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
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return OnBoardingPage();
      }));
    }
  }

  Future<void> _getDevices() async {
    print('Home page Getting devices');

    var results = await AirqoApiClient(context).fetchDevices();

    if (results.isNotEmpty) {
      await DBHelper().insertDevices(results);
    }
  }

  void _getMeasurements() async {
    print('Home page Getting measurements');

    var measurements = await AirqoApiClient(context).fetchLatestMeasurements();

    if (measurements.isNotEmpty) {
      print('inserting latest measurements into db');
      await DBHelper().insertMeasurements(measurements);
    }
  }

  void _launchURL() async => await canLaunch(_url)
      ? await launch(_url)
      : throw 'Could not launch feedback form, try opening $_url';

  void _launchURLFaqs() async => await canLaunch(_faqsUrl)
      ? await launch(_faqsUrl)
      : throw 'Could not launch feedback form, try opening $_faqsUrl';
}
