// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quiz.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Quiz _$QuizFromJson(Map<String, dynamic> json) => Quiz(
      title: json['title'] as String,
      subTitle: json['description'] as String,
      imageUrl: json['image'] as String,
      id: json['_id'] as String,
      questions: (json['questions'] as List<dynamic>)
          .map((e) => QuizQuestion.fromJson(e as Map<String, dynamic>))
          .toList(),
      activeQuestion: json['active_question'] as int? ?? 1,
      status: $enumDecodeNullable(_$QuizStatusEnumMap, json['status']) ??
          QuizStatus.todo,
      completionMessage: json['completion_message'] as String,
      shareLink: json['share_link'] as String? ?? '',
    );

Map<String, dynamic> _$QuizToJson(Quiz instance) => <String, dynamic>{
      'image': instance.imageUrl,
      'title': instance.title,
      'description': instance.subTitle,
      'questions': instance.questions.map((e) => e.toJson()).toList(),
      'completion_message': instance.completionMessage,
      '_id': instance.id,
      'active_question': instance.activeQuestion,
      'status': _$QuizStatusEnumMap[instance.status]!,
      'share_link': instance.shareLink,
    };

const _$QuizStatusEnumMap = {
  QuizStatus.todo: 'TODO',
  QuizStatus.inProgress: 'IN_PROGRESS',
  QuizStatus.complete: 'COMPLETE',
};

QuizQuestion _$QuizQuestionFromJson(Map<String, dynamic> json) => QuizQuestion(
      id: json['_id'] as String,
      title: json['title'] as String,
      category: json['context'] as String,
      options: (json['answers'] as List<dynamic>)
          .map((e) => QuizQuestionOption.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$QuizQuestionToJson(QuizQuestion instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'context': instance.category,
      'answers': instance.options.map((e) => e.toJson()).toList(),
    };

QuizQuestionOption _$QuizQuestionOptionFromJson(Map<String, dynamic> json) =>
    QuizQuestionOption(
      id: json['_id'] as String,
      title: json['title'] as String,
      answer: json['content'] as String,
    );

Map<String, dynamic> _$QuizQuestionOptionToJson(QuizQuestionOption instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'content': instance.answer,
    };
