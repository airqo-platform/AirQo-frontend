
import 'package:flutter/material.dart';
import '../widgets/status_notification.dart';

class NotificationManager {
  static final NotificationManager _instance = NotificationManager._internal();
  factory NotificationManager() => _instance;
  NotificationManager._internal();

  OverlayEntry? _currentNotification;

  /// Shows a status notification overlay
  void showNotification(
    BuildContext context, {
    required String message,
    bool isSuccess = true,
    Duration duration = const Duration(seconds: 3),
  }) {
    // Dismiss any existing notification first
    hideCurrentNotification();

    // Create an overlay entry
    _currentNotification = OverlayEntry(
      builder: (context) => Positioned(
        bottom: 50, // Position from bottom
        left: 0,
        right: 0,
        child: Material(
          color: Colors.transparent,
          child: StatusNotification(
            message: message,
            isSuccess: isSuccess,
            duration: duration,
            onDismissed: hideCurrentNotification,
          ),
        ),
      ),
    );

    // Insert the overlay
    Overlay.of(context).insert(_currentNotification!);
  }

  /// Hides the current notification if one exists
  void hideCurrentNotification() {
    _currentNotification?.remove();
    _currentNotification = null;
  }
}