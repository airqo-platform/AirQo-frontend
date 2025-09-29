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

class PrivacyLocationListView extends StatelessWidget with UiLoggy {
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

  const PrivacyLocationListView({
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
                  ...localSearchResults.asMap().entries.map((entry) => 
                      _buildLocationTile(
                        entry.value, 
                        context: context, 
                        isLast: entry.key == localSearchResults.length - 1
                      ),
                  ),
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
            (currentFilter == "All") ? allMeasurements : filteredMeasurements;

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
                  colorFilter: ColorFilter.mode(
                    Theme.of(context)
                            .textTheme
                            .bodyMedium
                            ?.color
                            ?.withValues(alpha: 0.6) ??
                        Colors.grey,
                    BlendMode.srcIn,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  currentFilter == "All"
                      ? "No locations available"
                      : currentFilter == "Near you"
                          ? "No locations found near you"
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

        return ListView(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 8, bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.darkHighlight.withValues(alpha: 0.5)
                    : AppColors.lightHighlight.withValues(alpha: 0.5),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.shield_outlined,
                    size: 18,
                    color: Theme.of(context).textTheme.headlineSmall?.color,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    "Select Privacy Locations",
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).textTheme.headlineSmall?.color,
                    ),
                  ),
                ],
              ),
            ),
            ...measurements.asMap().entries.map((entry) => 
                _buildLocationTile(
                  entry.value, 
                  context: context, 
                  isLast: entry.key == measurements.length - 1
                ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildLocationTile(Measurement measurement,
      {required BuildContext context, bool isLast = false}) {
    final isSelected = selectedLocations.contains(measurement.siteId);
    return Column(
      children: [
        Container(
          decoration: isSelected
              ? BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.primaryColor.withValues(alpha: 0.15)
                      : AppColors.primaryColor.withValues(alpha: 0.05),
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
                  ? AppColors.primaryColor.withValues(alpha: 0.2)
                  : Theme.of(context).highlightColor,
              child: SvgPicture.asset(
                "assets/images/shared/location_pin.svg",
                colorFilter: isSelected 
                    ? ColorFilter.mode(AppColors.primaryColor, BlendMode.srcIn)
                    : null,
              ),
            ),
            title: Text(
              measurement.siteDetails?.name ?? 
              measurement.siteDetails?.formattedName ??
              measurement.siteDetails?.city ??
              measurement.siteDetails?.town ??
              "Unknown Location",
              style: TextStyle(
                color: Theme.of(context).textTheme.bodyLarge?.color,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 16,
              ),
            ),
            subtitle: measurement.siteDetails?.city != null && measurement.siteDetails?.country != null
                ? Text(
                    "${measurement.siteDetails!.city}, ${measurement.siteDetails!.country}",
                    style: TextStyle(
                      fontSize: 14,
                      color: Theme.of(context).brightness == Brightness.dark
                          ? AppColors.boldHeadlineColor2
                          : AppColors.secondaryHeadlineColor,
                    ),
                  )
                : null,
            trailing: Checkbox(
              value: isSelected,
              onChanged: (value) {
                onToggleSelection(measurement, value ?? false);
              },
              fillColor: WidgetStateProperty.resolveWith(
                (states) => states.contains(WidgetState.selected)
                    ? AppColors.primaryColor
                    : Colors.transparent,
              ),
              checkColor: Colors.white,
              side: BorderSide(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.dividerColordark
                    : AppColors.dividerColorlight,
              ),
            ),
            onTap: () => onToggleSelection(measurement, !isSelected),
          ),
        ),
        if (!isLast)
          Divider(
            indent: 72,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
          ),
      ],
    );
  }
}