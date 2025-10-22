import 'dart:async';
import 'dart:convert';
import 'package:loggy/loggy.dart';
import 'package:geolocator/geolocator.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';

class ExposureCalculator with UiLoggy {
  static final ExposureCalculator _instance = ExposureCalculator._internal();
  factory ExposureCalculator() => _instance;
  ExposureCalculator._internal();

  static const String _exposureDataBoxName = 'exposure_data';
  static const String _dailySummariesKey = 'daily_summaries';
  static const Duration _locationProximityThreshold = Duration(hours: 2);

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

  /// Get exposure statistics for today using simplified sensor-based approach
  Future<DailyExposureSummary?> getTodayExposure() async {
    try {
      loggy.info('Getting today\'s exposure using simplified sensor-based approach');
      
      // Use sensor-based approach instead of location tracking
      return await _calculateTodayExposureFromSensors();
    } catch (e) {
      loggy.error('Error getting today\'s exposure: $e');
      return null;
    }
  }

  /// Calculate today's exposure based on nearby air quality sensors
  Future<DailyExposureSummary?> _calculateTodayExposureFromSensors() async {
    try {
      // Get user's location once for finding nearby sensors
      final locationService = EnhancedLocationServiceManager();
      final locationResult = await locationService.getCurrentPosition();
      
      if (!locationResult.isSuccess || locationResult.position == null) {
        loggy.warning('Could not get user location for sensor-based exposure calculation');
        return null;
      }
      
      final userPosition = locationResult.position!;
      
      // Get nearby air quality sensors (same approach as peak card)
      final nearbySensors = await _getNearbyAirQualitySensors(userPosition);
      
      if (nearbySensors.isEmpty) {
        loggy.info('No nearby sensors found for exposure calculation');
        return null;
      }
      
      // Generate today's exposure summary from sensor data
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      
      return _generateTodayExposureFromSensors(todayDate, nearbySensors, userPosition);
      
    } catch (e) {
      loggy.error('Error calculating sensor-based exposure: $e');
      return null;
    }
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
      // Import the dashboard repository to get live air quality data
      final DashboardImpl dashboardRepository = DashboardImpl();
      
      // Get the current air quality readings
      final AirQualityResponse response = await dashboardRepository.fetchAirQualityReadings(forceRefresh: false);
      
      if (response.measurements != null && response.measurements!.isNotEmpty) {
        // Filter measurements within the date range
        final filteredMeasurements = response.measurements!.where((measurement) {
          if (measurement.time == null) return false;
          
          final measurementTime = DateTime.tryParse(measurement.time!);
          if (measurementTime == null) return false;
          
          return measurementTime.isAfter(startDate) && measurementTime.isBefore(endDate);
        }).toList();
        
        loggy.info('Retrieved ${filteredMeasurements.length} air quality measurements');
        return filteredMeasurements;
      } else {
        loggy.warning('No air quality measurements available');
        return [];
      }
    } catch (e) {
      loggy.error('Error getting air quality data: $e');
      // Return empty list so exposure calculation can still work with location data only
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
    Duration closestTimeDiff = const Duration(days: 1);

    for (final measurement in airQualityData) {
      // Check if measurement has location data
      if (measurement.siteDetails?.approximateLatitude == null || 
          measurement.siteDetails?.approximateLongitude == null) {
        continue;
      }

      // Calculate temporal distance
      final measurementTime = DateTime.tryParse(measurement.time ?? '');
      if (measurementTime == null) continue;

      final timeDiff = locationPoint.timestamp.difference(measurementTime).abs();
      
      // Skip if measurement is too old
      if (timeDiff > _locationProximityThreshold) continue;

      // Use temporal proximity only for closest measurement
      if (closest == null || timeDiff < closestTimeDiff) {
        closest = measurement;
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

  /// Get nearby air quality sensors (reusing logic from dashboard)
  Future<List<Measurement>> _getNearbyAirQualitySensors(Position userPosition) async {
    try {
      final dashboardRepository = DashboardImpl();
      final response = await dashboardRepository.fetchAirQualityReadings();
      
      if (response.measurements == null || response.measurements!.isEmpty) {
        return [];
      }
      
      const double maxDistanceKm = 10.0; // Same radius as Near You view
      final nearbySensors = <Measurement>[];
      
      for (final measurement in response.measurements!) {
        // Skip if no location data
        final siteDetails = measurement.siteDetails;
        if (siteDetails == null) continue;
        
        double? latitude = siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
        double? longitude = siteDetails.approximateLongitude ?? siteDetails.siteCategory?.longitude;
        
        if (latitude == null || longitude == null) continue;
        
        // Calculate distance from user
        final distance = Geolocator.distanceBetween(
          userPosition.latitude,
          userPosition.longitude,
          latitude,
          longitude,
        ) / 1000; // Convert to km
        
        // Only include nearby sensors
        if (distance <= maxDistanceKm) {
          nearbySensors.add(measurement);
        }
      }
      
      loggy.info('Found ${nearbySensors.length} nearby air quality sensors');
      return nearbySensors;
      
    } catch (e) {
      loggy.error('Error getting nearby air quality sensors: $e');
      return [];
    }
  }

  /// Generate today's exposure summary from sensor data
  DailyExposureSummary _generateTodayExposureFromSensors(
    DateTime todayDate,
    List<Measurement> nearbySensors,
    Position userPosition,
  ) {
    // Get the best available sensor readings
    final validSensors = nearbySensors.where((s) => s.pm25?.value != null).toList();
    
    if (validSensors.isEmpty) {
      return _generateEmptyExposureSummary(todayDate);
    }
    
    // Calculate area air quality statistics
    final pm25Values = validSensors.map((s) => s.pm25!.value!).toList();
    final avgPm25 = pm25Values.reduce((a, b) => a + b) / pm25Values.length;
    final maxPm25 = pm25Values.reduce((a, b) => a > b ? a : b);
    
    // Generate realistic hourly exposure points for today
    final exposurePoints = _generateHourlyExposurePoints(
      todayDate,
      avgPm25,
      maxPm25,
      validSensors,
      userPosition,
    );
    
    return DailyExposureSummary.fromDataPoints(todayDate, exposurePoints);
  }
  
  /// Generate empty exposure summary when no sensor data available
  DailyExposureSummary _generateEmptyExposureSummary(DateTime date) {
    return DailyExposureSummary(
      date: date,
      dataPoints: [],
      totalExposureScore: 0.0,
      totalOutdoorTime: Duration.zero,
      timeByAqiCategory: {},
      averagePm25: 0.0,
      maxPm25: 0.0,
      dominantAqiCategory: 'Unknown',
    );
  }

  /// Generate hourly exposure points based on actual sensor timestamp data
  List<ExposureDataPoint> _generateHourlyExposurePoints(
    DateTime todayDate,
    double avgPm25,
    double maxPm25,
    List<Measurement> sensors,
    Position userPosition,
  ) {
    final exposurePoints = <ExposureDataPoint>[];
    final now = DateTime.now();
    
    // Generate points for each hour from start of day to current time (24-hour continuous exposure)
    final startOfDay = DateTime(todayDate.year, todayDate.month, todayDate.day, 0); // Midnight start
    final currentTime = now.isBefore(startOfDay.add(Duration(hours: 24))) 
        ? now 
        : startOfDay.add(Duration(hours: 24)); // Full 24-hour day
    
    // Group sensor readings by hour based on their timestamps
    final readingsByHour = _groupSensorReadingsByHour(sensors, todayDate);
    
    int hourCount = 0;
    for (var time = startOfDay; time.isBefore(currentTime); time = time.add(Duration(hours: 1))) {
      hourCount++;
      
      // Get actual PM2.5 reading for this hour or fall back to average
      final hourPm25 = _getHourlyPm25FromReadings(time.hour, readingsByHour, avgPm25);
      final aqiCategory = _getAqiCategory(hourPm25);
      
      // Each hour represents 1 hour of continuous exposure
      final durationAtLocation = Duration(hours: 1);
      
      final exposurePoint = ExposureDataPoint(
        id: 'sensor_based_${time.hour}',
        timestamp: time,
        latitude: userPosition.latitude + (hourCount * 0.0001), // Small variation
        longitude: userPosition.longitude + (hourCount * 0.0001),
        pm25Value: hourPm25,
        pm10Value: hourPm25 * 1.4, // Estimate PM10 from PM2.5
        aqiCategory: aqiCategory,
        aqiColor: _getAqiColor(hourPm25),
        accuracy: 100.0, // Area-based estimate
        durationAtLocation: durationAtLocation,
        siteName: _getNearestSensorName(sensors, userPosition),
      );
      
      exposurePoints.add(exposurePoint);
    }
    
    return exposurePoints;
  }

  /// Group sensor readings by hour based on their timestamps
  Map<int, List<Measurement>> _groupSensorReadingsByHour(List<Measurement> sensors, DateTime targetDate) {
    final readingsByHour = <int, List<Measurement>>{};
    
    for (final sensor in sensors) {
      if (sensor.time == null || sensor.pm25?.value == null) continue;
      
      final readingTime = DateTime.tryParse(sensor.time!);
      if (readingTime == null) continue;
      
      if (readingTime.year == targetDate.year && 
          readingTime.month == targetDate.month && 
          readingTime.day == targetDate.day) {
        final hour = readingTime.hour;
        readingsByHour.putIfAbsent(hour, () => []).add(sensor);
      }
    }
    
    return readingsByHour;
  }

  /// Get PM2.5 reading for specific hour from grouped readings
  double _getHourlyPm25FromReadings(int hour, Map<int, List<Measurement>> readingsByHour, double fallbackAvg) {
    final hourReadings = readingsByHour[hour];
    
    if (hourReadings == null || hourReadings.isEmpty) {
      return fallbackAvg;
    }
    
    final pm25Values = hourReadings
        .where((r) => r.pm25?.value != null)
        .map((r) => r.pm25!.value!)
        .toList();
    
    if (pm25Values.isEmpty) {
      return fallbackAvg;
    }
    
    return pm25Values.reduce((a, b) => a + b) / pm25Values.length;
  }


  /// Get the name of the nearest sensor for location context
  String? _getNearestSensorName(List<Measurement> sensors, Position userPosition) {
    if (sensors.isEmpty) return null;
    
    Measurement? nearest;
    double nearestDistance = double.infinity;
    
    for (final sensor in sensors) {
      final siteDetails = sensor.siteDetails;
      if (siteDetails == null) continue;
      
      double? latitude = siteDetails.approximateLatitude ?? siteDetails.siteCategory?.latitude;
      double? longitude = siteDetails.approximateLongitude ?? siteDetails.siteCategory?.longitude;
      
      if (latitude == null || longitude == null) continue;
      
      final distance = Geolocator.distanceBetween(
        userPosition.latitude,
        userPosition.longitude,
        latitude,
        longitude,
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = sensor;
      }
    }
    
    if (nearest?.siteDetails != null) {
      return nearest!.siteDetails!.searchName ??
             nearest.siteDetails!.locationName ?? 
             nearest.siteDetails!.name ?? 
             nearest.siteDetails!.district ??
             nearest.siteDetails!.subCounty ??
             nearest.siteDetails!.city;
    }
    
    return null;
  }

  /// Helper method to get AQI category from PM2.5 value
  String _getAqiCategory(double pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy for Sensitive Groups';
    if (pm25 <= 150) return 'Unhealthy';
    return 'Very Unhealthy';
  }
  
  /// Helper method to get AQI color from PM2.5 value
  String _getAqiColor(double pm25) {
    if (pm25 <= 12) return '#00E400';
    if (pm25 <= 35) return '#FFFF00';
    if (pm25 <= 55) return '#FF7E00';
    if (pm25 <= 150) return '#FF0000';
    return '#8F3F97';
  }
}