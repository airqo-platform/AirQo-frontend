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
import 'package:geolocator/geolocator.dart';
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
        child: CustomShowcaseWidget(
          showcaseKey: _skipShowcaseKey,
          description: "Click to Skip Tutorial",
          customize: ShowcaseOptions.skip,
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
                  BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
                    builder: (context, state) {
                      final favouritePlaces = favouritePlacesWidgets(
                        state.take(3).toList(),
                      );

                      return Expanded(
                        child: CustomShowcaseWidget(
                          showcaseKey: _favoritesShowcaseKey,
                          descriptionHeight: 120,
                          description:
                              "Find the latest air quality from your favorite locations",
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
                  BlocBuilder<KyaBloc, List<Kya>>(
                    builder: (context, state) {
                      final kyaWidgets = completeKyaWidgets(
                        state.filterComplete().take(3).toList(),
                      );

                      return Expanded(
                        child: CustomShowcaseWidget(
                          showcaseKey: _forYouShowcaseKey,
                          descriptionWidth: 100,
                          descriptionHeight: 130,
                          description:
                              "Find amazing content specifically designed for you here.",
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

                    return Expanded(
                      child: CustomShowcaseWidget(
                        showcaseKey: _favoritesShowcaseKey,
                        descriptionHeight: 120,
                        description:
                            "Find the latest air quality from your favorite locations",
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
                      child: CustomShowcaseWidget(
                        showcaseKey: _forYouShowcaseKey,
                        descriptionWidth: 100,
                        descriptionHeight: 130,
                        description:
                            "Find amazing content specifically designed for you here.",
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
                                case NearbyLocationStatus.searchComplete:
                                  final AirQualityReading? nearbyAirQuality =
                                      state.locationAirQuality;
                                  if (nearbyAirQuality == null) {
                                    _nearbyLocationExists = false;
                                    if (state.showErrorMessage) {
                                      return const Padding(
                                        padding: EdgeInsets.only(top: 16),
                                        child: NoLocationAirQualityMessage(),
                                      );
                                    }

                                    return Container();
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
                                context
                                    .read<LocationHistoryBloc>()
                                    .add(AddLocationHistory(nearbyAirQuality));

                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: CustomShowcaseWidget(
                                    showcaseKey: _nearestLocationShowcaseKey,
                                    description:
                                        "This card shows the air quality of your nearest location",
                                    child: AnalyticsCard(
                                      nearbyAirQuality,
                                      false,
                                    ),
                                  ),
                                );
                              },
                            ),
                            BlocBuilder<KyaBloc, List<Kya>>(
                              builder: (context, state) {
                                List<Kya> kya = state.filterPartiallyComplete();
                                if (kya.isEmpty) {
                                  kya = state.filterInProgressKya();
                                }
                                if (kya.isEmpty) {
                                  kya = state.filterHasNoProgress();
                                }
                                if (kya.isEmpty) {
                                  _kyaExists = false;

                                  return const SizedBox();
                                }

                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: CustomShowcaseWidget(
                                    showcaseKey: _kyaShowcaseKey,
                                    descriptionHeight: 100,
                                    description:
                                        "Do you want to know more about air quality? Know your air in this section",
                                    child: KyaCardWidget(
                                      kya.sortByProgress().first,
                                    ),
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
                                        child: CustomShowcaseWidget(
                                          showcaseKey: _analyticsShowcaseKey,
                                          descriptionHeight: 120,
                                          description:
                                              "Find the air quality of different locations across Africa here.",
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
                      childCount: 6,
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
