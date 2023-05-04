import 'dart:async';
import 'dart:math';

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
  bool _kyaExists = true, _nearbyLocationExists = false;

  final Stream<int> _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription<int> _timeSubscription;
  late StreamSubscription<ServiceStatus> _locationServiceStream;
  late StreamSubscription<Position> _locationPositionStream;
  final AppService _appService = AppService();
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(50.0),
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
        child: NestedScrollView(
          controller: _scrollController,
          floatHeaderSlivers: true,
          headerSliverBuilder: (context, innerBoxScrolled) => [
            SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                child: BlocBuilder<ProfileBloc, Profile>(
                  builder: (context, state) {
                    return AutoSizeText(
                      // TODO refresh greetings
                      state.greetings(),
                      maxLines: 1,
                      minFontSize: 24,
                      overflow: TextOverflow.ellipsis,
                      style: CustomTextStyle.headline7(context),
                    );
                  },
                ),
                minHeight: 0,
                maxHeight: 40,
              ),
            ),
            SliverAppBar(
              titleSpacing: 0,
              stretch: true,
              toolbarHeight: 80,
              backgroundColor: CustomColors.appBodyColor,
              automaticallyImplyLeading: false,
              title: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Row(
                  children: [
                    BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
                      builder: (context, state) {
                        final favouritePlaces = favouritePlacesWidgets(
                          state.take(3).toList(),
                        );

                        return Expanded(
                          child: CustomShowcaseWidget(
                            showcaseKey: _favoritesShowcaseKey,
                            descriptionHeight: screenSize.height * 0.12,
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
                            descriptionWidth: screenSize.width * 0.3,
                            descriptionHeight: screenSize.height * 0.17,
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
              ),
              floating: true,
              pinned: true,
            ),
            SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                child: Text(
                  DateTime.now().timelineString(),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.black.withOpacity(0.5),
                      ),
                ),
                minHeight: 20,
                maxHeight: 20,
              ),
              floating: true,
            ),
            SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                child: Text(
                  'Today’s air quality',
                  style: CustomTextStyle.headline11(context),
                ),
                minHeight: 40,
                maxHeight: 40,
              ),
            ),
          ],
          body: RefreshIndicator(
            color: CustomColors.appColorBlue,
            onRefresh: () {
              _refresh();

              return Future(() => null);
            },
            child: SingleChildScrollView(
              child: Column(
                children: [
                  BlocBuilder<NearbyLocationBloc, NearbyLocationState>(
                    builder: (context, state) {
                      switch (state.blocStatus) {
                        case NearbyLocationStatus.searchComplete:
                          break;
                        case NearbyLocationStatus.searching:
                          if (state.locationAirQuality == null) {
                            return const SearchingAirQuality();
                          }
                          break;
                        case NearbyLocationStatus.locationDenied:
                          return const Padding(
                            padding: EdgeInsets.only(top: 16),
                            child: LocationDeniedButton(),
                          );
                        case NearbyLocationStatus.locationDisabled:
                          return const Padding(
                            padding: EdgeInsets.only(top: 16),
                            child: NoLocationAirQualityMessage(
                              "Turn on location to get air quality near you.",
                              dismiss: false,
                            ),
                          );
                      }

                      final AirQualityReading? nearbyAirQuality =
                          state.locationAirQuality;
                      if (nearbyAirQuality == null) {
                        _nearbyLocationExists = false;

                        return state.showErrorMessage
                            ? const Padding(
                                padding: EdgeInsets.only(top: 16),
                                child: NoLocationAirQualityMessage(
                                  "We’re unable to get your location’s air quality. Explore locations below as we expand our network.",
                                ),
                              )
                            : Container();
                      }
                      context.read<LocationHistoryBloc>().add(
                            AddLocationHistory(nearbyAirQuality),
                          );

                      return Padding(
                        padding: const EdgeInsets.only(top: 16),
                        child: CustomShowcaseWidget(
                          showcaseKey: _nearestLocationShowcaseKey,
                          descriptionHeight: screenSize.height * 0.17,
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
                      List<Kya> kya = state
                        ..filterPartiallyComplete()
                        ..sortByProgress();
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
                          descriptionHeight: screenSize.height * 0.14,
                          description:
                              "Do you want to know more about air quality? Know your air in this section",
                          child: KyaCardWidget(
                            kya.first,
                          ),
                        ),
                      );
                    },
                  ),
                  BlocConsumer<DashboardBloc, DashboardState>(
                    listener: (context, state) {
                      if (state.scrollToTop) {
                        _scrollController.animateTo(
                          0,
                          duration: const Duration(milliseconds: 800),
                          curve: Curves.ease,
                        );
                      }
                    },
                    builder: (context, state) {
                      switch (state.status) {
                        case DashboardStatus.loaded:
                        case DashboardStatus.refreshing:
                          break;
                        case DashboardStatus.error:
                          switch (state.error) {
                            case DashboardError.noAirQuality:
                              return NoAirQualityDataWidget(
                                callBack: () => _refresh(),
                              );
                            case DashboardError.noInternetConnection:
                              return NoInternetConnectionWidget(
                                callBack: () => _refresh(),
                              );
                            case DashboardError.none:
                              break;
                          }
                          break;
                        case DashboardStatus.loading:
                          return const DashboardLoadingWidget();
                      }

                      return ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: state.airQualityReadings.length,
                        itemBuilder: (BuildContext context, int index) {
                          return (index == 0)
                              ? Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: CustomShowcaseWidget(
                                    showcaseKey: _analyticsShowcaseKey,
                                    descriptionHeight: screenSize.height * 0.17,
                                    customize: ShowcaseOptions.up,
                                    showLine: false,
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
                                );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
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
    _scrollController.dispose();
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
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
  }

  Future<void> _startShowcase() async {
    List<GlobalKey> globalKeys = [];
    final prefs = await SharedPreferences.getInstance();

    if (prefs.getBool(Config.restartTourShowcase) != true) {
      globalKeys.add(_skipShowcaseKey);
    }

    globalKeys.addAll([
      _favoritesShowcaseKey,
      _forYouShowcaseKey,
      _analyticsShowcaseKey,
    ]);

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
          WidgetsBinding.instance.addPostFrameCallback((_) async {
            await _startShowcase();
            await _appService.stopShowcase(Config.homePageShowcase);
          });
        }
      });
    }
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  _SliverAppBarDelegate({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => max(maxHeight, minHeight);

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return SizedBox.expand(child: child);
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return maxHeight != oldDelegate.maxHeight ||
        minHeight != oldDelegate.minHeight ||
        child != oldDelegate.child;
  }
}
