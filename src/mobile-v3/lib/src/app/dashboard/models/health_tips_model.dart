import 'package:json_annotation/json_annotation.dart';

part 'health_tips_model.g.dart';

@JsonSerializable(explicitToJson: true)
class HealthTipModel {
  @JsonKey(name: '_id')
  final String id;
  final String title;
  @JsonKey(name: 'tag_line', defaultValue: '')
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

  factory HealthTipModel.fromJson(Map<String, dynamic> json) {
    // Handle missing tag_line by using title as a fallback
    if (!json.containsKey('tag_line') || json['tag_line'] == null) {
      json['tag_line'] = json['title'] ?? '';
    }
    
    // Ensure createdAt and updatedAt are available
    if (!json.containsKey('createdAt') || json['createdAt'] == null) {
      json['createdAt'] = DateTime.now().toIso8601String();
    }
    
    if (!json.containsKey('updatedAt') || json['updatedAt'] == null) {
      json['updatedAt'] = DateTime.now().toIso8601String();
    }
    
    return _$HealthTipModelFromJson(json);
  }

  Map<String, dynamic> toJson() => _$HealthTipModelToJson(this);
}

@JsonSerializable()
class AqiCategoryRange {
  final double min;
  @JsonKey(defaultValue: 500.0)
  final double max;

  AqiCategoryRange({
    required this.min,
    required this.max,
  });

  factory AqiCategoryRange.fromJson(Map<String, dynamic> json) {
    // Handle null max value
    if (json['max'] == null) {
      json['max'] = 500.0; // Use a high value for open-ended ranges
    }
    
    return _$AqiCategoryRangeFromJson(json);
  }

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

  factory HealthTipsResponse.fromJson(Map<String, dynamic> json) {
    // Convert from the API's "tips" array to our expected structure
    if (json.containsKey('tips') && !json.containsKey('data')) {
      json['data'] = {
        'health_tips': json['tips']
      };
    }
    
    return _$HealthTipsResponseFromJson(json);
  }

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