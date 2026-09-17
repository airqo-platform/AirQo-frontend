import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_header.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/repository/declared_places_repository_impl.dart';
import 'package:airqo/src/app/exposure/repository/hourly_readings_repository_impl.dart';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/services/exposure_place_readings.dart';
import 'package:airqo/src/app/exposure/utils/exposure_load_status.dart';
import 'package:airqo/src/app/exposure/widgets/declared_place_card.dart';
import 'package:airqo/src/app/exposure/widgets/entry_place_card.dart';
import 'package:airqo/src/app/exposure/widgets/my_trips_view.dart';
import 'package:airqo/src/app/exposure/widgets/place_card_tour.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/map/utils/map_measurement_filter.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/shared/utils/saved_places_content_status.dart';
import 'package:airqo/src/meta/utils/colors.dart';

// ---------------------------------------------------------------------------
// Temporary default monitoring sites — replaced when the places API is wired.
// Icons: app nav home + profile "Places" glyph (AirQo Mobile-App / design system).
// ---------------------------------------------------------------------------
/// Empty-state floating chips (SVG, tinted in _FloatingTypeTag).
const String _kEmptyStateHomeIconAsset = 'assets/icons/home_icon.svg';
const String _kEmptyStateWorkIconAsset = 'assets/icons/place_type_work_tab.svg';

// ---------------------------------------------------------------------------

@visibleForTesting
List<SelectedSite> favouritesFromDashboardState(DashboardState state) {
  final DashboardLoaded? loaded = switch (state) {
    DashboardLoaded s => s,
    DashboardLoading(:final previousState) => previousState,
    DashboardAuthenticationError(:final previousState) => previousState,
    _ => null,
  };
  return List<SelectedSite>.from(
    loaded?.userPreferences?.selectedSites ?? const <SelectedSite>[],
  );
}

@visibleForTesting
bool dashboardFavoritesAreResolved(DashboardState state) => switch (state) {
      DashboardLoaded() => true,
      DashboardLoading(previousState: != null) => true,
      DashboardAuthenticationError() => true,
      _ => false,
    };

@visibleForTesting
class ExposureFavoriteItem {
  const ExposureFavoriteItem({required this.site, this.declaredPlace});

  final SelectedSite site;
  final DeclaredPlace? declaredPlace;
}

/// Keeps Exposure in exactly the same order as the dashboard Favorites tab.
/// Exposure-only metadata is layered onto a favorite when it exists; stale
/// cached declarations that are no longer favorites are intentionally omitted.
@visibleForTesting
List<ExposureFavoriteItem> exposureFavoritesForDashboard(
  List<SelectedSite> favorites,
  List<DeclaredPlace> declaredPlaces,
) {
  final declaredBySiteId = {
    for (final place in declaredPlaces) place.siteId: place,
  };
  return [
    for (final site in favorites)
      ExposureFavoriteItem(
        site: site,
        declaredPlace: declaredBySiteId[site.id]?.copyWith(
          // Dashboard Favorite cards use searchName as their visible title.
          // Keep Exposure identical while retaining the canonical monitor
          // name separately for hourly API response matching.
          locationName:
              site.searchName.trim().isEmpty ? site.name : site.searchName,
          monitorName: site.name,
          city: site.name,
        ),
      ),
  ];
}

@visibleForTesting
List<TripNetworkSite> tripNetworkSitesFromMapState(
  MapState state,
  List<SelectedSite> favorites,
) {
  final MapLoaded? loaded = switch (state) {
    MapLoaded s => s,
    MapLoading(:final previousState) => previousState,
    _ => null,
  };
  final favoriteIds = favorites.map((site) => site.id).toSet();
  final sites = <String, TripNetworkSite>{};
  final mapMeasurements = loaded?.response.validMeasurements ?? const [];
  for (final measurement in mapMeasurements.where(isAirQoNetworkMeasurement)) {
    final details = measurement.siteDetails!;
    final id = measurement.siteId ?? details.id;
    final latitude =
        details.approximateLatitude ?? details.siteCategory?.latitude;
    final longitude =
        details.approximateLongitude ?? details.siteCategory?.longitude;
    final country = details.country?.trim() ?? '';
    if (id == null ||
        id.isEmpty ||
        latitude == null ||
        longitude == null ||
        country.isEmpty) {
      continue;
    }
    sites[id] = TripNetworkSite(
      site: SelectedSite(
        id: id,
        name: details.searchName ?? details.name ?? 'AirQo location',
        searchName: details.locationName ??
            details.formattedName ??
            details.city ??
            country,
        latitude: latitude,
        longitude: longitude,
      ),
      country: country,
      isFavorite: favoriteIds.contains(id),
    );
  }
  return sites.values.toList();
}

