import 'package:equatable/equatable.dart';

enum QuestionType {
  multipleChoice,
  rating,
  text,
  yesNo,
  scale,
}

enum SurveyTriggerType {
  locationBased,
  timeBased,
  airQualityThreshold,
  manual,
  postExposure,
}

class SurveyQuestion extends Equatable {
  final String id;
  final String question;
  final QuestionType type;
  final List<String>? options; // For multiple choice
  final int? minValue; // For rating/scale
  final int? maxValue; // For rating/scale
  final String? placeholder; // For text input
  final bool isRequired;

  const SurveyQuestion({
    required this.id,
    required this.question,
    required this.type,
    this.options,
    this.minValue,
    this.maxValue,
    this.placeholder,
    this.isRequired = true,
  });

  @override
  List<Object?> get props => [
        id,
        question,
        type,
        options,
        minValue,
        maxValue,
        placeholder,
        isRequired,
      ];

  factory SurveyQuestion.fromJson(Map<String, dynamic> json) {
    return SurveyQuestion(
      id: json['id'] ?? '',
      question: json['question'] ?? '',
      type: QuestionType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => QuestionType.text,
      ),
      options: json['options'] != null
          ? List<String>.from(json['options'])
          : null,
      minValue: json['minValue'],
      maxValue: json['maxValue'],
      placeholder: json['placeholder'],
      isRequired: json['isRequired'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'type': type.toString().split('.').last,
      if (options != null) 'options': options,
      if (minValue != null) 'minValue': minValue,
      if (maxValue != null) 'maxValue': maxValue,
      if (placeholder != null) 'placeholder': placeholder,
      'isRequired': isRequired,
    };
  }
}

class SurveyTrigger extends Equatable {
  final SurveyTriggerType type;
  final Map<String, dynamic>? conditions; // Flexible conditions based on trigger type

  const SurveyTrigger({
    required this.type,
    this.conditions,
  });

  @override
  List<Object?> get props => [type, conditions];

  factory SurveyTrigger.fromJson(Map<String, dynamic> json) {
    return SurveyTrigger(
      type: SurveyTriggerType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => SurveyTriggerType.manual,
      ),
      conditions: json['conditions'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.toString().split('.').last,
      if (conditions != null) 'conditions': conditions,
    };
  }
}

class Survey extends Equatable {
  final String id;
  final String title;
  final String description;
  final List<SurveyQuestion> questions;
  final SurveyTrigger trigger;
  final Duration? timeToComplete; // Estimated completion time
  final bool isActive;
  final DateTime createdAt;
  final DateTime? expiresAt;

  const Survey({
    required this.id,
    required this.title,
    required this.description,
    required this.questions,
    required this.trigger,
    this.timeToComplete,
    this.isActive = true,
    required this.createdAt,
    this.expiresAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        questions,
        trigger,
        timeToComplete,
        isActive,
        createdAt,
        expiresAt,
      ];

  factory Survey.fromJson(Map<String, dynamic> json) {
    return Survey(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      questions: (json['questions'] as List<dynamic>?)
              ?.map((q) => SurveyQuestion.fromJson(q))
              .toList() ??
          [],
      trigger: SurveyTrigger.fromJson(json['trigger'] ?? {}),
      timeToComplete: json['timeToComplete'] != null
          ? Duration(seconds: json['timeToComplete'])
          : null,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'questions': questions.map((q) => q.toJson()).toList(),
      'trigger': trigger.toJson(),
      if (timeToComplete != null) 'timeToComplete': timeToComplete!.inSeconds,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      if (expiresAt != null) 'expiresAt': expiresAt!.toIso8601String(),
    };
  }

  // Helper method to check if survey is valid (not expired)
  bool get isValid {
    if (!isActive) return false;
    if (expiresAt == null) return true;
    return DateTime.now().isBefore(expiresAt!);
  }

  // Get estimated completion time as formatted string
  String get estimatedTimeString {
    if (timeToComplete == null) return '2 min';
    final minutes = timeToComplete!.inMinutes;
    return '$minutes min';
  }
}