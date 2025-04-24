import 'dart:convert';
import 'package:http/http.dart' as http;

class SlackLogger {
  static final SlackLogger _instance = SlackLogger._internal();
  factory SlackLogger() => _instance;
  SlackLogger._internal();

  static const bool _enableSlackLogging =
      true; // Set to false to disable in development
  String? _webhookUrl;
  String? _channel;
  String? _username;
  String? _appVersion;
  bool _initialized = false;

  /// Initialize the SlackLogger with required configuration
  void initialize({
    required String webhookUrl,
    String channel = '#notifs-mobile-app',
    // String username = '',
    String? appVersion,
  }) {
    _webhookUrl = webhookUrl;
    _channel = channel;
    // _username = username;
    _appVersion = appVersion;
    _initialized = true;
  }

  /// Send an error log to Slack
  Future<bool> logError(String message,
      {dynamic error, StackTrace? stackTrace}) async {
    return _sendToSlack(
      message: message,
      error: error,
      stackTrace: stackTrace,
      logLevel: 'ERROR',
      color: '#FF0000', // Red for errors
    );
  }

  /// Send a warning log to Slack
  Future<bool> logWarning(String message) async {
    return _sendToSlack(
      message: message,
      logLevel: 'WARNING',
      color: '#FFA500', // Orange for warnings
    );
  }

  /// Send an info log to Slack (use sparingly for important events)
  Future<bool> logInfo(String message) async {
    return _sendToSlack(
      message: message,
      logLevel: 'INFO',
      color: '#36C5F0', // Blue for info
    );
  }

  Future<bool> testConnection() async {
    return _sendToSlack(
      message: "Test message from AirQo Mobile App",
      logLevel: 'TEST',
      color: '#36C5F0',
    );
  }

  /// Private method to send logs to Slack
  Future<bool> _sendToSlack({
    required String message,
    String logLevel = 'INFO',
    String color = '#36C5F0',
    dynamic error,
    StackTrace? stackTrace,
  }) async {
    if (!_initialized || !_enableSlackLogging) {
      return false;
    }

    try {
      final url = Uri.parse(_webhookUrl!);

      // Format the message with details
      final formattedMsg = _formatMessage(
        message: message,
        logLevel: logLevel,
        error: error,
        stackTrace: stackTrace,
      );

      // Create the Slack payload
      final payload = {
        'channel': _channel,
        'username': _username,
        'attachments': [
          {
            'color': color,
            'text': formattedMsg,
            'footer': 'AirQo Mobile v${_appVersion ?? 'Unknown'}',
            'ts': (DateTime.now().millisecondsSinceEpoch / 1000)
                .floor()
                .toString(),
          }
        ]
      };

      final response = await http.post(
        url,
        body: jsonEncode(payload),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      // Don't log this error to avoid potential infinite loops
      return false;
    }
  }

  /// Format the message for better readability in Slack
  String _formatMessage({
    required String message,
    required String logLevel,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    StringBuffer buffer = StringBuffer();

    buffer.writeln('*[$logLevel]* $message');

    if (error != null) {
      buffer.writeln('```\nError: $error\n```');
    }

    if (stackTrace != null) {
      // Format and truncate stack trace for readability
      final trace = stackTrace.toString().split('\n').take(10).join('\n');
      buffer.writeln('```\nStack Trace:\n$trace\n...\n```');
    }

    return buffer.toString();
  }
}
