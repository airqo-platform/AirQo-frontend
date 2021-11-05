import 'package:app/constants/app_constants.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/profile_view.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import 'dashboard_view.dart';
import 'maps_view.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String title = AppConfig.name;
  bool showAddPlace = true;
  DateTime? exitTime;

  final CustomAuth _customAuth = CustomAuth();

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
              icon: Stack(
                children: [
                  SvgPicture.asset(
                    'assets/icon/profile.svg',
                    color: _selectedIndex == 2
                        ? ColorConstants.appColorBlue
                        : ColorConstants.appColorBlack.withOpacity(0.4),
                    semanticsLabel: 'Search',
                  ),
                  Positioned(
                    right: 0.0,
                    child: Consumer<NotificationModel>(
                      builder: (context, notificationModel, child) {
                        if (notificationModel.navBarNotification) {
                          return Container(
                            height: 4,
                            width: 4,
                            decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: ColorConstants.red),
                          );
                        }
                        return Container(
                          height: 0.1,
                          width: 0.1,
                          decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.transparent),
                        );
                      },
                    ),
                  ),
                ],
              ),
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

  Future<void> initialize() async {
    _getLatestMeasurements();
    _getFavPlaces();
    if (_customAuth.isLoggedIn()) {
      CloudStore().monitorNotifications(context, _customAuth.getId());
    }
  }

  @override
  void initState() {
    super.initState();
    initialize();
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

  void _getFavPlaces() {
    Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
  }

  void _getLatestMeasurements() {
    AirqoApiClient(context).fetchLatestMeasurements().then((value) => {
          if (value.isNotEmpty) {DBHelper().insertLatestMeasurements(value)}
        });
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    if (index == 2) {
      Provider.of<NotificationModel>(context, listen: false)
          .removeNavBarNotification();
    }
  }
}
