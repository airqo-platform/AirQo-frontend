import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';

/// Represents a data point combining location and air quality at a specific time
class ExposureDataPoint extends Equatable {
  final String id;
  final DateTime timestamp;
  final double latitude;
  final double longitude;
  final double? pm25Value;
  final double? pm10Value;
  final double? no2Value;
  final String? aqiCategory;
  final String? aqiColor;
  final double? accuracy;
  final Duration? durationAtLocation;

  const ExposureDataPoint({
    required this.id,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    this.pm25Value,
    this.pm10Value,
    this.no2Value,
    this.aqiCategory,
    this.aqiColor,
    this.accuracy,
    this.durationAtLocation,
  });

  @override
  List<Object?> get props => [
        id,
        timestamp,
        latitude,
        longitude,
        pm25Value,
        pm10Value,
        no2Value,
        aqiCategory,
        aqiColor,
        accuracy,
        durationAtLocation,
      ];

  /// Create from location data point and measurement
  factory ExposureDataPoint.fromLocationAndMeasurement({
    required LocationDataPoint locationPoint,
    required Measurement measurement,
    Duration? duration,
  }) {
    return ExposureDataPoint(
      id: '${locationPoint.id}_${measurement.id ?? "unknown"}',
      timestamp: locationPoint.timestamp,
      latitude: locationPoint.latitude,
      longitude: locationPoint.longitude,
      pm25Value: measurement.pm25?.value,
      pm10Value: measurement.pm10?.value,
      //no2Value: measurement.no2?.value,
      aqiCategory: measurement.aqiCategory,
      aqiColor: measurement.aqiColor,
      accuracy: locationPoint.accuracy,
      durationAtLocation: duration,
    );
  }

  /// Get AQI category severity level (0-5, higher is worse)
  int get severityLevel {
    switch (aqiCategory?.toLowerCase()) {
      case 'good':
        return 0;
      case 'moderate':
        return 1;
      case 'unhealthy for sensitive groups':
        return 2;
      case 'unhealthy':
        return 3;
      case 'very unhealthy':
        return 4;
      case 'hazardous':
        return 5;
      default:
        return 0;
    }
  }

  /// Calculate exposure score based on PM2.5 and duration
  double get exposureScore {
    if (pm25Value == null || durationAtLocation == null) return 0.0;
    
    // Exposure = concentration × time (simplified)
    // Weight by severity and duration in hours
    final durationHours = durationAtLocation!.inMinutes / 60.0;
    final concentrationFactor = pm25Value! / 100.0; // Normalize to 0-1+ scale
    
    return concentrationFactor * durationHours * (severityLevel + 1);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'latitude': latitude,
      'longitude': longitude,
      if (pm25Value != null) 'pm25Value': pm25Value,
      if (pm10Value != null) 'pm10Value': pm10Value,
      if (no2Value != null) 'no2Value': no2Value,
      if (aqiCategory != null) 'aqiCategory': aqiCategory,
      if (aqiColor != null) 'aqiColor': aqiColor,
      if (accuracy != null) 'accuracy': accuracy,
      if (durationAtLocation != null) 'durationAtLocation': durationAtLocation!.inSeconds,
    };
  }

  factory ExposureDataPoint.fromJson(Map<String, dynamic> json) {
    return ExposureDataPoint(
      id: json['id'],
      timestamp: DateTime.parse(json['timestamp']),
      latitude: json['latitude'],
      longitude: json['longitude'],
      pm25Value: json['pm25Value']?.toDouble(),
      pm10Value: json['pm10Value']?.toDouble(),
      no2Value: json['no2Value']?.toDouble(),
      aqiCategory: json['aqiCategory'],
      aqiColor: json['aqiColor'],
      accuracy: json['accuracy']?.toDouble(),
      durationAtLocation: json['durationAtLocation'] != null
          ? Duration(seconds: json['durationAtLocation'])
          : null,
    );
  }
}

