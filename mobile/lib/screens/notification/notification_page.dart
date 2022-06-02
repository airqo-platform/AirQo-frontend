import 'package:app/models/notification.dart';
import 'package:app/screens/notification/notification_widgets.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/firebase_service.dart';
import '../../services/hive_service.dart';
import '../../themes/colors.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({Key? key}) : super(key: key);

  @override
  _NotificationPageState createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Notifications'),
      body: Container(
          color: CustomColors.appBodyColor,
          child: ValueListenableBuilder<Box>(
            valueListenable: Hive.box<AppNotification>(HiveBox.appNotifications)
                .listenable(),
            builder: (context, box, widget) {
              if (box.isEmpty) {
                return const EmptyNotifications();
              }
              final notifications = box.values.toList().cast<AppNotification>();
              return Container(
                  color: CustomColors.appBodyColor,
                  child: AppRefreshIndicator(
                      sliverChildDelegate:
                          SliverChildBuilderDelegate((context, index) {
                        return Padding(
                            padding: EdgeInsets.fromLTRB(
                                16, index == 0 ? 24.0 : 4, 16, 4),
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(context,
                                    MaterialPageRoute(builder: (context) {
                                  return NotificationView(
                                      appNotification: notifications[index]);
                                }));
                              },
                              child: NotificationCard(
                                  appNotification: notifications[index]),
                            ));
                      }, childCount: notifications.length),
                      onRefresh: CloudStore.getNotifications));
            },
          )),
    );
  }
}
