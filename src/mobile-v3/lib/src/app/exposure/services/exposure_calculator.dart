import 'dart:async';
import 'dart:convert';
import 'package:loggy/loggy.dart';
import 'package:geolocator/geolocator.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';

class ExposureCalculator with UiLoggy {
  static final ExposureCalculator _instance = ExposureCalculator._internal();
  factory ExposureCalculator() => _instance;
  ExposureCalculator._internal();

  static const String _exposureDataBoxName = 'exposure_data';
  static const String _dailySummariesKey = 'daily_summaries';
  static const Duration _locationProximityThreshold = Duration(minutes: 10);
  static const double _proximityRadiusMeters = 1000; // 1km radius for AQ matching

  /// Calculate exposure data points from location history and air quality data
  Future<List<ExposureDataPoint>> calculateExposurePoints({
    required DateTime startDate,
    required DateTime endDate,
    List<LocationDataPoint>? locationHistory,
    List<Measurement>? airQualityData,
  }) async {
    try {
      loggy.info('Calculating exposure points from ${startDate.toIso8601String()} to ${endDate.toIso8601String()}');

      // Get location history if not provided
      locationHistory ??= await _getLocationHistory(startDate, endDate);
      if (locationHistory.isEmpty) {
        loggy.warning('No location history found for the specified period');
        return [];
      }

      // Get air quality data if not provided
      airQualityData ??= await _getAirQualityData(startDate, endDate);
      if (airQualityData.isEmpty) {
        loggy.warning('No air quality data found for the specified period');
        return [];
      }

      // Match location points with nearest air quality measurements
      final exposurePoints = <ExposureDataPoint>[];
      
      for (int i = 0; i < locationHistory.length; i++) {
        final locationPoint = locationHistory[i];
        
        // Calculate duration at this location
        final duration = _calculateDurationAtLocation(locationHistory, i);
        
        // Find closest air quality measurement
        final closestMeasurement = _findClosestAirQualityMeasurement(
          locationPoint,
          airQualityData,
        );

        if (closestMeasurement != null) {
          final exposurePoint = ExposureDataPoint.fromLocationAndMeasurement(
            locationPoint: locationPoint,
            measurement: closestMeasurement,
            duration: duration,
          );
          exposurePoints.add(exposurePoint);
        }
      }

      loggy.info('Generated ${exposurePoints.length} exposure points');
      return exposurePoints;
    } catch (e) {
      loggy.error('Error calculating exposure points: $e');
      return [];
    }
  }

  /// Calculate daily exposure summaries for a date range
  Future<List<DailyExposureSummary>> calculateDailySummaries({
    required DateTime startDate,
    required DateTime endDate,
    bool useCache = true,
  }) async {
    try {
      // Check cache first
      if (useCache) {
        final cachedSummaries = await _getCachedDailySummaries(startDate, endDate);
        if (cachedSummaries.isNotEmpty) {
          loggy.info('Returning ${cachedSummaries.length} cached daily summaries');
          return cachedSummaries;
        }
      }

      // Calculate exposure points
      final exposurePoints = await calculateExposurePoints(
        startDate: startDate,
        endDate: endDate,
      );

      if (exposurePoints.isEmpty) {
        return [];
      }

      // Group by date
      final pointsByDate = <DateTime, List<ExposureDataPoint>>{};
      for (final point in exposurePoints) {
        final date = DateTime(point.timestamp.year, point.timestamp.month, point.timestamp.day);
        pointsByDate.putIfAbsent(date, () => []).add(point);
      }

      // Create daily summaries
      final summaries = pointsByDate.entries
          .map((entry) => DailyExposureSummary.fromDataPoints(entry.key, entry.value))
          .toList();

      // Sort by date
      summaries.sort((a, b) => a.date.compareTo(b.date));

      // Cache results
      await _cacheDailySummaries(summaries);

      loggy.info('Calculated ${summaries.length} daily summaries');
      return summaries;
    } catch (e) {
      loggy.error('Error calculating daily summaries: $e');
      return [];
    }
  }

  /// Calculate weekly exposure trend
  Future<WeeklyExposureTrend?> calculateWeeklyTrend({
    required DateTime weekStartDate,
    bool useCache = true,
  }) async {
    try {
      final weekEndDate = weekStartDate.add(const Duration(days: 7));
      
      final dailySummaries = await calculateDailySummaries(
        startDate: weekStartDate,
        endDate: weekEndDate,
        useCache: useCache,
      );

      if (dailySummaries.isEmpty) {
        return null;
      }

      return WeeklyExposureTrend.fromDailySummaries(weekStartDate, dailySummaries);
    } catch (e) {
      loggy.error('Error calculating weekly trend: $e');
      return null;
    }
  }