/// Daily exposure summary with aggregated metrics
class DailyExposureSummary extends Equatable {
  final DateTime date;
  final List<ExposureDataPoint> dataPoints;
  final double totalExposureScore;
  final Duration totalOutdoorTime;
  final Map<String, Duration> timeByAqiCategory;
  final double averagePm25;
  final double maxPm25;
  final String dominantAqiCategory;

  const DailyExposureSummary({
    required this.date,
    required this.dataPoints,
    required this.totalExposureScore,
    required this.totalOutdoorTime,
    required this.timeByAqiCategory,
    required this.averagePm25,
    required this.maxPm25,
    required this.dominantAqiCategory,
  });

  @override
  List<Object?> get props => [
        date,
        dataPoints,
        totalExposureScore,
        totalOutdoorTime,
        timeByAqiCategory,
        averagePm25,
        maxPm25,
        dominantAqiCategory,
      ];

  /// Create from list of exposure data points for a single day
  factory DailyExposureSummary.fromDataPoints(
    DateTime date,
    List<ExposureDataPoint> points,
  ) {
    if (points.isEmpty) {
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

    // Calculate metrics
    final totalScore = points.fold(0.0, (sum, point) => sum + point.exposureScore);
    final totalTime = points.fold(
      Duration.zero,
      (sum, point) => sum + (point.durationAtLocation ?? Duration.zero),
    );

    // Group time by AQI category
    final timeByCategory = <String, Duration>{};
    for (final point in points) {
      final category = point.aqiCategory ?? 'Unknown';
      final duration = point.durationAtLocation ?? Duration.zero;
      timeByCategory[category] = (timeByCategory[category] ?? Duration.zero) + duration;
    }

    // Calculate PM2.5 statistics
    final pm25Values = points.where((p) => p.pm25Value != null).map((p) => p.pm25Value!);
    final avgPm25 = pm25Values.isNotEmpty 
        ? pm25Values.reduce((a, b) => a + b) / pm25Values.length 
        : 0.0;
    final maxPm25 = pm25Values.isNotEmpty ? pm25Values.reduce((a, b) => a > b ? a : b) : 0.0;

    // Find dominant AQI category (most time spent)
    final dominantCategory = timeByCategory.entries.isNotEmpty
        ? timeByCategory.entries.reduce((a, b) => a.value > b.value ? a : b).key
        : 'Unknown';

    return DailyExposureSummary(
      date: date,
      dataPoints: points,
      totalExposureScore: totalScore,
      totalOutdoorTime: totalTime,
      timeByAqiCategory: timeByCategory,
      averagePm25: avgPm25,
      maxPm25: maxPm25,
      dominantAqiCategory: dominantCategory,
    );
  }

  /// Get risk level based on exposure score and time
  ExposureRiskLevel get riskLevel {
    if (totalExposureScore >= 50) return ExposureRiskLevel.high;
    if (totalExposureScore >= 20) return ExposureRiskLevel.moderate;
    if (totalExposureScore >= 5) return ExposureRiskLevel.low;
    return ExposureRiskLevel.minimal;
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'dataPoints': dataPoints.map((dp) => dp.toJson()).toList(),
      'totalExposureScore': totalExposureScore,
      'totalOutdoorTime': totalOutdoorTime.inSeconds,
      'timeByAqiCategory': timeByAqiCategory.map((k, v) => MapEntry(k, v.inSeconds)),
      'averagePm25': averagePm25,
      'maxPm25': maxPm25,
      'dominantAqiCategory': dominantAqiCategory,
    };
  }

  factory DailyExposureSummary.fromJson(Map<String, dynamic> json) {
    final timeByCategory = <String, Duration>{};
    (json['timeByAqiCategory'] as Map<String, dynamic>).forEach((key, value) {
      timeByCategory[key] = Duration(seconds: value);
    });

    return DailyExposureSummary(
      date: DateTime.parse(json['date']),
      dataPoints: (json['dataPoints'] as List)
          .map((dp) => ExposureDataPoint.fromJson(dp))
          .toList(),
      totalExposureScore: json['totalExposureScore'],
      totalOutdoorTime: Duration(seconds: json['totalOutdoorTime']),
      timeByAqiCategory: timeByCategory,
      averagePm25: json['averagePm25'],
      maxPm25: json['maxPm25'],
      dominantAqiCategory: json['dominantAqiCategory'],
    );
  }
}

