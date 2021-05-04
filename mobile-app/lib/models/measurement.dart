import 'package:app/constants/app_constants.dart';
import 'package:flutter/foundation.dart';
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
    required this.favourite,
    required this.status,
    required this.address,
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



  static Map<String, dynamic> toDbMap(Measurement measurement) {

    var constants = DbConstants();

    var time = measurement.time.replaceAll('T', ' ');

    if(time.contains('.')){
      time = time.substring(0, time.indexOf('.'));
    }


    return {
      constants.favourite: measurement.favourite == null ? 0 : measurement.favourite ? 1 : 0,
      constants.channelID: measurement.channelID,
      constants.time: time,
      constants.pm2_5: measurement.pm2_5.value,
      constants.s2_pm2_5: measurement.s2_pm2_5.value,
      constants.s2_pm10: measurement.s2_pm10.value,
      constants.pm10: measurement.pm10.value,
      constants.longitude: measurement.location.longitude.value,
      constants.latitude: measurement.location.latitude.value,
      constants.address: measurement.address,
    };
  }

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {

    var constants = DbConstants();

    return {
      'favourite': json[constants.favourite] == 0 ? false : true,
      'address': json[constants.address] as String,
      'channelID': json[constants.channelID] as int,
      'time': json[constants.time] as String,
      'pm2_5': {'value' : json[constants.pm2_5]},
      's2_pm2_5': {'value' : json[constants.s2_pm2_5]},
      's2_pm10': {'value' : json[constants.s2_pm10]},
      'pm10': {'value' : json[constants.pm10]},
      'location': {
        'latitude' : {'value' : json[constants.latitude]},
        'longitude' : {'value' : json[constants.longitude]}
        },
    };
  }
  static Map<String, dynamic> fromApiMap(Map<String, dynamic> json) {
    var constants = DbConstants();

    Map<String, dynamic> data =
     {
      'time': json['created_at'] as String,
      'pm2_5': {'value': double.parse(json[constants.pm2_5])},
      's2_pm2_5': {'value': double.parse(json[constants.s2_pm2_5])},
        's2_pm10': {'value': double.parse(json[constants.s2_pm10])},
        'pm10': {'value': double.parse(json[constants.pm10])},
        'location': {
          'latitude': {'value': double.parse(json[constants.latitude])},
          'longitude': {'value': double.parse(json[constants.longitude])}
        },
      };

    print(data);
    return data;
  }


  @JsonKey(required: false)
  int channelID;

  @JsonKey(required: false)
  final String time;

  @JsonKey(required: false)
  final Value pm2_5;

  @JsonKey(required: false)
  final Value pm10;

  @JsonKey(required: false)
  final Value s2_pm2_5;

  @JsonKey(required: false)
  final Location location;

  @JsonKey(required: false)
  final Value s2_pm10;

  @JsonKey(required: false)
  String address;

  @JsonKey(required: false)
  String status;

  @JsonKey(required: false)
  bool favourite;

  void setAddress(String addr){
    address = addr;
  }

  void setStatus(String s){
    status = s;
  }

  void setFavourite(bool fav){
    favourite = fav;
  }

  void setChannelId(int fav){
    channelID = fav;
  }



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