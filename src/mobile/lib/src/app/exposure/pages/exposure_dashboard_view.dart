import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/dashboard_header.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/location_selection_screen.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/services/exposure_place_readings.dart';
import 'package:airqo/src/app/exposure/widgets/declared_place_card.dart';
import 'package:airqo/src/app/exposure/widgets/entry_place_card.dart';
import 'package:airqo/src/app/exposure/widgets/place_card_tour.dart';
import 'package:airqo/src/meta/utils/colors.dart';

// ---------------------------------------------------------------------------
// Temporary default monitoring sites — replaced when the places API is wired.
// Icons: app nav home + profile "Places" glyph (AirQo Mobile-App / design system).
// ---------------------------------------------------------------------------
/// Empty-state floating chips (SVG, tinted in _FloatingTypeTag).
const String _kEmptyStateHomeIconAsset = 'assets/icons/home_icon.svg';
const String _kEmptyStateWorkIconAsset = 'assets/icons/place_type_work_tab.svg';


// ---------------------------------------------------------------------------

class ExposureDashboardView extends StatelessWidget {
  const ExposureDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => DeclaredPlacesCubit(),
      child: const _ExposureBody(),
    );
  }
}

class _ExposureBody extends StatefulWidget {
  const _ExposureBody();

  @override
  State<_ExposureBody> createState() => _ExposureBodyState();
}

class _ExposureBodyState extends State<_ExposureBody> {
  /// `true` = My Places, `false` = My Trips
  bool _myPlacesSelected = true;

  // ── Tour ──────────────────────────────────────────────────────────────────
  static const String _tourSeenKey = 'exposure_place_card_tour_seen';
  final GlobalKey _firstCardKey = GlobalKey();
  bool _showTour = false;

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
  }

  Future<void> _dismissTour() async {
    setState(() => _showTour = false);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_tourSeenKey, true);
  }

  void _maybeShowTour(int placesCount) {
    if (_showTour || placesCount < 1) return;
    SharedPreferences.getInstance().then((prefs) {
      final seen = prefs.getBool(_tourSeenKey) ?? false;
      if (!seen && mounted) setState(() => _showTour = true);
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
          final declaredIds = declared.map((p) => p.siteId).toSet();

          // Read favourites from DashboardBloc — already loaded, no extra API call.
          final dashState = context.watch<DashboardBloc>().state;
          final favourites = dashState is DashboardLoaded
              ? (dashState.userPreferences?.selectedSites ?? <SelectedSite>[])
              : <SelectedSite>[];
          final untagged = favourites.where((s) => !declaredIds.contains(s.id)).toList();

          final showEmptyMyPlaces =
              loaded != null && _myPlacesSelected && declared.isEmpty && untagged.isEmpty;

          /// Single "day of view" for cards (weekday vs weekend windows). Replace with
          /// calendar/date-picker state when historical days are supported.
          final dayOfView = DateTime.now();

          // Check whether to trigger the first-place tour.
          _maybeShowTour(declared.length);

          final scrollView = CustomScrollView(
            slivers: [
              const SliverToBoxAdapter(child: DashboardHeader()),
              SliverToBoxAdapter(
                child: _ExposureSubTabs(
                  myPlacesSelected: _myPlacesSelected,
                  onChanged: (myPlaces) {
                    setState(() => _myPlacesSelected = myPlaces);
                  },
                ),
              ),
              if (!_myPlacesSelected)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _MyTripsPlaceholder(isDark: Theme.of(context).brightness == Brightness.dark),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      ...declared.asMap().entries.map((entry) {
                        final i = entry.key;
                        final p = entry.value;
                        final readings = ExposurePlaceReadings.hourlyForSite(p.siteId, dayOfView);
                        final avg = ExposurePlaceReadings.averagePm25ForCard(
                          place: p,
                          readings: readings,
                          dayOfView: dayOfView,
                        );
                        return DeclaredPlaceCard(
                          // Attach key to first card so the tour can locate it.
                          key: i == 0 ? _firstCardKey : null,
                          place: p,
                          exposureLevel: avg != null ? ExposureLevelExtension.fromPm25(avg) : null,
                          hourlyReadings: readings,
                          dayOfView: dayOfView,
                        );
                      }),
                      ...untagged.map((s) => EntryPlaceCard(site: s)),
                      if (showEmptyMyPlaces)
                        const _EmptyState(),
                    ]),
                  ),
                ),
            ],
          );

          return Stack(
            children: [
              scrollView,
              if (_showTour)
                PlaceCardTour(
                  cardKey: _firstCardKey,
                  onDismiss: _dismissTour,
                ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// My Places / My Trips — matches dashboard pill styling (Figma exposure tab)
// ---------------------------------------------------------------------------

class _ExposureSubTabs extends StatelessWidget {
  final bool myPlacesSelected;
  final ValueChanged<bool> onChanged;

  const _ExposureSubTabs({
    required this.myPlacesSelected,
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
                label: 'My Places',
                selected: myPlacesSelected,
                isDark: isDark,
                onTap: () => onChanged(true),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _ExposurePill(
                label: 'My Trips',
                selected: !myPlacesSelected,
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
                : (isDark ? AppColors.darkHighlight : AppColors.dividerColorlight),
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

class _MyTripsPlaceholder extends StatelessWidget {
  final bool isDark;

  const _MyTripsPlaceholder({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.route_rounded,
            size: 48,
            color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor,
          ),
          const SizedBox(height: 16),
          Text(
            'My Trips',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : AppColors.boldHeadlineColor5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Trip-based exposure will show here.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              height: 1.4,
              color: isDark ? AppColors.secondaryHeadlineColor2 : AppColors.boldHeadlineColor,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  final bool hasDeclared, hasUntagged;
  const _SectionHeader({required this.hasDeclared, required this.hasUntagged});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final sub = (!hasDeclared && hasUntagged)
        ? 'Set up each place to start tracking your exposure.'
        : hasDeclared
            ? 'Based on your declared time windows.'
            : 'Add places to get started.';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'My Places',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : const Color(0xFF1A1D23),
          ),
        ),
        const SizedBox(height: 2),
        Text(sub, style: TextStyle(fontSize: 13, color: AppColors.boldHeadlineColor)),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state — Mobile App Figma (e.g. node 10249:103564): cards inset; Home /
// Work chips sit on the stack layer above cards with elevation (not inside
// the card column).
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  Future<void> _goAddFavourites(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const LocationSelectionScreen()),
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
                color: isDark ? AppColors.secondaryHeadlineColor2 : AppColors.boldHeadlineColor,
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
                onPressed: () => _goAddFavourites(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Add a place',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
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
            color: isDark ? AppColors.dividerColordark : const Color(0xFFE1E7EC),
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
