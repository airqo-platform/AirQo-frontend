import 'package:app/config/languages/CustomLocalizations.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/screens/feedback_page.dart';
import 'package:app/screens/map_page_nav.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:flutter/material.dart';
import 'package:share/share.dart';

import 'add_place.dart';
import 'compare_page.dart';
import 'dashboard_page.dart';

class HomePage extends StatefulWidget {
  final String title = 'AirQo';

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final PageController _pageCtrl = PageController(initialPage: 0);
  String title = appName;
  bool showAddPlace = true;
  DateTime? exitTime;

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(appName),
        actions: [
          showAddPlace
              ? IconButton(
                  icon: const Icon(
                    Icons.addchart_outlined,
                  ),
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return AddPlacePage();
                    }));
                  },
                )
              : Text(''),
          IconButton(
            icon: const Icon(
              Icons.search,
            ),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return SearchPage();
              }));
            },
          ),
          PopupMenuButton<dynamic>(
            onSelected: (value) => {navigateToMenuItem(value)},
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'Settings',
                child: ListTile(
                  leading: Icon(Icons.settings),
                  title: Text(
                    'Settings',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Help',
                child: ListTile(
                  leading: const Icon(Icons.help_outline_outlined),
                  title: Text(
                    'Help',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Feedback',
                child: ListTile(
                  leading: const Icon(Icons.feedback_outlined),
                  title: Text(
                    'Feedback',
                  ),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<String>(
                value: 'Invite Friends',
                child: ListTile(
                  leading: const Icon(Icons.person_add_alt),
                  title: Text(
                    'Invite Friends',
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
              Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(left: 28.0),
                icon: const Icon(
                    Icons.home_outlined,
                    color: Color(0xff5f1ee8)),
                splashColor: Color(0xff5f1ee8),
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(0);
                  });
                },
              ),
              Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // autofocus: true,
                // padding: const EdgeInsets.only(right: 28.0),
                icon: const Icon(
                    Icons.stacked_bar_chart,
                    color: Color(0xff5f1ee8)),
                splashColor: Color(0xff5f1ee8),
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(1);
                  });
                },
              ),
              Spacer(
                flex: 3,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(left: 28.0),
                icon: const Icon(
                    Icons.notifications_none_outlined,
                    color: Color(0xff5f1ee8)),
                splashColor: Color(0xff5f1ee8),
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(2);
                  });
                },
              ),
              Spacer(
                flex: 1,
              ),
              IconButton(
                // iconSize: 30.0,
                // padding: const EdgeInsets.only(right: 28.0),
                icon: const Icon(
                    Icons.library_books_outlined,
                    color: Color(0xff5f1ee8)),
                splashColor: Color(0xff5f1ee8),
                onPressed: () {
                  setState(() {
                    _pageCtrl.jumpToPage(3);
                  });
                },
              ),
              Spacer(
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
          children: <Widget>[
            DashboardPage(),
            ComparePage(),
            Center(
              child: Container(
                child: Text('Page 2'),
              ),
            ),
            Center(
              child: Container(
                child: Text('Page 3'),
              ),
            )
          ],
          // physics: NeverScrollableScrollPhysics(),
        ),
      ),
      floatingActionButton: Container(
        // height: 60.0,
        // width: 60.0,
        child: FittedBox(
          child: FloatingActionButton(
            backgroundColor: Color(0xff5f1ee8),
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

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;
      final snackBar = const SnackBar(
        content: Text('Tap again to exit !'),
        backgroundColor: Color(0xff5f1ee8),
      );
      ScaffoldMessenger.of(context).showSnackBar(snackBar);

      return Future.value(false);
    }
    return Future.value(true);
  }

  void switchTitle(int) {
    switch (int) {
      case 0:
        setState(() {
          title = 'AirQo';
          showAddPlace = true;
        });
        break;
      case 1:
        setState(() {
          title = 'Compare Places';
          showAddPlace = false;
        });
        break;
      case 2:
        setState(() {
          title = 'Notifications';
          showAddPlace = false;
        });
        break;
      case 3:
        setState(() {
          title = 'Resources';
          showAddPlace = false;
        });
        break;
      default:
        setState(() {
          title = 'AirQo';
          showAddPlace = true;
        });
        break;
    }
  }

  void navigateToMenuItem(dynamic position) {
    var menuItem = position.toString();

    if (menuItem.trim().toLowerCase() == 'feedback') {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return FeedbackPage();
      }));
    } else if (menuItem.trim().toLowerCase() == 'invite friends') {
      Share.share(
          'https://play.google.com/store/apps/details?id=com.airqo.app ',
          subject: 'Airqo!');
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    }
  }
}
