import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/analytics/analytics_widgets.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dashboard.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/exception.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../blocs/map/map_bloc.dart';
import '../../blocs/nearby_location/nearby_location_bloc.dart';
import '../../blocs/nearby_location/nearby_location_event.dart';
import '../../blocs/nearby_location/nearby_location_state.dart';
import '../../services/hive_service.dart';
import '../../services/native_api.dart';
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
  String _greetings = '';

  final AppService _appService = AppService();
  late SharedPreferences _preferences;

  final GlobalKey _favToolTipKey = GlobalKey();
  final GlobalKey _kyaToolTipKey = GlobalKey();
  bool _isRefreshing = false;

  List<Widget> _analyticsCards = [
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
    const AnalyticsCardLoading(),
  ];

  List<Widget> _dashBoardItems = [];
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
            AutoSizeText(
              _greetings,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: CustomTextStyle.headline7(context),
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
              height: 8,
            ),
            Expanded(
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return _dashBoardItems[index];
                  },
                  childCount: _dashBoardItems.length,
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
    _timeSubscription = _timeStream.listen((_) {
      _setGreetings();
    });
    _initialize();
  }

  void _updateAnalyticsCards(List<Widget> cards) {
    if (cards.isEmpty) return;

    final analyticsCards = <Widget>[
      cards[0],
      const SizedBox(
        height: 16,
      ),
      ValueListenableBuilder<Box>(
        valueListenable: Hive.box<Kya>(HiveBox.kya).listenable(),
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
      ValueListenableBuilder<Box>(
        valueListenable: Hive.box<Kya>(HiveBox.kya).listenable(),
        builder: (context, box, widget) {
          final incompleteKya = box.values
              .toList()
              .cast<Kya>()
              .where((element) => element.progress != -1)
              .toList();
          if (incompleteKya.isEmpty) {
            return const SizedBox();
          }

          return const SizedBox(
            height: 16,
          );
        },
      ),
    ];

    for (final card in cards) {
      if (card == cards[0]) continue;

      analyticsCards
        ..add(card)
        ..add(const SizedBox(
          height: 16,
        ));
    }

    setState(
      () {
        _analyticsCards = analyticsCards;
        _dashBoardItems = _initializeDashBoardItems();
      },
    );
  }

  void _refreshAnalyticsCards() async {
    final airQualityCards = <AnalyticsCard>[];
    final region = getNextDashboardRegion(_preferences);
    final regionAirQualityReadings =
        Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
            .values
            .where((element) => element.region == region)
            .toList()
          ..shuffle();

    for (final regionAirQualityReading in regionAirQualityReadings.take(8)) {
      airQualityCards.add(
        AnalyticsCard(
          AirQualityReading.duplicate(regionAirQualityReading),
          _isRefreshing,
          false,
        ),
      );
    }

    if (airQualityCards.isNotEmpty && mounted) {
      _updateAnalyticsCards(airQualityCards);
    }
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
    await _refresh();
  }

  Future<void> _initialize() async {
    _preferences = await SharedPreferences.getInstance();
    _updateAnalyticsCards(_analyticsCards);
    _setGreetings();
    _refreshAnalyticsCards();
  }

  List<Widget> _initializeDashBoardItems() {
    return [
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
      const SizedBox(
        height: 24,
      ),
      BlocBuilder<NearbyLocationBloc, NearbyLocationState>(
        builder: (context, state) {
          if (state is NearbyLocationStateSuccess) {
            return ValueListenableBuilder<Box>(
              valueListenable:
                  Hive.box<AirQualityReading>(HiveBox.nearByAirQualityReadings)
                      .listenable(),
              builder: (context, box, widget) {
                final airQualityReadings = filterNearestLocations(
                  box.values.cast<AirQualityReading>().toList(),
                );

                return AnalyticsCard(
                  airQualityReadings.first,
                  _isRefreshing,
                  false,
                );
              },
            );
          }

          if (state is SearchingNearbyLocationsState) {
            return const AnalyticsCardLoading();
          }

          if (state is NearbyLocationStateError) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              showSnackBar(context, Config.locationErrorMessage);
            });
          }

          return const SizedBox();
        },
      ),
      const SizedBox(
        height: 16,
      ),
      ..._analyticsCards,
      Visibility(
        visible: _analyticsCards.isEmpty,
        child: const CircularProgressIndicator(),
      ),
    ];
  }

  Future<void> _refresh() async {
    setState(() => _isRefreshing = true);

    try {
      await PermissionService.checkPermission(
        AppPermission.location,
        request: true,
      ).then((value) => context
          .read<NearbyLocationBloc>()
          .add(const SearchNearbyLocations()));
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    await _appService.refreshDashboard(context);
    context.read<MapBloc>().add(const ShowAllSites());
    _refreshAnalyticsCards();
    setState(() => _isRefreshing = false);
  }

  void _setGreetings() async {
    final greetings = await DateTime.now().getGreetings();
    if (mounted) {
      setState(
        () => _greetings = greetings,
      );
    }
  }
}