/// Weekly exposure trends and analysis
class WeeklyExposureTrend extends Equatable {
  final DateTime weekStartDate;
  final List<DailyExposureSummary> dailySummaries;
  final double averageDailyExposure;
  final Duration averageDailyOutdoorTime;
  final List<String> recommendations;
  final ExposureRiskLevel overallRiskLevel;

  const WeeklyExposureTrend({
    required this.weekStartDate,
    required this.dailySummaries,
    required this.averageDailyExposure,
    required this.averageDailyOutdoorTime,
    required this.recommendations,
    required this.overallRiskLevel,
  });

  @override
  List<Object?> get props => [
        weekStartDate,
        dailySummaries,
        averageDailyExposure,
        averageDailyOutdoorTime,
        recommendations,
        overallRiskLevel,
      ];

  factory WeeklyExposureTrend.fromDailySummaries(
    DateTime weekStart,
    List<DailyExposureSummary> summaries,
  ) {
    final avgExposure = summaries.isNotEmpty
        ? summaries.map((s) => s.totalExposureScore).reduce((a, b) => a + b) / summaries.length
        : 0.0;

    final avgOutdoorTime = summaries.isNotEmpty
        ? Duration(
            seconds: summaries
                    .map((s) => s.totalOutdoorTime.inSeconds)
                    .reduce((a, b) => a + b) ~/
                summaries.length,
          )
        : Duration.zero;

    // Generate recommendations based on exposure patterns
    final recommendations = _generateRecommendations(summaries);
    
    // Calculate overall risk level
    final riskLevel = _calculateOverallRiskLevel(summaries);

    return WeeklyExposureTrend(
      weekStartDate: weekStart,
      dailySummaries: summaries,
      averageDailyExposure: avgExposure,
      averageDailyOutdoorTime: avgOutdoorTime,
      recommendations: recommendations,
      overallRiskLevel: riskLevel,
    );
  }

  static List<String> _generateRecommendations(List<DailyExposureSummary> summaries) {
    final recommendations = <String>[];
    
    if (summaries.isEmpty) return recommendations;

    final highExposureDays = summaries.where((s) => s.riskLevel == ExposureRiskLevel.high).length;
    final avgOutdoorHours = summaries
        .map((s) => s.totalOutdoorTime.inHours)
        .reduce((a, b) => a + b) / summaries.length;

    if (highExposureDays >= 2) {
      recommendations.add('Consider reducing outdoor activities on high pollution days');
      recommendations.add('Use air quality alerts to plan your daily activities');
    }

    if (avgOutdoorHours > 4) {
      recommendations.add('Try to schedule outdoor activities during better air quality hours');
      recommendations.add('Consider wearing a mask during high pollution periods');
    }

    final morningExposure = summaries
        .expand((s) => s.dataPoints)
        .where((p) => p.timestamp.hour >= 6 && p.timestamp.hour <= 10)
        .map((p) => p.exposureScore)
        .fold(0.0, (a, b) => a + b);

    final eveningExposure = summaries
        .expand((s) => s.dataPoints)
        .where((p) => p.timestamp.hour >= 17 && p.timestamp.hour <= 21)
        .map((p) => p.exposureScore)
        .fold(0.0, (a, b) => a + b);

    if (morningExposure > eveningExposure * 1.5) {
      recommendations.add('Morning air quality tends to be worse - consider adjusting your schedule');
    }

    return recommendations;
  }

