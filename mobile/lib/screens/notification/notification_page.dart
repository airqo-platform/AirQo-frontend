import 'package:app/models/models.dart';
import 'package:app/services/app_service.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/hive_service.dart';

part 'notification_widgets.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Notifications'),
      body: Container(
        color: CustomColors.appBodyColor,
        child: ValueListenableBuilder<Box<AppNotification>>(
          valueListenable:
              Hive.box<AppNotification>(HiveBox.appNotifications).listenable(),
          builder: (context, box, widget) {
            if (box.isEmpty) {
              return const EmptyNotifications();
            }
            final notifications = box.values.toList().cast<AppNotification>();

            return Container(
              color: CustomColors.appBodyColor,
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return Padding(
                      padding:
                          EdgeInsets.fromLTRB(16, index == 0 ? 24.0 : 4, 16, 4),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return NotificationView(
                                  appNotification: notifications[index],
                                );
                              },
                            ),
                          );
                        },
                        child: NotificationCard(
                          appNotification: notifications[index],
                        ),
                      ),
                    );
                  },
                  childCount: notifications.length,
                ),
                onRefresh: () async {
                  await AppService().refreshNotifications(context);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}
