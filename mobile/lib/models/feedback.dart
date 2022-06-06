import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

@JsonSerializable()
class UserFeedback {
  UserFeedback(this.contactDetails, this.message, this.feedbackType);
  String contactDetails;
  String message;
  FeedbackType feedbackType;
}
