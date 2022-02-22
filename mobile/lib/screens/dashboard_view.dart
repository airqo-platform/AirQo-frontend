import 'dart:math';

import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/dashboard.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/analytics_card.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'air_pollution_ways_page.dart';
import 'favourite_places.dart';
import 'for_you_page.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  String _greetings = '';
  bool _showName = true;
  List<Widget> _favLocations = [];
  List<Widget> _completeKyaWidgets = [
    SvgPicture.asset(
      'assets/icon/add_avator.svg',
    )
  ];
  List<Kya> _completeKya = [];

  late AppService _appService;
  List<Measurement> currentLocation = [];
  Kya? _kya;
  late SharedPreferences _preferences;

  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();
  final bool _isRefreshing = false;

  final LocationService _locationService = LocationService();

  final ScrollController _scrollController = ScrollController();
  List<Widget> _dashBoardPlaces = [
    analyticsCardLoading(),
    analyticsCardLoading(),
    analyticsCardLoading(),
    analyticsCardLoading(),
    analyticsCardLoading(),
    analyticsCardLoading()
  ];

  Widget appNavBar() {
    return Container(
      padding: const EdgeInsets.only(top: 24),
      child: Row(
        children: [
          SvgPicture.asset(
            'assets/icon/airqo_home.svg',
            height: 40,
            width: 58,
            semanticsLabel: 'Search',
          ),
          const Spacer(),
          Container(
            height: 40,
            width: 40,
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(10.0))),
            child: GestureDetector(
              onTap: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const SearchPage();
                }));
              },
              child: SvgPicture.asset(
                'assets/icon/search.svg',
                semanticsLabel: 'Search',
              ),
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: appNavBar(),
        elevation: 0,
        toolbarHeight: 65,
        backgroundColor: Config.appBodyColor,
      ),
      body: Container(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 24),
          color: Config.appBodyColor,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Visibility(
                visible: _showName,
                child: AutoSizeText(
                  _greetings,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),
              Visibility(
                visible: _showName,
                child: const SizedBox(
                  height: 16,
                ),
              ),
              topTabs(),
              const SizedBox(
                height: 25,
              ),
              Expanded(
                  child: RefreshIndicator(
                onRefresh: _refresh,
                color: Config.appColorBlue,
                child: _dashboardItems(),
              )),
            ],
          )),
    );
  }

  @override
  void dispose() {
    _scrollController.removeListener(() {});
    super.dispose();
  }

  Widget emptyAvatar(double rightPadding) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: Config.greyColor,
            shape: BoxShape.circle,
          ),
        ));
  }

  Widget favPlaceAvatar(double rightPadding, Measurement measurement) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: pm2_5ToColor(measurement.getPm2_5Value()),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '${measurement.getPm2_5Value()}',
              style: TextStyle(
                  fontSize: 7,
                  color: pm2_5TextColor(measurement.getPm2_5Value())),
            ),
          ),
        ));
  }

  void getFavourites(List<PlaceDetails> favouritePlaces) async {
    var widgets = <Widget>[];

    try {
      if (favouritePlaces.length == 1) {
        var measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }
      } else if (favouritePlaces.length == 2) {
        var measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }

        measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(7));
        }

        // widgets
        //   ..add(favPlaceAvatar(0, favouritePlaces[0]))
        //   ..add(favPlaceAvatar(7, favouritePlaces[1]));
      } else if (favouritePlaces.length >= 3) {
        var measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }

        measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(7));
        }

        measurement = await _appService.dbHelper
            .getMeasurement(favouritePlaces[2].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(14, measurement));
        } else {
          widgets.add(emptyAvatar(14));
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

  Future<void> handleKyaOnClick() async {
    if (_kya!.progress >= 99.0) {
      var completeKya = _kya;
      setState(() {
        _kya = null;
      });
      await _appService.cloudStore
          .updateKyaProgress(
              _appService.customAuth.getUserId(), completeKya!, 100)
          .then((value) => {
                _getCompleteKya(),
                _getIncompleteKya(),
              });
    } else {
      await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return AirPollutionWaysPage(_kya!, true);
      }));
    }
  }

  @override
  void initState() {
    super.initState();
    _initialize();
    _handleScroll();
  }

  Widget kyaAvatar(double rightPadding, Kya kya) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: Config.greyColor,
            shape: BoxShape.circle,
            image: DecorationImage(
              fit: BoxFit.cover,
              image: CachedNetworkImageProvider(
                kya.imageUrl,
              ),
            ),
          ),
        ));
  }

  Widget kyaSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 16.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              children: [
                GestureDetector(
                  onTap: () async {
                    await handleKyaOnClick();
                  },
                  child: Text(_kya!.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      )),
                ),
                const SizedBox(
                  height: 28,
                ),
                GestureDetector(
                  onTap: () async {
                    await handleKyaOnClick();
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      if (_kya!.progress == 0.0)
                        Text('Start learning',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: Config.appColorBlue,
                            )),
                      if (_kya!.progress > 0.0 && _kya!.progress < 89.0)
                        Text('Continue',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: Config.appColorBlue,
                            )),
                      if (_kya!.progress >= 89.0)
                        const Text('Complete! Move to ',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                            )),
                      if (_kya!.progress >= 89.0)
                        Text('For You',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: Config.appColorBlue,
                            )),
                      const SizedBox(
                        width: 6,
                      ),
                      Icon(
                        Icons.arrow_forward_ios_sharp,
                        size: 10,
                        color: Config.appColorBlue,
                      )
                    ],
                  ),
                ),
                const SizedBox(
                  height: 2,
                ),
                Visibility(
                  visible: _kya!.progress > 0.0 && _kya!.progress < 89.0,
                  child: Container(
                      height: 4,
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.all(Radius.circular(8.0)),
                      ),
                      child: LinearProgressIndicator(
                        color: Config.appColorBlue,
                        value: _kya!.progress / 100,
                        backgroundColor:
                            Config.appColorDisabled.withOpacity(0.2),
                      )),
                ),
              ],
            ),
          ),
          const SizedBox(
            width: 16,
          ),
          GestureDetector(
            onTap: () async {
              await handleKyaOnClick();
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8.0),
              child: CachedNetworkImage(
                fit: BoxFit.cover,
                width: 104,
                height: 104,
                placeholder: (context, url) => SizedBox(
                  width: 104,
                  height: 104,
                  child: containerLoadingAnimation(104, 104),
                ),
                imageUrl: _kya!.imageUrl,
                errorWidget: (context, url, error) => Icon(
                  Icons.error_outline,
                  color: Config.red,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget topTabs() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(
            key: _favToolTipKey,
            child: GestureDetector(
              onTap: () async {
                if (_favLocations.isEmpty) {
                  ToolTip(context, toolTipType.favouritePlaces).show(
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
                    borderRadius: BorderRadius.all(Radius.circular(8.0))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Consumer<PlaceDetailsModel>(
                      builder: (context, placeDetailsModel, child) {
                        if (placeDetailsModel.favouritePlaces.isEmpty) {
                          return SvgPicture.asset(
                            'assets/icon/add_avator.svg',
                          );
                        }
                        getFavourites(placeDetailsModel.favouritePlaces);
                        return SizedBox(
                          height: 32,
                          width: 44,
                          child: Stack(
                            children: _favLocations,
                          ),
                        );
                      },
                    ),
                    const SizedBox(
                      width: 8,
                    ),
                    Text(
                      'Favorites',
                      style: TextStyle(
                          color: Config.appColorBlue,
                          fontWeight: FontWeight.w500,
                          fontSize: 14),
                    )
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
                  ToolTip(context, toolTipType.forYou).show(
                    widgetKey: _kyaToolTipKey,
                  );
                  return;
                }
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const ForYouPage();
                }));
              },
              child: Container(
                height: 56,
                padding: const EdgeInsets.all(12.0),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(8.0))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      height: 32,
                      width: 44,
                      child: Stack(
                        children: _completeKyaWidgets,
                      ),
                    ),
                    const SizedBox(
                      width: 8,
                    ),
                    Text(
                      'For You',
                      style: TextStyle(
                          color: Config.appColorBlue,
                          fontWeight: FontWeight.w500,
                          fontSize: 14),
                    )
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Widget _dashboardItems() {
    return MediaQuery.removePadding(
        context: context,
        removeTop: true,
        child: ListView(
            controller: _scrollController,
            shrinkWrap: true,
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              Text(
                getDateTime(),
                style: TextStyle(
                  color: Colors.black.withOpacity(0.6),
                  fontSize: 12,
                ),
              ),
              const Text('Today’s air quality',
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                  )),
              const SizedBox(
                height: 12,
              ),
              if (_dashBoardPlaces.isNotEmpty) _dashBoardPlaces[0],
              if (_dashBoardPlaces.isNotEmpty)
                const SizedBox(
                  height: 16,
                ),
              // if (_kya != null && _customAuth.isLoggedIn()) kyaSection(),
              // if (_kya != null && _customAuth.isLoggedIn())
              //   const SizedBox(
              //     height: 16,
              //   ),
              if (_dashBoardPlaces.length >= 2) _dashBoardPlaces[1],
              if (_dashBoardPlaces.length >= 2)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 3) _dashBoardPlaces[2],
              if (_dashBoardPlaces.length >= 3)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 4) _dashBoardPlaces[3],
              if (_dashBoardPlaces.length >= 4)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 5) _dashBoardPlaces[4],
              if (_dashBoardPlaces.length >= 5)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 6) _dashBoardPlaces[5],
              if (_dashBoardPlaces.length >= 6)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 7) _dashBoardPlaces[6],
              if (_dashBoardPlaces.length >= 7)
                const SizedBox(
                  height: 16,
                ),
              if (_dashBoardPlaces.length >= 8) _dashBoardPlaces[7],
              if (_dashBoardPlaces.length >= 8)
                const SizedBox(
                  height: 16,
                ),
            ]));
  }

  void _getCompleteKya() async {
    var widgets = <Widget>[];

    if (_appService.isLoggedIn()) {
      widgets.add(SvgPicture.asset(
        'assets/icon/add_avator.svg',
      ));
      if (mounted) {
        setState(() {
          _completeKyaWidgets.clear();
          _completeKyaWidgets = widgets;
        });
      }
      return;
    }

    var dbKya = await _appService.dbHelper.getKyas();
    var completeKya =
        dbKya.where((element) => element.progress >= 100).toList();
    _loadCompleteKya(completeKya);

    var kyaCards =
        await _appService.cloudStore.getKya(_appService.customAuth.getUserId());
    var completeKyaCards =
        kyaCards.where((element) => element.progress >= 100.0).toList();

    if (completeKyaCards.isNotEmpty) {
      _loadCompleteKya(completeKyaCards);
      await _appService.dbHelper.insertKyas(kyaCards);
    }
  }

  void _getDashboardCards() async {
    var region = getNextDashboardRegion(_preferences);
    var measurements = await _appService.dbHelper.getRegionSites(region);
    var dashboardCards = <AnalyticsCard>[];

    if (measurements.isNotEmpty) {
      setState(() {
        _dashBoardPlaces.clear();
      });

      for (var i = 0; i <= 5; i++) {
        var random = Random().nextInt(measurements.length);

        if (mounted) {
          dashboardCards.add(AnalyticsCard(
              PlaceDetails.measurementToPLace(measurements[random]),
              measurements[random],
              _isRefreshing,
              false));
        }
        measurements.removeAt(random);
      }

      if (!mounted) {
        return;
      }

      dashboardCards.shuffle();
      setState(() {
        _dashBoardPlaces = dashboardCards;
      });
    }

    var locationMeasurements =
        await _locationService.getNearbyLocationReadings();

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

    dashboardCards.shuffle();
    setState(() {
      _dashBoardPlaces = dashboardCards;
    });
  }

  void _getIncompleteKya() async {
    if (_appService.isLoggedIn()) {
      return;
    }

    var kyas =
        await _appService.cloudStore.getKya(_appService.customAuth.getUserId());
    var inCompleteKya =
        kyas.where((element) => element.progress < 100).toList();

    if (kyas.isNotEmpty) {
      await _appService.dbHelper.insertKyas(kyas);
    }

    if (inCompleteKya.isNotEmpty) {
      if (mounted) {
        setState(() {
          _kya = inCompleteKya.first;
        });
      }
    }
  }

  void _handleScroll() async {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
              ScrollDirection.reverse &&
          mounted) {
        setState(() {
          _showName = false;
        });
      }
      if (_scrollController.position.userScrollDirection ==
              ScrollDirection.forward &&
          mounted) {
        setState(() {
          _showName = true;
        });
      }
    });
  }

  Future<void> _initialize() async {
    _appService = AppService(context);
    _preferences = await SharedPreferences.getInstance();
    _setGreetings();
    _getDashboardCards();
    if (_appService.isLoggedIn()) {
      await _loadKya();
      _getIncompleteKya();
      _getCompleteKya();
    }
    await _appService.fetchData();
  }

  void _loadCompleteKya(List<Kya> completeKya) async {
    var widgets = <Widget>[];

    if (completeKya.isEmpty) {
      widgets.add(SvgPicture.asset(
        'assets/icon/add_avator.svg',
      ));
    } else {
      setState(() {
        _completeKya = completeKya;
      });
      try {
        if (completeKya.length == 1) {
          widgets.add(kyaAvatar(7, completeKya[0]));
        } else if (completeKya.length == 2) {
          widgets
            ..add(kyaAvatar(0, completeKya[0]))
            ..add(kyaAvatar(7, completeKya[1]));
        } else if (completeKya.length >= 3) {
          widgets
            ..add(kyaAvatar(0, completeKya[0]))
            ..add(kyaAvatar(7, completeKya[1]))
            ..add(kyaAvatar(14, completeKya[2]));
        } else {}
      } on Error catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
        await Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }

    if (mounted) {
      if (widgets.isEmpty) {
        widgets.add(SvgPicture.asset(
          'assets/icon/add_avator.svg',
        ));
      }
      setState(() {
        _completeKyaWidgets.clear();
        _completeKyaWidgets = widgets;
      });
    }
  }

  Future<void> _loadKya() async {
    var kyas =
        await _appService.cloudStore.getKya(_appService.customAuth.getUserId());
    await _appService.dbHelper.insertKyas(kyas);
  }

  Future<void> _refresh() async {
    await _appService.fetchLatestMeasurements();
    _getDashboardCards();
  }

  void _setGreetings() {
    if (mounted) {
      setState(() {
        _greetings = getGreetings(_appService.customAuth.getDisplayName());
      });
    }
  }
}
