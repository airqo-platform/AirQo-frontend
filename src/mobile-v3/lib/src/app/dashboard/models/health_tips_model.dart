import 'package:json_annotation/json_annotation.dart';

part 'health_tips_model.g.dart';

@JsonSerializable(explicitToJson: true)
class HealthTipModel {
  @JsonKey(name: '_id')
  final String id;
  final String title;
  @JsonKey(name: 'tag_line')
  final String tagLine;
  final String description;
  final String image;
  
  @JsonKey(name: 'aqi_category')
  final AqiCategoryRange aqiCategory;
  
  @JsonKey(name: 'createdAt')
  final String createdAt;
  
  @JsonKey(name: 'updatedAt')
  final String updatedAt;

  HealthTipModel({
    required this.id,
    required this.title,
    required this.tagLine,
    required this.description,
    required this.image,
    required this.aqiCategory,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HealthTipModel.fromJson(Map<String, dynamic> json) => 
      _$HealthTipModelFromJson(json);

  Map<String, dynamic> toJson() => _$HealthTipModelToJson(this);
}

@JsonSerializable()
class AqiCategoryRange {
  final double min;
  final double max;

  AqiCategoryRange({
    required this.min,
    required this.max,
  });

  factory AqiCategoryRange.fromJson(Map<String, dynamic> json) => 
      _$AqiCategoryRangeFromJson(json);

  Map<String, dynamic> toJson() => _$AqiCategoryRangeToJson(this);
  
  bool isInRange(double value) {
    return value >= min && value <= max;
  }
}

@JsonSerializable(explicitToJson: true)
class HealthTipsResponse {
  final bool success;
  final String message;
  
  @JsonKey(name: 'data')
  final HealthTipsData data;

  HealthTipsResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HealthTipsResponse.fromJson(Map<String, dynamic> json) => 
      _$HealthTipsResponseFromJson(json);

  Map<String, dynamic> toJson() => _$HealthTipsResponseToJson(this);
}

@JsonSerializable(explicitToJson: true)
class HealthTipsData {
  @JsonKey(name: 'health_tips')
  final List<HealthTipModel> healthTips;

  HealthTipsData({
    required this.healthTips,
  });

  factory HealthTipsData.fromJson(Map<String, dynamic> json) => 
      _$HealthTipsDataFromJson(json);

  Map<String, dynamic> toJson() => _$HealthTipsDataToJson(this);
}