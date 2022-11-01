import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_view.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:showcaseview/showcaseview.dart';

import '../services/hive_service.dart';
import '../services/local_storage.dart';
import '../themes/colors.dart';
import '../utils/network.dart';
import 'dashboard/dashboard_view.dart';
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
  static final GlobalKey _homeShowcaseKey = GlobalKey();
  static final GlobalKey _mapShowcaseKey = GlobalKey();
  static final GlobalKey _profileShowcaseKey = GlobalKey();
  static BuildContext? myContext;

  final List<Widget> _widgetOptions = <Widget>[
    ShowCaseWidget(
      onFinish: _startShowcase,
      builder: Builder(builder: (context) => const DashboardView()),
    ),
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
        child: ShowCaseWidget(
          onFinish: _appService.showcaseStop,
          builder: Builder(
            builder: (context) {
              myContext = context;
              
              return BottomNavigationBar(
                selectedIconTheme: Theme.of(context)
                    .iconTheme
                    .copyWith(color: CustomColors.appColorBlue, opacity: 0.3),
                unselectedIconTheme: Theme.of(context)
                    .iconTheme
                    .copyWith(color: CustomColors.appColorBlack, opacity: 0.3),
                items: <BottomNavigationBarItem>[
                  BottomNavigationBarItem(
                    icon: Showcase(
                      key: _homeShowcaseKey,
                      description: 'Home',
                      child: CustomBottomNavBarItem(
                        selectedIndex: _selectedIndex,
                        svg: 'assets/icon/home_icon.svg',
                        label: 'Home',
                        index: 0,
                      ),
                    ),
                    label: '',
                  ),
                  BottomNavigationBarItem(
                      icon: Showcase(
                        key: _mapShowcaseKey,
                        description: 'This is the AirQo map',
                        child: CustomBottomNavBarItem(
                          svg: 'assets/icon/location.svg',
                          selectedIndex: _selectedIndex,
                          label: 'AirQo Map',
                          index: 1,
                        ),
                      ),
                    label: '',
                  ),
                  BottomNavigationBarItem(
                    icon: Stack(
                      children: [
                        Showcase(
                          key: _profileShowcaseKey,
                          description: 'Access your Profile details here',
                          child: CustomBottomNavBarItem(
                            svg: 'assets/icon/profile.svg',
                            selectedIndex: _selectedIndex,
                            label: 'Profile',
                            index: 2,
                          ),
                        ),
                        ValueListenableBuilder<Box>(
                          valueListenable: Hive.box<AppNotification>(
                                  HiveBox.appNotifications)
                              .listenable(),
                          builder: (context, box, widget) {
                            final unreadNotifications = box.values
                                .toList()
                                .cast<AppNotification>()
                                .where((element) => !element.read)
                                .toList();

                            return Positioned(
                              right: 0.0,
                              child: Container(
                                height: 4,
                                width: 4,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: unreadNotifications.isEmpty
                                      ? Colors.transparent
                                      : CustomColors.aqiRed,
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    label: '',
                  ),
                ],
                currentIndex: _selectedIndex,
                selectedItemColor: CustomColors.appColorBlue,
                unselectedItemColor:
                    CustomColors.appColorBlack.withOpacity(0.3),
                elevation: 0.0,
                backgroundColor: CustomColors.appBodyColor,
                onTap: _onItemTapped,
                showSelectedLabels: true,
                showUnselectedLabels: true,
                type: BottomNavigationBarType.fixed,
                selectedFontSize: 10,
                unselectedFontSize: 10,
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
    context.read<MapBloc>().add(const ShowAllSites());

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
    if (index == 1) context.read<MapBloc>().add(const ShowAllSites());
    if (index == 0) {
      context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
    }
    setState(() => _selectedIndex = index);
  }

  static void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      ShowCaseWidget.of(myContext!).startShowCase(
          [
        _homeShowcaseKey,
        _mapShowcaseKey,
        _profileShowcaseKey,
      ]);
    });
  }
}
