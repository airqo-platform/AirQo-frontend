import 'dart:io';

import 'package:animations/animations.dart';
import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/profile/profile_view.dart';
import 'package:app/screens/settings/update_screen.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:url_launcher/url_launcher.dart';

import 'dashboard/dashboard_view.dart';
import 'for_you_page.dart';
import 'map/map_view.dart';

import 'offline_banner.dart';

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
  final AppService _appService = AppService();
  late List<Widget> _widgetOptions;

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return OfflineBanner(
      child: Scaffold(
        backgroundColor: CustomColors.appBodyColor,
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              _onWillPop();
            }
          }),
          child: PageTransitionSwitcher(
            transitionBuilder: (
              Widget child,
              Animation<double> primaryAnimation,
              Animation<double> secondaryAnimation,
            ) {
              return SlideTransition(
                position: Tween<Offset>(
                  begin: Offset.zero,
                  end: const Offset(1.5, 0.0),
                ).animate(secondaryAnimation),
                child: FadeTransition(
                  opacity: Tween<double>(
                    begin: 0.0,
                    end: 1.0,
                  ).animate(primaryAnimation),
                  child: child,
                ),
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
            onFinish: () async {
              final prefs = await SharedPreferencesHelper.instance;
              if (prefs.getBool(Config.restartTourShowcase) == true) {
                Future.delayed(
                  Duration.zero,
                  () => _appService.navigateShowcaseToScreen(
                    context,
                    const ForYouPage(),
                  ),
                );
              }
            },
            builder: (BuildContext context) {
              // Corrected here
              _showcaseContext =
                  context;

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
                      customize: ShowcaseOptions.up,
                      showcaseKey: _homeShowcaseKey,
                      description:
                          AppLocalizations.of(context)!.exploreAirQualityHere,
                      child: BottomNavIcon(
                        selectedIndex: _selectedIndex,
                        icon: Icons.home_rounded,
                        label: AppLocalizations.of(context)!.home,
                        index: 0,
                      ),
                    ),
                    label: '',
                  ),
                  BottomNavigationBarItem(
                    icon: CustomShowcaseWidget(
                      customize: ShowcaseOptions.up,
                      showcaseKey: _mapShowcaseKey,
                      descriptionWidth: screenSize.width * 0.3,
                      descriptionHeight: screenSize.height * 0.09,
                      description: AppLocalizations.of(context)!
                          .seeReadingsFromOurMonitorsHere,
                      child: BottomNavIcon(
                        icon: Icons.location_on_rounded,
                        selectedIndex: _selectedIndex,
                        label: AppLocalizations.of(context)!.airQoMap,
                        index: 1,
                      ),
                    ),
                    label: '',
                  ),
                  BottomNavigationBarItem(
                    icon: Stack(
                      children: [
                        CustomShowcaseWidget(
                          customize: ShowcaseOptions.up,
                          showcaseKey: _profileShowcaseKey,
                          descriptionHeight: screenSize.height * 0.13,
                          descriptionWidth: screenSize.width * 0.23,
                          description: AppLocalizations.of(context)!
                              .changeYourPreferencesAndSettingsHere,
                          child: BottomNavIcon(
                            icon: Icons.person_rounded,
                            selectedIndex: _selectedIndex,
                            label: AppLocalizations.of(context)!.profile,
                            index: 2,
                          ),
                        ),
                        BlocBuilder<NotificationBloc, List<AppNotification>>(
                          builder: (context, state) {
                            return Positioned(
                              right: 0.0,
                              child: Container(
                                height: 4,
                                width: 4,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: state.filterUnRead().isEmpty
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
    context.read<KyaBloc>().add(const FetchKya());
    context.read<KyaBloc>().add(const FetchQuizzes());
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
    context.read<NotificationBloc>().add(const SyncNotifications());
    await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    await _initializeDynamicLinks();
    await SharedPreferencesHelper.updateOnBoardingPage(OnBoardingPage.home);
    WidgetsBinding.instance.addPostFrameCallback(
      (_) async {
        if (context.read<DashboardBloc>().state.checkForUpdates) {
          final PackageInfo packageInfo = await PackageInfo.fromPlatform();

          await AirqoApiClient()
              .getAppVersion(
            currentVersion: packageInfo.version,
            bundleId: Platform.isIOS ? packageInfo.packageName : null,
            packageName: Platform.isAndroid ? packageInfo.packageName : null,
          )
              .then(
            (version) async {
              if (version != null && mounted && !version.isUpdated) {
                await canLaunchUrl(version.url).then(
                  (bool result) async {
                    await openUpdateScreen(context, version);
                  },
                );
              }
            },
          );
        }
      },
    );
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
        builder: (context) => const DashboardView(),
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
        AppLocalizations.of(context)!.tapAgainToExit,
      );

      return Future.value(false);
    }

    return Future.value(true);
  }

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
    switch (index) {
      case 0:
        context.read<DashboardBloc>().add(
              const RefreshDashboard(scrollToTop: true),
            );
        break;
      case 1:
        context.read<MapBloc>().add(const InitializeMapState());
        break;
      case 2:
        context.read<ProfileBloc>().add(const SyncProfile());
        break;
    }
  }

  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ShowCaseWidget.of(_showcaseContext).startShowCase(
          [
            _homeShowcaseKey,
            _mapShowcaseKey,
            _profileShowcaseKey,
          ],
        );
      },
    );
  }
}
