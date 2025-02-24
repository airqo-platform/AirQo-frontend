import 'package:json_annotation/json_annotation.dart';

part 'airquality_response.g.dart';

@JsonSerializable(explicitToJson: true)
class AirQualityResponse {
  final bool? success;
  final String? message;
  final List<Measurement>? measurements;

  AirQualityResponse({
    this.success,
    this.message,
    this.measurements,
  });

  factory AirQualityResponse.fromJson(Map<String, dynamic> json) => 
      _$AirQualityResponseFromJson(json);

  Map<String, dynamic> toJson() => _$AirQualityResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Measurement {
  @JsonKey(name: '_id')
  final String? id;

  @JsonKey(name: 'site_id')
  final String? siteId;

  final String? time;
  
  @JsonKey(name: '__v')
  final int? v;

  @JsonKey(name: 'aqi_category')
  final String? aqiCategory;

  @JsonKey(name: 'aqi_color')
  final String? aqiColor;

  @JsonKey(name: 'aqi_color_name')
  final String? aqiColorName;

  @JsonKey(name: 'aqi_ranges')
  final AqiRanges? aqiRanges;

  final Averages? averages;
  
  @JsonKey(name: 'createdAt')
  final String? createdAt;

  final String? device;

  @JsonKey(name: 'device_id')
  final String? deviceId;

  final String? frequency;

  @JsonKey(name: 'health_tips')
  final List<HealthTip>? healthTips;

  @JsonKey(name: 'is_reading_primary')
  final bool? isReadingPrimary;

  final No2? no2;
  final Pm10? pm10;

  @JsonKey(name: 'pm2_5')
  final Pm25? pm25;

  @JsonKey(name: 'siteDetails')
  final SiteDetails? siteDetails;

  @JsonKey(name: 'timeDifferenceHours')
  final double? timeDifferenceHours;

  final String? updatedAt;

  Measurement({
    this.id,
    this.siteId,
    this.time,
    this.v,
    this.aqiCategory,
    this.aqiColor,
    this.aqiColorName,
    this.aqiRanges,
    this.averages,
    this.createdAt,
    this.device,
    this.deviceId,
    this.frequency,
    this.healthTips,
    this.isReadingPrimary,
    this.no2,
    this.pm10,
    this.pm25,
    this.siteDetails,
    this.timeDifferenceHours,
    this.updatedAt,
  });

  factory Measurement.fromJson(Map<String, dynamic> json) => 
      _$MeasurementFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementToJson(this);
}

@JsonSerializable(explicitToJson: true)
class AqiRanges {
  final RangeValue? good;
  final RangeValue? moderate;
  final RangeValue? u4sg;
  final RangeValue? unhealthy;
  
  @JsonKey(name: 'very_unhealthy')
  final RangeValue? veryUnhealthy;
  
  final RangeValue? hazardous;

  AqiRanges({
    this.good,
    this.moderate,
    this.u4sg,
    this.unhealthy,
    this.veryUnhealthy,
    this.hazardous,
  });

  factory AqiRanges.fromJson(Map<String, dynamic> json) => 
      _$AqiRangesFromJson(json);

  Map<String, dynamic> toJson() => _$AqiRangesToJson(this);
}

@JsonSerializable()
class RangeValue {
  final double? min;
  final double? max;

  RangeValue({this.min, this.max});

  factory RangeValue.fromJson(Map<String, dynamic> json) => 
      _$RangeValueFromJson(json);

  Map<String, dynamic> toJson() => _$RangeValueToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Averages {
  @JsonKey(name: 'dailyAverage')
  final double? dailyAverage;

  @JsonKey(name: 'percentageDifference')
  final double? percentageDifference;
  
  @JsonKey(name: 'weeklyAverages')
  final WeeklyAverages? weeklyAverages;

  Averages({
    this.dailyAverage,
    this.percentageDifference,
    this.weeklyAverages,
  });

  factory Averages.fromJson(Map<String, dynamic> json) => 
      _$AveragesFromJson(json);

  Map<String, dynamic> toJson() => _$AveragesToJson(this);
}

@JsonSerializable()
class WeeklyAverages {
  @JsonKey(name: 'currentWeek')
  final double? currentWeek;

