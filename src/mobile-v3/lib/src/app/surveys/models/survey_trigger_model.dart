import 'package:equatable/equatable.dart';
import 'package:geolocator/geolocator.dart';

// Context data that can be used to trigger surveys
class SurveyTriggerContext extends Equatable {
  final Position? currentLocation;
  final double? currentAirQuality;
  final String? currentAirQualityCategory;
  final DateTime timestamp;
  final Map<String, dynamic>? additionalData;

  const SurveyTriggerContext({
    this.currentLocation,
    this.currentAirQuality,
    this.currentAirQualityCategory,
    required this.timestamp,
    this.additionalData,
  });

  @override
  List<Object?> get props => [
        currentLocation,
        currentAirQuality,
        currentAirQualityCategory,
        timestamp,
        additionalData,
      ];

  factory SurveyTriggerContext.fromJson(Map<String, dynamic> json) {
    Position? location;
    if (json['currentLocation'] != null) {
      final locData = json['currentLocation'];
      location = Position(
        longitude: locData['longitude'],
        latitude: locData['latitude'],
        timestamp: DateTime.parse(locData['timestamp']),
        accuracy: locData['accuracy'],
        altitude: locData['altitude'] ?? 0.0,
        altitudeAccuracy: locData['altitudeAccuracy'] ?? 0.0,
        heading: locData['heading'] ?? 0.0,
        headingAccuracy: locData['headingAccuracy'] ?? 0.0,
        speed: locData['speed'] ?? 0.0,
        speedAccuracy: locData['speedAccuracy'] ?? 0.0,
      );
    }

    return SurveyTriggerContext(
      currentLocation: location,
      currentAirQuality: json['currentAirQuality']?.toDouble(),
      currentAirQualityCategory: json['currentAirQualityCategory'],
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      additionalData: json['additionalData'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (currentLocation != null)
        'currentLocation': {
          'longitude': currentLocation!.longitude,
          'latitude': currentLocation!.latitude,
          'timestamp': currentLocation!.timestamp.toIso8601String(),
          'accuracy': currentLocation!.accuracy,
          'altitude': currentLocation!.altitude,
          'altitudeAccuracy': currentLocation!.altitudeAccuracy,
          'heading': currentLocation!.heading,
          'headingAccuracy': currentLocation!.headingAccuracy,
          'speed': currentLocation!.speed,
          'speedAccuracy': currentLocation!.speedAccuracy,
        },
      if (currentAirQuality != null) 'currentAirQuality': currentAirQuality,
      if (currentAirQualityCategory != null)
        'currentAirQualityCategory': currentAirQualityCategory,
      'timestamp': timestamp.toIso8601String(),
      if (additionalData != null) 'additionalData': additionalData,
    };
  }
}

// Specific trigger conditions for different trigger types
class LocationBasedTriggerCondition extends Equatable {
  final double latitude;
  final double longitude;
  final double radius; // in meters
  final String? locationName;
  final bool triggerOnEnter;
  final bool triggerOnExit;

  const LocationBasedTriggerCondition({
    required this.latitude,
    required this.longitude,
    required this.radius,
    this.locationName,
    this.triggerOnEnter = true,
    this.triggerOnExit = false,
  });

  @override
  List<Object?> get props => [
        latitude,
        longitude,
        radius,
        locationName,
        triggerOnEnter,
        triggerOnExit,
      ];

  factory LocationBasedTriggerCondition.fromJson(Map<String, dynamic> json) {
    return LocationBasedTriggerCondition(
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      radius: json['radius'].toDouble(),
      locationName: json['locationName'],
      triggerOnEnter: json['triggerOnEnter'] ?? true,
      triggerOnExit: json['triggerOnExit'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'radius': radius,
      if (locationName != null) 'locationName': locationName,
      'triggerOnEnter': triggerOnEnter,
      'triggerOnExit': triggerOnExit,
    };
  }

  // Check if current position is within trigger zone
  bool isTriggered(Position currentPosition) {
    final distance = Geolocator.distanceBetween(
      latitude,
      longitude,
      currentPosition.latitude,
      currentPosition.longitude,
    );
    return distance <= radius;
  }
}

class TimeBasedTriggerCondition extends Equatable {
  final DateTime? specificTime;
  final Duration? intervalDuration;
  final List<int>? daysOfWeek; // 1-7, Monday = 1
  final int? hourOfDay; // 0-23
  final bool repeat;

