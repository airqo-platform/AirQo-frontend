import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository.dart';
import 'package:airqo/src/app/exposure/repository/route_exposure_repository_impl.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_level_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

class TripNetworkSite extends Equatable {
  const TripNetworkSite({
    required this.site,
    required this.country,
    this.isFavorite = false,
  });

  final SelectedSite site;
  final String country;
  final bool isFavorite;

  @override
  List<Object?> get props => [site, country, isFavorite];
}

class MyTripsView extends StatefulWidget {
  const MyTripsView({
    super.key,
    required this.savedSites,
    this.networkSites = const [],
    this.isDashboardLoading = false,
    this.hasDashboardError = false,
    this.onRetry,
    this.onAddPlaces,
    this.scrollController,
    RouteExposureRepository? repository,
  }) : repository = repository ?? const _RouteExposureRepositoryFactory();

  final List<SelectedSite> savedSites;
  final List<TripNetworkSite> networkSites;
  final bool isDashboardLoading;
  final bool hasDashboardError;
  final VoidCallback? onRetry;
  final VoidCallback? onAddPlaces;
  final ScrollController? scrollController;
  final RouteExposureRepository repository;

  @override
  State<MyTripsView> createState() => _MyTripsViewState();
}

class _MyTripsViewState extends State<MyTripsView> {
  SelectedSite? _origin;
  SelectedSite? _destination;
  String? _country;
  bool _isLoading = false;
  String? _errorMessage;
  RouteExposureSummary? _summary;

  List<String> get _countries => widget.networkSites
      .map((entry) => entry.country)
      .where((country) => country.isNotEmpty)
      .toSet()
      .toList()
    ..sort();

  List<TripNetworkSite> get _countrySites {
    final country = _country;
    if (country == null) return const [];
    final sites =
        widget.networkSites.where((entry) => entry.country == country).toList();
    sites.sort((a, b) {
      if (a.isFavorite != b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.site.name.compareTo(b.site.name);
    });
    return sites;
  }

  @override
  void initState() {
    super.initState();
    _syncSelection();
  }

  @override
  void didUpdateWidget(covariant MyTripsView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.savedSites != widget.savedSites ||
        oldWidget.networkSites != widget.networkSites) {
      _syncSelection();
    }
  }

  void _syncSelection() {
    final countries = _countries;
    if (countries.isEmpty) {
      _country = null;
      _origin = null;
      _destination = null;
      _summary = null;
      _errorMessage = null;
      return;
    }
    if (_country == null || !countries.contains(_country)) {
      final favoriteCountries = widget.networkSites
          .where((entry) => entry.isFavorite)
          .map((entry) => entry.country)
          .toSet();
      _country = countries.firstWhere(
        favoriteCountries.contains,
        orElse: () => countries.first,
      );
    }
    final sites = _countrySites.map((entry) => entry.site).toList();
    _origin = sites.where((site) => site.id == _origin?.id).firstOrNull ??
        sites.firstOrNull;
    _destination = sites
            .where((site) =>
                site.id == _destination?.id && site.id != _origin?.id)
            .firstOrNull ??
        sites.where((site) => site.id != _origin?.id).firstOrNull;
  }

  void _selectCountry(String country) {
    setState(() {
      _country = country;
      _origin = null;
      _destination = null;
      _summary = null;
      _errorMessage = null;
      _syncSelection();
    });
  }

