import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/analytics/analytics_card.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dashboard.dart';
import 'package:app/utils/date.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../models/enum_constants.dart';
import '../../services/firebase_service.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../utils/exception.dart';
import '../../widgets/custom_widgets.dart';
import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../kya/kya_title_page.dart';
import 'dashboard_widgets.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  String _greetings = '';

  List<Widget> _favLocations = [];
  List<Widget> _completeKyaWidgets = [];
  List<Kya> _completeKya = [];
  List<Kya> _incompleteKya = [];

  final AppService _appService = AppService();
  late SharedPreferences _preferences;

  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();
  bool _isRefreshing = false;

  final ScrollController _scrollController = ScrollController();
  List<Widget> _analyticsCards = [
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading()
  ];

  List<Widget> _dashBoardItems = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DashboardTopBar(),
      body: Container(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 24),
          color: Config.appBodyColor,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Visibility(
                visible: true,
                child: AutoSizeText(
                  _greetings,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.headline7(context),
                ),
              ),
              const Visibility(
                visible: true,
                // visible: _showName,
                child: SizedBox(
                  height: 16,
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(
                      key: _favToolTipKey,
                      child: GestureDetector(
                        onTap: () async {
                          if (_favLocations.isEmpty) {
                            ToolTip(context, ToolTipType.favouritePlaces).show(
                              widgetKey: _favToolTipKey,
                            );
                            return;
                          }
                          await Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return const FavouritePlaces();
                          }));
                        },
                        child: Container(
                          height: 56,
                          padding: const EdgeInsets.all(12.0),
                          decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Consumer<PlaceDetailsModel>(
                                builder: (context, placeDetailsModel, child) {
                                  if (placeDetailsModel
                                      .favouritePlaces.isEmpty) {
                                    return SvgPicture.asset(
                                      'assets/icon/add_avator.svg',
                                    );
                                  }
                                  _loadFavourites(reload: false);
                                  return SizedBox(
                                    height: 32,
                                    width: 47,
                                    child: Stack(
                                      children: _favLocations,
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(
                                width: 8,
                              ),
                              Text('Favorites',
                                  style: CustomTextStyle.bodyText4(context)
                                      ?.copyWith(
                                    color: Config.appColorBlue,
                                  ))
                            ],
                          ),
                        ),
                      )),
                  const SizedBox(
                    width: 16,
                  ),
                  Expanded(
                      key: _kyaToolTipKey,
                      child: GestureDetector(
                        onTap: () async {
                          if (_completeKya.isEmpty) {
                            ToolTip(context, ToolTipType.forYou).show(
                              widgetKey: _kyaToolTipKey,
                            );
                            return;
                          }
                          await Navigator.push(context,
                              MaterialPageRoute(builder: (context) {
                            return const ForYouPage(analytics: false);
                          }));
                        },
                        child: Container(
                          height: 56,
                          padding: const EdgeInsets.all(12.0),
                          decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0))),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                height: 32,
                                width: 47,
                                child: Stack(
                                  children: _completeKyaWidgets,
                                ),
                              ),
                              const SizedBox(
                                width: 8,
                              ),
                              Text('For You',
                                  style: CustomTextStyle.bodyText4(context)
                                      ?.copyWith(
                                    color: Config.appColorBlue,
                                  ))
                            ],
                          ),
                        ),
                      )),
                ],
              ),
              const SizedBox(
                height: 8,
              ),
              Expanded(
                child: AppRefreshIndicator(
                    sliverChildDelegate:
                        SliverChildBuilderDelegate((context, index) {
                      return _dashBoardItems[index];
                    }, childCount: _dashBoardItems.length),
                    onRefresh: _refresh),
              ),
            ],
          )),
    );
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _initialize();
    _handleScroll();
  }

  void _buildAnalyticsCards(List<Widget> cards) {
    cards.shuffle();

    setState(() {
      _analyticsCards = [
        if (cards.isNotEmpty) cards[0],
        if (cards.isNotEmpty)
          const SizedBox(
            height: 16,
          ),
        if (_incompleteKya.isNotEmpty)
          DashboardKyaCard(
            kyaClickCallBack: _handleKyaOnClick,
            kya: _incompleteKya[0],
          ),
        Visibility(
          visible: _incompleteKya.isNotEmpty,
          child: const SizedBox(
            height: 16,
          ),
        ),
        if (cards.length >= 2) cards[1],
        Visibility(
            visible: cards.length >= 2,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 3) cards[2],
        Visibility(
            visible: cards.length >= 3,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 4) cards[3],
        Visibility(
            visible: cards.length >= 4,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 5) cards[4],
        Visibility(
            visible: cards.length >= 5,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 6) cards[5],
        Visibility(
            visible: cards.length >= 6,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 7) cards[6],
        Visibility(
            visible: cards.length >= 7,
            child: const SizedBox(
              height: 16,
            )),
        if (cards.length >= 8) cards[7],
        Visibility(
            visible: cards.length >= 8,
            child: const SizedBox(
              height: 16,
            )),
      ];
      _dashBoardItems = _initializeDashBoardItems();
    });
  }

  void _getAnalyticsCards() async {
    var region = getNextDashboardRegion(_preferences);
    var measurements = await _appService.dbHelper.getRegionSites(region);
    var dashboardCards = <AnalyticsCard>[];

    if (measurements.isNotEmpty) {
      for (var i = 0; i <= 5; i++) {
        if (measurements.isEmpty) {
          break;
        }

        var randomMeasurement = (measurements..shuffle()).first;

        if (mounted) {
          dashboardCards.add(AnalyticsCard(
              PlaceDetails.measurementToPLace(randomMeasurement),
              randomMeasurement,
              _isRefreshing,
              false));
        }

        measurements.remove(randomMeasurement);
      }

      if (!mounted) {
        return;
      }
      _buildAnalyticsCards(dashboardCards);
    }

    var locationMeasurements =
        await LocationService.getNearbyLocationReadings();

    for (var location in locationMeasurements) {
      dashboardCards.add(AnalyticsCard(
          PlaceDetails.measurementToPLace(location),
          location,
          _isRefreshing,
          false));
    }
    if (!mounted) {
      return;
    }
    if (dashboardCards.isNotEmpty) {
      _buildAnalyticsCards(dashboardCards);
    }
  }

  Future<void> _handleKyaOnClick(Kya kya) async {
    if (kya.progress >= kya.lessons.length) {
      kya.progress = -1;
      await kya.saveKya();
    } else {
      await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return KyaTitlePage(kya);
      }));
    }
    await _refresh();
  }

  void _scrollListener() {
    if (mounted) {
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
      } else if (_scrollController.position.userScrollDirection ==
          ScrollDirection.forward) {
      } else {
        return;
      }
    }
  }

  void _handleScroll() async {
    _scrollController.addListener(_scrollListener);
  }

  Future<void> _initialize() async {
    _preferences = await SharedPreferences.getInstance();
    _completeKyaWidgets.add(const CircularLoadingAnimation(size: 30));
    _buildAnalyticsCards(_analyticsCards);
    _setGreetings();
    _getAnalyticsCards();
    _loadKya();
    await _initListeners();
    // Future.delayed(const Duration(seconds: 2), _loadKya);
  }

  List<Widget> _initializeDashBoardItems() {
    return [
      const SizedBox(
        height: 24,
      ),
      Text(getDateTime(),
          style: Theme.of(context).textTheme.caption?.copyWith(
                color: Colors.black.withOpacity(0.5),
              )),
      const SizedBox(
        height: 4,
      ),
      Text('Today’s air quality', style: CustomTextStyle.headline11(context)),
      const SizedBox(
        height: 24,
      ),
      ..._analyticsCards,
      Visibility(
          visible: _analyticsCards.isEmpty,
          child: const CircularProgressIndicator()),
    ];
  }

  void _loadCompleteKya(List<Kya> completeKya) async {
    var widgets = <Widget>[];

    if (completeKya.isEmpty) {
      widgets.add(SvgPicture.asset(
        'assets/icon/add_avator.svg',
      ));
    } else {
      setState(() => _completeKya = completeKya);
      try {
        if (completeKya.length == 1) {
          widgets.add(KyaDashboardAvatar(rightPadding: 7, kya: completeKya[0]));
        } else if (completeKya.length == 2) {
          widgets
            ..add(KyaDashboardAvatar(rightPadding: 0, kya: completeKya[0]))
            ..add(KyaDashboardAvatar(rightPadding: 7, kya: completeKya[1]));
        } else if (completeKya.length >= 3) {
          widgets
            ..add(KyaDashboardAvatar(rightPadding: 0, kya: completeKya[0]))
            ..add(KyaDashboardAvatar(rightPadding: 7, kya: completeKya[1]))
            ..add(KyaDashboardAvatar(rightPadding: 14, kya: completeKya[2]));
        } else {}
      } catch (exception, stackTrace) {
        await logException(exception, stackTrace);
      }
    }

    if (mounted) {
      if (widgets.isEmpty) {
        widgets.add(SvgPicture.asset(
          'assets/icon/add_avator.svg',
        ));
      }
      setState(() => _completeKyaWidgets = widgets);
    }
  }

  void _loadFavourites({required bool reload}) async {
    var widgets = <Widget>[];

    if (_favLocations.length != 3 || reload) {
      try {
        var favouritePlaces = await _appService.dbHelper.getFavouritePlaces();

        if (!reload) {
          if (_favLocations.length >= favouritePlaces.length) {
            return;
          }
        }

        var siteIds = <String>[];
        for (var place in favouritePlaces) {
          siteIds.add(place.siteId);
        }
        var measurements = await _appService.dbHelper.getMeasurements(siteIds);

        if (favouritePlaces.length == 1) {
          if (measurements.isNotEmpty) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 7, measurement: measurements[0]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 0));
          }
        } else if (favouritePlaces.length == 2) {
          if (measurements.isNotEmpty) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 0, measurement: measurements[0]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 0));
          }

          if (measurements.length >= 2) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 7, measurement: measurements[1]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 7));
          }
        } else if (favouritePlaces.length >= 3) {
          if (measurements.isNotEmpty) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 0, measurement: measurements[0]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 0));
          }

          if (measurements.length >= 2) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 7, measurement: measurements[1]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 7));
          }

          if (measurements.length >= 3) {
            widgets.add(DashboardFavPlaceAvatar(
                rightPadding: 14, measurement: measurements[2]));
          } else {
            widgets.add(const DashboardEmptyAvatar(rightPadding: 14));
          }
        } else {}
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }

      if (mounted) {
        setState(() {
          _favLocations.clear();
          _favLocations = widgets;
        });
      }
    }
  }

  Future<void> _refresh() async {
    setState(() => _isRefreshing = true);

    _setGreetings();
    await _appService.refreshDashboard(context);
    _getAnalyticsCards();
    _loadKya();
    _loadFavourites(reload: true);

    setState(() => _isRefreshing = false);
  }

  void _setGreetings() {
    if (mounted) {
      setState(() => _greetings = getGreetings(CustomAuth.getDisplayName()));
    }
  }

  void _loadKya() {
    final kya = Hive.box<Kya>(HiveBox.kya).values.toList().cast<Kya>();
    setState(() => _incompleteKya =
        kya.where((element) => element.progress != -1).toList());

    _completeKya = kya.where((element) => element.progress == -1).toList();
    _loadCompleteKya(_completeKya);
  }

  Future<void> _initListeners() async {
    Hive.box<Kya>(HiveBox.kya)
        .watch()
        .listen((_) => _loadKya())
        .onDone(_loadKya);
  }
}
