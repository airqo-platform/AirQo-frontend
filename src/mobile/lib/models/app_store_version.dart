import 'package:json_annotation/json_annotation.dart';

part 'app_store_version.g.dart';

@JsonSerializable(createToJson: false)
class AppStoreVersion {
  final String version;
  final Uri url;

  @JsonKey(name: 'is_updated', defaultValue: true)
  final bool isUpdated;

  AppStoreVersion({
    required this.version,
    required this.url,
    required this.isUpdated,
  });

  factory AppStoreVersion.fromJson(Map<String, dynamic> json) =>
      _$AppStoreVersionFromJson(json);
}