class ExposureDashboardView extends StatelessWidget {
  const ExposureDashboardView({super.key, this.isActive = true});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DeclaredPlacesCubit(
        placesRepo: DeclaredPlacesRepositoryImpl(),
        readingsRepo: HourlyReadingsRepositoryImpl(),
      ),
      child: _ExposureBody(isActive: isActive),
    );
  }
}

class _ExposureBody extends StatefulWidget {
  const _ExposureBody({required this.isActive});

  final bool isActive;

  @override
  State<_ExposureBody> createState() => _ExposureBodyState();
}

class _ExposureBodyState extends State<_ExposureBody> {
  /// `true` = Favorites, `false` = Trips
  bool _favoritesSelected = true;
  final ScrollController _scrollController = ScrollController();
  final ScrollController _tripsScrollController = ScrollController();

  // ── Tour ──────────────────────────────────────────────────────────────────
  static const String _tourSeenKey = 'exposure_favorite_card_tour_seen_v4';
  static const String _introDismissedKey =
      'exposure_favorites_intro_dismissed_v1';
  final GlobalKey _firstCardKey = GlobalKey();
  bool _showTour = false;
  bool _showIntro = false;
  OverlayEntry? _tourOverlay;

  @override
  void initState() {
    super.initState();
    // Exposure lives in an IndexedStack offstage tab until first open; ensure
    // profile loads so "Hi, {name}" appears like on Home (UserBloc may still be
    // initial when this tab is first built).
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final auth = context.read<AuthBloc>().state;
      if (auth is! AuthLoaded) return;
      final userBloc = context.read<UserBloc>();
      final s = userBloc.state;
      if (s is UserInitial || s is UserLoadingError) {
        userBloc.add(LoadUser());
      }
    });
    _loadIntroPreference();
  }

  @override
  void dispose() {
    _tourOverlay?.remove();
    _tourOverlay = null;
    _scrollController.dispose();
    _tripsScrollController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant _ExposureBody oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isActive && !widget.isActive) {
      _tourOverlay?.remove();
      _tourOverlay = null;
      _showTour = false;
    }
  }

  void _selectSection(bool favorites) {
    if (_favoritesSelected == favorites) return;
    setState(() => _favoritesSelected = favorites);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _scrollController.hasClients) {
        _scrollController.jumpTo(0);
      }
      if (mounted && !favorites && _tripsScrollController.hasClients) {
        _tripsScrollController.jumpTo(0);
      }
    });
  }

  Future<void> _loadIntroPreference() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _showIntro = !(prefs.getBool(_introDismissedKey) ?? false);
    });
  }

  Future<void> _dismissIntro() async {
    setState(() => _showIntro = false);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_introDismissedKey, true);
  }

  Future<void> _refreshFavorites() async {
    context.read<DashboardBloc>().add(
          const LoadUserPreferences(forceRefresh: true),
        );
    await context.read<DeclaredPlacesCubit>().reload(
          forceRefresh: true,
          showLoader: false,
        );
  }

  Future<void> _dismissTour() async {
    _tourOverlay?.remove();
    _tourOverlay = null;
    setState(() => _showTour = false);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_tourSeenKey, true);
  }

  void _maybeShowTour(int placesCount) {
    if (!widget.isActive || _showTour || placesCount < 1) return;
    SharedPreferences.getInstance().then((prefs) {
      final seen = prefs.getBool(_tourSeenKey) ?? false;
      if (!seen && mounted && widget.isActive) {
        setState(() => _showTour = true);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted || !_showTour || _tourOverlay != null) return;
          _tourOverlay = OverlayEntry(
            builder: (_) => Positioned.fill(
              child: PlaceCardTour(
                cardKey: _firstCardKey,
                onDismiss: _dismissTour,
              ),
            ),
          );
          Overlay.of(context, rootOverlay: true).insert(_tourOverlay!);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: const DashboardAppBar(),
      body: BlocBuilder<DeclaredPlacesCubit, DeclaredPlacesState>(
        builder: (ctx, placeState) {
          final loaded = placeState is DeclaredPlacesLoaded ? placeState : null;
          final declared = loaded?.places ?? <DeclaredPlace>[];

          // Read favourites from DashboardBloc — already loaded, no extra API call.
          final dashState = context.watch<DashboardBloc>().state;
          final favourites = favouritesFromDashboardState(dashState);
          final favoritesResolved = dashboardFavoritesAreResolved(dashState);
          final favoriteItems = exposureFavoritesForDashboard(
            favourites,
            declared,
          );
          final declaredFallback =
              favoritesResolved ? const <DeclaredPlace>[] : declared;
          final visibleDeclaredCount = favoritesResolved
              ? favoriteItems.where((item) => item.declaredPlace != null).length
              : declaredFallback.length;
          final firstDeclaredSiteId = favoriteItems
              .where((item) => item.declaredPlace != null)
              .firstOrNull
              ?.declaredPlace
              ?.siteId;
          final mapState = context.watch<MapBloc>().state;
          final networkSites =
              tripNetworkSitesFromMapState(mapState, favourites);

          final isDashboardFirstLoad = dashState is DashboardInitial ||
              (dashState is DashboardLoading &&
                  dashState.previousState == null);
          final prefsLoadFailed =
              dashState is DashboardLoaded && dashState.prefsLoadFailed;
          final placesLoadFailed = placeState is DeclaredPlacesError;
          final savedPlacesFailed = placesLoadFailed || prefsLoadFailed;

          final showPlacesLoader = shouldShowExposurePlacesLoader(
            isPlacesInitial: placeState is DeclaredPlacesInitial,
            isDashboardFirstLoad: isDashboardFirstLoad,
            hasDeclaredPlaces: declared.isNotEmpty,
            placesLoadFailed: savedPlacesFailed,
          );

          final placesStatus = resolveSavedPlacesContent(
            isLoading: showPlacesLoader,
            loadFailed: savedPlacesFailed,
            hasPlaces: favoritesResolved
                ? favoriteItems.isNotEmpty
                : declaredFallback.isNotEmpty,
          );

          final showEmptyFavorites = _favoritesSelected &&
              placesStatus == SavedPlacesContentStatus.empty;
          final isGuest = context.watch<AuthBloc>().state is GuestUser;

          /// Single "day of view" for cards (weekday vs weekend windows). Replace with
          /// calendar/date-picker state when historical days are supported.
          final dayOfView = DateTime.now();

          // Check whether to trigger the first-place tour.
          _maybeShowTour(visibleDeclaredCount);

          final scrollView = CustomScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              const SliverToBoxAdapter(child: DashboardHeader()),
              SliverPersistentHeader(
                pinned: true,
                delegate: _ExposureTabsHeaderDelegate(
                  favoritesSelected: _favoritesSelected,
                  onChanged: _selectSection,
                  backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                ),
              ),
              if (!_favoritesSelected)
                SliverFillRemaining(
                  child: MyTripsView(
                    scrollController: _tripsScrollController,
                    savedSites: favourites,
                    networkSites: networkSites,
                    isDashboardLoading: mapState is MapInitial ||
                        (mapState is MapLoading &&
                            mapState.previousState == null),
                    hasDashboardError: mapState is MapLoadingError,
                    onRetry: () {
                      context.read<MapBloc>().add(LoadMap(forceRefresh: true));
                    },
                    onAddPlaces: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          settings:
                              const RouteSettings(name: 'location_selection'),
                          builder: (_) => LocationSelectionScreen(),
                        ),
                      );
                    },
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      if (showPlacesLoader)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 48),
                          child: Center(
                            child: CircularProgressIndicator(),
                          ),
                        )
                      else if (placesStatus == SavedPlacesContentStatus.error)
                        EmptyStateView(
                          icon: SystemGlyph.error(context),
                          title: 'Unable to load places',
                          message:
                              "We couldn't load your places right now. Please try again.",
                          actionLabel: 'Try Again',
                          onAction: () {
                            context.read<DeclaredPlacesCubit>().reload(
                                  forceRefresh: true,
                                );
                            context.read<DashboardBloc>().add(
                                  const LoadUserPreferences(forceRefresh: true),
                                );
                          },
                        )
                      else ...[
                        if (_showIntro &&
                            (favoriteItems.isNotEmpty ||
                                declaredFallback.isNotEmpty))
                          _ExposureIntroCard(onDismiss: _dismissIntro),
                        ...favoriteItems.map((item) {
                          final p = item.declaredPlace;
                          if (p == null) {
                            return EntryPlaceCard(site: item.site);
                          }
                          final readings = loaded?.readings[p.siteId] ??
                              List.generate(24, (h) => HourlyReading(hour: h));
                          final avg = ExposurePlaceReadings.averagePm25ForCard(
                            place: p,
                            readings: readings,
                            dayOfView: dayOfView,
                          );
                          return DeclaredPlaceCard(
                            key: p.siteId == firstDeclaredSiteId
                                ? _firstCardKey
                                : null,
                            place: p,
                            exposureLevel: avg != null
                                ? ExposureLevelExtension.fromPm25(avg)
                                : null,
                            hourlyReadings: readings,
                            dayOfView: dayOfView,
                          );
                        }),
                        ...declaredFallback.asMap().entries.map((entry) {
                          final p = entry.value;
                          final readings = loaded?.readings[p.siteId] ??
                              List.generate(24, (h) => HourlyReading(hour: h));
                          final avg = ExposurePlaceReadings.averagePm25ForCard(
                            place: p,
                            readings: readings,
                            dayOfView: dayOfView,
                          );
                          return DeclaredPlaceCard(
                            key: entry.key == 0 ? _firstCardKey : null,
                            place: p,
                            exposureLevel: avg != null
                                ? ExposureLevelExtension.fromPm25(avg)
                                : null,
                            hourlyReadings: readings,
                            dayOfView: dayOfView,
                          );
                        }),
                        if (showEmptyFavorites) _EmptyState(isGuest: isGuest),
                      ],
                    ]),
                  ),
                ),
            ],
          );

          return _favoritesSelected
              ? RefreshIndicator(
                  onRefresh: _refreshFavorites,
                  color: AppColors.primaryColor,
                  backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                  child: scrollView,
                )
              : scrollView;
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Favorites / Trips — matches dashboard pill styling (Figma exposure tab)
// ---------------------------------------------------------------------------

