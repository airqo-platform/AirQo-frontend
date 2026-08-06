import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';

abstract class RouteExposureRepository {
  Future<RouteExposureSummary> buildTripExposure({
    required SelectedSite origin,
    required SelectedSite destination,
    double radiusKm = 2.5,
  });
}
