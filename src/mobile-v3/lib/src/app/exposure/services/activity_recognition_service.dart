import 'dart:math';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Service for recognizing activities from location and exposure data
class ActivityRecognitionService {
  static const double _stationarySpeedThreshold = 0.5; // m/s
  static const double _walkingSpeedThreshold = 2.0; // m/s
  static const double _cyclingSpeedThreshold = 8.0; // m/s
  static const double _drivingSpeedThreshold = 25.0; // m/s
  static const int _minimumPointsForSegment = 3;

  /// Analyzes exposure data points to create activity segments
  Future<List<ActivitySegment>> analyzeActivities(
    List<ExposureDataPoint> dataPoints,
  ) async {
    if (dataPoints.length < _minimumPointsForSegment) {
      return [];
    }

    // Sort by timestamp
    final sortedPoints = List<ExposureDataPoint>.from(dataPoints)
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));

    // Calculate speeds and movement patterns
    final pointsWithSpeed = _calculateSpeeds(sortedPoints);

    // Identify activity segments
    final segments = _identifyActivitySegments(pointsWithSpeed);

    return segments;
  }

  /// Calculates ActivityAnalysis for a day
  Future<ActivityAnalysis> analyzeDay(
    DateTime date,
    List<ExposureDataPoint> dataPoints,
  ) async {
    final segments = await analyzeActivities(dataPoints);
    return ActivityAnalysis.fromSegments(date, segments);
  }

  List<_DataPointWithSpeed> _calculateSpeeds(List<ExposureDataPoint> points) {
    final pointsWithSpeed = <_DataPointWithSpeed>[];

    for (int i = 0; i < points.length; i++) {
      double speed = 0.0;
      
      if (i > 0) {
        final prevPoint = points[i - 1];
        final currPoint = points[i];
        
        speed = _calculateSpeed(
          prevPoint.latitude, 
          prevPoint.longitude, 
          currPoint.latitude, 
          currPoint.longitude,
          prevPoint.timestamp,
          currPoint.timestamp,
        );
      }

      pointsWithSpeed.add(_DataPointWithSpeed(points[i], speed));
    }

    return pointsWithSpeed;
  }

  double _calculateSpeed(
    double lat1, 
    double lon1, 
    double lat2, 
    double lon2,
    DateTime time1,
    DateTime time2,
  ) {
    final distance = _calculateDistance(lat1, lon1, lat2, lon2);
    final timeDiff = time2.difference(time1).inSeconds;
    
    if (timeDiff <= 0) return 0.0;
    
    return distance / timeDiff; // meters per second
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371000; // meters
    
    final dLat = (lat2 - lat1) * (pi / 180);
    final dLon = (lon2 - lon1) * (pi / 180);
    
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180)) * cos(lat2 * (pi / 180)) *
        sin(dLon / 2) * sin(dLon / 2);
    
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    
    return earthRadius * c;
  }

  List<ActivitySegment> _identifyActivitySegments(List<_DataPointWithSpeed> pointsWithSpeed) {
    final segments = <ActivitySegment>[];
    
    if (pointsWithSpeed.isEmpty) return segments;

    List<_DataPointWithSpeed> currentSegment = [pointsWithSpeed.first];
    ActivityType currentActivity = _classifyActivity(pointsWithSpeed.first.speed);

    for (int i = 1; i < pointsWithSpeed.length; i++) {
      final point = pointsWithSpeed[i];
      final activity = _classifyActivity(point.speed);

      // Check if we should continue current segment or start new one
      if (_shouldContinueSegment(currentActivity, activity, currentSegment.length)) {
        currentSegment.add(point);
      } else {
        // Finalize current segment
        if (currentSegment.length >= _minimumPointsForSegment) {
          segments.add(_createActivitySegment(currentSegment, currentActivity));
        }
        
        // Start new segment
        currentSegment = [point];
        currentActivity = activity;
      }
    }

    // Add final segment
    if (currentSegment.length >= _minimumPointsForSegment) {
      segments.add(_createActivitySegment(currentSegment, currentActivity));
    }

    final mergedSegments = _mergeShortSegments(segments);
    return _identifyIndoorPeriods(mergedSegments);
  }

  ActivityType _classifyActivity(double speed) {
    if (speed <= _stationarySpeedThreshold) {
      return ActivityType.stationary;
    } else if (speed <= _walkingSpeedThreshold) {
      return ActivityType.walking;
    } else if (speed <= _cyclingSpeedThreshold) {
      return ActivityType.cycling;
    } else if (speed <= _drivingSpeedThreshold) {
      return ActivityType.driving;
    } else {
      return ActivityType.publicTransport;
    }
  }

  bool _shouldContinueSegment(ActivityType currentActivity, ActivityType newActivity, int segmentLength) {
    // Always continue if it's the same activity
    if (currentActivity == newActivity) return true;
    
    // If segment is very short, be more flexible
    if (segmentLength < 5) {
      return _areActivitiesSimilar(currentActivity, newActivity);
    }
    
    return false;
  }

  bool _areActivitiesSimilar(ActivityType activity1, ActivityType activity2) {
    // Group similar activities
    final stationaryGroup = {ActivityType.stationary, ActivityType.indoor};
    final slowMovementGroup = {ActivityType.walking, ActivityType.cycling};
    final fastMovementGroup = {ActivityType.driving, ActivityType.publicTransport};
    
    return (stationaryGroup.contains(activity1) && stationaryGroup.contains(activity2)) ||
           (slowMovementGroup.contains(activity1) && slowMovementGroup.contains(activity2)) ||
           (fastMovementGroup.contains(activity1) && fastMovementGroup.contains(activity2));
  }

  ActivitySegment _createActivitySegment(List<_DataPointWithSpeed> points, ActivityType activity) {
    final dataPoints = points.map((p) => p.dataPoint).toList();
    final startTime = dataPoints.first.timestamp;
    final endTime = dataPoints.last.timestamp;
    final totalExposure = dataPoints.fold(0.0, (sum, point) => sum + point.exposureScore);
    final averageSpeed = points.fold(0.0, (sum, point) => sum + point.speed) / points.length;
    
    // Calculate distance
    double totalDistance = 0.0;
    for (int i = 1; i < dataPoints.length; i++) {
      totalDistance += _calculateDistance(
        dataPoints[i - 1].latitude,
        dataPoints[i - 1].longitude,
        dataPoints[i].latitude,
        dataPoints[i].longitude,
      );
    }

    return ActivitySegment(
      id: '${startTime.millisecondsSinceEpoch}_${activity.name}',
      startTime: startTime,
      endTime: endTime,
      activityType: activity,
      dataPoints: dataPoints,
      totalExposureScore: totalExposure,
      averageSpeed: averageSpeed,
      distanceCovered: totalDistance,
      startLocation: LatLng(dataPoints.first.latitude, dataPoints.first.longitude),
      endLocation: LatLng(dataPoints.last.latitude, dataPoints.last.longitude),
      routeName: _generateRouteName(activity, dataPoints),
    );
  }

  String _generateRouteName(ActivityType activity, List<ExposureDataPoint> dataPoints) {
    final start = dataPoints.first;
    final end = dataPoints.last;
    
    // This is a simplified naming - in a real app you might use reverse geocoding
    return '${activity.displayName} from ${start.timestamp.hour}:${start.timestamp.minute.toString().padLeft(2, '0')} to ${end.timestamp.hour}:${end.timestamp.minute.toString().padLeft(2, '0')}';
  }

  List<ActivitySegment> _mergeShortSegments(List<ActivitySegment> segments) {
    if (segments.length <= 1) return segments;

    final mergedSegments = <ActivitySegment>[];
    ActivitySegment? currentSegment;

    for (final segment in segments) {
      if (currentSegment == null) {
        currentSegment = segment;
        continue;
      }

      // Merge very short segments with adjacent ones
      if (segment.duration.inMinutes < 2 && 
          _areActivitiesSimilar(currentSegment.activityType, segment.activityType)) {
        
        // Merge segments
        final mergedDataPoints = [...currentSegment.dataPoints, ...segment.dataPoints];
        final totalExposure = currentSegment.totalExposureScore + segment.totalExposureScore;
        final avgSpeed = (currentSegment.averageSpeed + segment.averageSpeed) / 2;
        final totalDistance = currentSegment.distanceCovered + segment.distanceCovered;

        currentSegment = ActivitySegment(
          id: '${currentSegment.startTime.millisecondsSinceEpoch}_${currentSegment.activityType.name}_merged',
          startTime: currentSegment.startTime,
          endTime: segment.endTime,
          activityType: currentSegment.activityType,
          dataPoints: mergedDataPoints,
          totalExposureScore: totalExposure,
          averageSpeed: avgSpeed,
          distanceCovered: totalDistance,
          startLocation: currentSegment.startLocation,
          endLocation: segment.endLocation,
          routeName: currentSegment.routeName,
        );
      } else {
        mergedSegments.add(currentSegment);
        currentSegment = segment;
      }
    }

    if (currentSegment != null) {
      mergedSegments.add(currentSegment);
    }

    return mergedSegments;
  }

  /// Identifies indoor periods based on stationary time and pollution patterns
  List<ActivitySegment> _identifyIndoorPeriods(List<ActivitySegment> segments) {
    final updatedSegments = <ActivitySegment>[];

    for (final segment in segments) {
      if (segment.activityType == ActivityType.stationary && 
          segment.duration.inMinutes >= 30) {
        
        // Check if pollution levels are consistently lower (indicating indoor)
        final avgPollution = segment.dataPoints
            .map((p) => p.pm25Value ?? 0)
            .fold(0.0, (sum, val) => sum + val) / segment.dataPoints.length;
        
        // Simple heuristic: if pollution is significantly lower than outdoor average
        // and person is stationary for long periods, assume indoor
        if (avgPollution < 15 && segment.duration.inMinutes >= 60) {
          final indoorSegment = ActivitySegment(
            id: segment.id,
            startTime: segment.startTime,
            endTime: segment.endTime,
            activityType: ActivityType.indoor,
            dataPoints: segment.dataPoints,
            totalExposureScore: segment.totalExposureScore,
            averageSpeed: segment.averageSpeed,
            distanceCovered: segment.distanceCovered,
            startLocation: segment.startLocation,
            endLocation: segment.endLocation,
            routeName: segment.routeName?.replaceAll('Stationary', 'Indoor'),
          );
          updatedSegments.add(indoorSegment);
        } else {
          updatedSegments.add(segment);
        }
      } else {
        updatedSegments.add(segment);
      }
    }

    return updatedSegments;
  }

  /// Gets exposure comparison by activity type
  Map<ActivityType, double> getExposureByActivity(List<ActivitySegment> segments) {
    final exposureByActivity = <ActivityType, double>{};
    
    for (final segment in segments) {
      exposureByActivity[segment.activityType] = 
          (exposureByActivity[segment.activityType] ?? 0) + segment.totalExposureScore;
    }
    
    return exposureByActivity;
  }

  /// Gets time spent by activity type
  Map<ActivityType, Duration> getTimeByActivity(List<ActivitySegment> segments) {
    final timeByActivity = <ActivityType, Duration>{};
    
    for (final segment in segments) {
      timeByActivity[segment.activityType] = 
          (timeByActivity[segment.activityType] ?? Duration.zero) + segment.duration;
    }
    
    return timeByActivity;
  }

  /// Finds the most polluted routes/activities
  List<ActivitySegment> getMostExposingActivities(
    List<ActivitySegment> segments, 
    {int limit = 5}
  ) {
    final sortedSegments = List<ActivitySegment>.from(segments)
      ..sort((a, b) => b.exposurePerMinute.compareTo(a.exposurePerMinute));
    
    return sortedSegments.take(limit).toList();
  }

  /// Generates activity-specific recommendations
  List<String> generateActivityRecommendations(ActivityAnalysis analysis) {
    final recommendations = <String>[];
    
    // High exposure activities
    if (analysis.exposureByActivity[ActivityType.walking] != null && 
        analysis.exposureByActivity[ActivityType.walking]! > 15) {
      recommendations.add('Consider walking during early morning or evening hours when air quality is typically better.');
    }
    
    if (analysis.exposureByActivity[ActivityType.cycling] != null && 
        analysis.exposureByActivity[ActivityType.cycling]! > 20) {
      recommendations.add('Plan cycling routes through parks or less trafficked areas to reduce pollution exposure.');
    }
    
    if (analysis.exposureByActivity[ActivityType.driving] != null && 
        analysis.exposureByActivity[ActivityType.driving]! > 10) {
      recommendations.add('Use air recirculation mode when driving through high-pollution areas.');
    }
    
    // Activity patterns
    final totalOutdoorTime = analysis.timeByActivity.entries
        .where((e) => [ActivityType.walking, ActivityType.cycling].contains(e.key))
        .fold(Duration.zero, (sum, e) => sum + e.value);
    
    if (totalOutdoorTime.inHours > 3) {
      recommendations.add('You spent ${totalOutdoorTime.inHours}+ hours in outdoor activities. Consider checking air quality forecasts before long sessions.');
    }
    
    return recommendations;
  }
}

/// Internal class to hold data point with calculated speed
class _DataPointWithSpeed {
  final ExposureDataPoint dataPoint;
  final double speed;

  _DataPointWithSpeed(this.dataPoint, this.speed);
}