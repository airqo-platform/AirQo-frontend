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
  });

  String get displayName =>
      city ?? town ?? locationName ?? name ?? 'Unknown Location';

  String get displaySubtitle => searchName ?? name ?? formattedName ?? '---';
}
