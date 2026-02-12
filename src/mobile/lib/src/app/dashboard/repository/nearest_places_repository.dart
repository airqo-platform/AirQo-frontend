import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/dashboard/models/nearest_places_model.dart';


class NearestPlacesRepositoryLogger {
  final _logger = Loggy('NearestPlacesRepositoryLogger');

  void info(String message) => _logger.info(message);
  void error(String message) => _logger.error(message);
}

class NearestPlacesException implements Exception {
  final String message;
  final int? statusCode;

  NearestPlacesException(this.message, [this.statusCode]);

  @override
  String toString() => 'NearestPlacesException: $message';
}

/// Repository for handling nearest places and device readings
class NearestPlacesRepository {
  /// Logger for the repository
  final _logger = NearestPlacesRepositoryLogger();

  final String baseUrl;
  final String authToken;
  final http.Client _httpClient;

  NearestPlacesRepository({
    required this.baseUrl,
    required this.authToken,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();


  Future<List<NearestSiteModel>> findNearestSites({
    required double longitude,
    required double latitude,
    required double radius,
  }) async {
    _logger.info(
        'Finding nearest sites: lon=$longitude, lat=$latitude, radius=$radius');

    final uri = Uri.parse('$baseUrl/devices/sites/nearest?'
        'longitude=$longitude&latitude=$latitude&radius=$radius&online_status=online');

    try {
      final response = await _httpClient.get(
        uri,
        headers: {
          'Authorization': 'JWT $authToken',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        final sites = (jsonResponse['sites'] as List? ?? [])
            .map((siteJson) => NearestSiteModel.fromJson(siteJson))
            .toList();

        _logger.info('Found ${sites.length} nearest sites');
        return sites;
      } else {
        _logger.error(
            'Failed to find nearest sites. Status code: ${response.statusCode}');
        throw NearestPlacesException(
            'Failed to find nearest sites', response.statusCode);
      }
    } catch (e) {
      _logger.error('Network error while finding nearest sites: $e');
      throw NearestPlacesException('Network error: ${e.toString()}');
    }
  }

  /// Fetches recent measurements for a specific site
  Future<List<RecentMeasurementModel>> fetchRecentMeasurements({
    String? siteId,
    String? deviceId,
    String? cohortId,
    String? gridId,
    int? limit,
    String? startDate,
    String? endDate,
  }) async {
    // Validate input parameters
    if ((cohortId != null && gridId != null) ||
        (siteId != null && deviceId != null)) {
      _logger.error('Invalid parameter combination for recent measurements');
      throw NearestPlacesException(
          'Invalid parameter combination: Cannot use cohort_id and grid_id simultaneously, '
          'or device_id and site_id simultaneously');
    }

    // Construct query parameters
    final queryParams = <String, String>{};

    if (siteId != null) queryParams['site_id'] = siteId;
    if (deviceId != null) queryParams['device_id'] = deviceId;
    if (cohortId != null) queryParams['cohort_id'] = cohortId;
    if (gridId != null) queryParams['grid_id'] = gridId;
    if (limit != null) queryParams['limit'] = limit.toString();
    if (startDate != null) queryParams['start_date'] = startDate;
    if (endDate != null) queryParams['end_date'] = endDate;

    _logger.info('Fetching recent measurements with params: $queryParams');

    final uri = Uri.parse('$baseUrl/devices/readings/recent')
        .replace(queryParameters: queryParams);

    try {
      final response = await _httpClient.get(
        uri,
        headers: {
          'Authorization': 'JWT $authToken',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        final measurements = (jsonResponse['readings'] as List? ?? [])
            .map((measurementJson) =>
                RecentMeasurementModel.fromJson(measurementJson))
            .toList();

        _logger.info('Found ${measurements.length} recent measurements');
        return measurements;
      } else {
        _logger.error(
            'Failed to fetch recent measurements. Status code: ${response.statusCode}');
        throw NearestPlacesException(
            'Failed to fetch recent measurements', response.statusCode);
      }
    } catch (e) {
      _logger.error('Network error while fetching recent measurements: $e');
      throw NearestPlacesException('Network error: ${e.toString()}');
    }
  }

  /// Fetches comprehensive nearest places data
  Future<NearestPlacesResponseModel> fetchNearestPlacesData({
    required double longitude,
    required double latitude,
    double radius = 5.0,
    int? measurementLimit,
  }) async {
    _logger.info(
        'Fetching nearest places data: lon=$longitude, lat=$latitude, radius=$radius');

    try {
      // Find nearest sites first
      final sites = await findNearestSites(
          longitude: longitude, latitude: latitude, radius: radius);

      // If no sites found, return empty response
      if (sites.isEmpty) {
        _logger.info('No nearest sites found');
        return NearestPlacesResponseModel(sites: [], measurements: []);
      }

      // Fetch measurements for the first site (or all sites if needed)
      final measurements = await fetchRecentMeasurements(
          siteId: sites.first.id, limit: measurementLimit);

      return NearestPlacesResponseModel(
          sites: sites, measurements: measurements);
    } catch (e) {
      _logger.error('Failed to fetch nearest places data: $e');
      throw NearestPlacesException(
          'Failed to fetch nearest places data: ${e.toString()}');
    }
  }

  /// Closes the HTTP client to prevent resource leaks
  void dispose() {
    _logger.info('Disposing NearestPlacesRepository resources');
    _httpClient.close();
  }
}
