import 'package:json_annotation/json_annotation.dart';

import 'measurement.dart';

part 'event.g.dart';

@JsonSerializable()
class Events {
  Events({
    required this.events,
  });

  factory Events.fromJson(Map<String, dynamic> json) => _$EventsFromJson(json);
  Map<String, dynamic> toJson() => _$EventsToJson(this);

  final List<Event> events;
}

@JsonSerializable()
class Event {
  Event({
    required this.isCache,
    required this.success,
    required this.message,
    required this.measurements
  });


  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);
  Map<String, dynamic> toJson() => _$EventToJson(this);


  final bool isCache;
  final bool success;
  final String message;
  final List<Measurement> measurements;

}
