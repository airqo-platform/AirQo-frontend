import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository_impl.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_level_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class MyTripsView extends StatefulWidget {
  const MyTripsView({
    super.key,
    required this.savedSites,
    RouteExposureRepository? repository,
  }) : repository = repository ?? const _RouteExposureRepositoryFactory();

  final List<SelectedSite> savedSites;
  final RouteExposureRepository repository;

  @override
  State<MyTripsView> createState() => _MyTripsViewState();
}

class _MyTripsViewState extends State<MyTripsView> {
  String? _originId;
  String? _destinationId;
  bool _isLoading = false;
  String? _errorMessage;
  RouteExposureSummary? _summary;

  List<SelectedSite> get _eligibleSites => widget.savedSites
      .where((site) => site.latitude != null && site.longitude != null)
      .toList();

  @override
  void initState() {
    super.initState();
    _syncSelection();
  }

  @override
  void didUpdateWidget(covariant MyTripsView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.savedSites != widget.savedSites) {
      _syncSelection();
    }
  }

  void _syncSelection() {
    final sites = _eligibleSites;
    if (sites.length < 2) {
      _originId = null;
      _destinationId = null;
      return;
    }

    _originId =
        sites.any((site) => site.id == _originId) ? _originId : sites.first.id;
    final fallbackDestination = sites.firstWhere(
      (site) => site.id != _originId,
      orElse: () => sites[1],
    );
    _destinationId =
        sites.any((site) => site.id == _destinationId && site.id != _originId)
            ? _destinationId
            : fallbackDestination.id;
  }

  SelectedSite? _findSite(String? id) {
    for (final site in _eligibleSites) {
      if (site.id == id) {
        return site;
      }
    }
    return null;
  }

  Future<void> _loadTripExposure() async {
    final origin = _findSite(_originId);
    final destination = _findSite(_destinationId);
    if (origin == null || destination == null) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final summary = await widget.repository.buildTripExposure(
        origin: origin,
        destination: destination,
      );
      if (!mounted) return;
      setState(() {
        _summary = summary;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = error.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final sites = _eligibleSites;
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    if (sites.length < 2) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Add at least two saved places to analyze a trip.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'My Trips uses your existing saved AirQo locations as route endpoints.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: bodyColor,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        _TripSelectorCard(
          sites: sites,
          originId: _originId!,
          destinationId: _destinationId!,
          isLoading: _isLoading,
          onOriginChanged: (value) {
            setState(() {
              _originId = value;
              if (_destinationId == value) {
                _destinationId =
                    sites.firstWhere((site) => site.id != value).id;
              }
            });
          },
          onDestinationChanged: (value) {
            setState(() {
              _destinationId = value;
            });
          },
          onSwap: () {
            setState(() {
              final currentOrigin = _originId;
              _originId = _destinationId;
              _destinationId = currentOrigin;
            });
          },
          onAnalyze: _loadTripExposure,
        ),
        if (_errorMessage != null) ...[
          const SizedBox(height: 12),
          _TripMessageCard(
            title: 'We could not analyze this trip',
            message: _errorMessage!,
            isError: true,
          ),
        ],
        if (_summary != null) ...[
          const SizedBox(height: 12),
          _RouteExposureSummaryCard(summary: _summary!),
        ],
      ],
    );
  }
}

class _TripSelectorCard extends StatelessWidget {
  const _TripSelectorCard({
    required this.sites,
    required this.originId,
    required this.destinationId,
    required this.isLoading,
    required this.onOriginChanged,
    required this.onDestinationChanged,
    required this.onSwap,
    required this.onAnalyze,
  });

