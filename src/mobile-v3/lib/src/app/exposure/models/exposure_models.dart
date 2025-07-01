import 'package:equatable/equatable.dart';
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