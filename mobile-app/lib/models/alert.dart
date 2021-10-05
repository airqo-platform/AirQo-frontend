import 'package:app/utils/date.dart';
import 'package:json_annotation/json_annotation.dart';

part 'alert.g.dart';

@JsonSerializable()
class Alert {

  Alert(this.receiver, this.siteId, this.type, this.hour, this.airQuality, this.siteName);

  final String receiver;
  final String siteId;
  final String siteName;
  final String type;
  final int hour;
  final String airQuality;

  factory Alert.fromJson(Map<String, dynamic> json) =>
      _$AlertFromJson(json);

  Map<String, dynamic> toJson() => _$AlertToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${alertDbName()}('
          '${dbSiteId()} TEXT PRIMARY KEY, '
          '${dbReceiver()} TEXT, '
          '${dbSiteName()} TEXT, '
          '${dbType()} TEXT, '
          '${dbHour()} INT, '
          '${dbAirQuality()} TEXT )';

  static String dbReceiver() => 'receiver';

  static String dbSiteId() => 'siteId';

  static String dbSiteName() => 'siteName';

  static String dbType() => 'type';

  static String dbHour() => 'hour';

  static String dbAirQuality() => 'airQuality';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${alertDbName()}';

  static String alertDbName() => 'alerts_table';

  @override
  String toString() {
    return 'Alert{receiver: $receiver, siteId: $siteId,'
        ' type: $type, hour: $hour, airQuality: $airQuality}';
  }
}

extension ParseAlert on Alert {
  String getAlertString() {
    if(type.toString().toLowerCase() == 'fixeddaily') {
      return 'Daily at ${getTime(hour)}';
    }
    else{
      return 'When air quality is ${getAirQuality(airQuality)}';
    }
  }

}

AlertType getAlertType(String type){
  if(type.toString().toLowerCase() == 'fixedDaily'){
    return AlertType.fixedDaily;
  }
  return AlertType.custom;
}

String getAirQuality(String quality){
  if(quality == 'veryUnhealthy'){
    return 'very unhealthy';
  }
  else if(quality == 'ufsg'){
    return 'unhealthy for sensitive groups';
  }
  else{
    return quality;
  }

}

enum AirQuality {
  good,
  moderate,
  unhealthy,
  veryUnhealthy,
  ufsg,
  hazardous,
}

enum AlertType { fixedDaily, custom }

extension ParseAlertType on AlertType {
  String getString() {
    return toString().split('.')[1].trim().toLowerCase();
  }
}

extension ParseAirQuality on AirQuality {
  String getString() {
    return toString().split('.')[1].trim().toLowerCase();
  }
}