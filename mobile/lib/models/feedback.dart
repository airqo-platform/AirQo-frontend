import 'package:json_annotation/json_annotation.dart';

part 'feedback.g.dart';

@JsonSerializable()
class UserFeedback {
  UserFeedback(this.contactDetails, this.message, this.feedbackType);

  factory UserFeedback.fromJson(Map<String, dynamic> json) =>
      _$UserFeedbackFromJson(json);
  String contactDetails;
  String message;
  String feedbackType;

  Map<String, dynamic> toJson() => _$UserFeedbackToJson(this);
}
