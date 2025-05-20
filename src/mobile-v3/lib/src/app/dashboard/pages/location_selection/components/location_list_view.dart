import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/other/places/bloc/google_places_bloc.dart';
import 'package:airqo/src/app/dashboard/widgets/google_places_loader.dart';
import 'package:airqo/src/app/dashboard/widgets/location_display_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:loggy/loggy.dart';

class LocationListView extends StatelessWidget with UiLoggy {
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onRetry;
  final TextEditingController searchController;
  final String currentFilter;
  final List<Measurement> allMeasurements;
  final List<Measurement> filteredMeasurements;
  final List<Measurement> localSearchResults;
  final Set<String> selectedLocations;
  final Function(Measurement, bool) onToggleSelection;
  final Function({Measurement? measurement, String? placeName}) onViewDetails;
  final VoidCallback onResetFilter;

  const LocationListView({
    super.key,
    required this.isLoading,
    required this.errorMessage,
    required this.onRetry,
    required this.searchController,
    required this.currentFilter,
    required this.allMeasurements,
    required this.filteredMeasurements,
    required this.localSearchResults,
    required this.selectedLocations,
    required this.onToggleSelection,
    required this.onViewDetails,
    required this.onResetFilter,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GooglePlacesBloc, GooglePlacesState>(
      builder: (context, placesState) {
        final dashboardState = context.watch<DashboardBloc>().state;
        loggy.debug(
            'Building with GooglePlacesState: ${placesState.runtimeType}, DashboardState: ${dashboardState.runtimeType}');

        if (isLoading || dashboardState is DashboardLoading) {
          loggy.info('Showing loading indicator');
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  color: AppColors.primaryColor,
                ),
                const SizedBox(height: 16),
                Text(
                  "Loading locations...",
                  style: TextStyle(
                      color: Theme.of(context).textTheme.bodyMedium?.color),
                ),
              ],
            ),
          );
        }