  @JsonKey(name: 'previousWeek')
  final double? previousWeek;

  WeeklyAverages({
    this.currentWeek, 
    this.previousWeek,
  });

  factory WeeklyAverages.fromJson(Map<String, dynamic> json) => 
      _$WeeklyAveragesFromJson(json);

  Map<String, dynamic> toJson() => _$WeeklyAveragesToJson(this);
}

@JsonSerializable()
class HealthTip {
  final String? title;
  final String? description;
  final String? image;

  HealthTip({
    this.title,
    this.description,
    this.image,
  });

  factory HealthTip.fromJson(Map<String, dynamic> json) => 
      _$HealthTipFromJson(json);

  Map<String, dynamic> toJson() => _$HealthTipToJson(this);
}

@JsonSerializable()
class No2 {
  // Empty in the provided JSON, but included for flexibility
  No2();

  factory No2.fromJson(Map<String, dynamic> json) => 
      _$No2FromJson(json);

  Map<String, dynamic> toJson() => _$No2ToJson(this);
}

@JsonSerializable()
class Pm10 {
  final double? value;

  Pm10({this.value});

  factory Pm10.fromJson(Map<String, dynamic> json) => 
      _$Pm10FromJson(json);

  Map<String, dynamic> toJson() => _$Pm10ToJson(this);
}

@JsonSerializable()
class Pm25 {
  final double? value;

  Pm25({this.value});

  factory Pm25.fromJson(Map<String, dynamic> json) => 
      _$Pm25FromJson(json);

  Map<String, dynamic> toJson() => _$Pm25ToJson(this);
}

@JsonSerializable(explicitToJson: true)
class SiteDetails {
  @JsonKey(name: '_id')
  final String? id;
  
  final String? town;
  final String? city;
  
  @JsonKey(name: 'formatted_name')
  final String? formattedName;
  
  final String? district;
  final String? county;
  final String? region;
  final String? country;
  final String? name;
  
  @JsonKey(name: 'approximate_latitude')
  final double? approximateLatitude;
  
  @JsonKey(name: 'approximate_longitude')
  final double? approximateLongitude;
  
  @JsonKey(name: 'bearing_in_radians')
  final double? bearingInRadians;
  
  final String? description;
  
  @JsonKey(name: 'location_name')
  final String? locationName;
  
  @JsonKey(name: 'search_name')
  final String? searchName;
  
  @JsonKey(name: 'sub_county')
  final String? subCounty;
  
  @JsonKey(name: 'data_provider')
  final String? dataProvider;
  
  @JsonKey(name: 'site_category')
  final SiteCategory? siteCategory;

  SiteDetails({
    this.id,
    this.town,
    this.city,
    this.formattedName,
    this.district,
    this.county,
    this.region,
    this.country,
    this.name,
    this.approximateLatitude,
    this.approximateLongitude,
    this.bearingInRadians,
    this.description,
    this.locationName,
    this.searchName,
    this.subCounty,
    this.dataProvider,
    this.siteCategory,
  });

  factory SiteDetails.fromJson(Map<String, dynamic> json) => 
      _$SiteDetailsFromJson(json);

  Map<String, dynamic> toJson() => _$SiteDetailsToJson(this);
}

@JsonSerializable()
class SiteCategory {
  final List<String>? tags;
  
  @JsonKey(name: 'area_name')
  final String? areaName;
  
  final String? category;
  final String? highway;
  final String? landuse;
  
  final double? latitude;
  final double? longitude;
  
  final String? natural;
  
  @JsonKey(name: 'search_radius')
  final double? searchRadius;
  
  final String? waterway;

  SiteCategory({
    this.tags,
    this.areaName,
    this.category,
    this.highway,
    this.landuse,
    this.latitude,
    this.longitude,
    this.natural,
    this.searchRadius,
    this.waterway,
  });

  factory SiteCategory.fromJson(Map<String, dynamic> json) => 
      _$SiteCategoryFromJson(json);

  Map<String, dynamic> toJson() => _$SiteCategoryToJson(this);
}