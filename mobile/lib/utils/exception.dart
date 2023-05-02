import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class NetworkConnectionException implements Exception {
  String cause;
  NetworkConnectionException(this.cause);
}

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
      Sentry.captureException(
        exception,
        stackTrace: stackTrace ?? '',
      ),
    ]);
  } catch (e) {
    debugPrint(e.toString());
  }
}
