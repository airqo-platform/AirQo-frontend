/// Maps French "Cameroun" to English "Cameroon" so chips, cards, search,
/// and Exposure all show the same country name.
final _camerounPattern = RegExp('Cameroun', caseSensitive: false);

String normalizeLocationLabel(String value) {
  return value.replaceAll(_camerounPattern, 'Cameroon');
}

String? normalizeLocationLabelOrNull(String? value) {
  if (value == null) return null;
  return normalizeLocationLabel(value);
}

bool countriesMatch(String? a, String? b) {
  if (a == null || b == null) return false;
  return normalizeLocationLabel(a).toLowerCase() ==
      normalizeLocationLabel(b).toLowerCase();
}
