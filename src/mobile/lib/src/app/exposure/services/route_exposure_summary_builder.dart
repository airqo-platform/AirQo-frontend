import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/models/route_exposure_summary.dart';

class RouteExposureSummaryBuilder {
  const RouteExposureSummaryBuilder();

  RouteExposureSummary build({
    required SelectedSite origin,
    required SelectedSite destination,
    required String distanceLabel,
    required String durationLabel,
    required double radiusKm,
    required int sampledPointCount,
    required List<RouteMonitoringSite> nearbySites,
    required List<Measurement> measurements,
  }) {
    final pm25Values = measurements
        .map((measurement) => measurement.pm25?.value)
        .whereType<double>()
        .toList();

    if (pm25Values.isEmpty) {
      return RouteExposureSummary(
        origin: origin,
        destination: destination,
        distanceLabel: distanceLabel,
        durationLabel: durationLabel,
        radiusKm: radiusKm,
        sampledPointCount: sampledPointCount,
        nearbySites: nearbySites,
        measurements: measurements,
        averagePm25: null,
        peakPm25: null,
        exposureLevel: null,
        headline: nearbySites.isEmpty
            ? 'No route monitoring coverage'
            : 'No recent route readings yet',
        guidance: nearbySites.isEmpty
            ? 'We did not find monitoring locations close to this route. Try another route or check a busier corridor.'
            : 'We found nearby monitoring locations, but none had recent PM2.5 readings to summarize right now.',
        highestSiteName: null,
      );
    }

    final averagePm25 =
        pm25Values.reduce((sum, value) => sum + value) / pm25Values.length;
    final peakPm25 =
        pm25Values.reduce((left, right) => left > right ? left : right);
    final exposureLevel = ExposureLevelExtension.fromPm25(averagePm25);

    Measurement? highestMeasurement;
    for (final measurement in measurements) {
      if (measurement.pm25?.value == peakPm25) {
        highestMeasurement = measurement;
        break;
      }
    }

    return RouteExposureSummary(
      origin: origin,
      destination: destination,
      distanceLabel: distanceLabel,
      durationLabel: durationLabel,
      radiusKm: radiusKm,
      sampledPointCount: sampledPointCount,
      nearbySites: nearbySites,
      measurements: measurements,
      averagePm25: averagePm25,
      peakPm25: peakPm25,
      exposureLevel: exposureLevel,
      headline: _headlineFor(exposureLevel),
      guidance: _guidanceFor(exposureLevel, origin.name, destination.name),
      highestSiteName: highestMeasurement?.siteDetails?.name ??
          highestMeasurement?.siteId ??
          (nearbySites.isNotEmpty ? nearbySites.first.name : null),
    );
  }

  String _headlineFor(ExposureLevel level) {
    switch (level) {
      case ExposureLevel.low:
        return 'This route looks relatively clean';
      case ExposureLevel.moderate:
        return 'This route has noticeable pollution';
      case ExposureLevel.high:
        return 'This route has elevated exposure';
    }
  }

  String _guidanceFor(
    ExposureLevel level,
    String originName,
    String destinationName,
  ) {
    switch (level) {
      case ExposureLevel.low:
        return 'Air between $originName and $destinationName is mostly clean based on nearby route monitors.';
      case ExposureLevel.moderate:
        return 'Air between $originName and $destinationName is mixed. Sensitive groups may want to reduce repeated exposure on this trip.';
      case ExposureLevel.high:
        return 'Air between $originName and $destinationName is elevated along this route. If possible, reduce travel during dirtier hours.';
    }
  }
}
