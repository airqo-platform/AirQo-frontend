// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya_bloc.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

KyaState _$KyaStateFromJson(Map<String, dynamic> json) => KyaState(
      lessons: (json['lessons'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$KyaStateToJson(KyaState instance) => <String, dynamic>{
      'lessons': instance.lessons,
    };
