import 'package:airqo/src/app/dashboard/models/airquality_response.dart';

String measurementDisplayName(
  Measurement measurement, {
  String? fallbackLocationName,
}) {
  return measurement.siteDetails?.searchName ??
      measurement.siteDetails?.name ??
      fallbackLocationName ??
      '---';
}

String measurementLocationDescription(Measurement measurement) {
  final siteDetails = measurement.siteDetails;
  if (siteDetails == null) return 'Unknown location';

  final locationParts = <String>[];

  if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
    locationParts.add(siteDetails.city!);
  } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
    locationParts.add(siteDetails.town!);
  }

  if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
    locationParts.add(siteDetails.region!);
  } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
    locationParts.add(siteDetails.county!);
  }

  if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
    locationParts.add(siteDetails.country!);
  }

  return locationParts.isNotEmpty
      ? locationParts.join(', ')
      : siteDetails.locationName ??
          siteDetails.formattedName ??
          'Unknown location';
}
