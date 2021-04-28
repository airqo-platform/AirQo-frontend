import 'package:json_annotation/json_annotation.dart';

part 'measurement.g.dart';

@JsonSerializable()
class Measurements {
  Measurements({
    required this.measurements,
  });

  factory Measurements.fromJson(Map<String, dynamic> json) => _$MeasurementsFromJson(json);
  Map<String, dynamic> toJson() => _$MeasurementsToJson(this);

  final List<Measurement> measurements;
}

@JsonSerializable()
class Measurement {
  Measurement({
    required this.channelID,
    required this.time,
    required this.pm2_5,
    required this.pm10,
    required this.s2_pm2_5,
    required this.location,
    required this.s2_pm10,
    // required this.altitude,
    // required this.speed,
    // required this.internalTemperature,
    // required this.internalHumidity,
    // required this.frequency
  });


  factory Measurement.fromJson(Map<String, dynamic> json) => _$MeasurementFromJson(json);
  Map<String, dynamic> toJson() => _$MeasurementToJson(this);


  final int channelID;
  final String time;
  final Value pm2_5;
  final Value pm10;
  final Value s2_pm2_5;
  final Location location;
  final Value s2_pm10;
  // final Value altitude;
  // final Value speed;
  // final Value internalTemperature;
  // final Value internalHumidity;
  // final String frequency;

}


@JsonSerializable()
class Value {
  Value({
    required this.value
  });

  factory Value.fromJson(Map<String, dynamic> json) => _$ValueFromJson(json);
  Map<String, dynamic> toJson() => _$ValueToJson(this);


  final double value;

}


@JsonSerializable()
class Location {
  Location({
    required this.latitude,
    required this.longitude
  });


  factory Location.fromJson(Map<String, dynamic> json) => _$LocationFromJson(json);
  Map<String, dynamic> toJson() => _$LocationToJson(this);


  final Value latitude;
  final Value longitude;


}