import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/screens/notification/notification_widgets.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

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
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: Container(
            color: Config.appBodyColor,
            child: refreshIndicator(
                sliverChildDelegate:
                    SliverChildBuilderDelegate((context, index) {
                  return GestureDetector(
                    onTap: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (context) {
                        return NotificationView(
                            appNotification: _notifications[index]);
                      })).then((value) =>
                          _updateNotification(_notifications[index]));
                    },
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                        child: NotificationCard(
                            appNotification: _notifications[index]),
                      ),
                    ),
                  );
                }, childCount: _notifications.length),
                onRefresh: _refreshNotifications)),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    var box = Hive.box(HiveBox.appNotifications);
    var notifies = box.values.toList().cast<AppNotification>();
    setState(() => _notifications = notifies);
  }

  void _updateNotification(AppNotification appNotification) {
    appNotification
      ..read = true
      ..save();
  }

  Future<void> _refreshNotifications() async {
    await _appService
        .fetchNotifications(context)
        .then((value) => _loadNotifications());
  }

  // Widget _mainSection() {
  //   if (_notifications.isEmpty) {
  //     return Container(
  //       color: Config.appBodyColor,
  //       padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
  //       child: Center(
  //         child: Text(
  //           'No notifications',
  //           style: TextStyle(color: Config.appColor),
  //         ),
  //       ),
  //     );
  //   }
  //
  //   return Container(
  //       color: Config.appBodyColor,
  //       child: refreshIndicator(
  //           sliverChildDelegate: SliverChildBuilderDelegate((context, index) {
  //             return Padding(
  //               padding: const EdgeInsets.only(bottom: 10),
  //               child: Padding(
  //                 padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
  //                 child: notificationCard(_notifications[index]),
  //               ),
  //             );
  //           }, childCount: _notifications.length),
  //           onRefresh: _getNotifications)
  //   );
  // }
  //
  // Widget notificationCard(AppNotification notification) {
  //   var notificationDate = notification.time;
  //
  //   if (notificationDate.isNull() ||
  //       notification.title.isNull() ||
  //       notification.body.isNull()) {
  //     return Visibility(
  //       visible: false,
  //       child: Container(),
  //     );
  //   }
  //
  //   try {
  //     notificationDate =
  //         DateTime.parse(notification.time).notificationDisplayDate();
  //   } catch (exception, stackTrace) {
  //     debugPrint('$exception\n$stackTrace');
  //   }
  //
  //   return Container(
  //     padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
  //     decoration: const BoxDecoration(
  //         color: Colors.white,
  //         borderRadius: BorderRadius.all(Radius.circular(16.0))),
  //     child: ListTile(
  //       onTap: () {
  //         setState(() {
  //           _selectedNotification = notification;
  //           _isViewNotification = true;
  //           updateNotification(notification);
  //         });
  //       },
  //       horizontalTitleGap: 12,
  //       contentPadding: EdgeInsets.zero,
  //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  //       tileColor: Colors.white,
  //       leading: Container(
  //         padding: const EdgeInsets.all(10.0),
  //         decoration: BoxDecoration(
  //           color: Config.appColorPaleBlue,
  //           shape: BoxShape.circle,
  //         ),
  //         child: SvgPicture.asset(
  //           'assets/icon/airqo_home.svg',
  //           height: 16,
  //           width: 24,
  //           semanticsLabel: 'Search',
  //         ),
  //       ),
  //       trailing: notification.isNew
  //           ? Container(
  //               padding: const EdgeInsets.fromLTRB(8.0, 1.0, 8.0, 1.0),
  //               constraints: const BoxConstraints(
  //                 maxHeight: 16,
  //                 maxWidth: 43.35,
  //               ),
  //               decoration: BoxDecoration(
  //                   color: Config.appColorPaleBlue,
  //                   borderRadius:
  //                       const BorderRadius.all(Radius.circular(535.87))),
  //               child: Column(
  //                 children: [
  //                   Text(
  //                     'New',
  //                     style:
  //                         TextStyle(fontSize: 10, color: Config.appColorBlue),
  //                   ),
  //                 ],
  //               ))
  //           : Container(
  //               constraints: const BoxConstraints(
  //                 maxHeight: 16,
  //                 maxWidth: 43.35,
  //               ),
  //               child: Column(
  //                 children: [
  //                   Text(
  //                     notificationDate,
  //                     maxLines: 1,
  //                     overflow: TextOverflow.ellipsis,
  //                     style:
  //                         TextStyle(fontSize: 10, color: Config.appColorBlack),
  //                   ),
  //                 ],
  //               )),
  //       title: AutoSizeText(
  //         notification.title,
  //         style: CustomTextStyle.button2(context),
  //       ),
  //       subtitle: AutoSizeText(
  //         notification.body,
  //         maxLines: 2,
  //         overflow: TextOverflow.ellipsis,
  //         style: Theme.of(context)
  //             .textTheme
  //             .caption
  //             ?.copyWith(color: Config.appColorBlack.withOpacity(0.4)),
  //       ),
  //     ),
  //   );
  // }
  //
  // Widget placeHolder() {
  //   return Padding(
  //     padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
  //     child: containerLoadingAnimation(height: 100.0, radius: 16.0),
  //   );
  // }
  //
  // Future<void> updateNotification(AppNotification notification) async {
  //   Provider.of<NotificationModel>(context, listen: false).removeAll();
  //   await _cloudStore.markNotificationAsRead(
  //       _customAuth.getUserId(), notification.id);
  //   await _getNotifications();
  // }

  // Future<void> _getNotifications() async {
  //   var offlineData = await _dbHelper.getAppNotifications();
  //
  //   if (offlineData.isNotEmpty && mounted) {
  //     setState(() {
  //       _notifications = AppNotification.reorderNotifications(offlineData);
  //     });
  //   }
  //
  //   var notifies = await _cloudStore.getNotifications(_customAuth.getUserId());
  //   if (notifies.isEmpty) {
  //     return;
  //   }
  //
  //   if (mounted) {
  //     setState(() {
  //       _notifications = AppNotification.reorderNotifications(notifies);
  //     });
  //   }
  //
  //   await _dbHelper.insertAppNotifications(notifies, context);
  // }
  //
}
