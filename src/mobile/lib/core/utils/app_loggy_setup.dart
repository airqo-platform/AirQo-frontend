import 'package:airqo/core/utils/slack_loggy_printer.dart';
import 'package:loggy/loggy.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:airqo/core/utils/slack_logger.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppLoggySetup {
  static bool _initialized = false;

  /// Initialize logging for the application
  static Future<void> init({bool isDevelopment = true}) async {
    if (_initialized) return;

    final defaultPrinter = PrettyPrinter(showColors: true);

    // Set up Loggy
    Loggy.initLoggy(
      logPrinter: SlackLoggyPrinter(defaultPrinter),
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
  }

  void logWarning(String message) {
    Loggy('Global').warning(message);
  }

  void logError(String message, [dynamic error, StackTrace? stackTrace]) {
    try {
      if (error != null && stackTrace != null) {
        Loggy('Global').error(message, error, stackTrace);
      } else if (error != null) {
        Loggy('Global').error(message, error);
      } else {
        Loggy('Global').error(message);
      }
    } catch (e) {
      // Prevent infinite loops by using print for logging errors in the logger itself
      print('LoggingError: Failed to log error: $e');
    }
  }
}
