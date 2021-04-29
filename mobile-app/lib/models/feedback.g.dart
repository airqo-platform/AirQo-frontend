// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feedback.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserFeedback _$FeedbackFromJson(Map<String, dynamic> json) {
  return UserFeedback(
    email: json['email'] as String,
    feedback: json['feedback'] as String,
  );
}

Map<String, dynamic> _$FeedbackToJson(UserFeedback instance) => <String, dynamic>{
      'email': instance.email,
      'feedback': instance.feedback,
    };
