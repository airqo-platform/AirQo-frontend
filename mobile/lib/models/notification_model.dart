// import 'package:firebase_messaging/firebase_messaging.dart';
// import 'package:flutter/cupertino.dart';
//
// class NotificationModel {
//   String title = 'AirQo';
//   String body = '';
//   int id = 0;
// }
//
// extension ParseNotificationModel on NotificationModel {
//   bool isEmpty() {
//     if (body == '' || id == 0) {
//       return true;
//     }
//
//     return false;
//   }
//
//
//
//   NotificationModel composeNotificationV1(RemoteMessage message) {
//     debugPrint('Message data: ${message.data}');
//
//     var data = message.data;
//     var notification = message.notification;
//     var notificationMessage = NotificationModel();
//
//     if (notification != null && notification.body != null) {
//       debugPrint('Message also contained a notification: '
//           '${message.notification}');
//       var title = notification.title ?? 'Air Quality Alert';
//       var body = notification.body ?? '';
//       var id = notification.hashCode;
//
//       notificationMessage = NotificationModel()
//         ..id = id
//         ..body = body
//         ..title = title;
//     } else if (data.isNotEmpty) {
//     } else {
//       throw Exception('');
//     }
//
//     if (notificationMessage.isEmpty()) {
//       throw Exception('');
//     }
//
//     return notificationMessage;
//   }
// }
