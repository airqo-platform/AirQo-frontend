import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import 'dashboard_widgets.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({
    super.key,
  });

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  final AppService _appService = AppService();
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
      body: Container(
        padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 24),
        color: CustomColors.appBodyColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            BlocBuilder<AccountBloc, AccountState>(
              builder: (context, state) {
                final profile = state.profile;
                final greetings =
                    profile == null ? 'Hello' : profile.greetings();

                return AutoSizeText(
                  greetings,
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
            Expanded(
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final items = [
                      Text(
                        getDateTime(),
                        style: Theme.of(context).textTheme.caption?.copyWith(
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
                      const SizedBox(
                        height: 8,
                      ),
                      BlocListener<NearbyLocationBloc, NearbyLocationState>(
                        listener: (context, state) async {
                          if (state is NearbyLocationStateError) {
                            await showLocationErrorSnackBar(
                              context,
                              state.error,
                            ).whenComplete(() => context
                                .read<NearbyLocationBloc>()
                                .add(const CheckNearbyLocations()));
                          }
                        },
                        child: Container(),
                      ),
                      ValueListenableBuilder<Box<AirQualityReading>>(
                        valueListenable: Hive.box<AirQualityReading>(
                          HiveBox.nearByAirQualityReadings,
                        ).listenable(),
                        builder: (context, box, widget) {
                          final airQualityReadings = filterNearestLocations(
                            box.values.cast<AirQualityReading>().toList(),
                          );

                          if (airQualityReadings.isNotEmpty) {
                            final sortedReadings =
                                sortAirQualityReadingsByDistance(
                              airQualityReadings,
                            ).take(1).toList();

                            return Padding(
                              padding: const EdgeInsets.only(top: 16),
                              child: AnalyticsCard(
                                sortedReadings.first,
                                false,
                                false,
                              ),
                            );
                          }

                          return const SizedBox();
                        },
                      ),
                      BlocBuilder<AccountBloc, AccountState>(
                        builder: (context, state) {
                          final incompleteKya = state.kya.filterIncompleteKya();
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
                      const SizedBox(
                        height: 16,
                      ),
                      BlocBuilder<DashboardBloc, DashboardState>(
                        builder: (context, state) {
                          final airQualityReadings = state.airQualityReadings;
                          if (airQualityReadings.isEmpty) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          }

                          return ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: airQualityReadings.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Padding(
                                padding:
                                    EdgeInsets.only(top: index == 0 ? 0 : 16),
                                child: AnalyticsCard(
                                  AirQualityReading.duplicate(
                                    airQualityReadings[index],
                                  ),
                                  state.loading,
                                  false,
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ];

                    return items[index];
                  },
                  childCount: 9,
                ),
                onRefresh: _refresh,
              ),
            ),
          ],
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
    context.read<DashboardBloc>().add(const InitializeDashboard());
    _listenToStream();
  }

  void _listenToStream() {
    _timeSubscription = _timeStream.listen((_) async {
      context.read<DashboardBloc>().add(const UpdateGreetings());
      context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
      await _appService.refreshDashboard(context);
    });
    context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
  }

  Future<void> _refresh() async {
    context.read<DashboardBloc>().add(const InitializeDashboard());
    context.read<MapBloc>().add(const ShowAllSites());
    context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
    await _appService.refreshDashboard(context);
  }
}