  const TimeBasedTriggerCondition({
    this.specificTime,
    this.intervalDuration,
    this.daysOfWeek,
    this.hourOfDay,
    this.repeat = false,
  });

  @override
  List<Object?> get props => [
        specificTime,
        intervalDuration,
        daysOfWeek,
        hourOfDay,
        repeat,
      ];

  factory TimeBasedTriggerCondition.fromJson(Map<String, dynamic> json) {
    return TimeBasedTriggerCondition(
      specificTime: json['specificTime'] != null
          ? DateTime.parse(json['specificTime'])
          : null,
      intervalDuration: json['intervalDuration'] != null
          ? Duration(seconds: json['intervalDuration'])
          : null,
      daysOfWeek: json['daysOfWeek'] != null
          ? List<int>.from(json['daysOfWeek'])
          : null,
      hourOfDay: json['hourOfDay'],
      repeat: json['repeat'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (specificTime != null) 'specificTime': specificTime!.toIso8601String(),
      if (intervalDuration != null) 'intervalDuration': intervalDuration!.inSeconds,
      if (daysOfWeek != null) 'daysOfWeek': daysOfWeek,
      if (hourOfDay != null) 'hourOfDay': hourOfDay,
      'repeat': repeat,
    };
  }
}

class AirQualityThresholdTriggerCondition extends Equatable {
  final double threshold;
  final String comparison; // 'greater', 'less', 'equal'
  final String pollutant; // 'pm2_5', 'pm10', 'aqi', etc.
  final Duration? sustainedDuration; // How long threshold must be crossed

  const AirQualityThresholdTriggerCondition({
    required this.threshold,
    required this.comparison,
    required this.pollutant,
    this.sustainedDuration,
  });

  @override
  List<Object?> get props => [
        threshold,
        comparison,
        pollutant,
        sustainedDuration,
      ];

  factory AirQualityThresholdTriggerCondition.fromJson(Map<String, dynamic> json) {
    return AirQualityThresholdTriggerCondition(
      threshold: json['threshold'].toDouble(),
      comparison: json['comparison'] ?? 'greater',
      pollutant: json['pollutant'] ?? 'pm2_5',
      sustainedDuration: json['sustainedDuration'] != null
          ? Duration(seconds: json['sustainedDuration'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'threshold': threshold,
      'comparison': comparison,
      'pollutant': pollutant,
      if (sustainedDuration != null) 'sustainedDuration': sustainedDuration!.inSeconds,
    };
  }

  // Check if current air quality value triggers the condition
  bool isTriggered(double currentValue) {
    switch (comparison) {
      case 'greater':
        return currentValue > threshold;
      case 'less':
        return currentValue < threshold;
      case 'equal':
        return currentValue == threshold;
      case 'greaterOrEqual':
        return currentValue >= threshold;
      case 'lessOrEqual':
        return currentValue <= threshold;
      default:
        return false;
    }
  }
}

// Model to track trigger history and prevent spam
class SurveyTriggerHistory extends Equatable {
  final String surveyId;
  final String triggerType;
  final DateTime lastTriggered;
  final int triggerCount;
  final SurveyTriggerContext? lastContext;

  const SurveyTriggerHistory({
    required this.surveyId,
    required this.triggerType,
    required this.lastTriggered,
    required this.triggerCount,
    this.lastContext,
  });

  @override
  List<Object?> get props => [
        surveyId,
        triggerType,
        lastTriggered,
        triggerCount,
        lastContext,
      ];

  factory SurveyTriggerHistory.fromJson(Map<String, dynamic> json) {
    return SurveyTriggerHistory(
      surveyId: json['surveyId'] ?? '',
      triggerType: json['triggerType'] ?? '',
      lastTriggered: DateTime.parse(json['lastTriggered']),
      triggerCount: json['triggerCount'] ?? 0,
      lastContext: json['lastContext'] != null
          ? SurveyTriggerContext.fromJson(json['lastContext'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'surveyId': surveyId,
      'triggerType': triggerType,
      'lastTriggered': lastTriggered.toIso8601String(),
      'triggerCount': triggerCount,
      if (lastContext != null) 'lastContext': lastContext!.toJson(),
    };
  }

  // Check if enough time has passed since last trigger to avoid spam
  bool canTriggerAgain(Duration cooldownPeriod) {
    return DateTime.now().difference(lastTriggered) >= cooldownPeriod;
  }
}