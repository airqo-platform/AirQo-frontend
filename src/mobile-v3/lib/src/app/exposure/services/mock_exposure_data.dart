import 'dart:math';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Mock data generator for testing exposure awareness features
class MockExposureData {
  static final Random _random = Random();
  
  /// Generates realistic exposure data for today
  static DailyExposureSummary generateTodayExposure() {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day, 6, 0); // 6 AM start
    
    // Generate a realistic day of movement data
    final dataPoints = <ExposureDataPoint>[];
    
    // Morning commute (6:30-7:30 AM) - Higher pollution
    dataPoints.addAll(_generateCommute(
      startOfDay.add(Duration(minutes: 30)),
      Duration(hours: 1),
      LatLng(0.3476, 32.5825), // Start location (Kampala area)
      LatLng(0.3136, 32.5811), // End location
      avgPm25: 45.0, // Higher morning pollution
    ));
    
    // Work period (8 AM - 5 PM) - Indoor, lower pollution
    dataPoints.addAll(_generateStationaryPeriod(
      startOfDay.add(Duration(hours: 2)),
      Duration(hours: 9),
      LatLng(0.3136, 32.5811), // Office location
      avgPm25: 12.0, // Clean indoor air
      isIndoor: true,
    ));
    
    // Lunch break walk (12:30-1:00 PM) - Moderate pollution
    dataPoints.addAll(_generateWalk(
      startOfDay.add(Duration(hours: 6, minutes: 30)),
      Duration(minutes: 30),
      LatLng(0.3136, 32.5811), // Start at office
      avgPm25: 35.0,
    ));
    
    // Evening commute (5:30-6:30 PM) - High pollution (rush hour)
    dataPoints.addAll(_generateCommute(
      startOfDay.add(Duration(hours: 11, minutes: 30)),
      Duration(hours: 1),
      LatLng(0.3136, 32.5811), // Office
      LatLng(0.3476, 32.5825), // Home
      avgPm25: 55.0, // Peak evening pollution
    ));
    
    // Evening exercise (7-8 PM) - Cycling
    dataPoints.addAll(_generateCycling(
      startOfDay.add(Duration(hours: 13)),
      Duration(hours: 1),
      LatLng(0.3476, 32.5825), // Start from home
      avgPm25: 40.0,
    ));
    
