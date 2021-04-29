import 'package:json_annotation/json_annotation.dart';

part 'feedback.g.dart';

@JsonSerializable()
class UserFeedback {
  UserFeedback({
    required this.email,
    required this.feedback,
  });

  factory UserFeedback.fromJson(Map<String, dynamic> json) =>
      _$FeedbackFromJson(json);

  Map<String, dynamic> toJson() => _$FeedbackToJson(this);

  String email;
  String feedback;
}
