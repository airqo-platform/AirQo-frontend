import 'dart:async';
import 'dart:io';

import 'package:app/services/services.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

class NetworkConnectionException implements Exception {
  String cause;

  NetworkConnectionException(this.cause);
}

Future<void> logException(exception, StackTrace? stackTrace,
    {bool fatal = false}) async {
  final unHandledExceptions = [
    SocketException,
    TimeoutException,
  ];

  debugPrint('$exception\n$stackTrace');
  if (!kReleaseMode || unHandledExceptions.contains(exception.runtimeType)) {
    return;
  }

  try {
    if (!Platform.isAndroid) {
      await AirqoApiClient.sendErrorToSlack(exception as Object, stackTrace);
      return;
    }

    await FirebaseCrashlytics.instance.recordError(
      exception,
      stackTrace,
      fatal: fatal,
    );
  } catch (e) {
    await AirqoApiClient.sendErrorToSlack(exception as Object, stackTrace);
  }
}
