import 'dart:async';
import 'dart:io';

import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class UserException implements Exception {
  UserException(this.message);
  String message;
}

Future<void> logException(
  exception,
  StackTrace? stackTrace, {
  bool remoteLogging = true,
}) async {
  final unHandledSentryExceptions = [
    SocketException,
    TimeoutException,
    UserException,
  ];
  debugPrint('$exception\n$stackTrace');
  if (kReleaseMode &&
      remoteLogging &&
      !unHandledSentryExceptions.contains(
        exception.runtimeType,
      )) {
    await Future.wait([
      FirebaseCrashlytics.instance
          .recordError(exception, stackTrace, fatal: true, printDetails: true),
      Sentry.captureException(
        exception,
        stackTrace: stackTrace ?? '',
      ),
    ]);
  }
}
