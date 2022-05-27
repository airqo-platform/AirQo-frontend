import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class UserException implements Exception {
  UserException(this.message);
  String message;
}

Future<void> logException(exception, stackTrace,
    {bool remoteLogging = true}) async {
  final unHandledSentryExceptions = [
    SocketException,
    TimeoutException,
    UserException
  ];
  debugPrint('$exception\n$stackTrace');
  if (kReleaseMode &&
      remoteLogging &&
      !unHandledSentryExceptions.contains(exception.runtimeType)) {
    await Sentry.captureException(
      exception,
      stackTrace: stackTrace ?? '',
    );
  }
}
