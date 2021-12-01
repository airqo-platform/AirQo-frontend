import 'dart:math';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/kya.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/analytics_card.dart';
import 'package:app/widgets/custom_widgets.dart';
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
  AirqoApiClient? _airqoApiClient;
  Measurement? currentLocation;
  Kya? _kya;
  bool _showAnalyticsCardTips = false;
  SharedPreferences? _preferences;

  final String _kyaToolTipText = 'All your complete tasks will show up here';
  final String _favToolTipText = 'Tap the ❤️ Favorite on any '
      'location air quality to save them here for later';
  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();
  final bool _isRefreshing = false;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final LocationService _locationService = LocationService();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final DBHelper _dbHelper = DBHelper();
  final ScrollController _scrollController = ScrollController();
  final List<Widget> _dashBoardPlaces = [
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
        backgroundColor: ColorConstants.appBodyColor,
      ),
      body: Container(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 24),
          color: ColorConstants.appBodyColor,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Visibility(
                visible: _showName,
                child: Text(
                  _greetings,
                  maxLines: 1,
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
                onRefresh: _getLatestMeasurements,
                color: ColorConstants.appColorBlue,
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
            border: Border.all(color: ColorConstants.appBodyColor, width: 2),
            color: ColorConstants.greyColor,
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
            border: Border.all(color: ColorConstants.appBodyColor, width: 2),
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
        var measurement =
            await _dbHelper.getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }
      } else if (favouritePlaces.length == 2) {
        var measurement =
            await _dbHelper.getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(7));
        }

        // widgets
        //   ..add(favPlaceAvatar(0, favouritePlaces[0]))
        //   ..add(favPlaceAvatar(7, favouritePlaces[1]));
      } else if (favouritePlaces.length >= 3) {
        var measurement =
            await _dbHelper.getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(emptyAvatar(0));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(emptyAvatar(7));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[2].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(14, measurement));
        } else {
          widgets.add(emptyAvatar(14));
        }
      } else {}
    } catch (e) {
      debugPrint(e.toString());
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
      await _cloudStore
          .updateKyaProgress(_customAuth.getId(), completeKya!, 100)
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
    _initialize();
    _handleScroll();
    super.initState();
  }

  Widget kyaAvatar(double rightPadding, Kya kya) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: ColorConstants.appBodyColor, width: 2),
            color: ColorConstants.greyColor,
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
                              color: ColorConstants.appColorBlue,
                            )),
                      if (_kya!.progress > 0.0 && _kya!.progress < 89.0)
                        Text('Continue',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColorBlue,
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
                              color: ColorConstants.appColorBlue,
                            )),
                      const SizedBox(
                        width: 6,
                      ),
                      Icon(
                        Icons.arrow_forward_ios_sharp,
                        size: 10,
                        color: ColorConstants.appColorBlue,
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
                        color: ColorConstants.appColorBlue,
                        value: _kya!.progress / 100,
                        backgroundColor:
                            ColorConstants.appColorDisabled.withOpacity(0.2),
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
                  child: analyticsCardLoading(),
                ),
                imageUrl: _kya!.imageUrl,
                errorWidget: (context, url, error) => Icon(
                  Icons.error_outline,
                  color: ColorConstants.red,
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
                  showTipText(
                      _favToolTipText, _favToolTipKey, context, () {}, false);
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
                          color: ColorConstants.appColorBlue,
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
                  showTipText(
                      _kyaToolTipText, _kyaToolTipKey, context, () {}, true);
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
                          color: ColorConstants.appColorBlue,
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
              if (currentLocation != null)
                AnalyticsCard(PlaceDetails.measurementToPLace(currentLocation!),
                    currentLocation!, _isRefreshing, _showAnalyticsCardTips),
              if (currentLocation == null) analyticsCardLoading(),
              const SizedBox(
                height: 16,
              ),
              if (_kya != null && _customAuth.isLoggedIn()) kyaSection(),
              if (_dashBoardPlaces.isNotEmpty) _dashBoardPlaces[0],
              const SizedBox(
                height: 16,
              ),
              if (_dashBoardPlaces.length >= 2) _dashBoardPlaces[1],
              const SizedBox(
                height: 16,
              ),
              if (_dashBoardPlaces.length >= 3) _dashBoardPlaces[2],
              const SizedBox(
                height: 16,
              ),
            ]));
  }

  void _getCompleteKya() async {
    var widgets = <Widget>[];

    if (!_customAuth.isLoggedIn()) {
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

    var dbKya = await _dbHelper.getKyas();
    var completeKya =
        dbKya.where((element) => element.progress >= 100).toList();
    _loadCompleteKya(completeKya);

    var kyaCards = await _cloudStore.getKya(_customAuth.getId());
    var completeKyaCards =
        kyaCards.where((element) => element.progress >= 100.0).toList();

    if (completeKyaCards.isNotEmpty) {
      _loadCompleteKya(completeKyaCards);
      await _dbHelper.insertKyas(kyaCards);
    }
  }

  void _getDashboardLocations() async {
    var measurements = await _dbHelper.getLatestMeasurements();

    if (measurements.isNotEmpty) {
      setState(_dashBoardPlaces.clear);

      var regions = [
        'cent',
        'west',
        'east',
      ];

      for (var i = 0; i < regions.length; i++) {
        var regionMeasurements = measurements
            .where((element) =>
                element.site.region.toLowerCase().contains(regions[i]))
            .toList();

        if (regionMeasurements.isNotEmpty) {
          var random = Random().nextInt(regionMeasurements.length);

          if (mounted) {
            setState(() {
              _dashBoardPlaces.add(AnalyticsCard(
                  PlaceDetails.measurementToPLace(regionMeasurements[random]),
                  regionMeasurements[random],
                  _isRefreshing,
                  false));
            });
          }
        } else {
          var random = Random().nextInt(measurements.length);

          if (mounted) {
            setState(() {
              _dashBoardPlaces.add(AnalyticsCard(
                  PlaceDetails.measurementToPLace(measurements[random]),
                  measurements[random],
                  _isRefreshing,
                  false));
            });
          }
        }
      }
    }
  }

  void _getIncompleteKya() async {
    if (!_customAuth.isLoggedIn()) {
      return;
    }

    var kyas = await _cloudStore.getKya(_customAuth.getId());
    var inCompleteKya =
        kyas.where((element) => element.progress < 100).toList();

    if (kyas.isNotEmpty) {
      await _dbHelper.insertKyas(kyas);
    }

    if (inCompleteKya.isNotEmpty) {
      if (mounted) {
        setState(() {
          _kya = inCompleteKya.first;
        });
      }
    }
  }

  Future<void> _getLatestMeasurements() async {
    var measurements = await _airqoApiClient!.fetchLatestMeasurements();
    if (measurements.isNotEmpty) {
      await _dbHelper.insertLatestMeasurements(measurements);
      if (mounted) {
        _getLocationMeasurements();
        _getDashboardLocations();
      }
    }
  }

  void _getLocationMeasurements() async {
    var defaultMeasurement = await _locationService.defaultLocationPlace();
    if (defaultMeasurement != null && mounted) {
      setState(() {
        currentLocation = defaultMeasurement;
      });
    }

    var measurement = await _locationService.getCurrentLocationReadings();
    if (measurement != null && mounted) {
      setState(() {
        currentLocation = measurement;
      });
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
    _cloudAnalytics.logScreenTransition('Home Page');
    _airqoApiClient = AirqoApiClient(context);
    _preferences = await SharedPreferences.getInstance();
    _setGreetings();
    _getLocationMeasurements();
    _getDashboardLocations();
    if (_customAuth.isLoggedIn()) {
      await _loadKya();
      _getIncompleteKya();
      _getCompleteKya();
    }
    await _getLatestMeasurements();
    _showHelpTips();
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
        debugPrint(exception.toString());
        debugPrint(stackTrace.toString());
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
    var kyas = await _cloudStore.getKya(_customAuth.getId());
    await _dbHelper.insertKyas(kyas);
  }

  void _setGreetings() {
    if (mounted) {
      setState(() {
        _greetings = getGreetings(_customAuth.getDisplayName());
      });
    }
  }

  void _showHelpTips() {
    return;
    if (!mounted) {
      return;
    }
    try {
      var showHelpTips =
          _preferences!.getBool(PrefConstant.homePageTips) ?? true;
      if (showHelpTips) {
        showTipText(_favToolTipText, _favToolTipKey, context, () {
          showTipText(_kyaToolTipText, _kyaToolTipKey, context, () {
            setState(() {
              _showAnalyticsCardTips = true;
            });
            _preferences!.setBool(PrefConstant.homePageTips, false);
          }, true);
        }, false);
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }
}