class _ExposureSubTabs extends StatelessWidget {
  final bool favoritesSelected;
  final ValueChanged<bool> onChanged;

  const _ExposureSubTabs({
    required this.favoritesSelected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: SizedBox(
        height: 44,
        child: Row(
          children: [
            Expanded(
              child: _ExposurePill(
                label: 'Favorites',
                selected: favoritesSelected,
                isDark: isDark,
                onTap: () => onChanged(true),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _ExposurePill(
                label: 'Trips',
                selected: !favoritesSelected,
                isDark: isDark,
                onTap: () => onChanged(false),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExposureTabsHeaderDelegate extends SliverPersistentHeaderDelegate {
  const _ExposureTabsHeaderDelegate({
    required this.favoritesSelected,
    required this.onChanged,
    required this.backgroundColor,
  });

  final bool favoritesSelected;
  final ValueChanged<bool> onChanged;
  final Color backgroundColor;

  static const double _height = 52;

  @override
  double get minExtent => _height;

  @override
  double get maxExtent => _height;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return ColoredBox(
      color: backgroundColor,
      child: _ExposureSubTabs(
        favoritesSelected: favoritesSelected,
        onChanged: onChanged,
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _ExposureTabsHeaderDelegate oldDelegate) {
    return favoritesSelected != oldDelegate.favoritesSelected ||
        backgroundColor != oldDelegate.backgroundColor ||
        onChanged != oldDelegate.onChanged;
  }
}

class _ExposurePill extends StatelessWidget {
  final String label;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  const _ExposurePill({
    required this.label,
    required this.selected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(30),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primaryColor
                : (isDark
                    ? AppColors.darkHighlight
                    : AppColors.dividerColorlight),
            borderRadius: BorderRadius.circular(30),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
              color: selected
                  ? Colors.white
                  : (isDark ? Colors.white : Colors.black87),
            ),
          ),
        ),
      ),
    );
  }
}

class _ExposureIntroCard extends StatelessWidget {
  const _ExposureIntroCard({required this.onDismiss});

  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Container(
      key: const ValueKey('exposure-favorites-intro'),
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.fromLTRB(16, 14, 8, 14),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryColor.withValues(alpha: 0.22),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primaryColor.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(10),
            ),
            child: AqBarChartSquare01(
              size: 20,
              color: AppColors.primaryColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Favorites power Exposure',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Add a label and your usual hours to understand the air you breathe there. Tap a card or its arrow for hourly readings.',
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.45,
                    color: bodyColor,
                  ),
                ),
              ],
            ),
          ),
          Semantics(
            button: true,
            label: 'Dismiss exposure introduction',
            child: IconButton(
              tooltip: 'Dismiss',
              onPressed: onDismiss,
              icon: AqXClose(size: 18, color: bodyColor),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state — Mobile App Figma (e.g. node 10249:103564): cards inset; Home /
// Work chips sit on the stack layer above cards with elevation (not inside
// the card column).
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.isGuest});

  final bool isGuest;

  Future<void> _goLogIn(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        settings: const RouteSettings(name: 'login'),
        builder: (_) => const LoginPage(),
      ),
    );
  }

