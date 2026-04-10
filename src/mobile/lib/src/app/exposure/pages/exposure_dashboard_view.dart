import 'dart:math' show Random;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/declared_place_card.dart';
import 'package:airqo/src/app/exposure/widgets/entry_place_card.dart';
import 'package:airqo/src/meta/utils/colors.dart';

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

class _ExposureBody extends StatelessWidget {
  const _ExposureBody();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: BlocBuilder<DashboardBloc, DashboardState>(
        builder: (ctx, dashState) {
          final sites = _sites(dashState);
          return BlocBuilder<DeclaredPlacesCubit, DeclaredPlacesState>(
            builder: (ctx, placeState) {
              final declared = placeState is DeclaredPlacesLoaded ? placeState.places : <DeclaredPlace>[];
              final declaredIds = declared.map((p) => p.siteId).toSet();
              final untagged = sites.where((s) => !declaredIds.contains(s.id)).toList();

              return CustomScrollView(
                slivers: [
                  SliverAppBar(
                    floating: true, snap: true,
                    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                    elevation: 0,
                    title: _AppBarTitle(),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        _SectionHeader(hasDeclared: declared.isNotEmpty, hasUntagged: untagged.isNotEmpty),
                        const SizedBox(height: 16),
                        ...declared.map((p) {
                          final readings = _mockReadings(p.siteId);
                          final avg = _avg(readings);
                          return DeclaredPlaceCard(
                            place: p,
                            exposureLevel: ExposureLevelExtension.fromPm25(avg),
                            hourlyReadings: readings,
                          );
                        }),
                        ...untagged.map((s) => EntryPlaceCard(site: s)),
                        if (declared.isEmpty && untagged.isEmpty) const _EmptyState(),
                      ]),
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  List<SelectedSite> _sites(DashboardState s) =>
      s is DashboardLoaded ? (s.userPreferences?.selectedSites ?? []) : [];

  double _avg(List<HourlyReading> r) {
    final v = r.where((x) => x.pm25 != null).toList();
    if (v.isEmpty) return 8.0;
    return v.map((x) => x.pm25!).reduce((a, b) => a + b) / v.length;
  }
}

/// Deterministic mock hourly readings — seeded by siteId.
/// TODO: replace with GET /api/v2/devices/measurements/sites/:siteId/hourly
List<HourlyReading> _mockReadings(String siteId) {
  final seed = siteId.codeUnits.fold(0, (a, b) => a + b);
  final rng = Random(seed);
  final base = 5.0 + rng.nextDouble() * 55;
  return List.generate(24, (h) {
    final offline = (h == 3 || h == 4) && rng.nextBool();
    if (offline) return HourlyReading(hour: h);
    double shape = 1.0;
    if (h >= 6 && h <= 9) shape = 1.4;
    if (h >= 16 && h <= 20) shape = 1.3;
    if (h >= 1 && h <= 5) shape = 0.6;
    final pm = (base * shape + rng.nextDouble() * 6 - 3).clamp(1.0, 200.0);
    return HourlyReading(hour: h, pm25: pm);
  });
}

// ---------------------------------------------------------------------------

class _AppBarTitle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Text(
      'Exposure',
      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700,
          color: isDark ? Colors.white : const Color(0xFF1A1D23)),
    );
  }
}

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
            : 'Add places in the Dashboard to get started.';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('My Places', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : const Color(0xFF1A1D23))),
        const SizedBox(height: 2),
        Text(sub, style: TextStyle(fontSize: 13, color: AppColors.boldHeadlineColor)),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(top: 48),
      child: Column(
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkHighlight : AppColors.highlightColor,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.place_outlined, size: 32, color: AppColors.boldHeadlineColor),
          ),
          const SizedBox(height: 16),
          Text('No places yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : const Color(0xFF1A1D23))),
          const SizedBox(height: 6),
          Text('Add places on the Dashboard tab\nto see your exposure here.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.boldHeadlineColor, height: 1.5)),
        ],
      ),
    );
  }
}
