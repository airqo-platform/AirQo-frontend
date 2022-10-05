import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/date.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/hive_service.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import '../favourite_places/favourite_places_page.dart';
import '../for_you_page.dart';
import '../kya/kya_title_page.dart';
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

  final Stream _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription _timeSubscription;

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
            BlocBuilder<DashboardBloc, DashboardState>(
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
                ValueListenableBuilder<Box>(
                  valueListenable:
                      Hive.box<FavouritePlace>(HiveBox.favouritePlaces)
                          .listenable(),
                  builder: (context, box, widget) {
                    final favouritePlaces =
                        box.values.cast<FavouritePlace>().take(3).toList();

                    final widgets = favouritePlacesWidgets(favouritePlaces);

                    return DashboardTopCard(
                      toolTipType: ToolTipType.favouritePlaces,
                      title: 'Favorites',
                      widgetKey: _favToolTipKey,
                      nextScreenClickHandler: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) {
                              return const FavouritePlaces();
                            },
                          ),
                        );
                      },
                      children: widgets,
                    );
                  },
                ),
                const SizedBox(
                  width: 16,
                ),
                ValueListenableBuilder<Box>(
                  valueListenable: Hive.box<Kya>(HiveBox.kya).listenable(),
                  builder: (context, box, widget) {
                    final completeKya = box.values
                        .cast<Kya>()
                        .where((element) => element.progress == -1)
                        .take(3)
                        .toList();

                    final widgets = completeKyaWidgets(completeKya);

                    return DashboardTopCard(
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
                      children: widgets,
                    );
                  },
                ),
              ],
            ),
            const SizedBox(
              height: 24,
            ),
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
            Expanded(
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final items = [
                      BlocConsumer<NearbyLocationBloc, NearbyLocationState>(
                          listener: (context, state) {
                        if (state is NearbyLocationStateError) {
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            showSnackBar(context, state.error.message);
                          });
                        }
                      }, builder: (context, state) {
                        if (state is NearbyLocationStateSuccess ||
                            state is SearchingNearbyLocationsState) {
                          return ValueListenableBuilder<Box>(
                            valueListenable: Hive.box<AirQualityReading>(
                                    HiveBox.nearByAirQualityReadings)
                                .listenable(),
                            builder: (context, box, widget) {
                              final airQualityReadings = filterNearestLocations(
                                box.values.cast<AirQualityReading>().toList(),
                              );

                              if (airQualityReadings.isNotEmpty) {
                                final sortedReadings =
                                    sortAirQualityReadingsByDistance(
                                            airQualityReadings)
                                        .take(1)
                                        .toList();

                                return Padding(
                                  padding: EdgeInsets.only(top: 24),
                                  child: AnalyticsCard(
                                    sortedReadings.first,
                                    false,
                                    false,
                                  ),
                                );
                              }

                              return const SizedBox();
                            },
                          );
                        }
                        return const SizedBox();
                      }),
                      ValueListenableBuilder<Box>(
                        valueListenable:
                            Hive.box<Kya>(HiveBox.kya).listenable(),
                        builder: (context, box, widget) {
                          final incompleteKya = box.values
                              .toList()
                              .cast<Kya>()
                              .where((element) => element.progress != -1)
                              .toList();
                          if (incompleteKya.isEmpty) {
                            return const SizedBox();
                          }

                          return DashboardKyaCard(
                            kyaClickCallBack: _handleKyaOnClick,
                            kya: incompleteKya[0],
                          );
                        },
                      ),
                      BlocBuilder<DashboardBloc, DashboardState>(
                        builder: (context, state) {
                          final airQualityReadings = state.airQualityReadings;
                          if (airQualityReadings.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.only(top: 16),
                              child: Center(
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }
                          return ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: airQualityReadings.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 16),
                                child: AnalyticsCard(
                                  AirQualityReading.duplicate(
                                      airQualityReadings[index]),
                                  state.loading,
                                  false,
                                ),
                              );
                            },
                          );
                        },
                      )
                    ];
                    return items[index];
                  },
                  childCount: 3,
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
      context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
      await _appService.refreshDashboard(context);
    });
  }

  Future<void> _handleKyaOnClick(Kya kya) async {
    if (kya.progress >= kya.lessons.length) {
      kya.progress = -1;
      await kya.saveKya();
    } else {
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) {
            return KyaTitlePage(kya);
          },
        ),
      );
    }
  }

  Future<void> _refresh() async {
    context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
    context.read<DashboardBloc>().add(const InitializeDashboard());
    context.read<MapBloc>().add(const ShowAllSites());
    await _appService.refreshDashboard(context);
  }
}
