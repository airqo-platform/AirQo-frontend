import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/screens/notification/notification_widgets.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/firebase_service.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({Key? key}) : super(key: key);

  @override
  _NotificationPageState createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  List<AppNotification> _notifications = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Notifications'),
      body: _notifications.isEmpty
          ? const EmptyNotifications()
          : Container(
              color: Config.appBodyColor,
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
                                  appNotification: _notifications[index]);
                            }));
                          },
                          child: NotificationCard(
                              appNotification: _notifications[index]),
                        ));
                  }, childCount: _notifications.length),
                  onRefresh: CloudStore.getNotifications)),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _initListeners();
  }

  void _loadNotifications() {
    setState(() => _notifications = AppNotification.sort(
        Hive.box<AppNotification>(HiveBox.appNotifications)
            .values
            .toList()
            .cast<AppNotification>()));
  }

  Future<void> _initListeners() async {
    Hive.box<AppNotification>(HiveBox.appNotifications)
        .watch()
        .listen((_) => _loadNotifications())
        .onDone(_loadNotifications);
  }
}