  static ExposureRiskLevel _calculateOverallRiskLevel(List<DailyExposureSummary> summaries) {
    if (summaries.isEmpty) return ExposureRiskLevel.minimal;

    final highRiskDays = summaries.where((s) => s.riskLevel == ExposureRiskLevel.high).length;
    final moderateRiskDays = summaries.where((s) => s.riskLevel == ExposureRiskLevel.moderate).length;

    if (highRiskDays >= 3) return ExposureRiskLevel.high;
    if (highRiskDays >= 1 || moderateRiskDays >= 4) return ExposureRiskLevel.moderate;
    if (moderateRiskDays >= 1) return ExposureRiskLevel.low;
    
    return ExposureRiskLevel.minimal;
  }
}

/// Risk levels for exposure assessment
enum ExposureRiskLevel {
  minimal,
  low,
  moderate,
  high,
}

/// Activity types for exposure analysis
enum ActivityType {
  stationary,
  walking,
  cycling,
  driving,
  publicTransport,
  indoor,
  unknown,
}

extension ActivityTypeExtension on ActivityType {
  String get displayName {
    switch (this) {
      case ActivityType.stationary:
        return 'Stationary';
      case ActivityType.walking:
        return 'Walking';
      case ActivityType.cycling:
        return 'Cycling';
      case ActivityType.driving:
        return 'Driving';
      case ActivityType.publicTransport:
        return 'Public Transport';
      case ActivityType.indoor:
        return 'Indoor';
      case ActivityType.unknown:
        return 'Unknown';
    }
  }

  String get description {
    switch (this) {
      case ActivityType.stationary:
        return 'Staying in one place for extended periods';
      case ActivityType.walking:
        return 'Walking or jogging outdoors';
      case ActivityType.cycling:
        return 'Cycling or biking';
      case ActivityType.driving:
        return 'Driving a personal vehicle';
      case ActivityType.publicTransport:
        return 'Using buses, trains, or other public transport';
      case ActivityType.indoor:
        return 'Inside buildings or enclosed spaces';
      case ActivityType.unknown:
        return 'Activity could not be determined';
    }
  }

  IconData get icon {
    switch (this) {
      case ActivityType.stationary:
        return Icons.place;
      case ActivityType.walking:
        return Icons.directions_walk;
      case ActivityType.cycling:
        return Icons.directions_bike;
      case ActivityType.driving:
        return Icons.directions_car;
      case ActivityType.publicTransport:
        return Icons.directions_bus;
      case ActivityType.indoor:
        return Icons.home;
      case ActivityType.unknown:
        return Icons.help_outline;
    }
  }
}

/// Route segment with activity classification
class ActivitySegment extends Equatable {
  final String id;
  final DateTime startTime;
  final DateTime endTime;
  final ActivityType activityType;
  final List<ExposureDataPoint> dataPoints;
  final double totalExposureScore;
  final double averageSpeed;
  final double distanceCovered;
  final LatLng? startLocation;
  final LatLng? endLocation;
  final String? routeName;

  const ActivitySegment({
    required this.id,
    required this.startTime,
    required this.endTime,
    required this.activityType,
    required this.dataPoints,
    required this.totalExposureScore,
    required this.averageSpeed,
    required this.distanceCovered,
    this.startLocation,
    this.endLocation,
    this.routeName,
  });

  @override
  List<Object?> get props => [
        id,
        startTime,
        endTime,
        activityType,
        dataPoints,
        totalExposureScore,
        averageSpeed,
        distanceCovered,
        startLocation,
        endLocation,
        routeName,
      ];

  Duration get duration => endTime.difference(startTime);

  double get exposurePerMinute {
    final minutes = duration.inMinutes;
    return minutes > 0 ? totalExposureScore / minutes : 0.0;
  }

