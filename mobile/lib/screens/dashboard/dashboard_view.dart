import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import 'dashboard_widgets.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();

  final Stream<int> _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription<int> _timeSubscription;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DashboardTopBar(),
      body: AppSafeArea(
        horizontalPadding: 16.0,
        widget: Padding(
          padding: const EdgeInsets.only(top: 24),
          child: BlocBuilder<DashboardBloc, DashboardState>(
            builder: (context, state) {
              switch (state.blocStatus) {
                case DashboardStatus.initial:
                  return NoAirQualityDataWidget(
                    callBack: () {
                      _refresh();
                    },
                  );
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
                case DashboardStatus.processing:
                case DashboardStatus.loaded:
                  break;
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  AutoSizeText(
                    state.greetings,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline7(context),
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
                  BlocListener<NearbyLocationBloc, NearbyLocationState>(
                    listener: (context, state) async {
                      if (state.blocStatus == NearbyLocationStatus.error) {
                        await showLocationErrorSnackBar(
                          context,
                          state.error,
                        ).whenComplete(() => context
                            .read<NearbyLocationBloc>()
                            .add(const SearchLocationAirQuality()));
                      }
                    },
                    child: Container(),
                  ),
                  Expanded(
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
                                if (state.airQualityReadings.isEmpty) {
                                  return Container();
                                }

                                final AirQualityReading nearbyAirQuality = state
                                    .airQualityReadings
                                    .reduce((value, element) {
                                  if (value.distanceToReferenceSite.compareTo(
                                          element.distanceToReferenceSite) <
                                      0) {
                                    return value;
                                  }
                                  return element;
                                });

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
                          final i = [ListView.builder(
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
                          )];
                          return i[index];
                        },
                        childCount: 1,
                      ),
                      onRefresh: _refresh,
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timeSubscription.cancel();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _listenToStream();
  }

  void _listenToStream() {
    _timeSubscription = _timeStream.listen((_) async {
      context.read<DashboardBloc>().add(const RefreshDashboard());
      context.read<NearbyLocationBloc>().add(const SearchLocationAirQuality());
    });
  }

  Future<void> _refresh() async {
    context.read<DashboardBloc>().add(const RefreshDashboard());
    context.read<MapBloc>().add(const InitializeMapState());
    context.read<NearbyLocationBloc>().add(const SearchLocationAirQuality());
  }
}
