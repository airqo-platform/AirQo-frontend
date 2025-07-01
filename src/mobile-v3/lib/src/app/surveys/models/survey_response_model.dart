import 'package:equatable/equatable.dart';

enum SurveyResponseStatus {
  inProgress,
  completed,
  skipped,
  expired,
}

class SurveyAnswer extends Equatable {
  final String questionId;
  final dynamic answer; // Can be String, int, List<String>, etc.
  final DateTime answeredAt;

  const SurveyAnswer({
    required this.questionId,
    required this.answer,
    required this.answeredAt,
  });

  @override
  List<Object?> get props => [questionId, answer, answeredAt];

  factory SurveyAnswer.fromJson(Map<String, dynamic> json) {
    return SurveyAnswer(
      questionId: json['questionId'] ?? '',
      answer: json['answer'],
      answeredAt: DateTime.parse(json['answeredAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'answer': answer,
      'answeredAt': answeredAt.toIso8601String(),
    };
  }
}

class SurveyResponse extends Equatable {
  final String id;
  final String surveyId;
  final String userId;
  final List<SurveyAnswer> answers;
  final SurveyResponseStatus status;
  final DateTime startedAt;
  final DateTime? completedAt;
  final Map<String, dynamic>? contextData; // Location, air quality, etc. when survey was triggered
  final Duration? timeToComplete;

  const SurveyResponse({
    required this.id,
    required this.surveyId,
    required this.userId,
    required this.answers,
    required this.status,
    required this.startedAt,
    this.completedAt,
    this.contextData,
    this.timeToComplete,
  });

  @override
  List<Object?> get props => [
        id,
        surveyId,
        userId,
        answers,
        status,
        startedAt,
        completedAt,
        contextData,
        timeToComplete,
      ];

  factory SurveyResponse.fromJson(Map<String, dynamic> json) {
    return SurveyResponse(
      id: json['_id'] ?? json['id'] ?? '',
      surveyId: json['surveyId'] ?? '',
      userId: json['userId'] ?? '',
      answers: (json['answers'] as List<dynamic>?)
              ?.map((a) => SurveyAnswer.fromJson(a))
              .toList() ??
          [],
      status: SurveyResponseStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => SurveyResponseStatus.inProgress,
      ),
      startedAt: DateTime.parse(json['startedAt'] ?? DateTime.now().toIso8601String()),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      contextData: json['contextData'],
      timeToComplete: json['timeToComplete'] != null
          ? Duration(seconds: json['timeToComplete'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'surveyId': surveyId,
      'userId': userId,
      'answers': answers.map((a) => a.toJson()).toList(),
      'status': status.toString().split('.').last,
      'startedAt': startedAt.toIso8601String(),
      if (completedAt != null) 'completedAt': completedAt!.toIso8601String(),
      if (contextData != null) 'contextData': contextData,
      if (timeToComplete != null) 'timeToComplete': timeToComplete!.inSeconds,
    };
  }

  // Helper methods
  bool get isCompleted => status == SurveyResponseStatus.completed;
  bool get isInProgress => status == SurveyResponseStatus.inProgress;
  bool get isSkipped => status == SurveyResponseStatus.skipped;

  // Get answer for a specific question
  SurveyAnswer? getAnswerForQuestion(String questionId) {
    try {
      return answers.firstWhere((answer) => answer.questionId == questionId);
    } catch (e) {
      return null;
    }
  }

  // Calculate completion percentage
  double getCompletionPercentage(int totalQuestions) {
    if (totalQuestions == 0) return 0.0;
    return (answers.length / totalQuestions) * 100;
  }

  // Copy with method for state updates
  SurveyResponse copyWith({
    String? id,
    String? surveyId,
    String? userId,
    List<SurveyAnswer>? answers,
    SurveyResponseStatus? status,
    DateTime? startedAt,
    DateTime? completedAt,
    Map<String, dynamic>? contextData,
    Duration? timeToComplete,
  }) {
    return SurveyResponse(
      id: id ?? this.id,
      surveyId: surveyId ?? this.surveyId,
      userId: userId ?? this.userId,
      answers: answers ?? this.answers,
      status: status ?? this.status,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      contextData: contextData ?? this.contextData,
      timeToComplete: timeToComplete ?? this.timeToComplete,
    );
  }
}

// Model for survey statistics and analytics
class SurveyStats extends Equatable {
  final String surveyId;
  final int totalResponses;
  final int completedResponses;
  final int skippedResponses;
  final double averageCompletionTime; // in seconds
  final double completionRate; // percentage
  final Map<String, dynamic>? answerDistribution; // Answer frequency analysis

  const SurveyStats({
    required this.surveyId,
    required this.totalResponses,
    required this.completedResponses,
    required this.skippedResponses,
    required this.averageCompletionTime,
    required this.completionRate,
    this.answerDistribution,
  });

  @override
  List<Object?> get props => [
        surveyId,
        totalResponses,
        completedResponses,
        skippedResponses,
        averageCompletionTime,
        completionRate,
        answerDistribution,
      ];

  factory SurveyStats.fromJson(Map<String, dynamic> json) {
    return SurveyStats(
      surveyId: json['surveyId'] ?? '',
      totalResponses: json['totalResponses'] ?? 0,
      completedResponses: json['completedResponses'] ?? 0,
      skippedResponses: json['skippedResponses'] ?? 0,
      averageCompletionTime: (json['averageCompletionTime'] ?? 0.0).toDouble(),
      completionRate: (json['completionRate'] ?? 0.0).toDouble(),
      answerDistribution: json['answerDistribution'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'surveyId': surveyId,
      'totalResponses': totalResponses,
      'completedResponses': completedResponses,
      'skippedResponses': skippedResponses,
      'averageCompletionTime': averageCompletionTime,
      'completionRate': completionRate,
      if (answerDistribution != null) 'answerDistribution': answerDistribution,
    };
  }
}