  final List<SelectedSite> sites;
  final String originId;
  final String destinationId;
  final bool isLoading;
  final ValueChanged<String?> onOriginChanged;
  final ValueChanged<String?> onDestinationChanged;
  final VoidCallback onSwap;
  final VoidCallback onAnalyze;

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Container(
      decoration: AppSurfaceColors.elevatedCardDecoration(context, radius: 10),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Check route exposure',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Use your saved places as trip endpoints and summarize PM2.5 along the route.',
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: bodyColor,
            ),
          ),
          const SizedBox(height: 16),
          _TripDropdownField(
            label: 'From',
            value: originId,
            sites: sites,
            onChanged: onOriginChanged,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                tooltip: 'Swap trip endpoints',
                onPressed: isLoading ? null : onSwap,
                icon: const Icon(Icons.swap_vert_rounded),
              ),
            ],
          ),
          _TripDropdownField(
            label: 'To',
            value: destinationId,
            sites: sites,
            onChanged: onDestinationChanged,
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed:
                  isLoading || originId == destinationId ? null : onAnalyze,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text(
                      'Analyze trip exposure',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TripDropdownField extends StatelessWidget {
  const _TripDropdownField({
    required this.label,
    required this.value,
    required this.sites,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<SelectedSite> sites;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    final fillColor = AppSurfaceColors.nested(context);
    final borderColor = AppSurfaceColors.border(context);
    final headlineColor = AppTextColors.headline(context);

    return DropdownButtonFormField<String>(
      key: ValueKey(value),
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: fillColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: AppColors.primaryColor),
        ),
      ),
      items: sites
          .map(
            (site) => DropdownMenuItem<String>(
              value: site.id,
              child: Text(
                site.name,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: headlineColor),
              ),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}

class _RouteExposureSummaryCard extends StatelessWidget {
  const _RouteExposureSummaryCard({required this.summary});

  final RouteExposureSummary summary;

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Container(
      decoration: AppSurfaceColors.elevatedCardDecoration(context, radius: 10),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${summary.origin.name} to ${summary.destination.name}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${summary.distanceLabel} • ${summary.durationLabel} • ${summary.nearbySites.length} nearby monitors',
            style: TextStyle(
              fontSize: 14,
              color: bodyColor,
            ),
          ),
          const SizedBox(height: 16),
          if (summary.exposureLevel != null)
            ExposureLevelChip(level: summary.exposureLevel!)
          else
            _TripMessageCard(
              title: summary.headline,
              message: summary.guidance,
            ),
          if (summary.hasMeasurements) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _TripStatTile(
                    label: 'Average PM2.5',
                    value: '${summary.averagePm25!.toStringAsFixed(1)} µg/m³',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _TripStatTile(
                    label: 'Peak PM2.5',
                    value: '${summary.peakPm25!.toStringAsFixed(1)} µg/m³',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              summary.headline,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: titleColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              summary.guidance,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: bodyColor,
              ),
            ),
            if (summary.highestSiteName != null) ...[
              const SizedBox(height: 12),
              Text(
                'Highest route reading near ${summary.highestSiteName}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: bodyColor,
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _TripStatTile extends StatelessWidget {
  const _TripStatTile({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppSurfaceColors.nested(context),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppSurfaceColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: bodyColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _TripMessageCard extends StatelessWidget {
  const _TripMessageCard({
    required this.title,
    required this.message,
    this.isError = false,
  });

  final String title;
  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final backgroundColor = isError
        ? AppTextColors.errorBackground(context)
        : AppSurfaceColors.nested(context);
    final titleColor = isError
        ? AppTextColors.errorForeground(context)
        : AppTextColors.headline(context);
    final bodyColor = isError
        ? AppTextColors.errorForeground(context)
        : AppTextColors.muted(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isError
              ? AppTextColors.errorForeground(context).withValues(alpha: 0.25)
              : AppSurfaceColors.border(context),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: titleColor,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: bodyColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _RouteExposureRepositoryFactory implements RouteExposureRepository {
  const _RouteExposureRepositoryFactory();

  @override
  Future<RouteExposureSummary> buildTripExposure({
    required SelectedSite origin,
    required SelectedSite destination,
    double radiusKm = 2.5,
  }) {
    return RouteExposureRepositoryImpl().buildTripExposure(
      origin: origin,
      destination: destination,
      radiusKm: radiusKm,
    );
  }
}
