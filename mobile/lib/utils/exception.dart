import 'dart:async';
import 'dart:io';

import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> logException(
  exception,
  StackTrace? stackTrace,
) async {
  final unHandledExceptions = [
    SocketException,
    TimeoutException,
  ];

  debugPrint('$exception\n$stackTrace');
  if (!kReleaseMode || unHandledExceptions.contains(exception.runtimeType)) {
    return;
  }

  try {
    await Future.wait([
      FirebaseCrashlytics.instance.recordError(
        exception,
        stackTrace,
        fatal: true,
        printDetails: true,
      ),
      Sentry.captureException(
        exception,
        stackTrace: stackTrace ?? '',
      ),
    ]);
  } catch (e) {
    debugPrint(e.toString());
  }
}