  ExposureRiskLevel get riskLevel {
    if (totalExposureScore >= 20) return ExposureRiskLevel.high;
    if (totalExposureScore >= 10) return ExposureRiskLevel.moderate;
    if (totalExposureScore >= 3) return ExposureRiskLevel.low;
    return ExposureRiskLevel.minimal;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'activityType': activityType.name,
      'dataPoints': dataPoints.map((dp) => dp.toJson()).toList(),
      'totalExposureScore': totalExposureScore,
      'averageSpeed': averageSpeed,
      'distanceCovered': distanceCovered,
      if (startLocation != null) 'startLocation': {
        'latitude': startLocation!.latitude,
        'longitude': startLocation!.longitude,
      },
      if (endLocation != null) 'endLocation': {
        'latitude': endLocation!.latitude,
        'longitude': endLocation!.longitude,
      },
      if (routeName != null) 'routeName': routeName,
    };
  }

  factory ActivitySegment.fromJson(Map<String, dynamic> json) {
    return ActivitySegment(
      id: json['id'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      activityType: ActivityType.values.byName(json['activityType']),
      dataPoints: (json['dataPoints'] as List)
          .map((dp) => ExposureDataPoint.fromJson(dp))
          .toList(),
      totalExposureScore: json['totalExposureScore'],
      averageSpeed: json['averageSpeed'],
      distanceCovered: json['distanceCovered'],
      startLocation: json['startLocation'] != null
          ? LatLng(json['startLocation']['latitude'], json['startLocation']['longitude'])
          : null,
      endLocation: json['endLocation'] != null
          ? LatLng(json['endLocation']['latitude'], json['endLocation']['longitude'])
          : null,
      routeName: json['routeName'],
    );
  }
}

/// Analysis of activities and their exposure impact
class ActivityAnalysis extends Equatable {
  final DateTime date;
  final List<ActivitySegment> segments;
  final Map<ActivityType, double> exposureByActivity;
  final Map<ActivityType, Duration> timeByActivity;
  final ActivityType mostExposingActivity;
  final ActivityType longestActivity;
  final List<String> recommendations;

  const ActivityAnalysis({
    required this.date,
    required this.segments,
    required this.exposureByActivity,
    required this.timeByActivity,
    required this.mostExposingActivity,
    required this.longestActivity,
    required this.recommendations,
  });

  @override
  List<Object?> get props => [
        date,
        segments,
        exposureByActivity,
        timeByActivity,
        mostExposingActivity,
        longestActivity,
        recommendations,
      ];

  factory ActivityAnalysis.fromSegments(DateTime date, List<ActivitySegment> segments) {
    if (segments.isEmpty) {
      return ActivityAnalysis(
        date: date,
        segments: [],
        exposureByActivity: {},
        timeByActivity: {},
        mostExposingActivity: ActivityType.unknown,
        longestActivity: ActivityType.unknown,
        recommendations: [],
      );
    }

    // Calculate exposure by activity
    final exposureByActivity = <ActivityType, double>{};
    final timeByActivity = <ActivityType, Duration>{};

    for (final segment in segments) {
      final activity = segment.activityType;
      exposureByActivity[activity] = (exposureByActivity[activity] ?? 0) + segment.totalExposureScore;
      timeByActivity[activity] = (timeByActivity[activity] ?? Duration.zero) + segment.duration;
    }

    // Find most exposing and longest activities
    final mostExposing = exposureByActivity.entries.isNotEmpty
        ? exposureByActivity.entries.reduce((a, b) => a.value > b.value ? a : b).key
        : ActivityType.unknown;

    final longest = timeByActivity.entries.isNotEmpty
        ? timeByActivity.entries.reduce((a, b) => a.value > b.value ? a : b).key
        : ActivityType.unknown;

    // Generate recommendations
    final recommendations = _generateActivityRecommendations(segments, exposureByActivity, timeByActivity);

    return ActivityAnalysis(
      date: date,
      segments: segments,
      exposureByActivity: exposureByActivity,
      timeByActivity: timeByActivity,
      mostExposingActivity: mostExposing,
      longestActivity: longest,
      recommendations: recommendations,
    );
  }

