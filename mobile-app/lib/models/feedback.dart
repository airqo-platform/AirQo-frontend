import 'package:json_annotation/json_annotation.dart';

part 'feedback.g.dart';

@JsonSerializable()
class UserFeedback {
  UserFeedback({
    required this.email,
    required this.feedback,
  });

  factory UserFeedback.fromJson(Map<String, dynamic> json) =>
      _$UserFeedbackFromJson(json);

  Map<String, dynamic> toJson() => _$UserFeedbackToJson(this);

  String email;
  String feedback;
}
