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

import '../themes/light_theme.dart';
import '../utils/kya_utils.dart';
import 'favourite_places.dart';
import 'for_you_page.dart';
import 'kya/kya_title_page.dart';

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

  late AppService _appService;
  List<Measurement> currentLocation = [];
  late SharedPreferences _preferences;

  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();
  bool _isRefreshing = false;

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
            semanticsLabel: 'AirQo',
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

  Future<void> handleKyaOnClick({required Kya kya}) async {
    if (kya.progress >= kya.lessons.length) {
      kya.progress = -1;
      await _appService.updateKya(kya);
      _getKya();
    } else {
      var returnStatus =
          await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return KyaTitlePage(kya);
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
                      getKyaMessageWidget(
                          kya: _incompleteKya[0], context: context),
                      const SizedBox(
                        width: 6,
                      ),
                      SvgPicture.asset(
                        'assets/icon/more_arrow.svg',
                        semanticsLabel: 'more',
                        height: 6.99,
                        width: 4,
                      ),
                    ],
                  ),
                  SizedBox(
                    height:
                        getKyaMessage(kya: _incompleteKya[0]).toLowerCase() ==
                                'continue'
                            ? 2
                            : 0,
                  ),
                  kyaProgressBar(kya: _incompleteKya[0]),
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
                        style: CustomTextStyle.bodyText4(context)?.copyWith(
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
                      width: 47,
                      child: Stack(
                        children: _completeKyaWidgets,
                      ),
                    ),
                    const SizedBox(
                      width: 8,
                    ),
                    Text('For You',
                        style: CustomTextStyle.bodyText4(context)?.copyWith(
                          color: Config.appColorBlue,
                        ))
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
              Text(getDateTime(),
                  style: Theme.of(context).textTheme.caption?.copyWith(
                        color: Colors.black.withOpacity(0.5),
                      )),
              const SizedBox(
                height: 4,
              ),
              Text('Today’s air quality',
                  style: CustomTextStyle.headline11(context)),
              const SizedBox(
                height: 24,
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
    _completeKyaWidgets.add(circularLoadingAnimation(30));
    _setGreetings();
    _getDashboardCards();
    _getKya();
    Future.delayed(const Duration(seconds: 2), _getKya);
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
        _completeKyaWidgets = widgets;
      });
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
            widgets.add(favPlaceAvatar(7, measurements[0]));
          } else {
            widgets.add(emptyAvatar(0));
          }
        } else if (favouritePlaces.length == 2) {
          if (measurements.isNotEmpty) {
            widgets.add(favPlaceAvatar(0, measurements[0]));
          } else {
            widgets.add(emptyAvatar(0));
          }

          if (measurements.length >= 2) {
            widgets.add(favPlaceAvatar(7, measurements[1]));
          } else {
            widgets.add(emptyAvatar(7));
          }

          // widgets
          //   ..add(favPlaceAvatar(0, favouritePlaces[0]))
          //   ..add(favPlaceAvatar(7, favouritePlaces[1]));
        } else if (favouritePlaces.length >= 3) {
          if (measurements.isNotEmpty) {
            widgets.add(favPlaceAvatar(0, measurements[0]));
          } else {
            widgets.add(emptyAvatar(0));
          }

          if (measurements.length >= 2) {
            widgets.add(favPlaceAvatar(7, measurements[1]));
          } else {
            widgets.add(emptyAvatar(7));
          }

          if (measurements.length >= 3) {
            widgets.add(favPlaceAvatar(14, measurements[2]));
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

  Future<void> _refresh() async {
    setState(() {
      _isRefreshing = true;
    });

    await _appService.refreshDashboard();
    _getDashboardCards();
    _getKya();
    _loadFavourites(reload: true);

    setState(() {
      _isRefreshing = false;
    });
  }

  void _setGreetings() {
    if (mounted) {
      setState(() {
        _greetings = getGreetings(_appService.customAuth.getDisplayName());
      });
    }
  }
}
