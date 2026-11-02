import 'package:airqo/src/app/shared/utils/location_label.dart';

/// The name a person would say for one monitor, and the line under it.
class SpokenPlace {
  final String title;
  final String quietLine;

  const SpokenPlace({required this.title, required this.quietLine});
}

/// Picks the place a person would say from [name] and [searchName].
///
/// Drops a trailing number on [searchName] only when it is the suffix of
/// [generatedName]. A bare division, the word Division, Site, or Device, and
/// a string that is only the city are set aside when the other string is a
/// place. A street in either string wins. The quiet line is city, then
/// region or county.
SpokenPlace spokenPlace({
  String? name,
  String? searchName,
  String? generatedName,
  String? city,
  String? town,
  String? region,
  String? county,
}) {
  final cleanedSearch = _stripSiteIdSuffix(searchName, generatedName);
  final nameCandidate = _prepare(name, city: city, town: town);
  final searchCandidate = _prepare(cleanedSearch, city: city, town: town);
  final title = _chooseTitle(nameCandidate, searchCandidate);
  return SpokenPlace(
    title: normalizeLocationLabel(title),
    quietLine: normalizeLocationLabel(
      _quietLine(
        title: title,
        city: city,
        town: town,
        region: region,
        county: county,
      ),
    ),
  );
}

enum _Rank { aside, place, street }

class _Candidate {
  final String text;
  final _Rank rank;

  const _Candidate(this.text, this.rank);
}

const _divisions = {
  'kawempe',
  'makindye',
  'nakawa',
  'rubaga',
  'kampalacentral',
};

final _streetPattern = RegExp(
  r'\b(road|rd|avenue|ave|street|st|lane|by-pass|bypass|way|drive|close|crescent|highway)\b',
  caseSensitive: false,
);

final _opsLabelPattern = RegExp(
  r'\b(?:Site|Device)\s+\d+\b',
  caseSensitive: false,
);

final _trailingDivisionPattern = RegExp(
  r'(?:,|\s)+(kawempe|makindye|nakawa|rubaga|kampala\s*central)(?:\s+division)?$',
  caseSensitive: false,
);

String? _stripSiteIdSuffix(String? searchName, String? generatedName) {
  if (searchName == null) return null;
  final trimmed = searchName.trim();
  final match = RegExp(r'^(.*\S)\s+(\d+)$').firstMatch(trimmed);
  if (match == null) return trimmed;
  final suffix = RegExp(r'(\d+)$').firstMatch(generatedName?.trim() ?? '');
  if (suffix != null && suffix.group(1) == match.group(2)) {
    return match.group(1)!.trim();
  }
  return trimmed;
}

_Candidate _prepare(String? raw, {String? city, String? town}) {
  if (raw == null || raw.trim().isEmpty) {
    return const _Candidate('', _Rank.aside);
  }
  final source = raw.trim();
  final hadOpsLabel = _opsLabelPattern.hasMatch(source);
  var text = _stripOps(source);
  text = _stripTrailingDivision(text);
  if (text.isEmpty ||
      RegExp(r'^(site|device)$', caseSensitive: false).hasMatch(text)) {
    return const _Candidate('', _Rank.aside);
  }
  if (_isDivisionLabel(text)) {
    return _Candidate(_spokenDivision(text), _Rank.aside);
  }
  if (_equalsPlace(text, city) || _equalsPlace(text, town)) {
    return _Candidate(_display(text), _Rank.aside);
  }
  // "Golf Course Kampala. Site 1. Training Area" loses the city after the
  // ops label is cut. A street keeps its city word: "Kampala Road Site 1"
  // stays Kampala Road.
  if (hadOpsLabel && !_streetPattern.hasMatch(text)) {
    text = _removePlaceWord(text, city);
    text = _removePlaceWord(text, town);
  }
  if (text.isEmpty ||
      _isDivisionLabel(text) ||
      _equalsPlace(text, city) ||
      _equalsPlace(text, town)) {
    return _Candidate(text.isEmpty ? '' : _display(text), _Rank.aside);
  }
  final rank = _streetPattern.hasMatch(text) ? _Rank.street : _Rank.place;
  return _Candidate(_display(text), rank);
}

