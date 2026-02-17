import 'dart:math';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:geolocator/geolocator.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/shared/services/push_notification_service.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';
import 'package:airqo/src/app/shared/services/navigation_service.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';
import 'package:loggy/loggy.dart';

/// Helper class to integrate push notifications with in-app notifications
class NotificationHelper with UiLoggy {
  static final NotificationHelper _instance = NotificationHelper._internal();
  factory NotificationHelper() => _instance;
  NotificationHelper._internal();

  /// Initialize notification handling
  void initialize(BuildContext context) {
    // Handle foreground messages by showing in-app notifications
    PushNotificationService().onForegroundMessage = (RemoteMessage message) {
      _handleForegroundMessage(context, message);
    };

    // Handle notification taps for navigation
    PushNotificationService().onNotificationTap = (Map<String, dynamic> data) {
      _handleNotificationTap(context, data);
    };
  }

  /// Handle foreground messages (when app is open)
  void _handleForegroundMessage(BuildContext context, RemoteMessage message) {
    loggy.info('Handling foreground message: ${message.messageId}');

    final data = message.data;
    final type = data['type'] as String?;

    switch (type) {
      case 'air_quality_alert':
        _showAirQualityNotification(context, message);
        break;
      case 'survey':
        _showSurveyNotification(context, message);
        break;
      case 'general':
      default:
        _showGeneralNotification(context, message);
        break;
    }
  }

  /// Handle notification taps (when user taps notification)
  void _handleNotificationTap(BuildContext context, Map<String, dynamic> data) {
    loggy.info('Handling notification tap');

    final type = data['type'] as String?;

    switch (type) {
      case 'survey':
        _navigateToSurvey(context, data);
        break;
      case 'air_quality_alert':
        _navigateToAirQuality(context, data);
        break;
      default:
        loggy.info('No specific action for notification type: $type');
    }
  }

  /// Show air quality alert notification
  void _showAirQualityNotification(BuildContext context, RemoteMessage message) {
    final data = message.data;
    final body = message.notification?.body ?? '';
    final location = data['location'] as String? ?? 'your area';
    final pollutionLevel = double.tryParse(data['pollutionLevel'] ?? '');
    final category = data['category'] as String? ?? 'moderate';
    final hexColor = data['hexColor'] as String?;

    NotificationManager().showAirQualityAlert(
      context,
      message: body.isNotEmpty ? body : 'Air quality alert in $location',
      category: category,
      pollutionLevel: pollutionLevel,
      hexColor: hexColor,
      onDismiss: () {
        loggy.info('Air quality notification dismissed');
      },
    );
  }

  /// Show survey notification
  void _showSurveyNotification(BuildContext context, RemoteMessage message) {
    final data = message.data;
    final surveyId = data['survey_id'] as String?;

    if (surveyId == null) {
      loggy.warning('Survey notification missing survey_id');
      return;
    }

    // Show a simple banner - you can customize this based on your needs
    NotificationManager().showNotification(
      context,
      message: message.notification?.body ?? 'New survey available',
      isSuccess: true,
    );

    // TODO: Optionally fetch survey details and show full survey notification
    // final survey = await fetchSurvey(surveyId);
    // NotificationManager().showSurveyNotification(context, survey: survey, ...);
  }

  /// Show general notification
  void _showGeneralNotification(BuildContext context, RemoteMessage message) {
    final body = message.notification?.body ?? '';

    if (body.isNotEmpty) {
      NotificationManager().showNotification(
        context,
        message: body,
        isSuccess: true,
      );
    }
  }

  /// Navigate to survey page
  Future<void> _navigateToSurvey(BuildContext context, Map<String, dynamic> data) async {
    final surveyId = data['survey_id'] as String?;

    if (surveyId == null) {
      loggy.warning('Cannot navigate to survey: missing survey_id');
      return;
    }

    loggy.info('Navigating to survey: $surveyId');

    try {
      final survey = await SurveyRepository().getSurvey(surveyId);
      if (survey != null) {
        await NavigationService().navigateToSurvey(survey);
      } else {
        loggy.warning('Survey not found: $surveyId');
      }
    } catch (e, stackTrace) {
      loggy.error('Failed to navigate to survey', e, stackTrace);
    }
  }

  /// Navigate to air quality page (returns to dashboard root)
  void _navigateToAirQuality(BuildContext context, Map<String, dynamic> data) {
    final location = data['location'] as String?;

    loggy.info('Navigating to air quality: $location');

    NavigationService().popUntil((route) => route.isFirst);
  }

