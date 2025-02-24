import 'dart:async';
import 'dart:io';

import 'package:app/services/services.dart';
import 'package:flutter/foundation.dart';

class NetworkConnectionException implements Exception {
  String cause;

  NetworkConnectionException(this.cause);
}

Future<void> logException(
  exception,
  StackTrace? stackTrace, {
  bool fatal = true,
}) async {
  final unHandledExceptions = [
    SocketException,
    TimeoutException,
  ];

  debugPrint('$exception\n$stackTrace');
  if (!kReleaseMode || unHandledExceptions.contains(exception.runtimeType)) {
    return;
  }

  await AirqoApiClient.sendErrorToSlack(exception as Object, stackTrace);
}
