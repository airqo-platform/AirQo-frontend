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
      options: _parseStringList(json['options']),
      minValue: _parseIntValue(json['minValue']),
      maxValue: _parseIntValue(json['maxValue']),
      placeholder: _parseStringValue(json['placeholder']),
      isRequired: json['isRequired'] ?? true,
    );
  }

  // Safe parsing helper methods
  static List<String>? _parseStringList(dynamic value) {
    if (value == null) return null;
    if (value is! Iterable) return null;
    
    try {
      return value
          .where((item) => item != null)
          .map((item) => item.toString())
          .toList();
    } catch (e) {
      return null;
    }
  }

  static int? _parseIntValue(dynamic value) {
    if (value == null) return null;
    
    try {
      if (value is int) return value;
      if (value is num) return value.toInt();
      if (value is String) {
        final parsed = int.tryParse(value);
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static String? _parseStringValue(dynamic value) {
    if (value == null) return null;
    
    try {
      return value.toString();
    } catch (e) {
      return null;
    }
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
      conditions: _parseConditionsMap(json['conditions']),
    );
  }

  // Safe parsing for conditions map
  static Map<String, dynamic>? _parseConditionsMap(dynamic value) {
    if (value == null) return null;
    
    try {
      if (value is Map<String, dynamic>) {
        return value;
      } else if (value is Map) {
        // Convert Map<dynamic, dynamic> to Map<String, dynamic>
        return Map<String, dynamic>.from(value);
      }
      return null;
    } catch (e) {
      return null;
    }
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
      title: SurveyQuestion._parseStringValue(json['title']) ?? '',
      description: SurveyQuestion._parseStringValue(json['description']) ?? '',
      questions: _parseQuestionsList(json['questions']),
      trigger: _parseTrigger(json['trigger']),
      timeToComplete: _parseDuration(json['timeToComplete']),
      isActive: json['isActive'] ?? true,
      createdAt: _parseDateTime(json['createdAt']) ?? DateTime.now(),
      expiresAt: _parseDateTime(json['expiresAt']),
    );
  }

  // Safe parsing for questions list
  static List<SurveyQuestion> _parseQuestionsList(dynamic value) {
    if (value == null) return [];
    if (value is! List) return [];
    
    try {
      return value
          .where((item) => item != null && item is Map)
          .map((item) {
            try {
              return SurveyQuestion.fromJson(Map<String, dynamic>.from(item));
            } catch (e) {
              return null;
            }
          })
          .where((question) => question != null)
          .cast<SurveyQuestion>()
          .toList();
    } catch (e) {
      return [];
    }
  }

  // Safe parsing for trigger
  static SurveyTrigger _parseTrigger(dynamic value) {
    try {
      if (value is Map<String, dynamic>) {
        return SurveyTrigger.fromJson(value);
      } else if (value is Map) {
        return SurveyTrigger.fromJson(Map<String, dynamic>.from(value));
      }
      return SurveyTrigger.fromJson({});
    } catch (e) {
      return SurveyTrigger.fromJson({});
    }
  }

  // Safe parsing for duration
  static Duration? _parseDuration(dynamic value) {
    if (value == null) return null;
    
    try {
      int? seconds;
      if (value is int) {
        seconds = value;
      } else if (value is num) {
        seconds = value.toInt();
      } else if (value is String) {
        seconds = int.tryParse(value);
      }
      
      return seconds != null && seconds >= 0 ? Duration(seconds: seconds) : null;
    } catch (e) {
      return null;
    }
  }

  // Safe parsing for DateTime
  static DateTime? _parseDateTime(dynamic value) {
    if (value == null) return null;
    
    try {
      if (value is String && value.isNotEmpty) {
        return DateTime.parse(value);
      }
      return null;
    } catch (e) {
      return null;
    }
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

  // Helper method to check if survey is expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  // Get estimated completion time as formatted string
  String get estimatedTimeString {
    if (timeToComplete == null) return '2 min';
    final minutes = timeToComplete!.inMinutes;
    return '$minutes min';
  }
}