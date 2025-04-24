import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class SlackLogger {
  static final SlackLogger _instance = SlackLogger._internal();
  factory SlackLogger() => _instance;
  SlackLogger._internal();

  static const bool _enableSlackLogging = true; // Set to false to disable in development
  String? _webhookUrl;
  String? _channel;
  String? _username;
  String? _appVersion;
  bool _initialized = false;

  /// Initialize the SlackLogger with required configuration
  void initialize({
    required String webhookUrl,
    String channel = '#notifs-mobile-app',
    String? username,
    String? appVersion,
  }) {
    _webhookUrl = webhookUrl;
    _channel = channel;
    _username = username;
    _appVersion = appVersion;
    _initialized = true;
  }

  /// Send an error log to Slack
  Future<bool> logError(String message, {dynamic error, StackTrace? stackTrace}) async {
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
      color: '#FFA500',
    );
  }

  /// Send an info log to Slack (use sparingly for important events)
  Future<bool> logInfo(String message) async {
    return _sendToSlack(
      message: message,
      logLevel: 'INFO',
      color: '#36C5F0',
    );
  }

  Future<bool> testConnection() async {
      // Auto-initialize if needed
  if (!_initialized) {
    print("🔍 SlackLogger: Auto-initializing for test");
    initialize(
      webhookUrl: dotenv.env['SLACK_WEBHOOK_URL']?? '',
      appVersion: dotenv.env['APP_VERSION'] ?? 'Unknown',
    );
  }
    return _sendToSlack(
      message: "Test message from AirQo Mobile App",
      logLevel: 'TEST',
      color: '#36C5F0',
    );
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

  /// Private method to send logs to Slack
  Future<bool> _sendToSlack({
    required String message,
    String logLevel = 'INFO',
    String color = '#36C5F0',
    dynamic error,
    StackTrace? stackTrace,
  }) async {
    print("🔍 SlackLogger: Attempting to send log to Slack");
    print("🔍 SlackLogger: Initialized? $_initialized, Enabled? $_enableSlackLogging");
    
    if (!_initialized || !_enableSlackLogging) {
      print("❌ SlackLogger: Not sending log - logger is not initialized or disabled");
      return false;
    }

    try {
      final url = Uri.parse(_webhookUrl!);
      print("🔍 SlackLogger: Sending to webhook URL: $_webhookUrl");

      // Format the message with details
      final formattedMsg = _formatMessage(
        message: message,
        logLevel: logLevel,
        error: error,
        stackTrace: stackTrace,
      );

      print("🔍 SlackLogger: Formatted message: $formattedMsg");

      // Create the Slack payload
      final Map<String, dynamic> payload = {};
      
      if (_channel != null) {
        payload['channel'] = _channel;
      }
      
      if (_username != null) {
        payload['username'] = _username;
      }
      
      payload['attachments'] = [
        {
          'color': color,
          'text': formattedMsg,
          'footer': 'AirQo Mobile v${_appVersion ?? 'Unknown'}',
          'ts': (DateTime.now().millisecondsSinceEpoch / 1000).floor().toString(),
        }
      ];

      print("🔍 SlackLogger: Payload prepared: ${jsonEncode(payload)}");
      print("🔍 SlackLogger: Sending HTTP POST request to Slack...");

      final response = await http.post(
        url,
        body: jsonEncode(payload),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 5));

      print("🔍 SlackLogger: Received response - Status: ${response.statusCode}");
      print("🔍 SlackLogger: Response body: ${response.body}");

      final successful = response.statusCode == 200;
      print(successful ? "✅ SlackLogger: Message sent successfully" : "❌ SlackLogger: Failed to send message");
      
      return successful;
    } catch (e) {
      print("❌ SlackLogger: Error sending to Slack: $e");
      if (e is FormatException) {
        print("❌ SlackLogger: Format error - possible malformed JSON");
      } else if (e is http.ClientException) {
        print("❌ SlackLogger: HTTP client error - check network connection");
      }
      // Don't log this error to avoid potential infinite loops
      return false;
    }
  }
}