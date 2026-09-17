import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:flutter/foundation.dart';

/// Coordinates requests that should open the Map tab at a specific monitor.
class MapNavigationService {
  MapNavigationService._();

  static final MapNavigationService instance = MapNavigationService._();

  final ValueNotifier<Measurement?> requestedMeasurement =
      ValueNotifier<Measurement?>(null);

  void showMonitor(Measurement measurement) {
    requestedMeasurement.value = measurement;
  }

  void clear(Measurement measurement) {
    if (identical(requestedMeasurement.value, measurement)) {
      requestedMeasurement.value = null;
    }
  }
}
