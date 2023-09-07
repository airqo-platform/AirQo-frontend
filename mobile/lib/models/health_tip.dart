import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'hive_type_id.dart';

part 'health_tip.g.dart';

@JsonSerializable()
@HiveType(typeId: healthTipsTypeId)
class HealthTip extends HiveObject with EquatableMixin {
  HealthTip({
    required this.title,
    required this.description,
    required this.image,
  });

  @JsonKey()
  @HiveField(0)
  final String title;

  @JsonKey()
  @HiveField(1)
  final String description;

  @JsonKey()
  @HiveField(2)
  final String image;

  Map<String, dynamic> toJson() => _$HealthTipToJson(this);

  factory HealthTip.fromJson(Map<String, dynamic> json) =>
      _$HealthTipFromJson(json);

  @override
  List<Object?> get props => [
        title,
        description,
        image,
      ];
}
