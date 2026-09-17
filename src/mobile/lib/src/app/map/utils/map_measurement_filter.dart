import 'package:airqo/src/app/dashboard/models/airquality_response.dart';

/// A reading that is rendered as a monitor marker on the app map.
bool isMapVisibleMeasurement(Measurement measurement) {
  return measurement.id != null &&
      measurement.pm25?.value != null &&
      measurement.siteDetails?.approximateLatitude != null &&
      measurement.siteDetails?.approximateLongitude != null;
}

/// AirQo-operated locations from the live dataset used by the Map tab.
///
/// The map feed also aggregates partner providers such as AIRGRADIENT. Trips
/// deliberately use the AirQo network subset so route exposure is based on
/// locations whose monitoring coverage AirQo manages.
bool isAirQoNetworkMeasurement(Measurement measurement) {
  final provider = measurement.siteDetails?.dataProvider?.trim().toLowerCase();
  return isMapVisibleMeasurement(measurement) &&
      provider != null &&
      provider.contains('airqo');
}
