// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'airquality_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AirQualityResponse _$AirQualityResponseFromJson(Map<String, dynamic> json) =>
    AirQualityResponse(
      success: json['success'] as bool?,
      message: json['message'] as String?,
      measurements: (json['measurements'] as List<dynamic>?)
          ?.map((e) => Measurement.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AirQualityResponseToJson(AirQualityResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'measurements': instance.measurements?.map((e) => e.toJson()).toList(),
    };

Measurement _$MeasurementFromJson(Map<String, dynamic> json) => Measurement(
      id: json['_id'] as String?,
      siteId: json['site_id'] as String?,
      time: json['time'] as String?,
      v: (json['__v'] as num?)?.toInt(),
      aqiCategory: json['aqi_category'] as String?,
      aqiColor: json['aqi_color'] as String?,
      aqiColorName: json['aqi_color_name'] as String?,
      aqiRanges: json['aqi_ranges'] == null
          ? null
          : AqiRanges.fromJson(json['aqi_ranges'] as Map<String, dynamic>),
      averages: json['averages'] == null
          ? null
          : Averages.fromJson(json['averages'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String?,
      device: json['device'] as String?,
      deviceId: json['device_id'] as String?,
      frequency: json['frequency'] as String?,
      healthTips: (json['health_tips'] as List<dynamic>?)
          ?.map((e) => HealthTip.fromJson(e as Map<String, dynamic>))
          .toList(),
      isReadingPrimary: json['is_reading_primary'] as bool?,
      no2: json['no2'] == null
          ? null
          : No2.fromJson(json['no2'] as Map<String, dynamic>),
      pm10: json['pm10'] == null
          ? null
          : Pm10.fromJson(json['pm10'] as Map<String, dynamic>),
      pm25: json['pm2_5'] == null
          ? null
          : Pm25.fromJson(json['pm2_5'] as Map<String, dynamic>),
      siteDetails: json['siteDetails'] == null
          ? null
          : SiteDetails.fromJson(json['siteDetails'] as Map<String, dynamic>),
      timeDifferenceHours: (json['timeDifferenceHours'] as num?)?.toDouble(),
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$MeasurementToJson(Measurement instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'site_id': instance.siteId,
      'time': instance.time,
      '__v': instance.v,
      'aqi_category': instance.aqiCategory,
      'aqi_color': instance.aqiColor,
      'aqi_color_name': instance.aqiColorName,
      'aqi_ranges': instance.aqiRanges?.toJson(),
      'averages': instance.averages?.toJson(),
      'createdAt': instance.createdAt,
      'device': instance.device,
      'device_id': instance.deviceId,
      'frequency': instance.frequency,
      'health_tips': instance.healthTips?.map((e) => e.toJson()).toList(),
      'is_reading_primary': instance.isReadingPrimary,
      'no2': instance.no2?.toJson(),
      'pm10': instance.pm10?.toJson(),
      'pm2_5': instance.pm25?.toJson(),
      'siteDetails': instance.siteDetails?.toJson(),
      'timeDifferenceHours': instance.timeDifferenceHours,
      'updatedAt': instance.updatedAt,
    };

AqiRanges _$AqiRangesFromJson(Map<String, dynamic> json) => AqiRanges(
      good: json['good'] == null
          ? null
          : RangeValue.fromJson(json['good'] as Map<String, dynamic>),
      moderate: json['moderate'] == null
          ? null
          : RangeValue.fromJson(json['moderate'] as Map<String, dynamic>),
      u4sg: json['u4sg'] == null
          ? null
          : RangeValue.fromJson(json['u4sg'] as Map<String, dynamic>),
      unhealthy: json['unhealthy'] == null
          ? null
          : RangeValue.fromJson(json['unhealthy'] as Map<String, dynamic>),
      veryUnhealthy: json['very_unhealthy'] == null
          ? null
          : RangeValue.fromJson(json['very_unhealthy'] as Map<String, dynamic>),
      hazardous: json['hazardous'] == null
          ? null
          : RangeValue.fromJson(json['hazardous'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AqiRangesToJson(AqiRanges instance) => <String, dynamic>{
      'good': instance.good?.toJson(),
      'moderate': instance.moderate?.toJson(),
      'u4sg': instance.u4sg?.toJson(),
      'unhealthy': instance.unhealthy?.toJson(),
      'very_unhealthy': instance.veryUnhealthy?.toJson(),
      'hazardous': instance.hazardous?.toJson(),
    };

RangeValue _$RangeValueFromJson(Map<String, dynamic> json) => RangeValue(
      min: (json['min'] as num?)?.toDouble(),
      max: (json['max'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$RangeValueToJson(RangeValue instance) =>
    <String, dynamic>{
      'min': instance.min,
      'max': instance.max,
    };

Averages _$AveragesFromJson(Map<String, dynamic> json) => Averages(
      dailyAverage: (json['dailyAverage'] as num?)?.toDouble(),
      percentageDifference: (json['percentageDifference'] as num?)?.toDouble(),
      weeklyAverages: json['weeklyAverages'] == null
          ? null
          : WeeklyAverages.fromJson(
              json['weeklyAverages'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AveragesToJson(Averages instance) => <String, dynamic>{
      'dailyAverage': instance.dailyAverage,
      'percentageDifference': instance.percentageDifference,
      'weeklyAverages': instance.weeklyAverages?.toJson(),
    };

WeeklyAverages _$WeeklyAveragesFromJson(Map<String, dynamic> json) =>
    WeeklyAverages(
      currentWeek: (json['currentWeek'] as num?)?.toDouble(),
      previousWeek: (json['previousWeek'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$WeeklyAveragesToJson(WeeklyAverages instance) =>
    <String, dynamic>{
      'currentWeek': instance.currentWeek,
      'previousWeek': instance.previousWeek,
    };

HealthTip _$HealthTipFromJson(Map<String, dynamic> json) => HealthTip(
      title: json['title'] as String?,
      description: json['description'] as String?,
      image: json['image'] as String?,
    );

Map<String, dynamic> _$HealthTipToJson(HealthTip instance) => <String, dynamic>{
      'title': instance.title,
      'description': instance.description,
      'image': instance.image,
    };

No2 _$No2FromJson(Map<String, dynamic> json) => No2();

Map<String, dynamic> _$No2ToJson(No2 instance) => <String, dynamic>{};

Pm10 _$Pm10FromJson(Map<String, dynamic> json) => Pm10(
      value: (json['value'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$Pm10ToJson(Pm10 instance) => <String, dynamic>{
      'value': instance.value,
    };

Pm25 _$Pm25FromJson(Map<String, dynamic> json) => Pm25(
      value: (json['value'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$Pm25ToJson(Pm25 instance) => <String, dynamic>{
      'value': instance.value,
    };

SiteDetails _$SiteDetailsFromJson(Map<String, dynamic> json) => SiteDetails(
      id: json['_id'] as String?,
      town: json['town'] as String?,
      city: json['city'] as String?,
      formattedName: json['formatted_name'] as String?,
      district: json['district'] as String?,
      county: json['county'] as String?,
      region: json['region'] as String?,
      country: json['country'] as String?,
      name: json['name'] as String?,
      approximateLatitude: (json['approximate_latitude'] as num?)?.toDouble(),
      approximateLongitude: (json['approximate_longitude'] as num?)?.toDouble(),
      bearingInRadians: (json['bearing_in_radians'] as num?)?.toDouble(),
      description: json['description'] as String?,
      locationName: json['location_name'] as String?,
      searchName: json['search_name'] as String?,
      subCounty: json['sub_county'] as String?,
      dataProvider: json['data_provider'] as String?,
      siteCategory: json['site_category'] == null
          ? null
          : SiteCategory.fromJson(
              json['site_category'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$SiteDetailsToJson(SiteDetails instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'town': instance.town,
      'city': instance.city,
      'formatted_name': instance.formattedName,
      'district': instance.district,
      'county': instance.county,
      'region': instance.region,
      'country': instance.country,
      'name': instance.name,
      'approximate_latitude': instance.approximateLatitude,
      'approximate_longitude': instance.approximateLongitude,
      'bearing_in_radians': instance.bearingInRadians,
      'description': instance.description,
      'location_name': instance.locationName,
      'search_name': instance.searchName,
      'sub_county': instance.subCounty,
      'data_provider': instance.dataProvider,
      'site_category': instance.siteCategory?.toJson(),
    };

SiteCategory _$SiteCategoryFromJson(Map<String, dynamic> json) => SiteCategory(
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
      areaName: json['area_name'] as String?,
      category: json['category'] as String?,
      highway: json['highway'] as String?,
      landuse: json['landuse'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      natural: json['natural'] as String?,
      searchRadius: (json['search_radius'] as num?)?.toDouble(),
      waterway: json['waterway'] as String?,
    );

Map<String, dynamic> _$SiteCategoryToJson(SiteCategory instance) =>
    <String, dynamic>{
      'tags': instance.tags,
      'area_name': instance.areaName,
      'category': instance.category,
      'highway': instance.highway,
      'landuse': instance.landuse,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'natural': instance.natural,
      'search_radius': instance.searchRadius,
      'waterway': instance.waterway,
    };
