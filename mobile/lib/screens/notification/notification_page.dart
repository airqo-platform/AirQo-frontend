import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/screens/notification/notification_widgets.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/app_service.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({Key? key}) : super(key: key);

  @override
  _NotificationPageState createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  List<AppNotification> _notifications = [];
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appTopBar(context: context, title: 'Notifications'),
      body: Container(
          color: Config.appBodyColor,
          child: refreshIndicator(
              sliverChildDelegate: SliverChildBuilderDelegate((context, index) {
                return Padding(
                    padding:
                        EdgeInsets.fromLTRB(16, index == 0 ? 24.0 : 4, 16, 4),
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
              onRefresh: _refreshNotifications)),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    var notifies = Hive.box<AppNotification>(HiveBox.appNotifications)
        .values
        .toList()
        .cast<AppNotification>();
    setState(() => _notifications = notifies);
  }

  Future<void> _refreshNotifications() async {
    await _appService
        .fetchNotifications(context)
        .then((value) => _loadNotifications());
  }
}
