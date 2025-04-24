import 'package:flutter/material.dart';
import 'package:airqo/core/utils/slack_logger.dart';

class SlackLoggerTestScreen extends StatefulWidget {
  const SlackLoggerTestScreen({super.key});

  @override
    State<SlackLoggerTestScreen> createState() => _SlackLoggerTestScreenState();
}

class _SlackLoggerTestScreenState extends State<SlackLoggerTestScreen> {
  bool _isLoading = false;
  String _lastResult = "";
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Test Slack Logging'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _isLoading ? null : _testConnection,
                child: Text('Test Basic Connection'),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading ? null : _testAllLogLevels,
                child: Text('Test All Log Levels'),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading ? null : _testErrorWithStackTrace,
                child: Text('Test Error With Stack Trace'),
              ),
              SizedBox(height: 32),
              if (_isLoading)
                CircularProgressIndicator(),
              SizedBox(height: 16),
              Text(_lastResult),
            ],
          ),
        ),
      ),
    );
  }
  
  Future<void> _testConnection() async {
    setState(() {
      _isLoading = true;
      _lastResult = "Sending test message...";
    });
    
    try {
      final result = await SlackLogger().testConnection();
      setState(() {
        _lastResult = result 
            ? "✅ Test message sent successfully!" 
            : "❌ Failed to send test message";
      });
    } catch (e) {
      setState(() {
        _lastResult = "❌ Error: $e";
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _testAllLogLevels() async {
    setState(() {
      _isLoading = true;
      _lastResult = "Sending test logs of all levels...";
    });
    
    try {
      await SlackLogger().logInfo("Test INFO log from AirQo Mobile App");
      await SlackLogger().logWarning("Test WARNING log from AirQo Mobile App");
      await SlackLogger().logError("Test ERROR log from AirQo Mobile App");
      
      setState(() {
        _lastResult = "✅ All test logs sent!";
      });
    } catch (e) {
      setState(() {
        _lastResult = "❌ Error: $e";
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _testErrorWithStackTrace() async {
    setState(() {
      _isLoading = true;
      _lastResult = "Testing error with stack trace...";
    });
    
    try {
      // Deliberately cause an exception
      try {
        throw Exception("This is a test exception");
      } catch (e, stackTrace) {
        await SlackLogger().logError(
          "Test ERROR with stack trace from AirQo Mobile App", 
          error: e, 
          stackTrace: stackTrace
        );
      }
      
      setState(() {
        _lastResult = "✅ Error with stack trace sent!";
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
}