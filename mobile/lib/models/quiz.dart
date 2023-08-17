import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'quiz.g.dart';

@JsonSerializable(explicitToJson: true)
class Quiz extends Equatable {
  factory Quiz.fromJson(Map<String, dynamic> json) => _$QuizFromJson(json);
  factory Quiz.initialize() => Quiz(
        title: "Get personalised air recommendations",
        subTitle:
            "Tell us more about Air Quality conditions in your environment & get personalised tips.",
        imageUrl: "imageUrl",
        id: "id",
        questions: List.generate(
          10,
          (index) => QuizQuestion(
            id: "id",
            title: "Where is your home environment situated?",
            category: "Home environment",
            options: List.generate(
              4,
              (index) => const QuizQuestionOption(
                id: "id",
                title: "Next to a busy roads",
                answer:
                    "Living next to a busy road tends to increase one’s exposure to air pollution. Only open the windows that face the road during hours when there is less traffic. You can also plant trees or a hedge around your home to act as a barrier between you and the emissions. Street with little traffic - Your exposure to air pollution is limited since there are less vehicle emissions.",
              ),
            ),
          ),
        ),
        activeQuestion: 1,
        status: QuizStatus.todo,
        completionMessage: "You have completed the quiz!",
      );
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

  @JsonKey()
  final String subTitle;

  @JsonKey()
  final List<QuizQuestion> questions;

  @JsonKey(name: 'completion_message')
  final String completionMessage;

  @JsonKey(name: '_id')
  final String id;

  @JsonKey(name: 'active_task', defaultValue: 1)
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
    int? activeQuestion, required List<QuizQuestion> questions,
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

  @JsonKey()
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

  final String answer;

  Map<String, dynamic> toJson() => _$QuizQuestionOptionToJson(this);

  @override
  List<Object> get props => [id];
}
