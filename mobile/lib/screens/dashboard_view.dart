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
import 'package:app/widgets/custom_shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'air_pollution_ways_page.dart';
import 'air_pollution_ways_page_v1.dart';
import 'favourite_places.dart';
import 'for_you_page.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  String _greetings = '';
  double tipsProgress = 0.0;
  bool _showName = true;
  List<Widget> _favLocations = [];
  List<Widget> _completeKya = [];
  AirqoApiClient? _airqoApiClient;
  Measurement? currentLocation;
  Kya? _kya;
  final bool _isRefreshing = false;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final LocationService _locationService = LocationService();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final DBHelper _dbHelper = DBHelper();
  final ScrollController _scrollController = ScrollController();
  final List<Widget> _dashBoardPlaces = [
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0)
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
    if (_kya!.progress >= 89.0) {
      var completeKya = _kya;
      setState(() {
        _kya = null;
      });
      await _cloudStore
          .migrateKya(completeKya!, _customAuth.getId())
          .then((value) => {initialize()});
    } else {
      await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return AirPollutionWaysPage(_kya!, true);
      }));
    }
  }

  void handleScroll() async {
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

  Future<void> initialize() async {
    _cloudAnalytics.logScreenTransition('Home Page');
    _airqoApiClient = AirqoApiClient(context);
    _setGreetings();
    _getIncompleteKya();
    _getCompleteKya();
    _getLocationMeasurements();
    _getDashboardLocations();
    var preferences = await SharedPreferences.getInstance();
    setState(() {
      tipsProgress = preferences.getDouble(PrefConstant.tipsProgress) ?? 0.0;
    });

    await _getLatestMeasurements();
  }

  @override
  void initState() {
    initialize();
    handleScroll();
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
      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
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
                  child: loadingAnimation(104, 8.0),
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

  Widget tipsSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
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
                    await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      if (tipsProgress >= 1.0) {
                        return const ForYouPage();
                      }
                      return const AirPollutionWaysPageV1();
                    }));
                  },
                  child: const Text('The Tid Tips On Air Quality!',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      )),
                ),
                const SizedBox(
                  height: 28,
                ),
                GestureDetector(
                  onTap: () async {
                    await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      if (tipsProgress >= 1.0) {
                        return const ForYouPage();
                      }
                      return const AirPollutionWaysPageV1();
                    }));
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      if (tipsProgress == 0.0)
                        Text('Start learning',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColorBlue,
                            )),
                      if (tipsProgress > 0.0 && tipsProgress < 1.0)
                        Text('Continue',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColorBlue,
                            )),
                      if (tipsProgress >= 1.0)
                        const Text('Complete! Move to ',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                            )),
                      if (tipsProgress >= 1.0)
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
                  visible: tipsProgress > 0.0 && tipsProgress < 1.0,
                  child: Container(
                      height: 4,
                      decoration: const BoxDecoration(
                        borderRadius: BorderRadius.all(Radius.circular(8.0)),
                      ),
                      child: LinearProgressIndicator(
                        color: ColorConstants.appColorBlue,
                        value: tipsProgress,
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
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                if (tipsProgress >= 1.0) {
                  return const ForYouPage();
                }
                return const AirPollutionWaysPageV1();
              }));
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8.0),
              child: Image.asset(
                'assets/images/know-your-air.png',
                width: 104,
                height: 104,
                fit: BoxFit.cover,
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
            child: GestureDetector(
          onTap: () async {
            await Navigator.push(context, MaterialPageRoute(builder: (context) {
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
                  'Favorite',
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
            child: GestureDetector(
          onTap: () async {
            await Navigator.push(context, MaterialPageRoute(builder: (context) {
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
                    children: _completeKya,
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

  void updateCurrentLocation() async {
    // try {
    //   var prefs = await SharedPreferences.getInstance();
    //   var dashboardSite = prefs.getString(PrefConstant.dashboardSite) ?? '';
    //
    //   if (dashboardSite == '') {
    //     await LocationService().getCurrentLocationReadings().then((value)
    //     => {
    //           if (value != null)
    //             {
    //               prefs.setStringList(PrefConstant.lastKnownLocation,
    //                   [(value.site.getUserLocation()), (value.site.id)]),
    //               if (mounted)
    //                 {
    //                   setState(() {
    //                     measurementData = value;
    //                     isRefreshing = false;
    //                     print(measurementData);
    //                   }),
    //                 }
    //             },
    //         });
    //   }
    // } catch (e) {
    //   debugPrint(e.toString());
    // }
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
                    currentLocation!, _isRefreshing),
              if (currentLocation == null) loadingAnimation(255.0, 16.0),
              const SizedBox(
                height: 16,
              ),
              if (_kya != null && _customAuth.isLoggedIn()) kyaSection(),

              // tipsSection(),
              const SizedBox(
                height: 16,
              ),
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
          _completeKya.clear();
          _completeKya = widgets;
        });
      }
      return;
    }

    var allKya = await _cloudStore.getKya(_customAuth.getId());

    var completeKya =
        allKya.where((element) => element.progress >= 100).toList();

    if (completeKya.isEmpty) {
      widgets.add(SvgPicture.asset(
        'assets/icon/add_avator.svg',
      ));
    } else {
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
        _completeKya.clear();
        _completeKya = widgets;
      });
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
                  _isRefreshing));
            });
          }
        } else {
          var random = Random().nextInt(measurements.length);

          if (mounted) {
            setState(() {
              _dashBoardPlaces.add(AnalyticsCard(
                  PlaceDetails.measurementToPLace(measurements[random]),
                  measurements[random],
                  _isRefreshing));
            });
          }
        }
      }
    }
  }

  void _getIncompleteKya() async {
    var userKya = await _cloudStore.getIncompleteKya(_customAuth.getId());
    if (userKya != null && mounted) {
      setState(() {
        _kya = userKya;
      });
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
    var measurement = await _locationService.getCurrentLocationReadings();
    if (measurement != null && mounted) {
      setState(() {
        currentLocation = measurement;
      });
    } else {
      var defaultMeasurement = await _locationService.defaultLocationPlace();
      if (defaultMeasurement != null && mounted) {
        setState(() {
          currentLocation = defaultMeasurement;
        });
      }
    }
  }

  void _setGreetings() {
    if (mounted) {
      setState(() {
        _greetings = getGreetings(_customAuth.getDisplayName());
      });
    }
  }
}