  Future<void> _loadTripExposure() async {
    final origin = _origin;
    final destination = _destination;
    if (origin == null || destination == null) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _summary = null;
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
    final sites = _countrySites;

    return ListView(
      controller: widget.scrollController,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        _TripSelectorCard(
          countries: _countries,
          selectedCountry: _country,
          networkSites: sites,
          origin: _origin,
          destination: _destination,
          isLoading: _isLoading,
          onCountryChanged: _selectCountry,
          onOriginChanged: (value) {
            setState(() {
              _origin = value;
              _summary = null;
              _errorMessage = null;
            });
          },
          onDestinationChanged: (value) {
            setState(() {
              _destination = value;
              _summary = null;
              _errorMessage = null;
            });
          },
          onSwap: () {
            setState(() {
              final currentOrigin = _origin;
              _origin = _destination;
              _destination = currentOrigin;
              _summary = null;
              _errorMessage = null;
            });
          },
          onAnalyze: _loadTripExposure,
          onAddPlaces: widget.isDashboardLoading || widget.hasDashboardError
              ? null
              : widget.onAddPlaces,
        ),
        if (widget.isDashboardLoading && widget.networkSites.isEmpty) ...[
          const SizedBox(height: 12),
          const LinearProgressIndicator(),
        ] else if (widget.hasDashboardError) ...[
          const SizedBox(height: 12),
          _TripMessageCard(
            title: 'AirQo network locations are unavailable',
            message:
                'Trips use monitored AirQo locations so route exposure has a better chance of returning readings.',
            isError: true,
          ),
          if (widget.onRetry != null)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: widget.onRetry,
                child: const Text('Retry locations'),
              ),
            ),
        ] else if (widget.networkSites.isEmpty) ...[
          const SizedBox(height: 12),
          const _TripMessageCard(
            title: 'No AirQo network locations to compare',
            message:
                'Trips need two monitored AirQo locations. Add places with coverage so you can pick trip endpoints.',
          ),
        ],
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
    required this.countries,
    required this.selectedCountry,
    required this.networkSites,
    required this.origin,
    required this.destination,
    required this.isLoading,
    required this.onCountryChanged,
    required this.onOriginChanged,
    required this.onDestinationChanged,
    required this.onSwap,
    required this.onAnalyze,
    this.onAddPlaces,
  });

  final List<String> countries;
  final String? selectedCountry;
  final List<TripNetworkSite> networkSites;
  final SelectedSite? origin;
  final SelectedSite? destination;
  final bool isLoading;
  final ValueChanged<String> onCountryChanged;
  final ValueChanged<SelectedSite> onOriginChanged;
  final ValueChanged<SelectedSite> onDestinationChanged;
  final VoidCallback onSwap;
  final VoidCallback onAnalyze;
  final VoidCallback? onAddPlaces;

  bool get _showAddPlacesAction =>
      onAddPlaces != null && origin == null && destination == null;

  VoidCallback? get _primaryAction {
    if (isLoading) return null;
    if (_showAddPlacesAction) return onAddPlaces;
    if (origin == null ||
        destination == null ||
        (origin!.latitude == destination!.latitude &&
            origin!.longitude == destination!.longitude)) {
      return null;
    }
    return onAnalyze;
  }

  Future<void> _pickEndpoint(
    BuildContext context,
    ValueChanged<SelectedSite> onSelected,
  ) async {
    final selection = await showModalBottomSheet<SelectedSite>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TripLocationPickerSheet(
        sites: networkSites,
      ),
    );
    if (selection != null) onSelected(selection);
  }

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
            'Choose two AirQo network locations in one country. Favorites appear first when they have monitoring coverage.',
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: bodyColor,
            ),
          ),
          const SizedBox(height: 16),
          _TripCountryField(
            countries: countries,
            value: selectedCountry,
            onChanged: isLoading ? null : onCountryChanged,
          ),
          const SizedBox(height: 12),
          _TripEndpointField(
            label: 'From',
            value: origin,
            onTap: isLoading
                ? null
                : () => _pickEndpoint(context, onOriginChanged),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              IconButton(
                tooltip: 'Swap trip endpoints',
                onPressed: isLoading ? null : onSwap,
                icon: AqSwitchVertical01(
                  color: AppTextColors.muted(context),
                ),
              ),
            ],
          ),
          _TripEndpointField(
            label: 'To',
            value: destination,
            onTap: isLoading
                ? null
                : () => _pickEndpoint(context, onDestinationChanged),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _primaryAction,
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
                  : Text(
                      _showAddPlacesAction
                          ? 'Add places'
                          : 'Analyze trip exposure',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TripCountryField extends StatelessWidget {
  const _TripCountryField({
    required this.countries,
    required this.value,
    required this.onChanged,
  });

  final List<String> countries;
  final String? value;
  final ValueChanged<String>? onChanged;

  Future<void> _pickCountry(BuildContext context) async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _TripCountryPickerSheet(
        countries: countries,
        selected: value,
      ),
    );
    if (selected != null) onChanged?.call(selected);
  }

  @override
  Widget build(BuildContext context) {
    final bodyColor = AppTextColors.muted(context);
    return Semantics(
      button: true,
      label: 'Trip country',
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onChanged == null || countries.isEmpty
            ? null
            : () => _pickCountry(context),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppSurfaceColors.nested(context),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppSurfaceColors.border(context)),
          ),
          child: Row(
            children: [
              Text(
                value == null
                    ? '🌍'
                    : CountryModel.getFlagFromCountryName(value!),
                style: const TextStyle(fontSize: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Country',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: bodyColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      value ?? 'Choose network coverage',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTextColors.headline(context),
                      ),
                    ),
                  ],
                ),
              ),
              AqChevronDown(color: bodyColor),
            ],
          ),
        ),
      ),
    );
  }
}