  /// Get exposure statistics for today
  Future<DailyExposureSummary?> getTodayExposure() async {
    final today = DateTime.now();
    final startOfDay = DateTime(today.year, today.month, today.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    final summaries = await calculateDailySummaries(
      startDate: startOfDay,
      endDate: endOfDay,
      useCache: false, // Always fresh for today
    );

    return summaries.isNotEmpty ? summaries.first : null;
  }

  /// Get current week exposure trend
  Future<WeeklyExposureTrend?> getCurrentWeekTrend() async {
    final now = DateTime.now();
    final weekStart = now.subtract(Duration(days: now.weekday - 1));
    final startOfWeek = DateTime(weekStart.year, weekStart.month, weekStart.day);

    return await calculateWeeklyTrend(weekStartDate: startOfWeek);
  }

  /// Clear all cached exposure data
  Future<void> clearCache() async {
    try {
      await HiveRepository.deleteData(_exposureDataBoxName, _dailySummariesKey);
      loggy.info('Cleared exposure data cache');
    } catch (e) {
      loggy.error('Error clearing exposure cache: $e');
    }
  }

  // Private helper methods

  Future<List<LocationDataPoint>> _getLocationHistory(DateTime startDate, DateTime endDate) async {
    try {
      final locationService = EnhancedLocationServiceManager();
      
      // Filter location history by date range
      final allHistory = locationService.locationHistory;
      final filteredHistory = allHistory.where((point) {
        return point.timestamp.isAfter(startDate) && point.timestamp.isBefore(endDate);
      }).toList();

      return filteredHistory;
    } catch (e) {
      loggy.error('Error getting location history: $e');
      return [];
    }
  }

  Future<List<Measurement>> _getAirQualityData(DateTime startDate, DateTime endDate) async {
    try {
      // This would typically come from the air quality repository
      // For now, we'll try to get cached data or return empty list
      
      // TODO: Implement proper air quality data retrieval based on the existing repository
      // The AirQualityRepository would need to be extended to support date range queries
      
      loggy.warning('Air quality data retrieval not fully implemented - using mock data');
      return [];
    } catch (e) {
      loggy.error('Error getting air quality data: $e');
      return [];
    }
  }

  Duration _calculateDurationAtLocation(List<LocationDataPoint> locationHistory, int currentIndex) {
    if (currentIndex >= locationHistory.length - 1) {
      // Last point, assume 5 minutes
      return const Duration(minutes: 5);
    }

    final currentPoint = locationHistory[currentIndex];
    final nextPoint = locationHistory[currentIndex + 1];
    
    final duration = nextPoint.timestamp.difference(currentPoint.timestamp);
    
    // Cap duration at reasonable limits (e.g., 2 hours max per location)
    if (duration.inHours > 2) {
      return const Duration(hours: 2);
    }
    
    return duration;
  }

  Measurement? _findClosestAirQualityMeasurement(
    LocationDataPoint locationPoint,
    List<Measurement> airQualityData,
  ) {
    if (airQualityData.isEmpty) return null;

    Measurement? closest;
    double closestDistance = double.infinity;
    Duration closestTimeDiff = const Duration(days: 1);

    for (final measurement in airQualityData) {
      // Check if measurement has location data
      if (measurement.siteDetails?.approximateLatitude == null || 
          measurement.siteDetails?.approximateLongitude == null) {
        continue;
      }

      // Calculate spatial distance
      final distance = Geolocator.distanceBetween(
        locationPoint.latitude,
        locationPoint.longitude,
        measurement.siteDetails!.approximateLatitude!,
        measurement.siteDetails!.approximateLongitude!,
      );

      // Skip if too far away
      if (distance > _proximityRadiusMeters) continue;

      // Calculate temporal distance
      final measurementTime = DateTime.tryParse(measurement.time ?? '');
      if (measurementTime == null) continue;

      final timeDiff = locationPoint.timestamp.difference(measurementTime).abs();
      
      // Skip if measurement is too old
      if (timeDiff > _locationProximityThreshold) continue;

      // Calculate combined score (prioritize temporal proximity)
      final spatialScore = distance / _proximityRadiusMeters; // 0-1
      final temporalScore = timeDiff.inMinutes / _locationProximityThreshold.inMinutes; // 0-1
      final combinedScore = (temporalScore * 0.7) + (spatialScore * 0.3);

      if (closest == null || combinedScore < 
          ((closestTimeDiff.inMinutes / _locationProximityThreshold.inMinutes * 0.7) + 
           (closestDistance / _proximityRadiusMeters * 0.3))) {
        closest = measurement;
        closestDistance = distance;
        closestTimeDiff = timeDiff;
      }
    }

    return closest;
  }

  Future<List<DailyExposureSummary>> _getCachedDailySummaries(
    DateTime startDate,
    DateTime endDate,
  ) async {
    try {
      final cachedData = await HiveRepository.getData(
        _dailySummariesKey,
        _exposureDataBoxName,
      );

      if (cachedData == null) return [];

      final summariesJson = json.decode(cachedData) as List;
      final summaries = summariesJson
          .map((json) => DailyExposureSummary.fromJson(json))
          .where((summary) => 
              !summary.date.isBefore(startDate) && 
              !summary.date.isAfter(endDate))
          .toList();

      return summaries;
    } catch (e) {
      loggy.error('Error getting cached daily summaries: $e');
      return [];
    }
  }

  Future<void> _cacheDailySummaries(List<DailyExposureSummary> summaries) async {
    try {
      // Get existing cached data
      final existing = await _getCachedDailySummaries(
        DateTime.now().subtract(const Duration(days: 30)),
        DateTime.now().add(const Duration(days: 1)),
      );

      // Merge with new data (new data takes precedence)
      final mergedMap = <String, DailyExposureSummary>{};
      
      for (final summary in existing) {
        mergedMap[summary.date.toIso8601String().substring(0, 10)] = summary;
      }
      
      for (final summary in summaries) {
        mergedMap[summary.date.toIso8601String().substring(0, 10)] = summary;
      }

      // Convert back to list and sort
      final mergedSummaries = mergedMap.values.toList();
      mergedSummaries.sort((a, b) => a.date.compareTo(b.date));

      // Keep only last 30 days to prevent unlimited growth
      final cutoffDate = DateTime.now().subtract(const Duration(days: 30));
      final recentSummaries = mergedSummaries
          .where((s) => s.date.isAfter(cutoffDate))
          .toList();

      final summariesJson = recentSummaries.map((s) => s.toJson()).toList();
      await HiveRepository.saveData(
        _exposureDataBoxName,
        _dailySummariesKey,
        json.encode(summariesJson),
      );

      loggy.info('Cached ${recentSummaries.length} daily summaries');
    } catch (e) {
      loggy.error('Error caching daily summaries: $e');
    }
  }
}