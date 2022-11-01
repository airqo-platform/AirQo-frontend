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
import 'package:shared_preferences/shared_preferences.dart';
import 'package:showcaseview/showcaseview.dart';

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
  final GlobalKey _favoritesShowcaseKey = GlobalKey();
  final GlobalKey _forYouShowcaseKey = GlobalKey();
  final GlobalKey _kyaShowcaseKey = GlobalKey();
  final GlobalKey _analyticsShowcaseKey = GlobalKey();
  final GlobalKey _nearestLocationShowcaseKey = GlobalKey();
  BuildContext? myContext;

  final Stream _timeStream =
      Stream.periodic(const Duration(minutes: 5), (int count) {
    return count;
  });
  late StreamSubscription _timeSubscription;
  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      ShowCaseWidget.of(context).startShowCase([
        _favoritesShowcaseKey,
        _forYouShowcaseKey,
        _kyaShowcaseKey,
        _analyticsShowcaseKey,
      ]);
    });
  }

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

                    return Showcase(
                      key: _favoritesShowcaseKey,
                      description: 'These are your favorite places',
                      child: DashboardTopCard(
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
                      ),
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

                    return Showcase(
                        key: _forYouShowcaseKey,
                      description: 'This is content speacilized for you.',
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
                          children: widgets,
                      ),
                    );
                  },
                ),
              ],
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
                      ValueListenableBuilder<Box>(
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
                              child: Showcase(
                                key: _nearestLocationShowcaseKey,
                                description:
                                    'This shows the airquality of your nearest location',
                                child: AnalyticsCard(
                                  sortedReadings.first,
                                  false,
                                  false,
                                ),
                              ),
                            );
                          }

                          return const SizedBox();
                        },
                      ),
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

                          return Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: Showcase(
                              key: _kyaShowcaseKey,
                              description:
                                  'This is your current set of Know Your Air lessons',
                              child: DashboardKyaCard(
                                kyaClickCallBack: _handleKyaOnClick,
                                kya: incompleteKya[0],
                              ),
                            ),
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
                              if (index == 0) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 0),
                                  child: Showcase(
                                      key: _analyticsShowcaseKey,
                                      description:
                                          'This shows airquality of other different locations across your country.',
                                      child: AnalyticsCard(
                                        AirQualityReading.duplicate(
                                          airQualityReadings[index],
                                        ),
                                        state.loading,
                                        false,
                                    ),
                                  ),
                                );
                              } else {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 16),
                                  child: AnalyticsCard(
                                    AirQualityReading.duplicate(
                                      airQualityReadings[index],
                                    ),
                                    state.loading,
                                    false,
                                  ),
                                );
                              }
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
    WidgetsBinding.instance.addPostFrameCallback((_) => showcasetoggle());
  }

  void _listenToStream() {
    _timeSubscription = _timeStream.listen((_) async {
      context.read<DashboardBloc>().add(const UpdateGreetings());
      context.read<NearbyLocationBloc>().add(const CheckNearbyLocations());
      await _appService.refreshDashboard(context);
    });
    context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
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
    context.read<DashboardBloc>().add(const InitializeDashboard());
    context.read<MapBloc>().add(const ShowAllSites());
    context.read<NearbyLocationBloc>().add(const SearchNearbyLocations());
    await _appService.refreshDashboard(context);
  }

  Future<void> showcasetoggle() async {
    final prefs = await SharedPreferences.getInstance();
    var showcase = prefs.getBool('showcase');
    if (showcase == true) {
      _startShowcase();
    }
  }
}
