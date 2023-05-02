import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';

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

  // TODO reconfigure remote error logging
  // ignore: no-empty-block
  try {} catch (e) {
    debugPrint(e.toString());
  }
}