    return DailyExposureSummary.fromDataPoints(
      DateTime(now.year, now.month, now.day),
      dataPoints,
    );
  }
  
  /// Generates sample data for the past 7 days
  static List<DailyExposureSummary> generateWeeklyData() {
    final summaries = <DailyExposureSummary>[];
    final now = DateTime.now();
    
    for (int i = 6; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      summaries.add(_generateDayExposure(date, i));
    }
    
    return summaries;
  }
  
  /// Generates activity analysis for today
  static ActivityAnalysis generateTodayActivityAnalysis() {
    final dataPoints = generateTodayExposure().dataPoints;
    
    // Create realistic activity segments
    final segments = <ActivitySegment>[
      // Morning commute - Driving
      ActivitySegment(
        id: 'morning_commute',
        startTime: DateTime.now().subtract(Duration(hours: 12)),
        endTime: DateTime.now().subtract(Duration(hours: 11)),
        activityType: ActivityType.driving,
        dataPoints: dataPoints.take(15).toList(),
        totalExposureScore: 25.5,
        averageSpeed: 15.0, // km/h
        distanceCovered: 8500, // meters
        startLocation: LatLng(0.3476, 32.5825),
        endLocation: LatLng(0.3136, 32.5811),
        routeName: 'Home to Office',
      ),
      
      // Work day - Indoor
      ActivitySegment(
        id: 'work_indoor',
        startTime: DateTime.now().subtract(Duration(hours: 11)),
        endTime: DateTime.now().subtract(Duration(hours: 3)),
        activityType: ActivityType.indoor,
        dataPoints: dataPoints.skip(15).take(40).toList(),
        totalExposureScore: 8.2,
        averageSpeed: 0.1,
        distanceCovered: 50,
        startLocation: LatLng(0.3136, 32.5811),
        endLocation: LatLng(0.3136, 32.5811),
        routeName: 'Office Work',
      ),
      
      // Lunch walk - Walking
      ActivitySegment(
        id: 'lunch_walk',
        startTime: DateTime.now().subtract(Duration(hours: 6, minutes: 30)),
        endTime: DateTime.now().subtract(Duration(hours: 6)),
        activityType: ActivityType.walking,
        dataPoints: dataPoints.skip(35).take(8).toList(),
        totalExposureScore: 12.8,
        averageSpeed: 4.5,
        distanceCovered: 1200,
        startLocation: LatLng(0.3136, 32.5811),
        endLocation: LatLng(0.3146, 32.5821),
        routeName: 'Lunch Break Walk',
      ),
      
      // Evening commute - Public Transport
      ActivitySegment(
        id: 'evening_commute',
        startTime: DateTime.now().subtract(Duration(hours: 3)),
        endTime: DateTime.now().subtract(Duration(hours: 2)),
        activityType: ActivityType.publicTransport,
        dataPoints: dataPoints.skip(55).take(12).toList(),
        totalExposureScore: 32.1,
        averageSpeed: 12.0,
        distanceCovered: 8200,
        startLocation: LatLng(0.3136, 32.5811),
        endLocation: LatLng(0.3476, 32.5825),
        routeName: 'Office to Home (Bus)',
      ),
      
      // Evening cycling - Cycling
      ActivitySegment(
        id: 'evening_cycling',
        startTime: DateTime.now().subtract(Duration(hours: 1, minutes: 30)),
        endTime: DateTime.now().subtract(Duration(minutes: 30)),
        activityType: ActivityType.cycling,
        dataPoints: dataPoints.skip(67).take(15).toList(),
        totalExposureScore: 18.4,
        averageSpeed: 18.0,
        distanceCovered: 5500,
        startLocation: LatLng(0.3476, 32.5825),
        endLocation: LatLng(0.3516, 32.5885),
        routeName: 'Evening Exercise Ride',
      ),
    ];
    
    return ActivityAnalysis.fromSegments(DateTime.now(), segments);
  }
  
  // Private helper methods
  
  static List<ExposureDataPoint> _generateCommute(
    DateTime startTime,
    Duration duration,
    LatLng start,
    LatLng end,
    {required double avgPm25}
  ) {
    final points = <ExposureDataPoint>[];
    final totalMinutes = duration.inMinutes;
    
    for (int i = 0; i < totalMinutes; i += 2) { // Every 2 minutes
      final progress = i / totalMinutes;
      final lat = start.latitude + (end.latitude - start.latitude) * progress;
      final lng = start.longitude + (end.longitude - start.longitude) * progress;
      
      // Add some traffic-based pollution variation
      final pollutionVariation = _random.nextDouble() * 20 - 10; // ±10
      final pm25 = (avgPm25 + pollutionVariation).clamp(5.0, 150.0);
      
      points.add(ExposureDataPoint(
        id: 'commute_${i}',
        timestamp: startTime.add(Duration(minutes: i)),
        latitude: lat,
        longitude: lng,
        pm25Value: pm25,
        pm10Value: pm25 * 1.4,
        aqiCategory: _getAqiCategory(pm25),
        aqiColor: _getAqiColor(pm25),
        accuracy: 5.0 + _random.nextDouble() * 10,
        durationAtLocation: Duration(minutes: 2),
      ));
    }
    
    return points;
  }
  
  static List<ExposureDataPoint> _generateStationaryPeriod(
    DateTime startTime,
    Duration duration,
    LatLng location,
    {required double avgPm25, bool isIndoor = false}
  ) {
    final points = <ExposureDataPoint>[];
    final totalMinutes = duration.inMinutes;
    
    for (int i = 0; i < totalMinutes; i += 15) { // Every 15 minutes when stationary
      // Indoor air tends to be more stable
      final pollutionVariation = isIndoor ? 
          _random.nextDouble() * 4 - 2 : // ±2 for indoor
          _random.nextDouble() * 8 - 4;   // ±4 for outdoor stationary
      
      final pm25 = (avgPm25 + pollutionVariation).clamp(3.0, 100.0);
      
      points.add(ExposureDataPoint(
        id: 'stationary_${i}',
        timestamp: startTime.add(Duration(minutes: i)),
        latitude: location.latitude + (_random.nextDouble() - 0.5) * 0.0001, // Minor GPS drift
        longitude: location.longitude + (_random.nextDouble() - 0.5) * 0.0001,
        pm25Value: pm25,
        pm10Value: pm25 * 1.3,
        aqiCategory: _getAqiCategory(pm25),
        aqiColor: _getAqiColor(pm25),
        accuracy: 3.0 + _random.nextDouble() * 5,
        durationAtLocation: Duration(minutes: 15),
      ));
    }
    
    return points;
  }
  
  static List<ExposureDataPoint> _generateWalk(
    DateTime startTime,
    Duration duration,
    LatLng startLocation,
    {required double avgPm25}
  ) {
    final points = <ExposureDataPoint>[];
    final totalMinutes = duration.inMinutes;
    
    for (int i = 0; i < totalMinutes; i += 3) { // Every 3 minutes while walking
      // Walking route with some randomness
      final progress = i / totalMinutes;
      final walkRadius = 0.002; // Small walking area
      final angle = progress * 2 * pi + _random.nextDouble();
      
      final lat = startLocation.latitude + sin(angle) * walkRadius * progress;
      final lng = startLocation.longitude + cos(angle) * walkRadius * progress;
      
      final pollutionVariation = _random.nextDouble() * 15 - 7.5; // ±7.5
      final pm25 = (avgPm25 + pollutionVariation).clamp(8.0, 120.0);
      
      points.add(ExposureDataPoint(
        id: 'walk_${i}',
        timestamp: startTime.add(Duration(minutes: i)),
        latitude: lat,
        longitude: lng,
        pm25Value: pm25,
        pm10Value: pm25 * 1.35,
        aqiCategory: _getAqiCategory(pm25),
        aqiColor: _getAqiColor(pm25),
        accuracy: 4.0 + _random.nextDouble() * 8,
        durationAtLocation: Duration(minutes: 3),
      ));
    }
    
    return points;
  }
  
  static List<ExposureDataPoint> _generateCycling(
    DateTime startTime,
    Duration duration,
    LatLng startLocation,
    {required double avgPm25}
  ) {
    final points = <ExposureDataPoint>[];
    final totalMinutes = duration.inMinutes;
    
    for (int i = 0; i < totalMinutes; i += 2) { // Every 2 minutes while cycling
      // Cycling route - more linear movement
      final progress = i / totalMinutes;
      final cyclingDistance = 0.008; // Larger cycling area
      
      final lat = startLocation.latitude + progress * cyclingDistance * sin(progress * 3);
      final lng = startLocation.longitude + progress * cyclingDistance * cos(progress * 3);
      
      // Cyclists get more pollution exposure due to higher breathing rate
      final pollutionVariation = _random.nextDouble() * 12 - 6; // ±6
      final pm25 = (avgPm25 + pollutionVariation).clamp(10.0, 100.0);
      
      points.add(ExposureDataPoint(
        id: 'cycling_${i}',
        timestamp: startTime.add(Duration(minutes: i)),
        latitude: lat,
        longitude: lng,
        pm25Value: pm25,
        pm10Value: pm25 * 1.4,
        aqiCategory: _getAqiCategory(pm25),
        aqiColor: _getAqiColor(pm25),
        accuracy: 3.0 + _random.nextDouble() * 6,
        durationAtLocation: Duration(minutes: 2),
      ));
    }
    
    return points;
  }
  
  static DailyExposureSummary _generateDayExposure(DateTime date, int daysAgo) {
    // Vary exposure patterns across days
    final baseExposure = 15.0 + _random.nextDouble() * 25; // 15-40 base exposure
    final isWeekend = date.weekday > 5;
    final pollutionMultiplier = isWeekend ? 0.7 : 1.0; // Less pollution on weekends
    
    // Generate fewer, simpler data points for past days
    final dataPoints = <ExposureDataPoint>[];
    final dayStart = DateTime(date.year, date.month, date.day, 7, 0);
    
    for (int hour = 0; hour < 16; hour++) { // 7 AM to 11 PM
      final pm25 = (baseExposure + _random.nextDouble() * 20 - 10) * pollutionMultiplier;
      
      dataPoints.add(ExposureDataPoint(
        id: 'day_${daysAgo}_hour_$hour',
        timestamp: dayStart.add(Duration(hours: hour)),
        latitude: 0.3476 + (_random.nextDouble() - 0.5) * 0.01,
        longitude: 32.5825 + (_random.nextDouble() - 0.5) * 0.01,
        pm25Value: pm25.clamp(5.0, 120.0),
        pm10Value: pm25 * 1.3,
        aqiCategory: _getAqiCategory(pm25),
        aqiColor: _getAqiColor(pm25),
        accuracy: 5.0,
        durationAtLocation: Duration(hours: 1),
      ));
    }
    
    return DailyExposureSummary.fromDataPoints(date, dataPoints);
  }
  
  static String _getAqiCategory(double pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy for Sensitive Groups';
    if (pm25 <= 150) return 'Unhealthy';
    return 'Very Unhealthy';
  }
  
  static String _getAqiColor(double pm25) {
    if (pm25 <= 12) return '#00E400';
    if (pm25 <= 35) return '#FFFF00';
    if (pm25 <= 55) return '#FF7E00';
    if (pm25 <= 150) return '#FF0000';
    return '#8F3F97';
  }
}