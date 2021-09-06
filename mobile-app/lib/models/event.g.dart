// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'event.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Event _$EventFromJson(Map<String, dynamic> json) {
  return Event(
    isCache: json['isCache'] as bool,
    success: json['success'] as bool,
    message: json['message'] as String,
    measurements: (json['measurements'] as List<dynamic>)
        .map((e) => Measurement.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$EventToJson(Event instance) => <String, dynamic>{
      'isCache': instance.isCache,
      'success': instance.success,
      'message': instance.message,
      'measurements': instance.measurements,
    };

Events _$EventsFromJson(Map<String, dynamic> json) {
  return Events(
    events: (json['events'] as List<dynamic>)
        .map((e) => Event.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$EventsToJson(Events instance) => <String, dynamic>{
      'events': instance.events,
    };
