import 'package:app/constants/app_constants.dart';
import 'package:app/screens/profile_view.dart';
import 'package:app/screens/settings_page.dart';
import 'package:app/screens/share_picture.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/share.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'dashboard_view.dart';
import 'help_page.dart';
import 'maps_view.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String title = '${AppConfig.name}';
  bool showAddPlace = true;
  DateTime? exitTime;

  int _selectedIndex = 0;
  final List<Widget> _widgetOptions = <Widget>[
    DashboardView(),
    MapView(),
    ProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.appBodyColor,
      body: WillPopScope(
        onWillPop: onWillPop,
        child: Center(
          child: _widgetOptions.elementAt(_selectedIndex),
        ),
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
            canvasColor: ColorConstants.appBodyColor,
            primaryColor: ColorConstants.appColorBlack,
            textTheme: Theme.of(context).textTheme.copyWith(
                caption: TextStyle(color: ColorConstants.appColorBlack))),
        child: BottomNavigationBar(
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/home_icon.svg',
                semanticsLabel: 'Home',
                color: _selectedIndex == 0
                    ? ColorConstants.appColorBlue
                    : ColorConstants.appColorBlack.withOpacity(0.4),
              ),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/location.svg',
                color: _selectedIndex == 1
                    ? ColorConstants.appColorBlue
                    : ColorConstants.appColorBlack.withOpacity(0.4),
                semanticsLabel: 'AirQo Map',
              ),
              label: 'AirQo Map',
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/profile.svg',
                color: _selectedIndex == 2
                    ? ColorConstants.appColorBlue
                    : ColorConstants.appColorBlack.withOpacity(0.4),
                semanticsLabel: 'Search',
              ),
              // Icon(Icons.account_circle_sharp),
              label: 'Profile',
            ),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: ColorConstants.appColorBlue,
          unselectedItemColor: ColorConstants.inactiveColor,
          elevation: 0.0,
          backgroundColor: ColorConstants.appBodyColor,
          onTap: _onItemTapped,
          showSelectedLabels: true,
          showUnselectedLabels: true,
        ),
      ),
    );
  }

  void initialize() {
    _getLatestMeasurements();
    _getStories();
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Widget navIcon(name) {
    return SvgPicture.asset('assets/icon/home_icon.svg',
        semanticsLabel: 'Home');
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
    } else if (menuItem.trim().toLowerCase() == 'camera') {
      takePhoto();
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    }
  }

  Future<bool> onWillPop() {
    var currentPage = _selectedIndex;

    if (currentPage != 0) {
      setState(() {
        _selectedIndex = 0;
      });
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

  void switchTitle(tile) {
    switch (tile) {
      case 0:
        setState(() {
          title = '${AppConfig.name}';
          showAddPlace = true;
          _selectedIndex = 0;
        });
        break;
      case 1:
        setState(() {
          title = 'MyPlaces';
          showAddPlace = false;
          _selectedIndex = 1;
        });
        break;
      case 2:
        setState(() {
          title = 'News Feed';
          showAddPlace = false;
          _selectedIndex = 2;
        });
        break;
      case 3:
        setState(() {
          title = 'Settings';
          showAddPlace = false;
          _selectedIndex = 3;
        });
        break;
      default:
        setState(() {
          title = '${AppConfig.name}';
          showAddPlace = true;
          _selectedIndex = 0;
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

  void _getLatestMeasurements() {
    AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
  }

  void _getStories() {
    AirqoApiClient(context).fetchLatestStories().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestStories(value)}
        });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }
}
