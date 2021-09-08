import 'package:json_annotation/json_annotation.dart';

import 'measurement.dart';

part 'event.g.dart';

@JsonSerializable()
class Event {
  final bool isCache;

  final bool success;

  final String message;

  final List<Measurement> measurements;

  Event(
      {required this.isCache,
      required this.success,
      required this.message,
      required this.measurements});

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);

  Map<String, dynamic> toJson() => _$EventToJson(this);
}

@JsonSerializable()
class Events {
  final List<Event> events;

  Events({
    required this.events,
  });

  factory Events.fromJson(Map<String, dynamic> json) => _$EventsFromJson(json);

  Map<String, dynamic> toJson() => _$EventsToJson(this);
}
