import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/shared/utils/spoken_place.dart';

/// Null when there is no site, so callers keep today's string.
SpokenPlace? spokenPlaceForDetails(SiteDetails? details) {
  if (details == null) return null;
  return spokenPlace(
    name: details.name,
    searchName: details.searchName,
    generatedName: details.generatedName,
    city: details.city,
    town: details.town,
    region: details.region,
    county: details.county,
  );
}

SpokenPlace? spokenPlaceForSelectedSite(SelectedSite site) {
  return spokenPlace(
    name: site.catalogName ?? site.name,
    searchName: site.catalogSearchName ?? site.searchName,
    generatedName: site.generatedName,
    city: site.city,
    town: site.town,
    region: site.region,
    county: site.county,
  );
}

String measurementSpokenTitle(Measurement measurement, String legacy) {
  final spoken = spokenPlaceForDetails(measurement.siteDetails);
  if (spoken == null || spoken.title.isEmpty) return legacy;
  return spoken.title;
}

String measurementSpokenQuietLine(Measurement measurement, String legacy) {
  final spoken = spokenPlaceForDetails(measurement.siteDetails);
  if (spoken == null) return legacy;
  return spoken.quietLine;
}

String selectedSiteSpokenTitle(SelectedSite site, String legacy) {
  final spoken = spokenPlaceForSelectedSite(site);
  if (spoken == null || spoken.title.isEmpty) return legacy;
  return spoken.title;
}

String selectedSiteSpokenQuietLine(SelectedSite site, String legacy) {
  final spoken = spokenPlaceForSelectedSite(site);
  if (spoken == null) return legacy;
  return spoken.quietLine;
}