String _chooseTitle(_Candidate name, _Candidate search) {
  _Candidate? best;
  for (final candidate in [name, search]) {
    if (candidate.rank == _Rank.aside || candidate.text.isEmpty) continue;
    if (best == null || candidate.rank.index > best.rank.index) {
      best = candidate;
    }
  }
  if (best != null) return best.text;
  if (name.text.isNotEmpty) return name.text;
  return search.text;
}

String _quietLine({
  required String title,
  String? city,
  String? town,
  String? region,
  String? county,
}) {
  final parts = <String>[];
  void add(String? part) {
    if (part == null) return;
    final trimmed = part.trim();
    if (trimmed.isEmpty) return;
    if (_equalsPlace(trimmed, title)) return;
    if (_isDivisionLabel(trimmed)) return;
    if (parts.any((existing) => _equalsPlace(existing, trimmed))) return;
    parts.add(trimmed);
  }

  add(_firstNonEmpty(city, town));
  final beforeRegion = parts.length;
  add(region);
  if (parts.length == beforeRegion) add(county);
  return parts.join(', ');
}

String _stripOps(String value) {
  var text = value.replaceAll(_opsLabelPattern, ' ');
  text = text.replaceAll(RegExp(r'[.]+'), ' ');
  text = text.replaceAll(RegExp(r'\s+'), ' ').trim();
  text = text.replaceAll(RegExp(r'^[,;\-]+|[,;\-]+$'), '').trim();
  return text;
}

String _stripTrailingDivision(String value) {
  final stripped = value.replaceFirst(_trailingDivisionPattern, '').trim();
  if (stripped.isEmpty || stripped == value) return value.trim();
  return stripped.replaceAll(RegExp(r'[,\s]+$'), '').trim();
}

bool _isDivisionLabel(String value) {
  final key = value.toLowerCase().replaceAll(RegExp(r'[^a-z]'), '');
  if (_divisions.contains(key)) return true;
  return RegExp(r'\bdivision\b', caseSensitive: false).hasMatch(value);
}

String _spokenDivision(String value) {
  final key = value.toLowerCase().replaceAll(RegExp(r'[^a-z]'), '');
  if (key == 'kampalacentral' || key == 'kampalacentraldivision') {
    return 'Kampala Central';
  }
  final withoutWord = value
      .replaceFirst(RegExp(r'\s+division$', caseSensitive: false), '')
      .trim();
  return _display(withoutWord.isEmpty ? value : withoutWord);
}

String _removePlaceWord(String value, String? place) {
  final word = place?.trim();
  if (word == null || word.isEmpty) return value;
  final pattern = RegExp('\\b${RegExp.escape(word)}\\b', caseSensitive: false);
  if (!pattern.hasMatch(value)) return value;
  final next = value
      .replaceAll(pattern, ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim()
      .replaceAll(RegExp(r'^[,.\-]+|[,.\-]+$'), '')
      .trim();
  if (next.isEmpty) return value;
  return next;
}

String? _firstNonEmpty(String? primary, String? fallback) {
  if (primary != null && primary.trim().isNotEmpty) return primary.trim();
  if (fallback != null && fallback.trim().isNotEmpty) return fallback.trim();
  return null;
}

bool _equalsPlace(String value, String? other) {
  if (other == null) return false;
  return value.trim().toLowerCase() == other.trim().toLowerCase();
}

String _display(String value) {
  final text = value.trim();
  if (text.isEmpty) return text;
  final first = text.substring(0, 1);
  if (first.toLowerCase() == first && first.toUpperCase() != first) {
    return first.toUpperCase() + text.substring(1);
  }
  return text;
}