  /// Request notification permission with user-friendly prompt
  Future<bool> requestPermissionWithDialog(BuildContext context) async {
    // Check if already granted
    final hasPermission = await PushNotificationService().hasPermission();
    if (hasPermission) {
      return true;
    }

    // Check if permanently denied (Android only)
    final isPermanentlyDenied = await PushNotificationService().isPermissionPermanentlyDenied();
    if (isPermanentlyDenied) {
      if (!context.mounted) return false;

      // Show dialog to guide user to settings
      final shouldOpenSettings = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Notifications Blocked'),
          content: const Text(
            'Notifications have been permanently blocked. To enable them, '
            'please go to app settings and allow notifications.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Open Settings'),
            ),
          ],
        ),
      );

      if (shouldOpenSettings == true) {
        await PushNotificationService().openNotificationSettings();
      }
      return false;
    }

    if (!context.mounted) return false;

    // Show explanation dialog
    final shouldRequest = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Enable Notifications'),
        content: const Text(
          'Stay informed about air quality changes and new surveys in your area. '
          'We\'ll send you important alerts and updates.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Not Now'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Enable'),
          ),
        ],
      ),
    );

    if (shouldRequest == true) {
      return await PushNotificationService().requestPermission();
    }

    return false;
  }

  /// Subscribe user to relevant topics based on preferences
  Future<void> subscribeToRelevantTopics({
    bool airQualityAlerts = true,
    bool surveys = true,
    String? locationTopic,
  }) async {
    final service = PushNotificationService();

    if (airQualityAlerts) {
      await service.subscribeToTopic('air_quality_alerts');
      loggy.info('Subscribed to air quality alerts');
    }

    if (surveys) {
      await service.subscribeToTopic('surveys');
      loggy.info('Subscribed to surveys');
    }

    if (locationTopic != null && locationTopic.isNotEmpty) {
      await service.subscribeToTopic(locationTopic);
      loggy.info('Subscribed to location topic: $locationTopic');
    }
  }

  /// Unsubscribe from topics
  Future<void> unsubscribeFromTopics({
    bool airQualityAlerts = false,
    bool surveys = false,
    String? locationTopic,
  }) async {
    final service = PushNotificationService();

    if (airQualityAlerts) {
      await service.unsubscribeFromTopic('air_quality_alerts');
      loggy.info('Unsubscribed from air quality alerts');
    }

    if (surveys) {
      await service.unsubscribeFromTopic('surveys');
      loggy.info('Unsubscribed from surveys');
    }

    if (locationTopic != null && locationTopic.isNotEmpty) {
      await service.unsubscribeFromTopic(locationTopic);
      loggy.info('Unsubscribed from location topic: $locationTopic');
    }
  }

  static const String _aqAlertCooldownKey = 'aq_alert_cooldown';
  static const _alertCategories = {'Unhealthy', 'Very Unhealthy', 'Hazardous'};

  /// Check nearby air quality and fire a local notification if unhealthy+.
  /// Respects a 6-hour cooldown stored in Hive cache.
  Future<void> checkNearbyAirQuality(List<Measurement>? measurements) async {
    if (measurements == null || measurements.isEmpty) return;

    try {
      // 1. Get user position (prefer last-known for speed)
      Position? position = await Geolocator.getLastKnownPosition();
      position ??= await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 5),
        ),
      );

      // 2. Find closest measurement using Haversine distance
      Measurement? closest;
      double minDistance = double.infinity;

      for (final m in measurements) {
        final lat = m.siteDetails?.approximateLatitude;
        final lon = m.siteDetails?.approximateLongitude;
        if (lat == null || lon == null) continue;

        final d = _haversineDistance(
          position.latitude, position.longitude, lat, lon,
        );
        if (d < minDistance) {
          minDistance = d;
          closest = m;
        }
      }

      if (closest == null) {
        loggy.info('No measurement with coordinates found');
        return;
      }

      final category = closest.aqiCategory;
      if (category == null || !_alertCategories.contains(category)) {
        loggy.info('Closest station category is "$category" — no alert needed');
        return;
      }

      // 3. Check 6-hour cooldown
      final cooldown = await HiveRepository.getCache(_aqAlertCooldownKey);
      if (cooldown != null) {
        loggy.info('Air quality alert cooldown active — skipping');
        return;
      }

      // 4. Show local notification
      final locationName = closest.siteDetails?.name ??
          closest.siteDetails?.formattedName ??
          'your area';

      await PushNotificationService().showLocalNotification(
        id: _aqAlertCooldownKey.hashCode,
        title: 'Air Quality Alert',
        body: 'Air quality near $locationName is $category. '
            'Consider reducing outdoor activities.',
      );

      // 5. Save cooldown (6 hours)
      await HiveRepository.saveCache(
        _aqAlertCooldownKey,
        true,
        expiry: const Duration(hours: 6),
      );

      loggy.info('Air quality alert sent for $locationName ($category)');
    } catch (e, stackTrace) {
      loggy.error('Failed to check nearby air quality', e, stackTrace);
    }
  }

  /// Haversine distance in kilometres between two lat/lng pairs.
  double _haversineDistance(
    double lat1, double lon1, double lat2, double lon2,
  ) {
    const R = 6371.0; // Earth radius in km
    final dLat = _degToRad(lat2 - lat1);
    final dLon = _degToRad(lon2 - lon1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_degToRad(lat1)) *
            cos(_degToRad(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  double _degToRad(double deg) => deg * (pi / 180);
}
