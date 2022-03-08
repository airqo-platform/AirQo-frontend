import 'package:animations/animations.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/screens/profile_view.dart';
import 'package:app/services/app_service.dart';
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
  int _selectedIndex = 0;

  final List<Widget> _widgetOptions = <Widget>[
    const DashboardView(),
    const MapView(),
    const ProfileView(),
  ];
  late AppService _appService;

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
    await _appService.fetchData();
    await _getCloudStore();
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    initialize();
    updateOnBoardingPage();
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

  void updateOnBoardingPage() async {
    await _appService.preferencesHelper.updateOnBoardingPage('home');
  }

  Future<void> _getCloudStore() async {
    if (_appService.customAuth.isLoggedIn()) {
      await _appService.cloudStore
          .monitorNotifications(context, _appService.customAuth.getUserId());
    }
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
