import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/dashboard/widgets/measurement_card_tour.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/dashboard/repository/country_repository.dart';
import 'package:airqo/src/app/dashboard/services/location_service_mananger.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/bloc/auth_bloc.dart';
import '../bloc/dashboard/dashboard_bloc.dart';
import '../widgets/dashboard_app_bar.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/dashboard_loading.dart';
import '../widgets/measurements_list.dart';
import '../widgets/my_places_view.dart';
import '../widgets/explore_countries_view.dart';
import '../widgets/nearby_view.dart';
import '../widgets/view_selector.dart';
import 'package:airqo/src/app/shared/services/notification_helper.dart';
import 'package:loggy/loggy.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> with UiLoggy {
  DashboardView currentView = DashboardView.nearYou;
  String? selectedCountry;
  String? userCountry;
  Timer? _backgroundRefreshTimer;
  final MeasurementCardTourKeys _cardTourKeys = MeasurementCardTourKeys();
  bool _showCardGesturesTour = false;

  @override
  void initState() {
    super.initState();

    context.read<DashboardBloc>().add(LoadDashboard());

    _getUserCountry();

    _backgroundRefreshTimer = Timer.periodic(Duration(minutes: 30), (_) {
      _silentBackgroundRefresh();
    });
  }

  @override
  void dispose() {
    _backgroundRefreshTimer?.cancel();
    super.dispose();
  }

  void _silentBackgroundRefresh() {
    if (context.read<DashboardBloc>().state is DashboardLoaded &&
        !(context.read<DashboardBloc>().state as DashboardLoaded).isOffline) {
      context.read<DashboardBloc>().add(SilentRefreshDashboard());
    }
  }

  Future<void> _getUserCountry() async {
    if (!mounted) return;
    final country = await LocationServiceManager().getUserCountry();
    if (country != null && mounted) {
      final match = CountryRepository.countries
          .where(
            (c) => c.countryName.toLowerCase() == country.toLowerCase(),
          )
          .firstOrNull;
      final canonicalName = match?.countryName;
      setState(() {
        userCountry = canonicalName ?? country;
        if (canonicalName != null && selectedCountry == null) {
          selectedCountry = canonicalName;
        }
      });
    }
  }

  void setView(DashboardView view, {String? country}) {
    setState(() {
      currentView = view;
      selectedCountry = country;
    });
  }

  Future<void> _dismissCardGesturesTour() async {
    setState(() => _showCardGesturesTour = false);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(measurementCardGesturesTourSeenKey, true);
  }

  void _maybeShowCardGesturesTour() {
    if (!kMeasurementCardGesturesTourEnabled || _showCardGesturesTour) return;
    SharedPreferences.getInstance().then((prefs) {
      final seen = prefs.getBool(measurementCardGesturesTourSeenKey) ?? false;
      if (!seen && mounted) setState(() => _showCardGesturesTour = true);
    });
  }

  void _scheduleCardGesturesTourCheck() {
    if (!kMeasurementCardGesturesTourEnabled) return;
    scheduleMeasurementCardTourReady(
      keys: _cardTourKeys,
      onReady: _maybeShowCardGesturesTour,
      isActive: () => mounted && !_showCardGesturesTour,
    );
  }

  MeasurementCardTourKeys? get _activeCardTourKeys =>
      kMeasurementCardGesturesTourEnabled ? _cardTourKeys : null;

  Future<void> _refreshDashboard() async {
    final completer = Completer<void>();

    final subscription = context.read<DashboardBloc>().stream.listen((state) {
      if (state is DashboardLoaded && state is! DashboardRefreshing) {
        completer.complete();
      } else if (state is DashboardLoadingError) {
        completer.completeError(state.message);
      }
    });

    context.read<DashboardBloc>().add(RefreshDashboard());

    try {
      await completer.future;
    } finally {
      await subscription.cancel();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final isGuest = authState is GuestUser;

    return Scaffold(
      appBar: DashboardAppBar(),
      body: BlocListener<DashboardBloc, DashboardState>(
        listenWhen: (previous, current) => current is DashboardLoaded,
        listener: (context, state) {
          _scheduleCardGesturesTourCheck();
          if (state is DashboardLoaded) {
            unawaited(NotificationHelper().onDashboardMeasurementsLoaded(
              state.response.measurements,
            ));
          }
        },
        child: Stack(
          children: [
            RefreshIndicator(
            onRefresh: _refreshDashboard,
            color: AppColors.primaryColor,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: DashboardHeader(),
                ),
                SliverToBoxAdapter(
                  child: BlocBuilder<DashboardBloc, DashboardState>(
                    builder: (context, state) {
                      Set<String>? activeCountries;
                      if (state is DashboardLoaded &&
                          state.response.measurements != null) {
                        activeCountries =
                            CountryRepository.extractActiveCountryNames(
                                state.response.measurements!);
                      }

                      return ViewSelector(
                        currentView: currentView,
                        selectedCountry: selectedCountry,
                        onViewChanged: setView,
                        isGuestUser: isGuest,
                        userCountry: userCountry,
                        activeCountries: activeCountries,
                      );
                    },
                  ),
                ),
                _buildContentForCurrentView(isGuest: isGuest),
              ],
            ),
          ),
          if (currentView == DashboardView.favorites && !isGuest)
            Positioned(
              right: 20,
              bottom: 20,
              child: FloatingActionButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      settings: const RouteSettings(name: 'location_selection'),
                      builder: (context) => LocationSelectionScreen(),
                    ),
                  ).then((value) {
                    if (value != null && context.mounted) {
                      context.read<DashboardBloc>().add(LoadDashboard());
                    }
                  });
                },
                backgroundColor: AppColors.primaryColor,
                child: const Icon(Icons.add, color: Colors.white),
              ),
            ),
          if (kMeasurementCardGesturesTourEnabled && _showCardGesturesTour)
            MeasurementCardGesturesTour(
              tourKeys: _cardTourKeys,
              steps: buildMeasurementCardGesturesTourSteps(),
              onDismiss: _dismissCardGesturesTour,
            ),
        ],
        ),
      ),
    );
  }

  Widget _buildContentForCurrentView({bool isGuest = false}) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardLoading && state.previousState == null) {
          return const SliverToBoxAdapter(child: DashboardLoadingPage());
        }

        if (state is DashboardLoadingError && !state.hasCache) {
          final isOffline = state.isOffline;
          return SliverFillRemaining(
            hasScrollBody: false,
            child: EmptyStateView(
              icon: isOffline
                  ? SystemGlyph.offline(context)
                  : SystemGlyph.error(context),
              title: isOffline
                  ? "Couldn't connect to the internet"
                  : "Couldn't load air quality data",
              message: isOffline
                  ? "Please check your connection and try again"
                  : "Something went wrong. Please try again later",
              actionLabel: 'Try Again',
              onAction: () {
                context
                    .read<DashboardBloc>()
                    .add(LoadDashboard(forceRefresh: true));
              },
            ),
          );
        }

        final DashboardLoaded? loaded = switch (state) {
          DashboardLoaded s => s,
          DashboardLoading s => s.previousState,
          DashboardAuthenticationError s => s.previousState,
          _ => null,
        };

        if (loaded != null) {
          return _buildLoadedView(loaded, isGuest: isGuest);
        }

        return const SliverToBoxAdapter(child: DashboardLoadingPage());
      },
    );
  }

  Widget _buildLoadedView(DashboardLoaded state, {bool isGuest = false}) {
    void retry() {
      context.read<DashboardBloc>().add(LoadDashboard(forceRefresh: true));
    }

    switch (currentView) {
      case DashboardView.favorites:
        loggy.info(
            'Dashboard loaded with preferences: ${state.userPreferences != null}');
        if (state.userPreferences != null) {
          loggy.info(
              'User has ${state.selectedLocationIds.length} selected locations');
        }

        return SliverToBoxAdapter(
          child: MyPlacesView(
            userPreferences: state.userPreferences,
            prefsLoadFailed: state.prefsLoadFailed,
            tourKeys: _activeCardTourKeys,
            onTourTargetReady:
                kMeasurementCardGesturesTourEnabled
                    ? _maybeShowCardGesturesTour
                    : null,
          ),
        );

      case DashboardView.nearYou:
        return SliverToBoxAdapter(
          child: NearbyView(
            onNavigateToFavorites: () =>
                setView(DashboardView.favorites),
            onExploreCities: isGuest
                ? () => setView(DashboardView.explore)
                : null,
            tourKeys: _activeCardTourKeys,
            onTourTargetReady:
                kMeasurementCardGesturesTourEnabled
                    ? _maybeShowCardGesturesTour
                    : null,
          ),
        );

      case DashboardView.country:
        final countryMeasurements =
            (state.response.measurements ?? [])
                .where((m) => m.siteDetails?.country == selectedCountry)
                .toList();

        return MeasurementsList(
          measurements: countryMeasurements,
          tourKeys: _activeCardTourKeys,
          onTourTargetReady:
              kMeasurementCardGesturesTourEnabled
                  ? _maybeShowCardGesturesTour
                  : null,
          onRetry: retry,
        );

      case DashboardView.explore:
        return SliverToBoxAdapter(
          child: ExploreCountriesView(
            measurements: state.response.measurements ?? [],
            onRetry: retry,
          ),
        );

      default:
        return MeasurementsList(
          measurements:
              (state.response.measurements ?? []).take(5).toList(),
          tourKeys: _activeCardTourKeys,
          onTourTargetReady:
              kMeasurementCardGesturesTourEnabled
                  ? _maybeShowCardGesturesTour
                  : null,
          onRetry: retry,
        );
    }
  }
}
