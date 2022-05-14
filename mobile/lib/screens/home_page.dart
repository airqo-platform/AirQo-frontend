import 'package:animations/animations.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/screens/profile_view.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../services/local_storage.dart';
import 'dashboard_view.dart';
import 'map_view.dart';

class HomePage extends StatefulWidget {
  final bool? refresh;

  const HomePage({Key? key, this.refresh}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  DateTime? _exitTime;
  int _selectedIndex = 0;
  late bool refresh;

  final List<Widget> _widgetOptions = <Widget>[
    const DashboardView(),
    const MapView(),
    const ProfileView(),
  ];
  final AppService _appService = AppService();

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
          selectedIconTheme: Theme.of(context)
              .iconTheme
              .copyWith(color: Config.appColorBlue, opacity: 0.3),
          unselectedIconTheme: Theme.of(context)
              .iconTheme
              .copyWith(color: Config.appColorBlack, opacity: 0.3),
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/home_icon.svg',
                semanticsLabel: 'Home',
                color: _selectedIndex == 0
                    ? Config.appColorBlue
                    : Config.appColorBlack.withOpacity(0.3),
              ),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/location.svg',
                color: _selectedIndex == 1
                    ? Config.appColorBlue
                    : Config.appColorBlack.withOpacity(0.3),
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
                        : Config.appColorBlack.withOpacity(0.3),
                    semanticsLabel: 'Search',
                  ),
                  // TODO - fix functionality
                  // Positioned(
                  //   right: 0.0,
                  //   child: Consumer<NotificationModel>(
                  //     builder: (context, notificationModel, child) {
                  //       if (notificationModel.navBarNotification) {
                  //         return Container(
                  //           height: 4,
                  //           width: 4,
                  //           decoration: BoxDecoration(
                  //               shape: BoxShape.circle, color: Config.red),
                  //         );
                  //       }
                  //       return Container(
                  //         height: 0.1,
                  //         width: 0.1,
                  //         decoration: const BoxDecoration(
                  //             shape: BoxShape.circle,
                  //             color: Colors.transparent),
                  //       );
                  //     },
                  //   ),
                  // ),
                ],
              ),
              label: 'Profile',
            ),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: Config.appColorBlue,
          unselectedItemColor: Config.appColorBlack.withOpacity(0.3),
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
    if (refresh) {
      await _appService.fetchData(context);
    }
    await _getCloudStore();
  }

  @override
  void initState() {
    super.initState();
    refresh = widget.refresh ?? true;
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
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.home);
  }

  Future<void> _getCloudStore() async {
    // TODO - fix functionality
    // if (_appService.customAuth.isLoggedIn()) {
    //   await _appService.cloudStore
    //       .monitorNotifications(context, _appService.customAuth.getUserId());
    // }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    // TODO - fix functionality
    // if (index == 2) {
    //   Provider.of<NotificationModel>(context, listen: false)
    //       .removeNavBarNotification();
    // }
  }
}
