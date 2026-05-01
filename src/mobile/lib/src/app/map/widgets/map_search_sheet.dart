import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/pages/location_selection/components/location_search_bar.dart';
import 'package:airqo/src/app/dashboard/widgets/google_places_loader.dart';
import 'package:airqo/src/app/map/utils/map_aq_presentation.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class MapSearchSheet extends StatefulWidget {
  final ScrollController scrollController;
  final bool isDark;
  final TextEditingController searchController;
  final FocusNode searchFocusNode;
  final List<Measurement> allMeasurements;
  final List<Measurement> nearbyMeasurements;
  final List<Measurement> localSearchResults;
  final bool hasUserPosition;
  final VoidCallback onSearchTap;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<Measurement> onMeasurementSelected;
  final ValueChanged<String> onPlaceSelected;

  const MapSearchSheet({
    super.key,
    required this.scrollController,
    required this.isDark,
    required this.searchController,
    required this.searchFocusNode,
    required this.allMeasurements,
    required this.nearbyMeasurements,
    required this.localSearchResults,
    required this.hasUserPosition,
    required this.onSearchTap,
    required this.onSearchChanged,
    required this.onMeasurementSelected,
    required this.onPlaceSelected,
  });

  @override
  State<MapSearchSheet> createState() => _MapSearchSheetState();
}

class _MapSearchSheetState extends State<MapSearchSheet> {
  String _selectedCountry = 'Nearby';

  List<String> get _activeCountries {
    final countries = widget.allMeasurements
        .map((m) => m.siteDetails?.country)
        .whereType<String>()
        .where((country) => country.trim().isNotEmpty)
        .toSet()
        .toList();
    countries.sort();
    return countries;
  }