        if (errorMessage != null || dashboardState is DashboardLoadingError) {
          final errorMsg = errorMessage ??
              (dashboardState is DashboardLoadingError
                  ? dashboardState.message
                  : 'Unknown error');

          loggy.error('Showing error: $errorMsg');

          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Colors.red[400],
                ),
                const SizedBox(height: 16),
                Text(
                  errorMsg,
                  style: TextStyle(
                      color: Theme.of(context).textTheme.bodyMedium?.color),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: onRetry,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Try Again'),
                ),
              ],
            ),
          );
        }

        if (searchController.text.isNotEmpty) {
          loggy.info('Handling search for "${searchController.text}"');
          if (placesState is SearchLoading) {
            loggy.info('Google Places search loading');
            return Column(
              children: const [
                GooglePlacesLoader(),
                SizedBox(height: 12),
                GooglePlacesLoader(),
                SizedBox(height: 12),
                GooglePlacesLoader(),
              ],
            );
          } else if (placesState is SearchLoaded) {
            bool hasLocalResults = localSearchResults.isNotEmpty;
            bool hasGoogleResults = placesState.response.predictions.isNotEmpty;

            loggy.info(
                'Search results - local: $hasLocalResults (${localSearchResults.length}), Google: $hasGoogleResults (${placesState.response.predictions.length})');

            if (!hasLocalResults && !hasGoogleResults) {
              loggy.info('No search results found');
              return Center(
                child: Text(
                  "No matching locations found",
                  style: TextStyle(
                      color: Theme.of(context).textTheme.bodyMedium?.color),
                ),
              );
            }

            return ListView(
              children: [
                if (hasLocalResults) ...[
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  ...localSearchResults.map((measurement) => Column(
                        children: [
                          ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Theme.of(context).highlightColor,
                              child: SvgPicture.asset(
                                "assets/images/shared/location_pin.svg",
                              ),
                            ),
                            title: Text(
                              measurement.siteDetails?.city ??
                                  measurement.siteDetails?.town ??
                                  measurement.siteDetails?.locationName ??
                                  "Unknown Location",
                              style: TextStyle(
                                  color: Theme.of(context)
                                      .textTheme
                                      .bodyLarge
                                      ?.color),
                            ),
                            subtitle: Text(
                              measurement.siteDetails?.searchName ??
                                  measurement.siteDetails?.formattedName ??
                                  "",
                              style: TextStyle(
                                  color: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.color
                                      ?.withOpacity(0.7)),
                            ),
                            trailing: Checkbox(
                              value: selectedLocations
                                  .contains(measurement.siteId),
                              onChanged: (value) {
                                onToggleSelection(measurement, value!);
                              },
                              fillColor: WidgetStateProperty.resolveWith(
                                (states) =>
                                    states.contains(WidgetState.selected)
                                        ? AppColors.primaryColor
                                        : Colors.transparent,
                              ),
                              checkColor: Colors.white,
                              side: BorderSide(
                                  color: Theme.of(context).dividerColor),
                            ),
                            onTap: () =>
                                onViewDetails(measurement: measurement),
                          ),
                          if (measurement != localSearchResults.last)
                            Divider(indent: 50),
                        ],
                      )),
                  if (hasGoogleResults) const Divider(thickness: 1, height: 32),
                ],

                // Then show Google Places results
                if (hasGoogleResults) ...[
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Text(
                      "Other Locations",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).textTheme.headlineSmall?.color,
                      ),
                    ),
                  ),
                  ...placesState.response.predictions.map((prediction) =>
                      GestureDetector(
                        onTap: () =>
                            onViewDetails(placeName: prediction.description),
                        child: LocationDisplayWidget(
                          title: prediction.description,
                          subTitle: prediction.structuredFormatting.mainText,
                        ),
                      )),
                ],
              ],
            );
          }
        }

        List<Measurement> measurements =
            currentFilter == "All" ? allMeasurements : filteredMeasurements;

        if (measurements.isEmpty) {
          loggy.info('No measurements to display');
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SvgPicture.asset(
                  "assets/images/shared/empty_state.svg",
                  height: 100,
                  width: 100,
                  color: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.color
                      ?.withOpacity(0.6),
                ),
                const SizedBox(height: 16),
                Text(
                  currentFilter == "All"
                      ? "No locations available"
                      : "No locations found in $currentFilter",
                  style: TextStyle(
                      color: Theme.of(context).textTheme.bodyMedium?.color),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: currentFilter == "All" ? onRetry : onResetFilter,
                  child: Text(
                    currentFilter == "All" ? "Refresh" : "Show All Locations",
                    style: TextStyle(color: AppColors.primaryColor),
                  ),
                ),
              ],
            ),
          );
        }

        final selectedMeasurements = <Measurement>[];
        final unselectedMeasurements = <Measurement>[];

        for (var measurement in measurements) {
          final isSelected = selectedLocations.contains(measurement.siteId);

          if (isSelected) {
            selectedMeasurements.add(measurement);
          } else {
            unselectedMeasurements.add(measurement);
          }
        }

        loggy.debug(
            'Split measurements: ${selectedMeasurements.length} selected, ${unselectedMeasurements.length} unselected');

        return ListView(
          children: [
            if (selectedMeasurements.isNotEmpty) ...[
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 4),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.darkHighlight.withOpacity(0.5)
                      : AppColors.lightHighlight.withOpacity(0.5),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.favorite,
                      size: 18,
                      color: AppColors.primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "Favorite Locations",
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).textTheme.headlineSmall?.color,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      "${selectedMeasurements.length}",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
              ...selectedMeasurements
                  .map((m) => _buildLocationTile(m, context: context)),
              const Divider(thickness: 1, height: 16),
            ],
            Container(
              margin: const EdgeInsets.only(top: 8, bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.darkHighlight.withOpacity(0.5)
                    : AppColors.lightHighlight.withOpacity(0.5),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.location_on,
                    size: 18,
                    color: Theme.of(context).textTheme.headlineSmall?.color,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    unselectedMeasurements.isEmpty &&
                            selectedMeasurements.isNotEmpty
                        ? "Other Locations"
                        : "All Locations",
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineSmall?.color,
                    ),
                  ),
                ],
              ),
            ),
            ...unselectedMeasurements
                .map((m) => _buildLocationTile(m, context: context)),
          ],
        );
      },
    );
  }

  Widget _buildLocationTile(Measurement measurement,
      {required BuildContext context}) {
    final isSelected = selectedLocations.contains(measurement.siteId);

    return Column(
      children: [
        Container(
          decoration: isSelected
              ? BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.primaryColor.withOpacity(0.15)
                      : AppColors.primaryColor.withOpacity(0.05),
                  border: Border(
                    left: BorderSide(
                      color: AppColors.primaryColor,
                      width: 3,
                    ),
                  ),
                )
              : null,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isSelected
                  ? AppColors.primaryColor.withOpacity(0.2)
                  : Theme.of(context).highlightColor,
              child: SvgPicture.asset(
                "assets/images/shared/location_pin.svg",
                color: isSelected ? AppColors.primaryColor : null,
              ),
            ),
            title: Text(
              measurement.siteDetails?.city ??
                  measurement.siteDetails?.town ??
                  measurement.siteDetails?.locationName ??
                  "Unknown Location",
              style: TextStyle(
                color: Theme.of(context).textTheme.bodyLarge?.color,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            subtitle: Text(
              measurement.siteDetails?.searchName ??
                  measurement.siteDetails?.formattedName ??
                  "",
              style: TextStyle(
                  color: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.color
                      ?.withOpacity(0.7)),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isSelected)
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Icon(
                      Icons.favorite,
                      color: AppColors.primaryColor,
                      size: 18,
                    ),
                  ),
                Checkbox(
                  value: isSelected,
                  onChanged: (value) {
                    onToggleSelection(measurement, value!);
                  },
                  fillColor: WidgetStateProperty.resolveWith(
                    (states) => states.contains(WidgetState.selected)
                        ? AppColors.primaryColor
                        : Colors.transparent,
                  ),
                  checkColor: Colors.white,
                  side: BorderSide(color: Theme.of(context).dividerColor),
                ),
              ],
            ),
            onTap: () => onViewDetails(measurement: measurement),
          ),
        ),
        Divider(indent: 50),
      ],
    );
  }
}