class _TripEndpointField extends StatelessWidget {
  const _TripEndpointField({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final SelectedSite? value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final fillColor = AppSurfaceColors.nested(context);
    final borderColor = AppSurfaceColors.border(context);
    final headlineColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Semantics(
      button: true,
      label: '$label trip location',
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: fillColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: AqMarkerPin01(
                  color: AppColors.primaryColor,
                  size: 19,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: bodyColor,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      value?.visibleName ?? 'Choose a location',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: headlineColor,
                      ),
                    ),
                  ],
                ),
              ),
              AqChevronRight(color: bodyColor),
            ],
          ),
        ),
      ),
    );
  }
}

class _TripCountryPickerSheet extends StatelessWidget {
  const _TripCountryPickerSheet({
    required this.countries,
    required this.selected,
  });

  final List<String> countries;
  final String? selected;

  @override
  Widget build(BuildContext context) {
    final bodyColor = AppTextColors.muted(context);
    return SafeArea(
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * 0.72,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: bodyColor.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Choose a coverage country',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppTextColors.headline(context),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Only countries with active AirQo network locations are shown.',
                style: TextStyle(fontSize: 13, color: bodyColor, height: 1.45),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView(
                  children: countries.map((country) {
                    final active = country == selected;
                    return GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => Navigator.of(context).pop(country),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 13,
                        ),
                        decoration: BoxDecoration(
                          color: active
                              ? AppColors.primaryColor.withValues(alpha: 0.1)
                              : AppSurfaceColors.nested(context),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: active
                                ? AppColors.primaryColor
                                : AppSurfaceColors.border(context),
                          ),
                        ),
                        child: Row(
                          children: [
                            Text(
                              CountryModel.getFlagFromCountryName(country),
                              style: const TextStyle(fontSize: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                country,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: AppTextColors.headline(context),
                                ),
                              ),
                            ),
                            if (active)
                              AqCheck(
                                color: AppColors.primaryColor,
                              ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TripLocationPickerSheet extends StatefulWidget {
  const _TripLocationPickerSheet({required this.sites});

  final List<TripNetworkSite> sites;

  @override
  State<_TripLocationPickerSheet> createState() =>
      _TripLocationPickerSheetState();
}

class _TripLocationPickerSheetState extends State<_TripLocationPickerSheet> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<TripNetworkSite> get _filteredSites {
    final query = _controller.text.trim().toLowerCase();
    if (query.isEmpty) return widget.sites;
    return widget.sites.where((entry) {
      return entry.site.visibleName.toLowerCase().contains(query) ||
          entry.site.visibleSearchName.toLowerCase().contains(query);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final bodyColor = AppTextColors.muted(context);
    final borderColor = AppSurfaceColors.border(context);
    final sites = _filteredSites;
    final country = widget.sites.firstOrNull?.country ?? 'AirQo network';

    return Container(
      height: MediaQuery.sizeOf(context).height * 0.82,
      padding: EdgeInsets.fromLTRB(16, 12, 16, 16 + bottomInset),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: bodyColor.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Choose an AirQo location',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppTextColors.headline(context),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '$country network coverage',
            style: TextStyle(fontSize: 13, color: bodyColor),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _controller,
            autofocus: true,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search monitored locations',
              prefixIcon: AqSearchMd(
                size: 18,
                color: bodyColor,
                semanticsLabel: 'Search monitored locations',
              ),
              prefixIconConstraints: const BoxConstraints(
                minWidth: 40,
                minHeight: 40,
              ),
              filled: true,
              fillColor: AppSurfaceColors.nested(context),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: AppColors.primaryColor,
                  width: 1.5,
                ),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: borderColor),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'AIRQO LOCATIONS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: bodyColor,
            ),
          ),
          Expanded(
            child: sites.isEmpty
                ? Center(
                    child: Text(
                      'No monitored locations match that search.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: bodyColor),
                    ),
                  )
                : ListView(
                    children: sites.map((entry) {
                      return _TripLocationRow(
                        title: entry.site.visibleName,
                        subtitle: entry.site.visibleSearchName,
                        isFavorite: entry.isFavorite,
                        onTap: () => Navigator.of(context).pop(entry.site),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _TripLocationRow extends StatelessWidget {
  const _TripLocationRow({
    required this.title,
    required this.subtitle,
    required this.isFavorite,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final bool isFavorite;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            if (isFavorite)
              AqHeart(color: AppColors.primaryColor, size: 21)
            else
              AqMarkerPin01(color: AppColors.primaryColor, size: 21),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppTextColors.headline(context),
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTextColors.muted(context),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
            '${summary.origin.visibleName} to ${summary.destination.visibleName}',
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

  static final RouteExposureRepositoryImpl _delegate =
      RouteExposureRepositoryImpl();

  @override
  Future<RouteExposureSummary> buildTripExposure({
    required SelectedSite origin,
    required SelectedSite destination,
    double radiusKm = 2.5,
  }) {
    return _delegate.buildTripExposure(
      origin: origin,
      destination: destination,
      radiusKm: radiusKm,
    );
  }
}
