// To parse this JSON data, do
//
//     final lessonResponseModel = lessonResponseModelFromJson(jsonString);

import 'dart:convert';

LessonResponseModel lessonResponseModelFromJson(String str) => LessonResponseModel.fromJson(json.decode(str));

String lessonResponseModelToJson(LessonResponseModel data) => json.encode(data.toJson());

class LessonResponseModel {
    bool success;
    String message;
    List<KyaLesson> kyaLessons;

    LessonResponseModel({
        required this.success,
        required this.message,
        required this.kyaLessons,
    });

    factory LessonResponseModel.fromJson(Map<String, dynamic> json) => LessonResponseModel(
        success: json["success"],
        message: json["message"],
        kyaLessons: List<KyaLesson>.from(json["kya_lessons"].map((x) => KyaLesson.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "success": success,
        "message": message,
        "kya_lessons": List<dynamic>.from(kyaLessons.map((x) => x.toJson())),
    };
}

class KyaLesson {
    String id;
    String title;
    String completionMessage;
    String image;
    List<Task> tasks;

    KyaLesson({
        required this.id,
        required this.title,
        required this.completionMessage,
        required this.image,
        required this.tasks,
    });

    factory KyaLesson.fromJson(Map<String, dynamic> json) => KyaLesson(
        id: json["_id"],
        title: json["title"],
        completionMessage: json["completion_message"],
        image: json["image"],
        tasks: List<Task>.from(json["tasks"].map((x) => Task.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "_id": id,
        "title": title,
        "completion_message": completionMessage,
        "image": image,
        "tasks": List<dynamic>.from(tasks.map((x) => x.toJson())),
    };
}


class Task {
    String id;
    String title;
    String content;
    String image;
    DateTime createdAt;
    DateTime updatedAt;
    int v;
    String kyaLesson;
    int taskPosition;

    Task({
        required this.id,
        required this.title,
        required this.content,
        required this.image,
        required this.createdAt,
        required this.updatedAt,
        required this.v,
        required this.kyaLesson,
        required this.taskPosition,
    });

    factory Task.fromJson(Map<String, dynamic> json) => Task(
        id: json["_id"],
        title: json["title"],
        content: json["content"],
        image: json["image"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
        v: json["__v"],
        kyaLesson: json["kya_lesson"],
        taskPosition: json["task_position"],
    );

    Map<String, dynamic> toJson() => {
        "_id": id,
        "title": title,
        "content": content,
        "image": image,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
        "__v": v,
        "kya_lesson": kyaLesson,
        "task_position": taskPosition,
    };
}
