import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

class AirQualityConverter implements JsonConverter<AirQuality, String> {
  const AirQualityConverter();

  @override
  String toJson(AirQuality airQuality) {
    return airQuality.toString();
  }

  @override
  AirQuality fromJson(String jsonString) {
    return AirQuality.fromString(jsonString);
  }
}

class RegionConverter implements JsonConverter<Region, String> {
  const RegionConverter();

  @override
  String toJson(Region region) {
    return region.toString();
  }

  @override
  Region fromJson(String jsonString) {
    return Region.fromString(jsonString);
  }
}
