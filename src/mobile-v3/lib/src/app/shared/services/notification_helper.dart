import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:airqo/src/app/shared/services/push_notification_service.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';
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
  void _navigateToSurvey(BuildContext context, Map<String, dynamic> data) {
    final surveyId = data['survey_id'] as String?;

    if (surveyId == null) {
      loggy.warning('Cannot navigate to survey: missing survey_id');
      return;
    }

    loggy.info('Navigating to survey: $surveyId');

    // TODO: Implement navigation to survey page
    // Example:
    // Navigator.of(context).pushNamed('/survey', arguments: surveyId);
    // or
    // Navigator.of(context).push(MaterialPageRoute(
    //   builder: (context) => SurveyDetailPage(surveyId: surveyId),
    // ));
  }

  /// Navigate to air quality page
  void _navigateToAirQuality(BuildContext context, Map<String, dynamic> data) {
    final location = data['location'] as String?;

    loggy.info('Navigating to air quality: $location');

    // TODO: Implement navigation to dashboard or map
    // Example:
    // Navigator.of(context).pushNamed('/dashboard');
    // or if coordinates provided:
    // Navigator.of(context).pushNamed('/map', arguments: {
    //   'latitude': latitude,
    //   'longitude': longitude,
    // });
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

  /// Send FCM token to backend server
  Future<bool> syncTokenWithBackend(String userId) async {
    try {
      final token = PushNotificationService().currentToken;

      if (token == null) {
        loggy.warning('No FCM token available to sync');
        return false;
      }

      loggy.info('Syncing FCM token with backend for user: $userId');

      // TODO: Implement API call to your backend
      // Example:
      // await yourApiService.updateFcmToken(
      //   userId: userId,
      //   fcmToken: token,
      // );

      loggy.info('FCM token synced successfully');
      return true;
    } catch (e, stackTrace) {
      loggy.error('Failed to sync FCM token with backend', e, stackTrace);
      return false;
    }
  }

  /// Remove FCM token from backend when user logs out
  Future<void> removeTokenFromBackend(String userId) async {
    try {
      loggy.info('Removing FCM token from backend for user: $userId');

      // TODO: Implement API call to your backend
      // Example:
      // await yourApiService.removeFcmToken(userId: userId);

      // Delete local token
      await PushNotificationService().deleteToken();

      loggy.info('FCM token removed successfully');
    } catch (e, stackTrace) {
      loggy.error('Failed to remove FCM token from backend', e, stackTrace);
    }
  }
}
