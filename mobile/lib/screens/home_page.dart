import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_view.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:showcaseview/showcaseview.dart';
import 'for_you_page.dart';

import 'dashboard/dashboard_view.dart';
import 'map/map_view.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  DateTime? _exitTime;
  int _selectedIndex = 0;
  late bool refresh;
  late GlobalKey _homeShowcaseKey;
  late GlobalKey _mapShowcaseKey;
  late GlobalKey _profileShowcaseKey;
  late BuildContext _showcaseContext;

  late List<Widget> _widgetOptions;

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
                bodySmall: TextStyle(
                  color: CustomColors.appColorBlack,
                ),
              ),
        ),
        child: ShowCaseWidget(
          onFinish: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ForYouPage(),
              ),
            );
          },
          builder: Builder(
            builder: (context) {
              _showcaseContext = context;

              return BottomNavigationBar(
                selectedIconTheme: Theme.of(context)
                    .iconTheme
                    .copyWith(color: CustomColors.appColorBlue, opacity: 0.3),
                unselectedIconTheme: Theme.of(context)
                    .iconTheme
                    .copyWith(color: CustomColors.appColorBlack, opacity: 0.3),
                items: <BottomNavigationBarItem>[
                  BottomNavigationBarItem(
                    icon: CustomShowcaseWidget(
                      customize: "up",
                      showcaseKey: _homeShowcaseKey,
                      description: 'Explore air quality here',
                      childWidget: BottomNavIcon(
                        selectedIndex: _selectedIndex,
                        svg: 'assets/icon/home_icon.svg',
                        label: 'Home',
                        index: 0,
                      ),
                    ),
                    label: '',
                  ),
                  BottomNavigationBarItem(
                    icon: CustomShowcaseWidget(
                      customize: "up",
                      showcaseKey: _mapShowcaseKey,
                      descriptionWidth: 90,
                      descriptionHeight: 110,
                      description: 'See readings from our monitors here',
                      childWidget: BottomNavIcon(
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
                        CustomShowcaseWidget(
                          customize: "up",
                          showcaseKey: _profileShowcaseKey,
                          descriptionHeight: 110,
                          descriptionWidth: 80,
                          description:
                              'Change your preferences and settings here',
                          childWidget: BottomNavIcon(
                            svg: 'assets/icon/profile.svg',
                            selectedIndex: _selectedIndex,
                            label: 'Profile',
                            index: 2,
                          ),
                        ),
                        ValueListenableBuilder<Box>(
                          valueListenable: Hive.box<AppNotification>(
                            HiveBox.appNotifications,
                          ).listenable(),
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
    context.read<DashboardBloc>().add(const RefreshDashboard());
    context.read<MapBloc>().add(const InitializeMapState());
    await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    await _initializeDynamicLinks();
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.home);
  }

  Future<void> _initializeDynamicLinks() async {
    FirebaseDynamicLinks.instance.onLink.listen((linkData) async {
      BuildContext? navigatorBuildContext = navigatorKey.currentContext;
      if (navigatorBuildContext != null) {
        await ShareService.navigateToSharedFeature(
          linkData: linkData,
          context: navigatorBuildContext,
        );
      }
    }).onError((error) async {
      await logException(error, null);
    });
  }

  @override
  void initState() {
    super.initState();
    _initialize();
    _homeShowcaseKey = GlobalKey();
    _mapShowcaseKey = GlobalKey();
    _profileShowcaseKey = GlobalKey();
    _widgetOptions = <Widget>[
      ShowCaseWidget(
        onFinish: _startShowcase,
        enableAutoScroll: true,
        builder: Builder(builder: (context) => const DashboardView()),
      ),
      const MapView(),
      const ProfileView(),
    ];
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
        context.read<DashboardBloc>().add(const RefreshDashboard());
        break;
      case 1:
        context.read<MapBloc>().add(const InitializeMapState());
        break;
    }

    setState(() => _selectedIndex = index);
  }

  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ShowCaseWidget.of(_showcaseContext).startShowCase(
        [
          _homeShowcaseKey,
          _mapShowcaseKey,
          _profileShowcaseKey,
        ],
      );
    });
  }
}
