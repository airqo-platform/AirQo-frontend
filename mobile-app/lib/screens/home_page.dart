import 'package:app/constants/app_constants.dart';
import 'package:app/screens/map_page.dart';
import 'package:app/screens/ranking_page.dart';
import 'package:app/screens/search_location_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/screens/share_picture.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/share.dart';
import 'package:camera/camera.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'blog_page.dart';
import 'dashboard_page.dart';
import 'help_page.dart';
import 'my_places_view.dart';

class HomePage extends StatefulWidget {
  final String title = 'AirQo';

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final PageController _pageCtrl = PageController(initialPage: 0);
  String title = '${AppConfig.name}';
  bool showAddPlace = true;
  DateTime? exitTime;

  double selectedPage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        backgroundColor: ColorConstants.appBarBgColor,
        elevation: 0,
        title: Text(
          title,
          style: TextStyle(
            color: ColorConstants.appBarTitleColor,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.search,
              color: ColorConstants.appBarTitleColor,
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
            icon: Icon(
              Icons.menu,
              color: ColorConstants.appBarTitleColor,
            ),
            onSelected: (value) => {navigateToMenuItem(value)},
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              PopupMenuItem<String>(
                textStyle: TextStyle(
                  color: ColorConstants.appColor,
                ),
                value: 'AQI Index',
                child: ListTile(
                  leading: Icon(
                    Icons.info_outline_rounded,
                    color: ColorConstants.appColor,
                  ),
                  title: Text('Guides',
                      style: TextStyle(
                        color: ColorConstants.appColor,
                      )),
                ),
              ),
              PopupMenuItem<String>(
                value: 'settings',
                child: ListTile(
                  leading: Icon(
                    Icons.settings,
                    color: ColorConstants.appColor,
                  ),
                  title: const Text(
                    'Settings',
                  ),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<String>(
                value: 'Share',
                child: ListTile(
                  leading: Icon(
                    Icons.share_outlined,
                    color: ColorConstants.appColor,
                  ),
                  title: Text('Share',
                      style: TextStyle(
                        color: ColorConstants.appColor,
                      )
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
                icon: Icon(Icons.home_outlined,
                    color: selectedPage == 0
                        ? ColorConstants.appColor
                        : ColorConstants.inactiveColor),
                splashColor: ColorConstants.appColor,
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(0);
                  });
                },
              ),
              const Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(left: 28.0),
                icon: Icon(Icons.favorite,
                    color: selectedPage == 1
                        ? ColorConstants.appColor
                        : ColorConstants.inactiveColor),
                splashColor: ColorConstants.appColor,
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(1);
                  });
                },
              ),
              const Spacer(
                flex: 3,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(right: 28.0),
                icon: Icon(Icons.bar_chart_outlined,
                    color: selectedPage == 2
                        ? ColorConstants.appColor
                        : ColorConstants.inactiveColor),
                splashColor: ColorConstants.appColor,
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(2);
                  });
                },
              ),
              const Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(right: 28.0),
                icon: Icon(Icons.library_books_outlined,
                    color: selectedPage == 3
                        ? ColorConstants.appColor
                        : ColorConstants.inactiveColor),
                splashColor: ColorConstants.appColor,
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
            MyPlacesView(),
            RankingPage(),
            BlogPage(),
            // SettingsView(),
          ],
        ),
      ),
      floatingActionButton: Container(
        // height: 60.0,
        // width: 60.0,
        child: FittedBox(
          child: FloatingActionButton(
              mini: false,
              backgroundColor: Colors.white,
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return MapPage();
                }));
              },
              child: FaIcon(
                FontAwesomeIcons.map,
                color: ColorConstants.appColor,
              )),
        ),
      ),
    );
  }

  Future<void> initialize() async {
    _getLatestMeasurements();
  }

  @override
  void initState() {
    // _displayOnBoarding();
    super.initState();
    initialize();
  }

  void navigateToMenuItem(dynamic position) {
    var menuItem = position.toString();

    if (menuItem.trim().toLowerCase() == 'share') {
      shareApp();
    } else if (menuItem.trim().toLowerCase() == 'aqi index') {
      Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (BuildContext context) => const HelpPage(
            initialIndex: 0,
          ),
          fullscreenDialog: true,
        ),
      );
    } else if (menuItem.trim().toLowerCase() == 'settings') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    }
  }

  Future<bool> onWillPop() {
    var currentPage = _pageCtrl.page ?? 0;

    if (currentPage != 0) {
      _pageCtrl.jumpToPage(0);
      return Future.value(false);
    }

    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }

  Future<void> setupInteractedMessage() async {
    // Get any messages which caused the application to open from
    // a terminated state.
    var initialMessage = await FirebaseMessaging.instance.getInitialMessage();

    // If the message also contains a data property with a "type" of "chat",
    // navigate to a chat screen
    if (initialMessage != null) {
      _handleMessage(initialMessage);
    }

    // Also handle any interaction when the app is in the background via a
    // Stream listener
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);
  }

  void switchTitle(tile) {
    switch (tile) {
      case 0:
        setState(() {
          title = '${AppConfig.name}';
          showAddPlace = true;
          selectedPage = 0;
        });
        break;
      case 1:
        setState(() {
          title = 'My Places';
          showAddPlace = false;
          selectedPage = 1;
        });
        break;
      case 2:
        setState(() {
          title = 'Air Quality Ranking';
          showAddPlace = false;
          selectedPage = 2;
        });
        break;
      case 3:
        setState(() {
          title = 'Blog';
          showAddPlace = false;
          selectedPage = 3;
        });
        break;
      default:
        setState(() {
          title = '${AppConfig.name}';
          showAddPlace = true;
          selectedPage = 0;
        });
        break;
    }
  }

  Future<void> takePhoto() async {
    // Obtain a list of the available cameras on the phone.
    final cameras = await availableCameras();

    // Get a specific camera from the list of available cameras.
    if (cameras.isEmpty) {
      await showSnackBar(context, 'Could not open AQI camera');
      return;
    }
    final firstCamera = cameras.first;

    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return TakePicture(
        camera: firstCamera,
      );
    }));
  }

  void _getLatestMeasurements() async {
    await AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
  }

  void _handleMessage(RemoteMessage message) {
    print(message.data);
  }
}