  Future<void> _goAddFavourites(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
          settings: const RouteSettings(name: 'location_selection'),
          builder: (_) => LocationSelectionScreen()),
    );
    // Reload declared places so newly added favourites appear immediately.
    if (context.mounted) {
      context.read<DeclaredPlacesCubit>().reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Column(
        children: [
          // Full-width stack: chips align to screen margins; cards are inset.
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(height: 8),
                      _PreviewCard(
                        name: 'Wandegeya',
                        showBadge: true,
                        isDark: isDark,
                        compact: false,
                      ),
                      const SizedBox(height: 8),
                      Opacity(
                        opacity: 0.42,
                        child: _PreviewCard(
                          name: 'Kawempe',
                          showBadge: false,
                          isDark: isDark,
                          compact: true,
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  top: 48,
                  right: 0,
                  child: _FloatingTypeTag(
                    assetPath: _kEmptyStateHomeIconAsset,
                    label: 'Home',
                    isActive: true,
                    isDark: isDark,
                  ),
                ),
                Positioned(
                  top: 86,
                  left: 0,
                  child: _FloatingTypeTag(
                    assetPath: _kEmptyStateWorkIconAsset,
                    label: 'Work',
                    isActive: false,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // ── Headline ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Know the air at every stop',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                height: 1.25,
                color: isDark ? Colors.white : AppColors.boldHeadlineColor5,
              ),
            ),
          ),
          const SizedBox(height: 8),

          // ── Subtitle ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Text(
              "Tag your home, work, gym, and more. We'll show you when air quality is cleanest across your week.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w400,
                color: isDark
                    ? AppColors.secondaryHeadlineColor2
                    : AppColors.boldHeadlineColor,
                height: 1.4,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── CTA Button ───────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () =>
                    isGuest ? _goLogIn(context) : _goAddFavourites(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  isGuest ? 'Log in' : 'Add a place',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Preview skeleton card (used in empty state illustration)
// ---------------------------------------------------------------------------

class _PreviewCard extends StatelessWidget {
  final String name;
  final bool showBadge;
  final bool isDark;

  /// Shorter card for the second row (Kawempe) to keep CTA above the fold.
  final bool compact;

  const _PreviewCard({
    required this.name,
    required this.showBadge,
    required this.isDark,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final radius = compact ? 10.0 : 12.0;
    final topPad = compact
        ? const EdgeInsets.fromLTRB(12, 8, 12, 8)
        : const EdgeInsets.fromLTRB(16, 12, 16, 12);
    final nameSize = compact ? 15.0 : 18.0;
    final chip = compact ? 20.0 : 24.0;

    // Theme-aware colours — mirror the real DeclaredPlaceCard approach.
    final cardBg = isDark ? Theme.of(context).cardColor : Colors.white;
    final borderColor =
        isDark ? AppColors.dividerColordark : const Color(0xFFE1E7EC);
    // Skeleton bar / placeholder colour — uses the inset "sink" background in
    // dark mode (same as icon backgrounds on the real cards).
    final skeletonColor =
        isDark ? AppColors.darkThemeBackground : const Color(0xFFF0F4F8);
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: topPad,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: chip,
                      height: chip,
                      decoration: BoxDecoration(
                        color: skeletonColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    SizedBox(width: compact ? 4 : 6),
                    Container(
                      width: compact ? 32 : 40,
                      height: compact ? 6 : 8,
                      decoration: BoxDecoration(
                        color: skeletonColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      width: compact ? 16 : 20,
                      height: compact ? 16 : 20,
                      decoration: BoxDecoration(
                        color: skeletonColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: compact ? 6 : 10),
                Text(
                  name,
                  style: TextStyle(
                    fontSize: nameSize,
                    fontWeight: FontWeight.w700,
                    color: nameColor,
                  ),
                ),
                if (!compact) ...[
                  const SizedBox(height: 6),
                  Container(
                    width: 120,
                    height: 10,
                    decoration: BoxDecoration(
                      color: skeletonColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ] else ...[
                  const SizedBox(height: 4),
                  Container(
                    width: 88,
                    height: 6,
                    decoration: BoxDecoration(
                      color: skeletonColor,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: borderColor),
          Padding(
            padding: EdgeInsets.fromLTRB(
              compact ? 12 : 16,
              compact ? 6 : 10,
              compact ? 12 : 16,
              compact ? 8 : 14,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (showBadge) ...[
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: compact ? 10 : 14,
                      vertical: compact ? 3 : 4,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDFF9E5),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      'Low',
                      style: TextStyle(
                        fontSize: compact ? 11 : 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF34C759),
                      ),
                    ),
                  ),
                  SizedBox(height: compact ? 6 : 10),
                ],
                Container(
                  width: double.infinity,
                  height: compact ? 6 : 10,
                  decoration: BoxDecoration(
                    color: skeletonColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                if (!compact) ...[
                  const SizedBox(height: 6),
                  Container(
                    width: 160,
                    height: 8,
                    decoration: BoxDecoration(
                      color: skeletonColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Floating type-tag button (used in empty state illustration)
// ---------------------------------------------------------------------------

class _FloatingTypeTag extends StatelessWidget {
  final String assetPath;
  final String label;
  final bool isActive;
  final bool isDark;

  const _FloatingTypeTag({
    required this.assetPath,
    required this.label,
    required this.isActive,
    required this.isDark,
  });

  static const double _iconSize = 18;

  @override
  Widget build(BuildContext context) {
    final bg = isActive
        ? AppColors.primaryColor
        : (isDark ? const Color(0xFF2E2F33) : const Color(0xFFF4F6F8));
    final fg = isActive
        ? Colors.white
        : (isDark ? Colors.white70 : const Color(0xFF1A1D23));

    final borderSide = isActive
        ? BorderSide.none
        : BorderSide(
            color:
                isDark ? AppColors.dividerColordark : const Color(0xFFE1E7EC),
          );

    return Material(
      color: bg,
      elevation: isActive ? 5 : 4,
      shadowColor: Colors.black.withValues(alpha: 0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: borderSide,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SvgPicture.asset(
              assetPath,
              width: _iconSize,
              height: _iconSize,
              colorFilter: ColorFilter.mode(fg, BlendMode.srcIn),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
