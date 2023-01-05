import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geolocator/geolocator.dart';

import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../search/search_page.dart';
import 'dashboard_widgets.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView>
    with WidgetsBindingObserver {
  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();

  final Stream<int> _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription<int> _timeSubscription;
  late StreamSubscription<ServiceStatus> _locationServiceStream;
  late StreamSubscription<Position> _locationPositionStream;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
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
              BlocBuilder<AccountBloc, AccountState>(
                builder: (context, state) {
                  final favouritePlaces = favouritePlacesWidgets(
                    state.favouritePlaces.take(3).toList(),
                  );
                  final kyaWidgets = completeKyaWidgets(
                    state.kya.filterCompleteKya().take(3).toList(),
                  );

                  return Row(
                    children: [
                      DashboardTopCard(
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
                      const SizedBox(
                        width: 16,
                      ),
                      DashboardTopCard(
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
                    ],
                  );
                },
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
                              getDateTime(),
                              style:
                                  Theme.of(context).textTheme.caption?.copyWith(
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
                                if (state.blocStatus ==
                                    NearbyLocationStatus.error) {
                                  switch (state.error) {
                                    case NearbyAirQualityError.locationDenied:
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 16),
                                        child: DashboardLocationButton(
                                          state.error,
                                        ),
                                      );
                                    case NearbyAirQualityError.locationDisabled:
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 16),
                                        child: DashboardLocationButton(
                                          state.error,
                                        ),
                                      );
                                    case NearbyAirQualityError.none:
                                    case NearbyAirQualityError
                                        .noNearbyAirQualityReadings:
                                      return Container();
                                  }
                                }

                                final AirQualityReading? nearbyAirQuality =
                                    state.locationAirQuality;
                                if (nearbyAirQuality == null) {
                                  return Container();
                                }

                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: AnalyticsCard(
                                    nearbyAirQuality,
                                    false,
                                  ),
                                );
                              },
                            ),
                            BlocBuilder<AccountBloc, AccountState>(
                              builder: (context, state) {
                                final incompleteKya =
                                    state.kya.filterIncompleteKya();
                                if (incompleteKya.isEmpty) {
                                  return const SizedBox();
                                }

                                final Kya kya = incompleteKya.reduce(
                                  (value, element) =>
                                      value.progress > element.progress
                                          ? value
                                          : element,
                                );

                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: DashboardKyaCard(kya),
                                );
                              },
                            ),
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: state.airQualityReadings.length,
                              itemBuilder: (BuildContext context, int index) {
                                return Padding(
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
                      onRefresh: () async {
                        _refresh();
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
}
