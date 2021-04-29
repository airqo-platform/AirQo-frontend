import 'package:app/constants/app_constants.dart';
import 'package:intl/intl.dart';
import 'package:json_annotation/json_annotation.dart';

part 'hourly.g.dart';

@JsonSerializable()
class Hourly{

  Hourly(this.channelId, this.time, this.pm2_5);

  factory Hourly.fromJson(Map<String, dynamic> json) => _$HourlyFromJson(json);
  Map<String, dynamic> toJson() => _$HourlyToJson(this);

  @JsonKey(name: 'channel_id', required: true)
  final int channelId;
  final String time;
  final double pm2_5;

  static Map<String, dynamic> toDbMap(Hourly hourly) {

    var constants = DbConstants();

    final formatter = DateFormat('yyyy-MM-dd HH:mm');
    final formatted = formatter.parse(hourly.time);

    return {
      constants.channelID: hourly.channelId,
      constants.time: formatted.toString(),
      constants.pm2_5: hourly.pm2_5,
    };
  }

  static Map<String, dynamic> fromDbMap(Map<String, dynamic> json) {

    var constants = DbConstants();

    return {
      'channelId': json[constants.channelID] as int,
      'time': json[constants.time] as String,
      'pm2_5': json[constants.pm2_5],
    };
  }

}