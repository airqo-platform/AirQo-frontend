import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';
import 'package:home_widget/home_widget.dart';

import 'package:collection/collection.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:showcaseview/showcaseview.dart';

import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../kya/kya_widgets.dart';
import '../search/search_page.dart';
import 'dashboard_widgets.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView>
    with WidgetsBindingObserver {
  late GlobalKey _favToolTipKey;
  late GlobalKey _kyaToolTipKey;
  late GlobalKey _favoritesShowcaseKey;
  late GlobalKey _forYouShowcaseKey;
  late GlobalKey _kyaShowcaseKey;
  late GlobalKey _analyticsShowcaseKey;
  late GlobalKey _nearestLocationShowcaseKey;
  late GlobalKey _skipShowcaseKey;
  bool _kyaExists = true, _nearbyLocationExists = true;

  final Stream<int> _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription<int> _timeSubscription;
  late StreamSubscription<ServiceStatus> _locationServiceStream;
  late StreamSubscription<Position> _locationPositionStream;
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60.0),
        child: Showcase.withWidget(
          key: _skipShowcaseKey,
          overlayOpacity: 0.6,
          targetShapeBorder: const RoundedRectangleBorder(),
          width: 50,
          height: 50,
          container: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 45,
                height: 45,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
                child: IconButton(
                  tooltip: "Skip Showcase",
                  icon: const Icon(Icons.skip_next),
                  onPressed: () => ShowCaseWidget.of(context).dismiss(),
                  color: CustomColors.appColorBlue,
                ),
              ),
              const SizedBox(
                height: 10,
              ),
              const Text(
                "Click to Skip Tutorial",
                textAlign: TextAlign.left,
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
          child: AppBar(
            automaticallyImplyLeading: false,
            centerTitle: false,
            title: SvgPicture.asset(
              'assets/icon/airqo_logo.svg',
              height: 40,
              width: 58,
              semanticsLabel: 'AirQo',
            ),
            elevation: 0,
            backgroundColor: CustomColors.appBodyColor,
          ),
        ),
      ),
      body: AppSafeArea(
        horizontalPadding: 16.0,
        widget: Padding(
          padding: const EdgeInsets.only(top: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              BlocBuilder<DashboardBloc, DashboardState>(
                buildWhen: (previous, current) {
                  return previous.greetings != current.greetings;
                },
                builder: (context, state) {
                  return AutoSizeText(
                    state.greetings,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline7(context),
                  );
                },
              ),
              const SizedBox(
                height: 16,
              ),
              Row(
                children: [
                  BlocBuilder<AccountBloc, AccountState>(
                    builder: (context, state) {
                      final favouritePlaces = favouritePlacesWidgets(
                        state.favouritePlaces.take(3).toList(),
                      );

                      return Expanded(
                        child: Showcase(
                          key: _favoritesShowcaseKey,
                          description:
                              'Find the latest air quality from your favorite locations',
                          child: DashboardTopCard(
                            toolTipType: ToolTipType.favouritePlaces,
                            title: 'Favorites',
                            widgetKey: _favToolTipKey,
                            nextScreenClickHandler: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) {
                                    return const FavouritePlacesPage();
                                  },
                                ),
                              );
                            },
                            children: favouritePlaces,
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(
                    width: 16,
                  ),
                  BlocBuilder<KyaBloc, KyaState>(
                    builder: (context, state) {
                      final kyaWidgets = completeKyaWidgets(
                        state.kya.filterCompleteKya().take(3).toList(),
                      );

                      return Expanded(
                        child: Showcase(
                          key: _forYouShowcaseKey,
                          description:
                              'Find amazing content specifically designed for you here.',
                          child: DashboardTopCard(
                            toolTipType: ToolTipType.forYou,
                            title: 'For You',
                            widgetKey: _kyaToolTipKey,
                            nextScreenClickHandler: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) {
                                    return const ForYouPage(analytics: false);
                                  },
                                ),
                              );
                            },
                            children: kyaWidgets,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(
                height: 24,
              ),
              BlocBuilder<DashboardBloc, DashboardState>(
                builder: (context, state) {
                  switch (state.status) {
                    case DashboardStatus.error:
                      switch (state.error) {
                        case DashboardError.none:
                        case DashboardError.noAirQuality:
                          return NoAirQualityDataWidget(
                            callBack: () {
                              _refresh();
                            },
                          );
                        case DashboardError.noInternetConnection:
                          return NoInternetConnectionWidget(
                            callBack: () {
                              _refresh();
                            },
                          );
                      }
                    case DashboardStatus.loading:
                      return const Expanded(
                        child: DashboardLoadingWidget(),
                      );
                    case DashboardStatus.refreshing:
                    case DashboardStatus.loaded:
                      break;
                  }

                  if (state.airQualityReadings.isEmpty) {
                    return NoAirQualityDataWidget(
                      callBack: () {
                        _refresh();
                      },
                    );
                  }

                  return Expanded(
                    child: AppRefreshIndicator(
                      sliverChildDelegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final items = [
                            Text(
                              DateTime.now().timelineString(),
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: Colors.black.withOpacity(0.5),
                                  ),
                            ),
                            const SizedBox(
                              height: 4,
                            ),
                            Text(
                              'Today’s air quality',
                              style: CustomTextStyle.headline11(context),
                            ),
                            BlocBuilder<NearbyLocationBloc,
                                NearbyLocationState>(
                              builder: (context, state) {
                                switch (state.blocStatus) {
                                  case NearbyLocationStatus.initial:
                                  case NearbyLocationStatus.searching:
                                    return const ContainerLoadingAnimation(
                                      radius: 16,
                                      height: 251,
                                    );
                                  case NearbyLocationStatus.loaded:
                                    return const SizedBox(
                                      height: 16,
                                    );
                                  case NearbyLocationStatus.error:
                                    switch (state.error) {
                                      case NearbyAirQualityError.none:
                                        return const SizedBox(
                                          height: 0,
                                        );
                                      case NearbyAirQualityError.locationDenied:
                                      case NearbyAirQualityError
                                          .locationDisabled:
                                        return const SizedBox(
                                          height: 16,
                                        );
                                      case NearbyAirQualityError
                                          .noNearbyAirQualityReadings:
                                        return SizedBox(
                                          height:
                                              state.showErrorMessage ? 16 : 0,
                                        );
                                    }
                                }
                              },
                            ),
                            BlocBuilder<NearbyLocationBloc,
                                NearbyLocationState>(
                              builder: (context, state) {
                                if (state.blocStatus ==
                                    NearbyLocationStatus.error) {
                                  _nearbyLocationExists = false;
                                  switch (state.error) {
                                    case NearbyAirQualityError.locationDenied:
                                      return DashboardLocationButton(
                                        state.error,
                                      );
                                    case NearbyAirQualityError.locationDisabled:
                                      return DashboardLocationButton(
                                        state.error,
                                      );
                                    case NearbyAirQualityError
                                        .noNearbyAirQualityReadings:
                                      return state.showErrorMessage
                                          ? const NoLocationAirQualityMessage(
                                              NearbyAirQualityError
                                                  .noNearbyAirQualityReadings,
                                            )
                                          : Container();
                                    case NearbyAirQualityError.none:
                                      break;
                                  }
                                }

                                final AirQualityReading? nearbyAirQuality =
                                    state.locationAirQuality;
                                if (nearbyAirQuality == null) {
                                  return state.showErrorMessage
                                      ? const NoLocationAirQualityMessage(
                                          NearbyAirQualityError
                                              .noNearbyAirQualityReadings,
                                        )
                                      : Container();
                                }

                                return Showcase(
                                  key: _nearestLocationShowcaseKey,
                                  description:
                                      'This card shows the air quality of your nearest location',
                                  child: AnalyticsCard(
                                    nearbyAirQuality,
                                    false,
                                  ),
                                );
                              },
                            ),
                            BlocBuilder<KyaBloc, KyaState>(
                              builder: (context, state) {
                                List<Kya> kya = state.kya.filterIncompleteKya();
                                if (kya.isEmpty) {
                                  _kyaExists = false;

                                  return const SizedBox();
                                }
                                kya.sortByProgress();

                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: Showcase(
                                    key: _kyaShowcaseKey,
                                    description:
                                        'Do you want to know more about air quality? Know your air in this section',
                                    child: KyaCardWidget(kya.first),
                                  ),
                                );
                              },
                            ),
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: state.airQualityReadings.length,
                              itemBuilder: (BuildContext context, int index) {
                                return (index == 0)
                                    ? Padding(
                                        padding: const EdgeInsets.only(top: 16),
                                        child: Showcase(
                                          key: _analyticsShowcaseKey,
                                          description:
                                              'Find the air quality of different locations across Africa here.',
                                          child: AnalyticsCard(
                                            state.airQualityReadings[index],
                                            false,
                                          ),
                                        ),
                                      )
                                    : Padding(
                                        padding: const EdgeInsets.only(top: 16),
                                        child: AnalyticsCard(
                                          state.airQualityReadings[index],
                                          false,
                                        ),
                                      );
                              },
                            ),
                          ];

                          return items[index];
                        },
                        childCount: 7,
                      ),
                      onRefresh: () {
                        _refresh();

                        return Future(() => null);
                      },
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                return const SearchPage();
              },
            ),
          );
        },
        backgroundColor: CustomColors.appColorBlue,
        child: const Icon(Icons.search),
      ),
    );
  }

  @override
  void dispose() {
    _timeSubscription.cancel();
    _locationServiceStream.cancel();
    _locationPositionStream.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _favToolTipKey = GlobalKey();
    _kyaToolTipKey = GlobalKey();
    _favoritesShowcaseKey = GlobalKey();
    _forYouShowcaseKey = GlobalKey();
    _kyaShowcaseKey = GlobalKey();
    _analyticsShowcaseKey = GlobalKey();
    _nearestLocationShowcaseKey = GlobalKey();
    _skipShowcaseKey = GlobalKey();
    WidgetsBinding.instance.addPostFrameCallback((_) => _showcaseToggle());
    WidgetsBinding.instance.addObserver(this);
    _listenToStreams();
    _refresh();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    switch (state) {
      case AppLifecycleState.resumed:
        _refresh();
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
        break;
    }
  }

  Future<void> _sendData() async {
    AirQualityReading? airQualityReading =
        context.read<NearbyLocationBloc>().state.locationAirQuality ??
            HiveService.getAirQualityReadings().firstOrNull;

    if (airQualityReading == null) return;

    List<ForecastInsight> forecastDbData = await AirQoDatabase()
        .getForecastInsights(airQualityReading.referenceSite);
    forecastDbData = forecastDbData
        .where((element) => element.time.compareTo(DateTime.now()) > 1)
        .take(3)
        .toList();

    Map<String, double> forecastData = {};

    for (var element in forecastDbData) {
      forecastData.putIfAbsent(
        DateFormat('h:mm a').format(element.time.toLocal()),
        () => element.pm2_5,
      );
    }
    // print("Data is $forecastData");
    List<String> forecastValues =
        forecastData.values.map((value) => value.toString()).toList();
    List<String> times = forecastData.keys.toList();

    String rectangleWidgetTime =
        DateFormat('dd/MM, h:mm a').format(DateTime.now().toLocal());
    String circularWidgetTime =
        DateFormat('h:mm a').format(DateTime.now().toLocal());

    return Future.wait([
      HomeWidget.saveWidgetData<String>('location', airQualityReading.name),
      HomeWidget.saveWidgetData('circular_location', airQualityReading.name),
      HomeWidget.saveWidgetData<String>('date', rectangleWidgetTime),
      HomeWidget.saveWidgetData<String>('circular_date', circularWidgetTime),
      HomeWidget.saveWidgetData<String>(
          'pmValue', airQualityReading.pm2_5.toString()),
      HomeWidget.saveWidgetData<String>(
          'circular_pm_value', airQualityReading.pm2_5.toString()),
      HomeWidget.saveWidgetData<String>('forecastValue1', forecastValues[0]),
      HomeWidget.saveWidgetData<String>('forecastValue2', forecastValues[1]),
      HomeWidget.saveWidgetData<String>('forecastValue3', forecastValues[2]),
      HomeWidget.saveWidgetData<String>('time1', times[0]),
      HomeWidget.saveWidgetData<String>('time2', times[1]),
      HomeWidget.saveWidgetData<String>('time3', times[2]),
    ]).then((value) => value);
  }

  Future<void> _updateWidget() {
    final rectangleWidgetUpdate = HomeWidget.updateWidget(
      name: 'AirQoHomeScreenWidget',
      iOSName: 'AirQoHomeScreenWidget',
      qualifiedAndroidName: 'com.airqo.app.AirQoHomeScreenWidget',
    );

    final circularWidgetUpdate = HomeWidget.updateWidget(
      name: 'AirQoCircularWidget',
      iOSName: 'AirQoCircularWidget',
      qualifiedAndroidName: 'com.airqo.app.AirQoCircularWidget',
    );

    return Future.wait([rectangleWidgetUpdate, circularWidgetUpdate]);
  }

  Future<void> _sendAndUpdate() async {
    await _sendData();
    await _updateWidget();
  }

  void _listenToStreams() {
    _timeSubscription = _timeStream.listen((_) {
      _refresh(refreshMap: false);
    });

    _locationServiceStream = Geolocator.getServiceStatusStream().listen((_) {
      context.read<NearbyLocationBloc>().add(const SearchLocationAirQuality());
    });

    _locationPositionStream = Geolocator.getPositionStream(
      locationSettings: Config.locationSettings(),
    ).listen(
      (Position? position) {
        context
            .read<NearbyLocationBloc>()
            .add(SearchLocationAirQuality(position: position));
      },
      onError: (error) {
        debugPrint('error listening to location updates : $error');
      },
    );
  }

  void _refresh({bool refreshMap = true}) {
    context.read<DashboardBloc>().add(const RefreshDashboard());
    context.read<NearbyLocationBloc>().add(const SearchLocationAirQuality());
    context.read<NearbyLocationBloc>().add(const UpdateLocationAirQuality());
    if (refreshMap) {
      context.read<MapBloc>().add(const InitializeMapState());
    }
    _sendAndUpdate();
  }

  void _startShowcase() {
    List<GlobalKey> globalKeys = [
      _skipShowcaseKey,
      _favoritesShowcaseKey,
      _forYouShowcaseKey,
      _analyticsShowcaseKey,
    ];
    if (_kyaExists) {
      globalKeys.add(_kyaShowcaseKey);
    }

    if (_nearbyLocationExists) {
      globalKeys.add(_nearestLocationShowcaseKey);
    }
    WidgetsBinding.instance.addPostFrameCallback(
      (_) {
        ShowCaseWidget.of(context).startShowCase(globalKeys);
      },
    );
  }

  Future<void> _showcaseToggle() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(Config.homePageShowcase) == null) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && (ModalRoute.of(context)?.isCurrent ?? true)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _startShowcase();
            _appService.stopShowcase(Config.homePageShowcase);
          });
        }
      });
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted && (ModalRoute.of(context)?.isCurrent ?? true)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ShowCaseWidget.of(context).next();
          });
        }
      });
    }
  }
}
