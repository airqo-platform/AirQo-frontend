import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class UserException implements Exception {
  String message;
  UserException(this.message);
}

Future<void> logException(exception, stackTrace) async {
  final unHandledSentryExceptions = [
    SocketException,
    TimeoutException,
    UserException
  ];
  debugPrint('$exception\n$stackTrace');
  if (!unHandledSentryExceptions.contains(exception.runtimeType)) {
    await Sentry.captureException(
      exception,
      stackTrace: stackTrace,
    );
  }
}
