import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/utils/location_label.dart';
import 'package:airqo/src/app/shared/utils/spoken_place.dart';

class SiteSearchResult {
  final String id;
  final String? name;
  final String? searchName;
  final String? city;
  final String? town;
  final String? district;
  final String? country;
  final String? formattedName;
  final String? locationName;
  final String? region;
  final String? county;
  final String? generatedName;

  const SiteSearchResult({
    required this.id,
    this.name,
    this.searchName,
    this.city,
    this.town,
    this.district,
    this.country,
    this.formattedName,
    this.locationName,
    this.region,
    this.county,
    this.generatedName,
  });

  String get displayName {
    final legacy = normalizeLocationLabel(
      city ?? town ?? locationName ?? name ?? 'Unknown Location',
    );
    if (!FeatureFlagService.instance
        .isEnabled(AppFeatureFlag.spokenPlaceTitles)) {
      return legacy;
    }
    final spoken = _spoken;
    return spoken.title.isEmpty ? legacy : spoken.title;
  }

  String get displaySubtitle {
    final legacy = normalizeLocationLabel(
      searchName ?? name ?? formattedName ?? '---',
    );
    if (!FeatureFlagService.instance
        .isEnabled(AppFeatureFlag.spokenPlaceTitles)) {
      return legacy;
    }
    return _spoken.quietLine;
  }

  SpokenPlace get _spoken => spokenPlace(
        name: name,
        searchName: searchName,
        generatedName: generatedName,
        city: city,
        town: town,
        region: region,
        county: county,
      );
}