  static List<String> _generateActivityRecommendations(
    List<ActivitySegment> segments,
    Map<ActivityType, double> exposureByActivity,
    Map<ActivityType, Duration> timeByActivity,
  ) {
    final recommendations = <String>[];

    // High exposure activities
    final highExposureActivities = exposureByActivity.entries
        .where((e) => e.value > 15)
        .map((e) => e.key)
        .toList();

    if (highExposureActivities.contains(ActivityType.walking)) {
      recommendations.add('Consider walking during early morning or evening hours when air quality is typically better.');
    }

    if (highExposureActivities.contains(ActivityType.cycling)) {
      recommendations.add('Plan cycling routes through parks or less trafficked areas to reduce pollution exposure.');
    }

    if (highExposureActivities.contains(ActivityType.driving)) {
      recommendations.add('Use air recirculation mode in your car when driving through high-pollution areas.');
    }

    // Long duration activities
    final longOutdoorTime = timeByActivity.entries
        .where((e) => [ActivityType.walking, ActivityType.cycling].contains(e.key))
        .fold(Duration.zero, (sum, e) => sum + e.value);

    if (longOutdoorTime.inHours > 3) {
      recommendations.add('You spent ${longOutdoorTime.inHours}+ hours in outdoor activities. Consider checking air quality forecasts before long outdoor sessions.');
    }

    // Activity patterns
    final morningSegments = segments.where((s) => s.startTime.hour >= 6 && s.startTime.hour <= 10).toList();
    final eveningSegments = segments.where((s) => s.startTime.hour >= 17 && s.startTime.hour <= 21).toList();

    final morningExposure = morningSegments.fold(0.0, (sum, s) => sum + s.totalExposureScore);
    final eveningExposure = eveningSegments.fold(0.0, (sum, s) => sum + s.totalExposureScore);

    if (morningExposure > eveningExposure * 1.5) {
      recommendations.add('Your morning activities had higher pollution exposure. Consider adjusting your schedule when possible.');
    }

    return recommendations;
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'segments': segments.map((s) => s.toJson()).toList(),
      'exposureByActivity': exposureByActivity.map((k, v) => MapEntry(k.name, v)),
      'timeByActivity': timeByActivity.map((k, v) => MapEntry(k.name, v.inSeconds)),
      'mostExposingActivity': mostExposingActivity.name,
      'longestActivity': longestActivity.name,
      'recommendations': recommendations,
    };
  }

  factory ActivityAnalysis.fromJson(Map<String, dynamic> json) {
    final exposureByActivity = <ActivityType, double>{};
    (json['exposureByActivity'] as Map<String, dynamic>).forEach((key, value) {
      exposureByActivity[ActivityType.values.byName(key)] = value;
    });

    final timeByActivity = <ActivityType, Duration>{};
    (json['timeByActivity'] as Map<String, dynamic>).forEach((key, value) {
      timeByActivity[ActivityType.values.byName(key)] = Duration(seconds: value);
    });

    return ActivityAnalysis(
      date: DateTime.parse(json['date']),
      segments: (json['segments'] as List)
          .map((s) => ActivitySegment.fromJson(s))
          .toList(),
      exposureByActivity: exposureByActivity,
      timeByActivity: timeByActivity,
      mostExposingActivity: ActivityType.values.byName(json['mostExposingActivity']),
      longestActivity: ActivityType.values.byName(json['longestActivity']),
      recommendations: List<String>.from(json['recommendations']),
    );
  }
}

extension ExposureRiskLevelExtension on ExposureRiskLevel {
  String get displayName {
    switch (this) {
      case ExposureRiskLevel.minimal:
        return 'Minimal';
      case ExposureRiskLevel.low:
        return 'Low';
      case ExposureRiskLevel.moderate:
        return 'Moderate';
      case ExposureRiskLevel.high:
        return 'High';
    }
  }

  String get description {
    switch (this) {
      case ExposureRiskLevel.minimal:
        return 'Very low pollution exposure';
      case ExposureRiskLevel.low:
        return 'Low pollution exposure with minimal health impact';
      case ExposureRiskLevel.moderate:
        return 'Moderate exposure - consider reducing outdoor activities';
      case ExposureRiskLevel.high:
        return 'High exposure - limit outdoor activities and take precautions';
    }
  }
}