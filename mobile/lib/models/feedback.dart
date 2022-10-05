import 'enum_constants.dart';

class UserFeedback {
  UserFeedback(
      {required this.contactDetails,
      required this.message,
      required this.feedbackType});
  String contactDetails;
  String message;
  FeedbackType feedbackType;
}
