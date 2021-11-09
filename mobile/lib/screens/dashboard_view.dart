import 'dart:math';

import 'package:app/constants/app_constants.dart';
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
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
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
  List<Widget> dashBoardPlaces = [
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0),
    loadingAnimation(255.0, 16.0)
  ];
  var greetings = '';
  double tipsProgress = 0.0;
  bool isRefreshing = false;
  List<Widget> dashboardCards = [];
  List<Widget> favLocations = [];
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final DBHelper _dbHelper = DBHelper();
  AirqoApiClient? _airqoApiClient;
  final CustomAuth _customAuth = CustomAuth();
  PlaceDetails? currentLocation;
  final LocationService _locationService = LocationService();
  bool _showName = true;
  final ScrollController _scrollController = ScrollController();

  Widget actionsSection() {
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
                      return const AirPollutionWaysPage();
                    }));
                  },
                  child: const Text(
                      'Actions You Can Take to Reduce '
                      'Air Pollution',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 16,
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
                      return const AirPollutionWaysPage();
                    }));
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text('Start reading',
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
                return const AirPollutionWaysPage();
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
                  greetings,
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

  Widget favPlaceAvatar(double rightPadding, Measurement measurement) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white, width: 2),
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

  Widget favPlaceAvatarEmpty(double rightPadding) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white, width: 2),
            color: ColorConstants.greyColor,
            shape: BoxShape.circle,
          ),
        ));
  }

  void getDashboardLocations() async {
    var measurements = await _dbHelper.getLatestMeasurements();

    if (measurements.isNotEmpty) {
      setState(() {
        dashBoardPlaces.clear();
      });

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
          var random = 0 + Random().nextInt(regionMeasurements.length - 0);

          dashBoardPlaces.add(AnalyticsCard(
              PlaceDetails.measurementToPLace(regionMeasurements[random]),
              isRefreshing));
        } else {
          var random = 0 + Random().nextInt(measurements.length - 0);
          setState(() {
            dashBoardPlaces.add(AnalyticsCard(
                PlaceDetails.measurementToPLace(measurements[random]),
                isRefreshing));
          });
        }
      }
    }
  }

  void getFavourites(List<PlaceDetails> favouritePlaces) async {
    var widgets = <Widget>[];

    try {
      if (favouritePlaces.length == 1) {
        var measurement =
            await _dbHelper.getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(favPlaceAvatarEmpty(0));
        }
      } else if (favouritePlaces.length == 2) {
        var measurement =
            await _dbHelper.getMeasurement(favouritePlaces[0].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(0, measurement));
        } else {
          widgets.add(favPlaceAvatarEmpty(0));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(favPlaceAvatarEmpty(7));
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
          widgets.add(favPlaceAvatarEmpty(0));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[1].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(7, measurement));
        } else {
          widgets.add(favPlaceAvatarEmpty(7));
        }

        measurement = await _dbHelper.getMeasurement(favouritePlaces[2].siteId);
        if (measurement != null) {
          widgets.add(favPlaceAvatar(14, measurement));
        } else {
          widgets.add(favPlaceAvatarEmpty(14));
        }
      } else {}
    } catch (e) {
      debugPrint(e.toString());
    }

    setState(() {
      favLocations.clear();
      favLocations = widgets;
    });
  }

  void getLocationMeasurements() async {
    var measurement = await _locationService.getCurrentLocationReadings();
    if (measurement != null) {
      setState(() {
        currentLocation = PlaceDetails.measurementToPLace(measurement);
      });
    } else {
      var defaultMeasurement = await _locationService.defaultLocationPlace();
      if (defaultMeasurement != null) {
        setState(() {
          currentLocation = defaultMeasurement;
        });
      }
    }
  }

  void handleScroll() async {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.reverse) {
        setState(() {
          _showName = false;
        });
      }
      if (_scrollController.position.userScrollDirection ==
          ScrollDirection.forward) {
        setState(() {
          _showName = true;
        });
      }
    });
  }

  Future<void> initialize() async {
    _cloudAnalytics.logScreenTransition('Home Page');
    _airqoApiClient = AirqoApiClient(context);
    setGreetings();
    getLocationMeasurements();
    getDashboardLocations();
    var preferences = await SharedPreferences.getInstance();
    setState(() {
      tipsProgress = preferences.getDouble(PrefConstant.tipsProgress) ?? 0.0;
    });
    await _getLatestMeasurements();
  }

  @override
  void initState() {
    super.initState();
    initialize();
    handleScroll();
  }

  void setGreetings() {
    setState(() {
      greetings = getGreetings(_customAuth.getDisplayName());
    });
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
                      return const AirPollutionWaysPage();
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
                      return const AirPollutionWaysPage();
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
                return const AirPollutionWaysPage();
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
                        children: favLocations,
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
                SvgPicture.asset(
                  'assets/icon/add_avator.svg',
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
                AnalyticsCard(currentLocation!, isRefreshing),
              if (currentLocation == null) loadingAnimation(255.0, 16.0),
              const SizedBox(
                height: 16,
              ),
              tipsSection(),
              const SizedBox(
                height: 16,
              ),
              if (dashBoardPlaces.isNotEmpty) dashBoardPlaces[0],
              const SizedBox(
                height: 16,
              ),
              if (dashBoardPlaces.length >= 2) dashBoardPlaces[1],
              const SizedBox(
                height: 16,
              ),
              if (dashBoardPlaces.length >= 3) dashBoardPlaces[2],
              const SizedBox(
                height: 16,
              ),
            ]));
  }

  Future<void> _getLatestMeasurements() async {
    var measurements = await _airqoApiClient!.fetchLatestMeasurements();
    if (measurements.isNotEmpty) {
      await _dbHelper.insertLatestMeasurements(measurements);
      if (mounted) {
        getLocationMeasurements();
        getDashboardLocations();
      }
    }
  }
}
