// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feedback.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserFeedback _$UserFeedbackFromJson(Map<String, dynamic> json) {
  return UserFeedback(
    json['contactDetails'] as String,
    json['message'] as String,
    json['feedbackType'] as String,
  );
}

Map<String, dynamic> _$UserFeedbackToJson(UserFeedback instance) =>
    <String, dynamic>{
      'contactDetails': instance.contactDetails,
      'message': instance.message,
      'feedbackType': instance.feedbackType,
    };
