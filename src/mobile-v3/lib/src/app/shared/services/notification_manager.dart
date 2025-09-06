
import 'package:flutter/material.dart';
import '../widgets/status_notification.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter_svg/flutter_svg.dart';

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

  /// Shows a survey notification dialog
  void showSurveyNotification(
    BuildContext context, {
    required Survey survey,
    VoidCallback? onTakeSurvey,
    VoidCallback? onDismiss,
  }) {
    final theme = Theme.of(context);
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: theme.scaffoldBackgroundColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.all(20),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with icon
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.assignment,
                    color: AppColors.primaryColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Research Survey',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Survey title
            Text(
              survey.title,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 8),
            
            // Survey description
            Text(
              survey.description,
              style: theme.textTheme.bodyMedium?.copyWith(
                height: 1.4,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 16),
            
            // Time estimate
            Row(
              children: [
                Icon(
                  Icons.schedule, 
                  size: 16, 
                  color: AppColors.secondaryHeadlineColor,
                ),
                const SizedBox(width: 4),
                Text(
                  '~${survey.estimatedTimeString}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.secondaryHeadlineColor,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Help text
            Text(
              'Your responses help improve air quality research for the community.',
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 12,
                color: AppColors.boldHeadlineColor,
                fontStyle: FontStyle.italic,
              ),
            ),
            const SizedBox(height: 24),
            
            // Action buttons
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      onDismiss?.call();
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.boldHeadlineColor,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Skip',
                      style: TextStyle(
                        color: AppColors.boldHeadlineColor,
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      onTakeSurvey?.call();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Take Survey',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Shows an air quality alert notification
  void showAirQualityAlert(
    BuildContext context, {
    required String message,
    required String category,
    double? pollutionLevel,
    String? hexColor,
    VoidCallback? onDismiss,
  }) {
    final theme = Theme.of(context);
    hideCurrentNotification(); // Remove any existing notification

    final entry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 10,
        left: 16,
        right: 16,
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.highlightColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _getAlertColor(category, hexColor).withValues(alpha: 0.3),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // Air Quality Icon
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _getAlertColor(category, hexColor).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(6),
                    child: SvgPicture.asset(
                      _getAirQualityIconPath(category),
                      width: 24,
                      height: 24,
                      colorFilter: ColorFilter.mode(
                        _getAlertColor(category, hexColor),
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Air Quality Alert',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: _getAlertColor(category, hexColor),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        message,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontSize: 12,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (pollutionLevel != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'PM2.5: ${pollutionLevel.toStringAsFixed(1)} μg/m³',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: _getAlertColor(category, hexColor),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                
                // Dismiss button
                GestureDetector(
                  onTap: () {
                    hideCurrentNotification();
                    onDismiss?.call();
                  },
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: AppColors.secondaryHeadlineColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      Icons.close,
                      color: AppColors.secondaryHeadlineColor,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    _currentNotification = entry;
    Overlay.of(context).insert(entry);

    // Auto-hide after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      hideCurrentNotification();
    });
  }

  Color _getAlertColor(String category, [String? hexColor]) {
    // Use hex color from API if available (same as AQI cards)
    if (hexColor != null) {
      try {
        final colorStr = hexColor.replaceAll('#', '');
        return Color(int.parse('0xFF$colorStr'));
      } catch (e) {
        // Fall through to category-based colors if hex parsing fails
      }
    }

    // Use the same color system as the main app's AQI cards
    switch (category.toLowerCase()) {
      case 'good':
        return Colors.green;
      case 'moderate':
        return Colors.yellow.shade700;
      case 'unhealthy for sensitive groups':
      case 'u4sg':
        return Colors.orange;
      case 'unhealthy':
        return Colors.red;
      case 'very unhealthy':
        return Colors.purple;
      case 'hazardous':
        return Colors.brown;
      default:
        return AppColors.primaryColor;
    }
  }

  String _getAirQualityIconPath(String category) {
    switch (category.toLowerCase()) {
      case 'good':
        return "assets/images/shared/airquality_indicators/good.svg";
      case 'moderate':
        return "assets/images/shared/airquality_indicators/moderate.svg";
      case 'unhealthy for sensitive groups':
        return "assets/images/shared/airquality_indicators/unhealthy-sensitive.svg";
      case 'unhealthy':
        return "assets/images/shared/airquality_indicators/unhealthy.svg";
      case 'very unhealthy':
        return "assets/images/shared/airquality_indicators/very-unhealthy.svg";
      case 'hazardous':
        return "assets/images/shared/airquality_indicators/hazardous.svg";
      case 'unavailable':
        return "assets/images/shared/airquality_indicators/unavailable.svg";
      default:
        return "assets/images/shared/airquality_indicators/unavailable.svg";
    }
  }

  /// Shows a simple survey banner notification
  void showSurveyBanner(
    BuildContext context, {
    required Survey survey,
    VoidCallback? onTap,
    VoidCallback? onDismiss,
  }) {
    final theme = Theme.of(context);
    hideCurrentNotification(); // Remove any existing notification

    final entry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 10,
        left: 16,
        right: 16,
        child: GestureDetector(
          onTap: () {
            hideCurrentNotification();
            onTap?.call();
          },
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.highlightColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primaryColor.withValues(alpha: 0.3),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Icon container
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.assignment,
                      color: AppColors.primaryColor,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Research Survey Available',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${survey.title} • ~${survey.estimatedTimeString}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.secondaryHeadlineColor,
                            fontSize: 12,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tap to participate',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.primaryColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Dismiss button
                  GestureDetector(
                    onTap: () {
                      hideCurrentNotification();
                      onDismiss?.call();
                    },
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppColors.boldHeadlineColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.close,
                        color: AppColors.boldHeadlineColor,
                        size: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    _currentNotification = entry;
    Overlay.of(context).insert(entry);

    // Auto-hide after 8 seconds
    Future.delayed(const Duration(seconds: 8), () {
      hideCurrentNotification();
    });
  }
}