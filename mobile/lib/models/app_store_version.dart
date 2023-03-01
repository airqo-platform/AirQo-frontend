import 'package:json_annotation/json_annotation.dart';

part 'app_store_version.g.dart';

@JsonSerializable(createToJson: false)
class AppStoreVersion {
  final String version;
  final Uri url;

  AppStoreVersion({required this.version, required this.url});

  factory AppStoreVersion.fromJson(Map<String, dynamic> json) =>
      _$AppStoreVersionFromJson(json);
}
