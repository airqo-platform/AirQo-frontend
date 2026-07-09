import 'dart:convert';

LearnV2CatalogResponse learnV2CatalogResponseFromJson(String str) =>
    LearnV2CatalogResponse.fromJson(json.decode(str));

String learnV2CatalogResponseToJson(LearnV2CatalogResponse data) =>
    json.encode(data.toJson());

class LearnV2CatalogResponse {
  final bool success;
  final String catalogVersion;
  final List<LearnV2Stage> stages;
  final int maxPoints;
  final List<LearnV2Course> courses;

  const LearnV2CatalogResponse({
    required this.success,
    required this.catalogVersion,
    this.stages = const [],
    this.maxPoints = 0,
    required this.courses,
  });

  factory LearnV2CatalogResponse.fromJson(Map<String, dynamic> json) =>
      LearnV2CatalogResponse(
        success: json['success'] ?? false,
        catalogVersion: json['catalog_version'] ?? '',
        stages: json['stages'] is List
            ? (json['stages'] as List)
                .whereType<Map>()
                .map((s) =>
                    LearnV2Stage.fromJson(Map<String, dynamic>.from(s)))
                .toList()
            : [],
        maxPoints: json['max_points'] as int? ?? 0,
        courses: json['courses'] != null
            ? (json['courses'] as List)
                .map((c) => LearnV2Course.fromJson(c as Map<String, dynamic>))
                .toList()
            : [],
      );

  Map<String, dynamic> toJson() => {
        'success': success,
        'catalog_version': catalogVersion,
        'stages': stages.map((s) => s.toJson()).toList(),
        'max_points': maxPoints,
        'courses': courses.map((c) => c.toJson()).toList(),
      };
}

class LearnV2Stage {
  final int index;
  final String name;

  const LearnV2Stage({required this.index, required this.name});

  factory LearnV2Stage.fromJson(Map<String, dynamic> json) => LearnV2Stage(
        index: json['index'] as int? ?? 0,
        name: json['name'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {'index': index, 'name': name};
}

class LearnV2Course {
  final String id;
  final int courseNumber;
  final String title;
  final String plainTitleKey;
  final String? coverImageUrl;
  final List<LearnV2Unit> units;

  const LearnV2Course({
    required this.id,
    required this.courseNumber,
    required this.title,
    required this.plainTitleKey,
    this.coverImageUrl,
    required this.units,
  });

  factory LearnV2Course.fromJson(Map<String, dynamic> json) => LearnV2Course(
        id: json['_id'] as String? ?? json['id'] as String? ?? '',
        courseNumber: json['course_number'] as int? ?? 0,
        title: json['title'] as String? ?? '',
        plainTitleKey:
            json['plain_title_key'] as String? ?? json['title'] as String? ?? '',
        coverImageUrl: json['cover_image_url'] as String?,
        units: json['units'] != null
            ? (json['units'] as List)
                .map((u) => LearnV2Unit.fromJson(u as Map<String, dynamic>))
                .toList()
            : [],
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'course_number': courseNumber,
        'title': title,
        'plain_title_key': plainTitleKey,
        'cover_image_url': coverImageUrl,
        'units': units.map((u) => u.toJson()).toList(),
      };
}

class LearnV2Unit {
  final String id;
  final String title;
  final List<LearnV2Lesson> lessons;

  const LearnV2Unit({
    required this.id,
    required this.title,
    required this.lessons,
  });

  factory LearnV2Unit.fromJson(Map<String, dynamic> json) => LearnV2Unit(
        id: json['_id'] as String? ?? json['id'] as String? ?? '',
        title: json['title'] as String? ?? '',
        lessons: json['lessons'] != null
            ? (json['lessons'] as List)
                .map((l) => LearnV2Lesson.fromJson(l as Map<String, dynamic>))
                .toList()
            : [],
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'title': title,
        'lessons': lessons.map((l) => l.toJson()).toList(),
      };
}

class LearnV2Lesson {
  final String id;
  final String title;
  final String? coverImageUrl;
  final String completionMessage;
  final List<LearnV2Activity> activities;

  const LearnV2Lesson({
    required this.id,
    required this.title,
    this.coverImageUrl,
    required this.completionMessage,
    required this.activities,
  });

  factory LearnV2Lesson.fromJson(Map<String, dynamic> json) {
    final rawActivities = json['activities'] as List? ?? [];
    final activities = rawActivities
        .map((a) => LearnV2Activity.fromJson(a as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => a.order.compareTo(b.order));
    return LearnV2Lesson(
      id: json['_id'] as String? ?? json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      coverImageUrl: json['cover_image_url'] as String?,
      completionMessage: json['completion_message'] as String? ?? '',
      activities: activities,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'title': title,
        'cover_image_url': coverImageUrl,
        'completion_message': completionMessage,
        'activities': activities.map((a) => a.toJson()).toList(),
      };
}

class LearnV2Activity {
  final String id;
  final String type;
  final int order;
  final Map<String, dynamic> payload;

  const LearnV2Activity({
    required this.id,
    required this.type,
    required this.order,
    required this.payload,
  });

  factory LearnV2Activity.fromJson(Map<String, dynamic> json) =>
      LearnV2Activity(
        id: json['_id'] as String? ?? json['id'] as String? ?? '',
        type: json['type'] as String? ?? '',
        order: json['order'] as int? ?? 0,
        payload: Map<String, dynamic>.from(json['payload'] as Map? ?? {}),
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'type': type,
        'order': order,
        'payload': payload,
      };
}
