import 'package:loggy/loggy.dart';
import 'package:airqo/core/utils/slack_logger.dart';
import 'package:flutter/foundation.dart';

class SlackLoggyPrinter extends LoggyPrinter {
  final LoggyPrinter _defaultPrinter;
  
  SlackLoggyPrinter(this._defaultPrinter);
  
  @override
  void onLog(LogRecord record) {
    // Always use the default printer for local logging
    _defaultPrinter.onLog(record);
    
    // Then forward appropriate logs to Slack based on level
    final message = '${record.loggerName}: ${record.message}';
    
    switch (record.level) {
      case LogLevel.error:
        SlackLogger().logError(
          message,
          error: record.error,
          stackTrace: record.stackTrace,
        );
        break;
        
      case LogLevel.warning:
        // Only send warnings to Slack in production, matching your current logic
        if (!kDebugMode) {
          SlackLogger().logWarning(message);
        }
        break;
        
      case LogLevel.info:
        // Only send critical info logs to Slack
        if (message.contains('CRITICAL') || message.contains('IMPORTANT')) {
          SlackLogger().logInfo(message);
        }
        break;
        
      default:
        break;
    }
  }
}