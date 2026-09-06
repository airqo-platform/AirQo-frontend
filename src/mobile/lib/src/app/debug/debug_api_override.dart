import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:flutter/foundation.dart';

/// Debug-only switches to simulate empty API success without a proxy.
///
/// Always off in release builds. Not persisted — resets on process restart.
class DebugApiOverride extends ChangeNotifier {
  DebugApiOverride._();
  static final DebugApiOverride instance = DebugApiOverride._();

  bool _forceEmptyAirQuality = false;
  bool _forceFailAirQuality = false;
  bool _forceEmptyLearn = false;
  bool _forceEmptySurveys = false;
  bool _forceEmptyPlaces = false;
  bool _forceFailPlaces = false;

  bool get forceEmptyAirQuality => kDebugMode && _forceEmptyAirQuality;
  bool get forceFailAirQuality => kDebugMode && _forceFailAirQuality;
  bool get forceEmptyLearn => kDebugMode && _forceEmptyLearn;
  bool get forceEmptySurveys => kDebugMode && _forceEmptySurveys;
  bool get forceEmptyPlaces => kDebugMode && _forceEmptyPlaces;
  bool get forceFailPlaces => kDebugMode && _forceFailPlaces;

  void setForceEmptyAirQuality(bool value) {
    if (!kDebugMode) return;
    if (_forceEmptyAirQuality == value) return;
    _forceEmptyAirQuality = value;
    if (value) _forceFailAirQuality = false;
    notifyListeners();
  }

  void setForceFailAirQuality(bool value) {
    if (!kDebugMode) return;
    if (_forceFailAirQuality == value) return;
    _forceFailAirQuality = value;
    if (value) _forceEmptyAirQuality = false;
    notifyListeners();
  }

  void setForceEmptyLearn(bool value) {
    if (!kDebugMode) return;
    if (_forceEmptyLearn == value) return;
    _forceEmptyLearn = value;
    notifyListeners();
  }

  void setForceEmptySurveys(bool value) {
    if (!kDebugMode) return;
    if (_forceEmptySurveys == value) return;
    _forceEmptySurveys = value;
    notifyListeners();
  }

  void setForceEmptyPlaces(bool value) {
    if (!kDebugMode) return;
    if (_forceEmptyPlaces == value) return;
    _forceEmptyPlaces = value;
    if (value) _forceFailPlaces = false;
    notifyListeners();
  }

  void setForceFailPlaces(bool value) {
    if (!kDebugMode) return;
    if (_forceFailPlaces == value) return;
    _forceFailPlaces = value;
    if (value) _forceEmptyPlaces = false;
    notifyListeners();
  }

  AirQualityResponse get emptyAirQualityResponse =>
      AirQualityResponse(success: true, measurements: const []);

  LearnV2CatalogResponse get emptyLearnCatalog =>
      const LearnV2CatalogResponse(
        success: true,
        catalogVersion: 'debug-empty',
        courses: [],
      );
}
