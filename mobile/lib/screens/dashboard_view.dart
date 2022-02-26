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

import 'favourite_places.dart';
import 'for_you_page.dart';
import 'kya_lessons_page.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  _DashboardViewState createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  String _greetings = '';

  List<Widget> _favLocations = [];
  List<Widget> _completeKyaWidgets = [
    SvgPicture.asset(
      'assets/icon/add_avator.svg',
    )
  ];
  List<Kya> _completeKya = [];
  List<Kya> _incompleteKya = [];

  late AppService _appService;
  List<Measurement> currentLocation = [];
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
                visible: true,
                // visible: _showName,
                child: AutoSizeText(
                  _greetings,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),
              const Visibility(
                visible: true,
                // visible: _showName,
                child: SizedBox(
                  height: 16,
                ),
              ),
              topTabs(),
              const SizedBox(
                height: 8,
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

  String getKyaMessage({required Kya kya}) {
    var kyaItems = kya.lessons.length;
    var progress = kya.progress;
    if (progress == 0) {
      return 'Start learning';
    }
    if (progress > 0 && progress < kyaItems) {
      return 'Continue';
    }
    if (progress >= kyaItems) {
      return 'Complete! Move to For You';
    }
    return '';
  }

  Future<void> handleKyaOnClick({required Kya kya}) async {
    if (kya.progress >= kya.lessons.length) {
      kya.progress = -1;
      await _appService.updateKya(kya);
      _getKya();
    } else {
      var returnStatus =
          await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return KyaLessonsPage(kya);
      }));
      if (returnStatus) {
        Future.delayed(const Duration(seconds: 500), () {
          if (mounted) {
            _getKya();
          }
        });
      }
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
    if (_incompleteKya.isEmpty) {
      return const SizedBox();
    }
    return GestureDetector(
      onTap: () async {
        await handleKyaOnClick(kya: _incompleteKya[0]);
      },
      child: Container(
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
                  Text(_incompleteKya[0].title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      )),
                  const SizedBox(
                    height: 28,
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      AutoSizeText(getKyaMessage(kya: _incompleteKya[0]),
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
                  SizedBox(
                    height:
                        getKyaMessage(kya: _incompleteKya[0]).toLowerCase() ==
                                'continue'
                            ? 2
                            : 0,
                  ),
                  Visibility(
                    visible:
                        getKyaMessage(kya: _incompleteKya[0]).toLowerCase() ==
                            'continue',
                    child: Container(
                        height: 4,
                        decoration: const BoxDecoration(
                          borderRadius: BorderRadius.all(Radius.circular(8.0)),
                        ),
                        child: LinearProgressIndicator(
                          color: Config.appColorBlue,
                          value: _incompleteKya[0].progress /
                              _incompleteKya[0].lessons.length,
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
            ClipRRect(
              borderRadius: BorderRadius.circular(8.0),
              child: CachedNetworkImage(
                fit: BoxFit.cover,
                width: 104,
                height: 104,
                placeholder: (context, url) => SizedBox(
                  width: 104,
                  height: 104,
                  child: containerLoadingAnimation(height: 104, radius: 8),
                ),
                imageUrl: _incompleteKya[0].imageUrl,
                errorWidget: (context, url, error) => Icon(
                  Icons.error_outline,
                  color: Config.red,
                ),
              ),
            ),
          ],
        ),
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
                        _getFavourites(placeDetailsModel.favouritePlaces);
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
              const SizedBox(
                height: 32,
              ),
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
              kyaSection(),
              Visibility(
                visible: _incompleteKya.isNotEmpty,
                child: const SizedBox(
                  height: 16,
                ),
              ),
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

  void _getFavourites(List<PlaceDetails> favouritePlaces) async {
    var widgets = <Widget>[];

    if ((_favLocations.length != 3 && favouritePlaces.length >= 3) ||
        (_favLocations.length > favouritePlaces.length)) {
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
  }

  void _getKya() async {
    var kya = await _appService.dbHelper.getKyas();

    _completeKya = kya.where((element) => element.progress == -1).toList();
    _loadCompleteKya(_completeKya);

    setState(() {
      _incompleteKya = kya.where((element) => element.progress != -1).toList();
    });
  }

  void _handleScroll() async {
    _scrollController.addListener(() {
      if (_scrollController.position.userScrollDirection ==
              ScrollDirection.reverse &&
          mounted) {
        // setState(() {
        //   _showName = false;
        // });
      }
      if (_scrollController.position.userScrollDirection ==
              ScrollDirection.forward &&
          mounted) {
        // setState(() {
        //   _showName = true;
        // });
      }
    });
  }

  Future<void> _initialize() async {
    _appService = AppService(context);
    _preferences = await SharedPreferences.getInstance();
    _setGreetings();
    _getDashboardCards();
    _getKya();
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

  Future<void> _refresh() async {
    await _appService.refreshDashboard();
    _getDashboardCards();
    _getKya();
  }

  void _setGreetings() {
    if (mounted) {
      setState(() {
        _greetings = getGreetings(_appService.customAuth.getDisplayName());
      });
    }
  }
}
