import 'package:animations/animations.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/profile_view.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import 'dashboard_view.dart';
import 'map_view.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  DateTime? _exitTime;
  AirqoApiClient? _airqoApiClient;
  int _selectedIndex = 0;

  final CustomAuth _customAuth = CustomAuth();
  final DBHelper _dbHelper = DBHelper();
  final CloudStore _cloudStore = CloudStore();
  final List<Widget> _widgetOptions = <Widget>[
    const DashboardView(),
    const MapView(),
    const ProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Config.appBodyColor,
      body: WillPopScope(
        onWillPop: onWillPop,
        child: PageTransitionSwitcher(
          transitionBuilder: (
            Widget child,
            Animation<double> primaryAnimation,
            Animation<double> secondaryAnimation,
          ) {
            return FadeThroughTransition(
              child: child,
              animation: primaryAnimation,
              secondaryAnimation: secondaryAnimation,
            );
          },
          // child: Center(
          //   child: _widgetOptions.elementAt(_selectedIndex),
          // ),
          child: IndexedStack(
            index: _selectedIndex,
            children: _widgetOptions,
          ),
        ),
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
            canvasColor: Config.appBodyColor,
            primaryColor: Config.appColorBlack,
            textTheme: Theme.of(context)
                .textTheme
                .copyWith(caption: TextStyle(color: Config.appColorBlack))),
        child: BottomNavigationBar(
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/home_icon.svg',
                semanticsLabel: 'Home',
                color: _selectedIndex == 0
                    ? Config.appColorBlue
                    : Config.appColorBlack.withOpacity(0.4),
              ),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/location.svg',
                color: _selectedIndex == 1
                    ? Config.appColorBlue
                    : Config.appColorBlack.withOpacity(0.4),
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
                        ? Config.appColorBlue
                        : Config.appColorBlack.withOpacity(0.4),
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
                                shape: BoxShape.circle, color: Config.red),
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
          selectedItemColor: Config.appColorBlue,
          unselectedItemColor: Config.inactiveColor,
          elevation: 0.0,
          backgroundColor: Config.appBodyColor,
          onTap: _onItemTapped,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 10,
          unselectedFontSize: 10,
        ),
      ),
    );
  }

  Future<void> initialize() async {
    _airqoApiClient = AirqoApiClient(context);
    _getLatestMeasurements();
    _getFavPlaces();
    await _getCloudStore();
  }

  @override
  void initState() {
    initialize();
    super.initState();
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

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }

  Future<void> _getCloudStore() async {
    if (_customAuth.isLoggedIn()) {
      await _cloudStore.monitorNotifications(context, _customAuth.getId());
    }
  }

  void _getFavPlaces() {
    Provider.of<PlaceDetailsModel>(context, listen: false)
        .reloadFavouritePlaces();
  }

  void _getLatestMeasurements() {
    _airqoApiClient!.fetchLatestMeasurements().then((value) =>
        {if (value.isNotEmpty) _dbHelper.insertLatestMeasurements(value)});
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
