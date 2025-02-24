import 'dart:async';
import 'dart:math';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:home_widget/home_widget.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:showcaseview/showcaseview.dart';

import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../search/search_page.dart';
import 'dashboard_widgets.dart';

@pragma("vm:entry-point")
void backgroundCallback(Uri? _) async {
  await WidgetService.sendAndUpdate();
}

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
  bool kyaExists = true, _nearbyLocationExists = false;

  final Stream<int> _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription<int> _timeSubscription;
  late StreamSubscription<ServiceStatus> _locationServiceStream;
  late StreamSubscription<Position> _locationPositionStream;
  final AppService _appService = AppService();
  final ScrollController _scrollController = ScrollController();
  final HiveService _hiveService = HiveService();

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(50.0),
        child: CustomShowcaseWidget(
          showcaseKey: _skipShowcaseKey,
          description: AppLocalizations.of(context)!.clickToSkipTutorial,
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
        backgroundColor: CustomColors.appBodyColor,
        horizontalPadding: 16.0,
        child: AnimatedPadding(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.all(0.0),
          child: NestedScrollView(
            controller: _scrollController,
            floatHeaderSlivers: true,
            headerSliverBuilder: (context, innerBoxScrolled) => [
              SliverPersistentHeader(
                delegate: _SliverAppBarDelegate(
                  child: BlocBuilder<ProfileBloc, Profile>(
                    builder: (context, state) {
                      return AutoSizeText(
                        state.greetings(context),
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

                          return Flexible(
                            child: CustomShowcaseWidget(
                              showcaseKey: _favoritesShowcaseKey,
                              descriptionHeight: screenSize.height * 0.12,
                              description: AppLocalizations.of(context)!
                                  .findTheLatestAirQualityFromYourFavoriteLocations,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 500),
                                curve: Curves.easeInOut,
                                child: DashboardTopCard(
                                  toolTipType: ToolTipType.favouritePlaces,
                                  title:
                                      AppLocalizations.of(context)!.favorites,
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
                            ),
                          );
                        },
                      ),
                      const SizedBox(
                        width: 16,
                      ),
                      BlocBuilder<KyaBloc, KyaState>(
                        builder: (context, state) {
                          final allLessons = state.lessons;
                          final allQuizzes = state.quizzes;
                          final kyaWidgets =
                              kyaHeaderWidget(allLessons, allQuizzes);
                          return Expanded(
                            child: CustomShowcaseWidget(
                              showcaseKey: _forYouShowcaseKey,
                              descriptionWidth: screenSize.width * 0.3,
                              descriptionHeight: screenSize.height * 0.17,
                              description: AppLocalizations.of(context)!
                                  .findAmazingContentSpecificallyDesignedForYouHere,
                              child: AnimatedContainer(
                                curve: Curves.easeInOut,
                                duration: const Duration(milliseconds: 500),
                                child: DashboardTopCard(
                                  toolTipType: ToolTipType.forYou,
                                  title: AppLocalizations.of(context)!.forYou,
                                  widgetKey: _kyaToolTipKey,
                                  nextScreenClickHandler: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) {
                                          return const ForYouPage(
                                              analytics: false);
                                        },
                                      ),
                                    );
                                  },
                                  children: kyaWidgets,
                                ),
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
                    DateTime.now().timelineString(context),
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
                  child: AutoSizeText(
                    AppLocalizations.of(context)!.todayAirQuality,
                    style: CustomTextStyle.headline11(context),
                    maxLines: 1,
                    minFontSize: 1,
                  ),
                  minHeight: 25,
                  maxHeight: 25,
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
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    BlocBuilder<NearbyLocationBloc, NearbyLocationState>(
                      builder: (context, state) {
                        CurrentLocation? currentLocation =
                            state.currentLocation;
                        String topCardName = "";
                        String topCardLocation = "";
                        List<AirQualityReading> airQualityReadings = [];
                        switch (state.blocStatus) {
                          case NearbyLocationStatus.searchComplete:
                            break;
                          case NearbyLocationStatus.searching:
                            if (currentLocation == null) {
                              return const SearchingAirQuality();
                            }
                            break;
                          case NearbyLocationStatus.locationDisabled:
                            return const Padding(
                              padding: EdgeInsets.only(top: 16),
                              child: DashboardLocationButton(),
                            );
                        }

                        return ValueListenableBuilder<Box<AirQualityReading>>(
                          valueListenable: Hive.box<AirQualityReading>(
                            _hiveService.airQualityReadingsBox,
                          ).listenable(),
                          builder: (context, box, widget) {
                            if (currentLocation != null) {
                              topCardName = currentLocation.name;
                              topCardLocation = currentLocation.location;
                              airQualityReadings = box.values
                                  .where((element) =>
                                      element.referenceSite ==
                                      currentLocation.referenceSite)
                                  .toList();
                            }

                            if (airQualityReadings.isEmpty) {
                              _nearbyLocationExists = false;

                              List<FavouritePlace> favouritePlaces =
                                  context.read<FavouritePlaceBloc>().state;
                              if (favouritePlaces.isNotEmpty) {
                                airQualityReadings = box.values
                                    .where((element) =>
                                        element.referenceSite ==
                                        favouritePlaces.first.referenceSite)
                                    .toList();
                                topCardName = favouritePlaces.first.name;
                                topCardLocation =
                                    favouritePlaces.first.location;
                              }

                              if (airQualityReadings.isEmpty) {
                                List<LocationHistory> locationHistory =
                                    context.read<LocationHistoryBloc>().state;
                                if (locationHistory.isNotEmpty) {
                                  airQualityReadings = box.values
                                      .where((element) =>
                                          element.placeId ==
                                          locationHistory.first.placeId)
                                      .toList();
                                  topCardName = locationHistory.first.name;
                                  topCardLocation =
                                      locationHistory.first.location;
                                }
                              }

                              if (airQualityReadings.isEmpty) {
                                List<SearchHistory> searchHistory = context
                                    .read<SearchHistoryBloc>()
                                    .state
                                    .history;

                                if (searchHistory.isNotEmpty) {
                                  airQualityReadings = box.values
                                      .where((element) =>
                                          element.placeId ==
                                          searchHistory.first.placeId)
                                      .toList();
                                  topCardName = searchHistory.first.name;
                                  topCardLocation =
                                      searchHistory.first.location;
                                }
                              }

                              if (airQualityReadings.isEmpty) {
                                return state.showErrorMessage
                                    ? Padding(
                                        padding: const EdgeInsets.only(top: 16),
                                        child: NoLocationAirQualityMessage(
                                          AppLocalizations.of(context)!
                                              .unableToGetAirQuality,
                                        ),
                                      )
                                    : Container();
                              }
                            }

                            AirQualityReading airQualityReading =
                                airQualityReadings.first.copyWith(
                              name: topCardName,
                              location: topCardLocation,
                            );
                            context
                                .read<LocationHistoryBloc>()
                                .add(AddLocationHistory(airQualityReading));

                            return AnimatedPadding(
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.easeInExpo,
                              padding: const EdgeInsets.only(top: 16),
                              child: CustomShowcaseWidget(
                                showcaseKey: _nearestLocationShowcaseKey,
                                descriptionHeight: screenSize.height * 0.17,
                                description: AppLocalizations.of(context)!
                                    .thisCardShowsTheAirQualityOfYourNearestLocation,
                                child: AnalyticsCard(
                                  airQualityReading,
                                  false,
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
                    BlocBuilder<KyaBloc, KyaState>(
                      builder: (context, state) {
                        List<Quiz> quizzes = state.quizzes;

                        if (quizzes.isEmpty) {
                          return const SizedBox();
                        }
                        Quiz displayedQuiz = quizzes.first;
                        return AnimatedPadding(
                          duration: const Duration(milliseconds: 500),
                          curve: Curves.easeInExpo,
                          padding: const EdgeInsets.only(top: 16),
                          child: QuizCard(displayedQuiz),
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

                        return BlocBuilder<NearbyLocationBloc,
                            NearbyLocationState>(
                          builder: (context, surroundingSitesState) {
                            List<AirQualityReading> surroundingSites = List.of(
                              surroundingSitesState.surroundingSites,
                            );
                            surroundingSites =
                                surroundingSites.take(5).toList();
                            surroundingSites.shuffle();
                            surroundingSites.addAll(state.airQualityReadings);

                            return ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: surroundingSites.length,
                              itemBuilder: (BuildContext context, int index) {
                                return (index == 0)
                                    ? AnimatedPadding(
                                        duration:
                                            const Duration(milliseconds: 500),
                                        curve: Curves.easeInExpo,
                                        padding: const EdgeInsets.only(top: 16),
                                        child: CustomShowcaseWidget(
                                          showcaseKey: _analyticsShowcaseKey,
                                          descriptionHeight:
                                              screenSize.height * 0.17,
                                          customize: ShowcaseOptions.up,
                                          showLine: false,
                                          description: AppLocalizations.of(
                                                  context)!
                                              .findTheAirQualityOfDifferentLocationsAcrossAfricaHere,
                                          child: AnalyticsCard(
                                            surroundingSites[index],
                                            false,
                                          ),
                                        ),
                                      )
                                    : AnimatedPadding(
                                        duration:
                                            const Duration(milliseconds: 500),
                                        curve: Curves.easeInExpo,
                                        padding: const EdgeInsets.only(top: 16),
                                        child: AnalyticsCard(
                                          surroundingSites[index],
                                          false,
                                        ),
                                      );
                              },
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
      ),
      floatingActionButton: FloatingActionButton(
        shape: const CircleBorder(),
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
        child: const Icon(Icons.search, color: Colors.white),
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
    _updateWidget();
    NotificationService.requestNotification(context, "dashboard");
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    super.didChangeAppLifecycleState(state);
    switch (state) {
      case AppLifecycleState.resumed:
        _refresh();
        await _checkNotificationsNavigator();
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.hidden:
      case AppLifecycleState.detached:
        break;
    }
  }

  Future<void> _checkNotificationsNavigator() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.reload();
    final List<String> notifsNavigator =
        prefs.getStringList("pushNotificationTarget") ?? [];

    if (notifsNavigator.isNotEmpty) {
      final subject = notifsNavigator[0];

      switch (subject) {
        case "daily_air_quality":
          try {
            await prefs.setStringList("pushNotificationTarget", []);
            final siteId = notifsNavigator[1];
            List<AirQualityReading> airQualityReadings =
                HiveService().getAirQualityReadings();

            AirQualityReading airQualityReading = airQualityReadings.firstWhere(
              (element) => element.placeId == siteId,
            );

            await navigateToInsights(context, airQualityReading);
          } catch (err) {
            await logException(err, null);
          }
          break;
      }
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
        if (position != null) {
          if (mounted) {
            context.read<NearbyLocationBloc>().add(
                  SearchLocationAirQuality(
                    newLocation: CurrentLocation.fromPosition(position),
                  ),
                );
          }
        }
      },
      onError: (error) {
        debugPrint('error listening to location updates : $error');
        logException(error, null);
      },
    );
  }

  void _refresh({bool refreshMap = true}) async {
    context.read<DashboardBloc>().add(const RefreshDashboard());
    context.read<NearbyLocationBloc>().add(const SearchLocationAirQuality());
    if (refreshMap) {
      context.read<MapBloc>().add(const InitializeMapState());
    }

    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
    _updateWidget();
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

    if (kyaExists) {
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

  Future<void> _updateWidget() async {
    try {
      await WidgetService.sendAndUpdate();
      HomeWidget.registerBackgroundCallback(backgroundCallback);
    } catch (e, stackTrace) {
      await logException(
        e,
        stackTrace,
      );
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
