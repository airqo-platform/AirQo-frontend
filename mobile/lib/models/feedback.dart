import 'enum_constants.dart';

class UserFeedback {
  UserFeedback(
    this.contactDetails,
    this.message,
    this.feedbackType,
  );
  String contactDetails;
  String message;
  FeedbackType feedbackType;
}
