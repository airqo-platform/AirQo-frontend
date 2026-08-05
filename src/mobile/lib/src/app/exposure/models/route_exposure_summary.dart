import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:equatable/equatable.dart';

class RouteMonitoringSite extends Equatable {
  final String id;
  final String name;

  const RouteMonitoringSite({
    required this.id,
    required this.name,
  });

  @override
  List<Object?> get props => [id, name];
}

class RouteExposureSummary extends Equatable {
  final SelectedSite origin;
  final SelectedSite destination;
  final String distanceLabel;
  final String durationLabel;
  final double radiusKm;
  final int sampledPointCount;
  final List<RouteMonitoringSite> nearbySites;
  final List<Measurement> measurements;
  final double? averagePm25;
  final double? peakPm25;
  final ExposureLevel? exposureLevel;
  final String headline;
  final String guidance;
  final String? highestSiteName;

  const RouteExposureSummary({
    required this.origin,
    required this.destination,
    required this.distanceLabel,
    required this.durationLabel,
    required this.radiusKm,
    required this.sampledPointCount,
    required this.nearbySites,
    required this.measurements,
    required this.averagePm25,
    required this.peakPm25,
    required this.exposureLevel,
    required this.headline,
    required this.guidance,
    required this.highestSiteName,
  });

  bool get hasMeasurements => averagePm25 != null && peakPm25 != null;

  @override
  List<Object?> get props => [
        origin,
        destination,
        distanceLabel,
        durationLabel,
        radiusKm,
        sampledPointCount,
        nearbySites,
        measurements,
        averagePm25,
        peakPm25,
        exposureLevel,
        headline,
        guidance,
        highestSiteName,
      ];
}
