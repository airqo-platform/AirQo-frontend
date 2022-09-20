import 'package:json_annotation/json_annotation.dart';

enum Region {
  @JsonValue('Central Region')
  central,
  @JsonValue('Eastern Region')
  eastern,
  @JsonValue('Western Region')
  western,
  @JsonValue('Northern Region')
  northern,
  @JsonValue('Southern Region')
  southern,
  @JsonValue('Unknown Region')
  unknown
}

extension on Region {
  String toStr() {
    switch (this) {
      case Region.central:
        return 'Central Region';
      case Region.eastern:
        return 'Eastern Region';
      case Region.western:
        return 'Western Region';
      case Region.northern:
        return 'Northern Region';
      case Region.southern:
        return 'Southern Region';
      case Region.unknown:
        return 'Unknown Region';
    }
  }
}

Region regionFromStr(String string) {
  if (string.toLowerCase().contains('central')) {
    return Region.central;
  } else if (string.toLowerCase().contains('east')) {
    return Region.eastern;
  } else if (string.toLowerCase().contains('west')) {
    return Region.western;
  } else if (string.toLowerCase().contains('north')) {
    return Region.northern;
  } else if (string.toLowerCase().contains('south')) {
    return Region.southern;
  } else {
    return Region.unknown;
  }
}

class RegionConverter implements JsonConverter<Region, String> {
  const RegionConverter();

  @override
  String toJson(Region region) {
    return region.toStr();
  }

  @override
  Region fromJson(String jsonString) {
    return regionFromStr(jsonString);
  }
}
