import 'package:loggy/loggy.dart';

/// Setup Loggy for the application
class AppLoggySetup {
  /// Initialize Loggy with appropriate configuration
  static void init({bool isDevelopment = true}) {
    Loggy.initLoggy(
      logOptions: LogOptions(
        LogLevel.all,
        stackTraceLevel: LogLevel.error,
      ),
      logPrinter: isDevelopment 
          ? const PrettyPrinter(
              showColors: true,
            ) 
          : const PrettyPrinter(
              showColors: false,
            ),
    );
    
    // Create a loggy instance for logging
    final logger = Loggy('AppLoggySetup');
    logger.info('Loggy initialized with development mode: $isDevelopment');
  }
}