import 'package:flutter/foundation.dart';
import 'package:loggy/loggy.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:airqo/core/utils/slack_logger.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppLoggySetup {
  static bool _initialized = false;

  /// Initialize logging for the application
  static Future<void> init({bool isDevelopment = true}) async {
    if (_initialized) return;

    // Set up Loggy
    Loggy.initLoggy(
      logPrinter: const PrettyPrinter(
        showColors: true,
      ),
      logOptions: LogOptions(
        LogLevel.all,
        stackTraceLevel: LogLevel.error,
      ),
    );

    // Initialize Slack logger for production environment
    if (!isDevelopment) {
      try {
        final packageInfo = await PackageInfo.fromPlatform();
        final appVersion = '${packageInfo.version}(${packageInfo.buildNumber})';

        // Initialize the Slack logger
        final webhook = dotenv.env['SLACK_WEBHOOK_URL'];
        if (webhook == null || webhook.isEmpty) {
          Loggy('Global')
              .warning('SLACK_WEBHOOK_URL not set – Slack logging disabled');
        } else {
          SlackLogger().initialize(
            webhookUrl: webhook,
            appVersion: appVersion,
          );
        }
        logInfo('Slack logging initialized for version $appVersion');
      } catch (e) {
        logError('Failed to initialize Slack logging: $e');
      }
    }

    _initialized = true;
    logInfo('Logging initialized. Development mode: $isDevelopment');
  }
}

// Extension methods for easier logging
extension LoggyExtension on Object {
  void logInfo(String message) {
    Loggy('Global').info(message);
    // Only send important info logs to Slack
    if (message.contains('CRITICAL') || message.contains('IMPORTANT')) {
      SlackLogger().logInfo(message);
    }
  }

  void logWarning(String message) {
    Loggy('Global').warning(message);
    // Send all warnings to Slack in production
    if (!kDebugMode) {
      SlackLogger().logWarning(message);
    }
  }

  void logError(String message, [dynamic error, StackTrace? stackTrace]) {
    Loggy('Global').error(message);
    // Always send errors to Slack
    SlackLogger().logError(message, error: error, stackTrace: stackTrace);
  }
}
