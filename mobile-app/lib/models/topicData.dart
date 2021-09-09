import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:json_annotation/json_annotation.dart';

part 'topicData.g.dart';

@JsonSerializable()
class TopicData {
  @JsonKey(required: true)
  final String message;

  @JsonKey(required: false, name: 'site_id')
  final String siteId;

  TopicData({required this.message, required this.siteId});

  factory TopicData.fromJson(Map<String, dynamic> json) =>
      _$TopicDataFromJson(json);

  Map<String, dynamic> toJson() => _$TopicDataToJson(this);
}

extension ParseAppNotification on AppNotification {
  bool isEmpty() {
    if (body == '' || id == 0) {
      return true;
    }

    return false;
  }

  AppNotification composeNotification(RemoteMessage message) {
    print('Message data: ${message.data}');

    var data = message.data;
    var notification = message.notification;
    var notificationMessage = AppNotification();

    if (notification != null && notification.body != null) {
      print('Message also contained a notification: ${message.notification}');
      var title = notification.title ?? 'Air Quality Alert';
      var body = notification.body ?? '';
      var id = notification.hashCode;

      notificationMessage = AppNotification()
        ..id = id
        ..body = body
        ..title = title;
    } else if (data.isNotEmpty) {
    } else {
      throw Exception('');
    }

    if (notificationMessage.isEmpty()) {
      throw Exception('');
    }

    return notificationMessage;
  }
}

class AppNotification {
  String title = 'AirQo';
  String body = '';
  int id = 0;
}
