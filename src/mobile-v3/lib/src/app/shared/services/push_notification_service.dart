import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:permission_handler/permission_handler.dart';

class PushNotificationService with UiLoggy {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  static const String channelId = 'airqo_notifications';
  static const String channelName = 'AirQo Notifications';
  static const String channelDescription = 'Notifications for air quality alerts and surveys';

  static const String _fcmTokenKey = 'fcm_token';
  static const String _boxName = 'push_notifications';

  String? _currentToken;
  bool _isInitialized = false;

  /// Callback for handling notification taps when app is in foreground/background
  Function(Map<String, dynamic>)? onNotificationTap;

  /// Callback for handling notification received in foreground
  Function(RemoteMessage)? onForegroundMessage;

  /// Initialize push notifications
  Future<void> initialize() async {
    if (_isInitialized) {
      loggy.info('Push notifications already initialized');
      return;
    }

    try {
      loggy.info('Initializing push notification service...');

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Request notification permissions
      await requestPermission();

      // Get FCM token
      await _getAndSaveToken();

      // Listen to token refresh
      _firebaseMessaging.onTokenRefresh.listen(_onTokenRefresh);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle notification taps when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Check if app was opened from a terminated state by tapping notification
      final initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        loggy.info('App opened from terminated state via notification');
        _handleNotificationTap(initialMessage);
      }

      _isInitialized = true;
      loggy.info('Push notification service initialized successfully');
    } catch (e, stackTrace) {
      loggy.error('Failed to initialize push notifications', e, stackTrace);
    }
  }

  /// Initialize local notifications for displaying custom notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onLocalNotificationTap,
    );

    // Create notification channel for Android
    if (Platform.isAndroid) {
      await _createNotificationChannel();
    }
  }

  /// Create Android notification channel
  Future<void> _createNotificationChannel() async {
    const channel = AndroidNotificationChannel(
      channelId,
      channelName,
      description: channelDescription,
      importance: Importance.high,
      enableVibration: true,
      playSound: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  /// Request notification permissions
  Future<bool> requestPermission() async {
    try {
      // Handle Android 13+ (API 33+) runtime permission
      if (Platform.isAndroid) {
        final status = await Permission.notification.status;

        if (status.isGranted) {
          loggy.info('Android notification permission already granted');
          return true;
        }

        if (status.isDenied || status.isLimited) {
          final result = await Permission.notification.request();
          final granted = result.isGranted;
          loggy.info('Android notification permission request result: $result');
          return granted;
        }

        if (status.isPermanentlyDenied) {
          loggy.warning('Android notification permission permanently denied');
          return false;
        }
      }

      // Handle iOS permissions
      if (Platform.isIOS) {
        final settings = await _firebaseMessaging.requestPermission(
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
          announcement: false,
          carPlay: false,
          criticalAlert: false,
        );

        final enabled = settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional;

        loggy.info('iOS notification permission status: ${settings.authorizationStatus}');
        return enabled;
      }

      return false;
    } catch (e, stackTrace) {
      loggy.error('Failed to request notification permission', e, stackTrace);
      return false;
    }
  }

  /// Get current notification permission status
  Future<bool> hasPermission() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.notification.status;
        return status.isGranted;
      }

      if (Platform.isIOS) {
        final settings = await _firebaseMessaging.getNotificationSettings();
        return settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional;
      }

      return false;
    } catch (e) {
      loggy.error('Failed to check notification permission', e);
      return false;
    }
  }

  /// Check if notification permission is permanently denied (Android only)
  Future<bool> isPermissionPermanentlyDenied() async {
    if (Platform.isAndroid) {
      final status = await Permission.notification.status;
      return status.isPermanentlyDenied;
    }
    return false;
  }

  /// Open app settings to allow user to manually enable notifications
  Future<bool> openNotificationSettings() async {
    try {
      final opened = await openAppSettings();
      loggy.info('App settings opened: $opened');
      return opened;
    } catch (e, stackTrace) {
      loggy.error('Failed to open app settings', e, stackTrace);
      return false;
    }
  }

  /// Get and save FCM token
  Future<String?> _getAndSaveToken() async {
    try {
      // For iOS, get APNs token first
      if (Platform.isIOS) {
        final apnsToken = await _firebaseMessaging.getAPNSToken();
        if (apnsToken == null) {
          loggy.warning('APNs token not available yet, FCM token may not work');
        } else {
          loggy.info('APNs token obtained: $apnsToken');
        }
      }

      final token = await _firebaseMessaging.getToken();
      if (token != null) {
        _currentToken = token;
        await _saveToken(token);
        loggy.info('FCM token obtained: $token');
        return token;
      } else {
        loggy.warning('Failed to obtain FCM token');
        return null;
      }
    } catch (e, stackTrace) {
      loggy.error('Failed to get FCM token', e, stackTrace);
      return null;
    }
  }

  /// Save token to local storage
  Future<void> _saveToken(String token) async {
    try {
      await HiveRepository.saveData(_boxName, _fcmTokenKey, token);
      loggy.debug('FCM token saved to local storage');
    } catch (e) {
      loggy.error('Failed to save FCM token', e);
    }
  }

  /// Get saved token from local storage
  Future<String?> getSavedToken() async {
    try {
      return await HiveRepository.getData(_fcmTokenKey, _boxName);
    } catch (e) {
      loggy.error('Failed to get saved FCM token', e);
      return null;
    }
  }

  /// Get current FCM token
  String? get currentToken => _currentToken;

  /// Handle token refresh
  void _onTokenRefresh(String newToken) {
    loggy.info('FCM token refreshed: $newToken');
    _currentToken = newToken;
    _saveToken(newToken);

    // TODO: Send new token to your backend server
    // Example: await yourApiService.updateFcmToken(newToken);
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    loggy.info('Foreground message received: ${message.messageId}');
    loggy.debug('Message data: ${message.data}');
    loggy.debug('Notification: ${message.notification?.title}');

    // Call custom callback if provided
    onForegroundMessage?.call(message);

    // Show local notification
    if (message.notification != null) {
      _showLocalNotification(message);
    }
  }

  /// Show a local notification (public API for other services)
  Future<void> showLocalNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    try {
      await _localNotifications.show(
        id,
        title,
        body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            channelId,
            channelName,
            channelDescription: channelDescription,
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
      );
    } catch (e, stackTrace) {
      loggy.error('Failed to show local notification', e, stackTrace);
    }
  }

  /// Show local notification from a RemoteMessage
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification == null) return;

    try {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            channelId,
            channelName,
            channelDescription: channelDescription,
            importance: Importance.high,
            priority: Priority.high,
            icon: android?.smallIcon ?? '@mipmap/ic_launcher',
            enableVibration: true,
            playSound: true,
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: _encodePayload(message.data),
      );
    } catch (e, stackTrace) {
      loggy.error('Failed to show local notification', e, stackTrace);
    }
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    loggy.info('Notification tapped: ${message.messageId}');
    loggy.debug('Message data: ${message.data}');

    // Call custom callback if provided
    onNotificationTap?.call(message.data);
  }

  /// Handle local notification tap
  void _onLocalNotificationTap(NotificationResponse response) {
    loggy.info('Local notification tapped');

    if (response.payload != null) {
      final data = _decodePayload(response.payload!);
      onNotificationTap?.call(data);
    }
  }

  /// Encode payload to string
  String _encodePayload(Map<String, dynamic> data) {
    return jsonEncode(data);
  }

  /// Decode payload from string
  Map<String, dynamic> _decodePayload(String payload) {
    try {
      return Map<String, dynamic>.from(jsonDecode(payload) as Map);
    } catch (e) {
      loggy.error('Failed to decode notification payload', e);
      return {};
    }
  }

  /// Subscribe to a topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      loggy.info('Subscribed to topic: $topic');
    } catch (e, stackTrace) {
      loggy.error('Failed to subscribe to topic: $topic', e, stackTrace);
    }
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      loggy.info('Unsubscribed from topic: $topic');
    } catch (e, stackTrace) {
      loggy.error('Failed to unsubscribe from topic: $topic', e, stackTrace);
    }
  }

  /// Delete FCM token
  Future<void> deleteToken() async {
    try {
      await _firebaseMessaging.deleteToken();
      _currentToken = null;
      await HiveRepository.deleteData(_fcmTokenKey, _boxName);
      loggy.info('FCM token deleted');
    } catch (e, stackTrace) {
      loggy.error('Failed to delete FCM token', e, stackTrace);
    }
  }

  /// Set notification badge count (iOS only)
  Future<void> setBadgeCount(int count) async {
    if (Platform.isIOS) {
      try {
        await _firebaseMessaging.setAutoInitEnabled(true);
        // Note: Badge count management might need additional iOS configuration
        loggy.info('Badge count set to: $count');
      } catch (e) {
        loggy.error('Failed to set badge count', e);
      }
    }
  }
}
