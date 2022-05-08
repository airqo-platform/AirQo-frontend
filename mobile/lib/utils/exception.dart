import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> logException(exception, stackTrace) async {
  final unHandledSentryExceptions = [SocketException, TimeoutException];
  debugPrint('$exception\n$stackTrace');
  if (kReleaseMode &&
      !unHandledSentryExceptions.contains(exception.runtimeType)) {
    await Sentry.captureException(
      exception,
      stackTrace: stackTrace ?? '',
    );
  }
}
