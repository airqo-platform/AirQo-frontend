// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class KyaAdapter extends TypeAdapter<Kya> {
  @override
  final int typeId = 30;

  @override
  Kya read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Kya(
      title: fields[2] as String,
      imageUrl: fields[4] as String,
      id: fields[6] as String,
      lessons: (fields[7] as List).cast<KyaLesson>(),
      progress: fields[1] == null ? 0 : fields[1] as int,
      completionMessage: fields[3] == null
          ? 'You just finished your first Know You Air Lesson'
          : fields[3] as String,
      secondaryImageUrl: fields[5] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Kya obj) {
    writer
      ..writeByte(7)
      ..writeByte(1)
      ..write(obj.progress)
      ..writeByte(2)
      ..write(obj.title)
      ..writeByte(3)
      ..write(obj.completionMessage)
      ..writeByte(4)
      ..write(obj.imageUrl)
      ..writeByte(5)
      ..write(obj.secondaryImageUrl)
      ..writeByte(6)
      ..write(obj.id)
      ..writeByte(7)
      ..write(obj.lessons);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is KyaAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class KyaLessonAdapter extends TypeAdapter<KyaLesson> {
  @override
  final int typeId = 130;

  @override
  KyaLesson read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return KyaLesson(
      fields[0] as String,
      fields[1] as String,
      fields[2] as String,
    );
  }

  @override
  void write(BinaryWriter writer, KyaLesson obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.title)
      ..writeByte(1)
      ..write(obj.imageUrl)
      ..writeByte(2)
      ..write(obj.body);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is KyaLessonAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Kya _$KyaFromJson(Map<String, dynamic> json) => Kya(
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      id: json['id'] as String,
      lessons: (json['lessons'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
      progress: json['progress'] as int? ?? 0,
      completionMessage: json['completionMessage'] as String? ??
          'You just finished your first Know You Air Lesson',
      secondaryImageUrl: json['secondaryImageUrl'] as String? ?? '',
    );

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'progress': instance.progress,
      'title': instance.title,
      'completionMessage': instance.completionMessage,
      'imageUrl': instance.imageUrl,
      'secondaryImageUrl': instance.secondaryImageUrl,
      'id': instance.id,
      'lessons': instance.lessons.map((e) => e.toJson()).toList(),
    };

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      json['title'] as String,
      json['imageUrl'] as String,
      json['body'] as String,
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'body': instance.body,
    };
