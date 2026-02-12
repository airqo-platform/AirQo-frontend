import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:loggy/loggy.dart';

typedef MeasurementsCallback = void Function(List<Measurement> measurements);

/// Helper methods for location selection functionality
class LocationHelper {
  // Create a static logger for the class
  static final _logger = Loggy('LocationHelper');

  /// Filters and validates measurements
  static void populateMeasurements(
    List<Measurement> measurements, {
    required MeasurementsCallback onSuccess,
  }) {
    _logger.info('Processing ${measurements.length} measurements');
    
    List<Measurement> finalMeasurements = [];
    int invalidCount = 0;

    for (var meas in measurements) {
      if (meas.siteDetails != null && meas.id != null) {
        finalMeasurements.add(meas);
      } else {
        invalidCount++;
        _logger.warning('Invalid measurement found - siteDetails: ${meas.siteDetails != null}, id: ${meas.id != null}');
      }
    }
    
    _logger.info('Filtered ${measurements.length} measurements to ${finalMeasurements.length} valid ones. Dropped $invalidCount invalid measurements');
    
    onSuccess(finalMeasurements);
  }

  /// Search measurements by query string
  static List<Measurement> searchAirQualityLocations(
    String query, 
    List<Measurement> measurements,
  ) {
    query = query.toLowerCase();
    _logger.info('Searching for "$query" in ${measurements.length} measurements');
    
    var results = measurements.where((measurement) {
      if (measurement.siteDetails != null) {
        return (measurement.siteDetails!.city?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.locationName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.name?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.searchName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.formattedName
                    ?.toLowerCase()
                    .contains(query) ??
                false) ||
            (measurement.siteDetails!.town?.toLowerCase().contains(query) ??
                false) ||
            (measurement.siteDetails!.district?.toLowerCase().contains(query) ??
                false);
      }
      return false;
    }).toList();
    
    _logger.info('Found ${results.length} matching results for query "$query"');
    return results;
  }

  /// Filter measurements by country
  static List<Measurement> filterByCountry(
    String country, 
    List<Measurement> measurements,
  ) {
    _logger.info('Filtering by country: $country');
    
    var filtered = measurements.where((measurement) {
      if (measurement.siteDetails != null) {
        return measurement.siteDetails!.country == country;
      }
      return false;
    }).toList();
    
    _logger.info('Found ${filtered.length} measurements for country $country');
    return filtered;
  }

  /// Validate a location ID
  static bool isValidLocationId(String? id) {
    return id != null && id.isNotEmpty;
  }

  /// Get location display name from measurement
  static String getLocationDisplayName(Measurement measurement) {
    if (measurement.siteDetails == null) {
      return "Unknown Location";
    }
    
    return measurement.siteDetails!.city ?? 
           measurement.siteDetails!.town ?? 
           measurement.siteDetails!.locationName ?? 
           "Unknown Location";
  }

  /// Get location subtitle from measurement
  static String getLocationSubtitle(Measurement measurement) {
    if (measurement.siteDetails == null) {
      return "";
    }
    
    return measurement.siteDetails!.name ?? 
           measurement.siteDetails!.formattedName ?? 
           "";
  }
}