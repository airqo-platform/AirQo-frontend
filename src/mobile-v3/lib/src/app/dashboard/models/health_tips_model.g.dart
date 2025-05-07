// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_tips_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HealthTipModel _$HealthTipModelFromJson(Map<String, dynamic> json) =>
    HealthTipModel(
      id: json['_id'] as String,
      title: json['title'] as String,
      tagLine: json['tag_line'] as String? ?? '',
      description: json['description'] as String,
      image: json['image'] as String,
      aqiCategory:
          AqiCategoryRange.fromJson(json['aqi_category'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );

Map<String, dynamic> _$HealthTipModelToJson(HealthTipModel instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'tag_line': instance.tagLine,
      'description': instance.description,
      'image': instance.image,
      'aqi_category': instance.aqiCategory.toJson(),
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

AqiCategoryRange _$AqiCategoryRangeFromJson(Map<String, dynamic> json) =>
    AqiCategoryRange(
      min: (json['min'] as num).toDouble(),
      max: json['max'] != null ? (json['max'] as num).toDouble() : 500.0,
    );

Map<String, dynamic> _$AqiCategoryRangeToJson(AqiCategoryRange instance) =>
    <String, dynamic>{
      'min': instance.min,
      'max': instance.max,
    };

HealthTipsResponse _$HealthTipsResponseFromJson(Map<String, dynamic> json) =>
    HealthTipsResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null
          ? HealthTipsData.fromJson(json['data'] as Map<String, dynamic>)
          : HealthTipsData(
              healthTips: (json['tips'] as List<dynamic>)
                  .map((e) => HealthTipModel.fromJson(e as Map<String, dynamic>))
                  .toList(),
            ),
    );

Map<String, dynamic> _$HealthTipsResponseToJson(HealthTipsResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'data': instance.data.toJson(),
    };

HealthTipsData _$HealthTipsDataFromJson(Map<String, dynamic> json) =>
    HealthTipsData(
      healthTips: (json['health_tips'] as List<dynamic>)
          .map((e) => HealthTipModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$HealthTipsDataToJson(HealthTipsData instance) =>
    <String, dynamic>{
      'health_tips': instance.healthTips.map((e) => e.toJson()).toList(),
    };