  List<Measurement> get _browseMeasurements {
    if (_selectedCountry != 'Nearby') {
      return widget.allMeasurements
          .where((m) => m.siteDetails?.country == _selectedCountry)
          .toList();
    }

    if (widget.nearbyMeasurements.isNotEmpty) {
      return widget.nearbyMeasurements;
    }

    return widget.allMeasurements.take(6).toList();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            color: widget.isDark
                ? AppColors.darkThemeBackground.withValues(alpha: 0.68)
                : Colors.white.withValues(alpha: 0.58),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(
              top: BorderSide(
                color: widget.isDark
                    ? Colors.white.withValues(alpha: 0.07)
                    : Colors.white.withValues(alpha: 0.70),
                width: 1,
              ),
            ),
          ),
          child: CustomScrollView(
            controller: widget.scrollController,
            slivers: [
              SliverToBoxAdapter(child: _buildSearchHeader()),
              SliverToBoxAdapter(
                child: BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
                  builder: (context, placesState) {
                    final trimmed = widget.searchController.text.trim();
                    if (trimmed.isEmpty) {
                      return _BrowseList(
                        isDark: widget.isDark,
                        selectedCountry: _selectedCountry,
                        countries: _activeCountries,
                        measurements: _browseMeasurements,
                        hasUserPosition: widget.hasUserPosition,
                        onCountrySelected: (country) {
                          setState(() => _selectedCountry = country);
                        },
                        onMeasurementSelected: widget.onMeasurementSelected,
                      );
                    }

                    if (placesState is SearchLoading) {
                      return const Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(children: [
                          GooglePlacesLoader(),
                          SizedBox(height: 12),
                          GooglePlacesLoader(),
                          SizedBox(height: 12),
                          GooglePlacesLoader(),
                        ]),
                      );
                    }

                    if (placesState is SearchLoaded) {
                      return _SearchResults(
                        state: placesState,
                        isDark: widget.isDark,
                        localSearchResults: widget.localSearchResults,
                        query: widget.searchController.text.trim(),
                        onMeasurementSelected: widget.onMeasurementSelected,
                        onPlaceSelected: widget.onPlaceSelected,
                      );
                    }

                    return _BrowseList(
                      isDark: widget.isDark,
                      selectedCountry: _selectedCountry,
                      countries: _activeCountries,
                      measurements: _browseMeasurements,
                      hasUserPosition: widget.hasUserPosition,
                      onCountrySelected: (country) {
                        setState(() => _selectedCountry = country);
                      },
                      onMeasurementSelected: widget.onMeasurementSelected,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchHeader() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Center(
          child: Container(
            margin: const EdgeInsets.only(top: 10, bottom: 12),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: LocationSearchBar(
            controller: widget.searchController,
            focusNode: widget.searchFocusNode,
            padding: EdgeInsets.zero,
            onTap: widget.onSearchTap,
            onChanged: widget.onSearchChanged,
          ),
        ),
        const SizedBox(height: 4),
      ],
    );
  }
}

class _BrowseList extends StatelessWidget {
  final bool isDark;
  final String selectedCountry;
  final List<String> countries;
  final List<Measurement> measurements;
  final bool hasUserPosition;
  final ValueChanged<String> onCountrySelected;
  final ValueChanged<Measurement> onMeasurementSelected;

  const _BrowseList({
    required this.isDark,
    required this.selectedCountry,
    required this.countries,
    required this.measurements,
    required this.hasUserPosition,
    required this.onCountrySelected,
    required this.onMeasurementSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (measurements.isEmpty && countries.isEmpty) {
      return const SizedBox.shrink();
    }

    final labelColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 6),
          _CountryChips(
            isDark: isDark,
            countries: countries,
            selectedCountry: selectedCountry,
            onSelected: onCountrySelected,
          ),
          const SizedBox(height: 8),
          if (measurements.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: TranslatedText(
                  'No locations available',
                  style: TextStyle(color: labelColor, fontSize: 13),
                ),
              ),
            )
          else
            ..._measurementRows(
              context: context,
              measurements: measurements,
              isDark: isDark,
              onSelected: onMeasurementSelected,
            ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _SearchResults extends StatelessWidget {
  final SearchLoaded state;
  final bool isDark;
  final List<Measurement> localSearchResults;
  final String query;
  final ValueChanged<Measurement> onMeasurementSelected;
  final ValueChanged<String> onPlaceSelected;

  const _SearchResults({
    required this.state,
    required this.isDark,
    required this.localSearchResults,
    required this.query,
    required this.onMeasurementSelected,
    required this.onPlaceSelected,
  });

  @override
  Widget build(BuildContext context) {
    final predictions = state.response.predictions;
    final labelStyle = _sectionLabelStyle(isDark);
    final widgets = <Widget>[];

    if (localSearchResults.isNotEmpty) {
      final sectionLabel = predictions.isNotEmpty
          ? 'stations in ${query.toLowerCase()}'
          : '${localSearchResults.length} stations found';

      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(sectionLabel, style: labelStyle),
      ));

      widgets.addAll(_measurementRows(
        context: context,
        measurements: localSearchResults,
        isDark: isDark,
        onSelected: onMeasurementSelected,
        addTrailingDivider: predictions.isNotEmpty,
      ));
    }

    if (predictions.isNotEmpty) {
      if (localSearchResults.isNotEmpty) {
        widgets.add(const SizedBox(height: 8));
      }
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text('places', style: labelStyle),
      ));

      for (int i = 0; i < predictions.length; i++) {
        final pred = predictions[i];
        widgets.add(InkWell(
          onTap: () => onPlaceSelected(pred.description),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/images/shared/location_pin.svg',
                  width: 20,
                  height: 20,
                  colorFilter: ColorFilter.mode(
                    isDark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.boldHeadlineColor3,
                    BlendMode.srcIn,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    pred.description,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ));
        if (i < predictions.length - 1) {
          widgets.add(_rowDivider(isDark));
        }
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          ...widgets,
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _CountryChips extends StatelessWidget {
  final bool isDark;
  final List<String> countries;
  final String selectedCountry;
  final ValueChanged<String> onSelected;

  const _CountryChips({
    required this.isDark,
    required this.countries,
    required this.selectedCountry,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (countries.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 32,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _CountryChip(
              label: 'Nearby',
              selected: selectedCountry == 'Nearby',
              isDark: isDark,
              onTap: () => onSelected('Nearby'),
            ),
            ...countries.map(
              (country) => Padding(
                padding: const EdgeInsets.only(left: 6),
                child: _CountryChip(
                  label: country,
                  flag: CountryModel.getFlagFromCountryName(country),
                  selected: selectedCountry == country,
                  isDark: isDark,
                  onTap: () => onSelected(country),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CountryChip extends StatelessWidget {
  final String label;
  final String? flag;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  const _CountryChip({
    required this.label,
    required this.selected,
    required this.isDark,
    required this.onTap,
    this.flag,
  });

  @override
  Widget build(BuildContext context) {
    final bg = selected
        ? AppColors.primaryColor
        : (isDark ? AppColors.darkHighlight : AppColors.dividerColorlight);
    final textColor =
        selected ? Colors.white : (isDark ? Colors.white : Colors.black87);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (flag != null) ...[
              Text(flag!, style: const TextStyle(fontSize: 12)),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

List<Widget> _measurementRows({
  required BuildContext context,
  required List<Measurement> measurements,
  required bool isDark,
  required ValueChanged<Measurement> onSelected,
  bool addTrailingDivider = false,
}) {
  return measurements.asMap().entries.map((entry) {
    final i = entry.key;
    final measurement = entry.value;
    final pm25 = measurement.pm25?.value ?? 0;
    final showDivider = i < measurements.length - 1 || addTrailingDivider;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          onTap: () => onSelected(measurement),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Row(
              children: [
                SvgPicture.asset(
                  mapAqLevelFromPm25(pm25).asset,
                  width: 20,
                  height: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    measurement.siteDetails?.searchName ??
                        measurement.siteDetails?.name ??
                        '—',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).textTheme.bodyLarge?.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                _AqCategoryChip(
                  label: measurement.aqiCategory ?? '',
                  color: mapAqLevelFromPm25(pm25).color,
                ),
              ],
            ),
          ),
        ),
        if (showDivider) _rowDivider(isDark),
      ],
    );
  }).toList();
}

TextStyle _sectionLabelStyle(bool isDark) {
  return TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.06,
    color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
  );
}

Widget _rowDivider(bool isDark) {
  return Divider(
    indent: 16,
    thickness: 0.5,
    color: isDark ? AppColors.dividerColordark : AppColors.dividerColorlight,
  );
}

class _AqCategoryChip extends StatelessWidget {
  final String label;
  final Color color;

  const _AqCategoryChip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    if (label.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
