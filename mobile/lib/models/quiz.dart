import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'quiz.g.dart';

@JsonSerializable(explicitToJson: true)
class Quiz extends Equatable {
  factory Quiz.fromJson(Map<String, dynamic> json) => _$QuizFromJson(json);
  const Quiz({
    required this.title,
    required this.subTitle,
    required this.imageUrl,
    required this.id,
    required this.questions,
    required this.activeQuestion,
    required this.status,
    required this.completionMessage,
    this.shareLink,
  });
  @JsonKey(name: 'image')
  final String imageUrl;

  @JsonKey()
  final String title;

  @JsonKey(name: 'description')
  final String subTitle;

  @JsonKey()
  final List<QuizQuestion> questions;

  @JsonKey(name: 'completion_message')
  final String completionMessage;

  @JsonKey(name: '_id')
  final String id;

  @JsonKey(name: 'active_question', defaultValue: 1)
  final int activeQuestion;

  @JsonKey(defaultValue: QuizStatus.todo)
  final QuizStatus status;

  @JsonKey(name: 'share_link', defaultValue: '')
  final String? shareLink;

  factory Quiz.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return Quiz(
      title: '',
      subTitle: '',
      imageUrl: '',
      id: id,
      questions: const [],
      completionMessage: '',
      shareLink: '',
      activeQuestion: 1,
      status: QuizStatus.todo,
    );
  }

  Map<String, dynamic> toJson() => _$QuizToJson(this);

  Quiz copyWith({
    String? shareLink,
    QuizStatus? status,
    int? activeQuestion,
    required List<QuizQuestion> questions,
  }) {
    return Quiz(
      title: title,
      subTitle: subTitle,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      questions: questions,
      status: status ?? this.status,
      activeQuestion: activeQuestion ?? this.activeQuestion,
      shareLink: shareLink ?? this.shareLink,
    );
  }

  String shareLinkParams() {
    return 'quizId=$id';
  }

  String imageUrlCacheKey() {
    return 'quiz-$id-image-url';
  }

  @override
  List<Object> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class QuizQuestion extends Equatable {
  const QuizQuestion({
    required this.id,
    required this.title,
    required this.category,
    required this.options,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return _$QuizQuestionFromJson(json);
  }

  @JsonKey(name: '_id')
  final String id;

  final String title;

  @JsonKey(name: 'context')
  final String category;

  @JsonKey(name: 'answers')
  final List<QuizQuestionOption> options;

  Map<String, dynamic> toJson() => _$QuizQuestionToJson(this);

  @override
  List<Object> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class QuizQuestionOption extends Equatable {
  const QuizQuestionOption({
    required this.id,
    required this.title,
    required this.answer,
  });

  factory QuizQuestionOption.fromJson(Map<String, dynamic> json) {
    return _$QuizQuestionOptionFromJson(json);
  }

  @JsonKey(name: '_id')
  final String id;

  final String title;

  @JsonKey(name: 'content')
  final String answer;

  Map<String, dynamic> toJson() => _$QuizQuestionOptionToJson(this);

  @override
  List<Object> get props => [id];
}
