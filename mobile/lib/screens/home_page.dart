import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_view.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'dashboard/dashboard_view.dart';
import 'insights/insights_page.dart';
import 'kya/kya_title_page.dart';
import 'map/map_view.dart';

class HomePage extends StatefulWidget {
  const HomePage({
    super.key,
    this.refresh,
  });
  final bool? refresh;

  @override
  State<HomePage> createState() => _HomePageState();
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
      backgroundColor: CustomColors.appBodyColor,
      body: WillPopScope(
        onWillPop: _onWillPop,
        child: PageTransitionSwitcher(
          transitionBuilder: (
            Widget child,
            Animation<double> primaryAnimation,
            Animation<double> secondaryAnimation,
          ) {
            return FadeThroughTransition(
              animation: primaryAnimation,
              secondaryAnimation: secondaryAnimation,
              child: child,
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
          canvasColor: CustomColors.appBodyColor,
          primaryColor: CustomColors.appColorBlack,
          textTheme: Theme.of(context).textTheme.copyWith(
                caption: TextStyle(
                  color: CustomColors.appColorBlack,
                ),
              ),
        ),
        child: BottomNavigationBar(
          selectedIconTheme: Theme.of(context)
              .iconTheme
              .copyWith(color: CustomColors.appColorBlue, opacity: 0.3),
          unselectedIconTheme: Theme.of(context)
              .iconTheme
              .copyWith(color: CustomColors.appColorBlack, opacity: 0.3),
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/home_icon.svg',
                semanticsLabel: 'Home',
                color: _selectedIndex == 0
                    ? CustomColors.appColorBlue
                    : CustomColors.appColorBlack.withOpacity(0.3),
              ),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icon/location.svg',
                color: _selectedIndex == 1
                    ? CustomColors.appColorBlue
                    : CustomColors.appColorBlack.withOpacity(0.3),
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
                        ? CustomColors.appColorBlue
                        : CustomColors.appColorBlack.withOpacity(0.3),
                    semanticsLabel: 'Profile',
                  ),
                  BlocBuilder<AccountBloc, AccountState>(
                    buildWhen: (previous, current) {
                      final previousNotifications = previous.notifications
                          .where((element) => !element.read)
                          .toList()
                          .length;

                      final currentNotifications = previous.notifications
                          .where((element) => !element.read)
                          .toList()
                          .length;

                      return previousNotifications != currentNotifications;
                    },
                    builder: (context, state) {
                      final Color color = state.notifications
                              .where((element) => !element.read)
                              .toList()
                              .isEmpty
                          ? Colors.transparent
                          : CustomColors.aqiRed;

                      return Positioned(
                        right: 0.0,
                        child: Container(
                          height: 4,
                          width: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: color,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              label: 'Profile',
            ),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: CustomColors.appColorBlue,
          unselectedItemColor: CustomColors.appColorBlack.withOpacity(0.3),
          elevation: 0.0,
          backgroundColor: CustomColors.appBodyColor,
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

  Future<void> _initialize() async {
    context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
    context.read<MapBloc>().add(const InitializeMapState());
    FirebaseDynamicLinks.instance.onLink.listen((linkData) {
      // TODO Add error handling

      final destination = linkData.link.queryParameters['destination'] ?? '';

      if (destination.equalsIgnoreCase('insights')) {
        AirQualityReading airQualityReading =
            AirQualityReading.fromDynamicLink(linkData);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) {
            return InsightsPage(airQualityReading);
          }),
        );
        return;
      }

      if (destination.equalsIgnoreCase('kya')) {
        Kya kya = Kya.fromDynamicLink(linkData);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) {
            return KyaTitlePage(kya);
          }),
        );
        return;
      }
    }).onError((error) {
      debugPrint('Error: \n\n\n\n$error\n\n\n\n');
    });
    if (refresh) {
      await _appService.fetchData(context);
    } else {
      await checkNetworkConnection(
        context,
        notifyUser: true,
      );
    }
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.home);
  }

  @override
  void initState() {
    super.initState();
    refresh = widget.refresh ?? true;
    _initialize();
  }

  Future<bool> _onWillPop() {
    final currentPage = _selectedIndex;

    if (currentPage != 0) {
      setState(() => _selectedIndex = 0);

      return Future.value(false);
    }

    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to exit !',
      );

      return Future.value(false);
    }

    return Future.value(true);
  }

  void _onItemTapped(int index) {
    switch (index) {
      case 0:
        context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
        break;
      case 1:
        switch (context.read<MapBloc>().state.mapStatus) {
          case MapStatus.initial:
          case MapStatus.error:
          case MapStatus.noAirQuality:
            context.read<MapBloc>().add(const InitializeMapState());
            break;
          case MapStatus.showingCountries:
          case MapStatus.showingRegions:
          case MapStatus.showingFeaturedSite:
          case MapStatus.showingRegionSites:
            break;
        }
        break;
    }

    setState(() => _selectedIndex = index);
  }
}
