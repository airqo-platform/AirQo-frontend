import 'package:app/constants/app_constants.dart';
import 'package:app/models/notification.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({Key? key}) : super(key: key);

  @override
  _NotificationPageState createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  var notifications = <UserNotification>[];
  var isViewNotification = false;
  late UserNotification selectedNotification;
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 800),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: _renderWidget(),
      ),
    );
  }

  Widget mainSection() {
    return Container(
        color: ColorConstants.appBodyColor,
        child: FutureBuilder(
            future: _cloudStore.getNotifications(_customAuth.getId()),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                notifications = snapshot.data as List<UserNotification>;

                if (notifications.isEmpty) {
                  return Center(
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: Text(
                        'No notifications',
                        style: TextStyle(color: ColorConstants.appColor),
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  color: ColorConstants.appColor,
                  onRefresh: refreshData,
                  child: ListView.builder(
                    itemBuilder: (context, index) => Padding(
                      padding: const EdgeInsets.fromLTRB(10, 5, 10, 5),
                      child: notificationCard(notifications[index]),
                    ),
                    itemCount: 2,
                  ),
                );
              } else {
                return ListView(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                      child: loadingAnimation(115.0, 16.0),
                    ),
                  ],
                );
              }
            }));
  }

  Widget notificationCard(UserNotification notification) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
      child: ListTile(
        onTap: () {
          setState(() {
            selectedNotification = notification;
            isViewNotification = true;
          });
        },
        horizontalTitleGap: 12,
        contentPadding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        tileColor: Colors.white,
        leading: Container(
          padding: const EdgeInsets.all(10.0),
          decoration: BoxDecoration(
            color: ColorConstants.appColorPaleBlue,
            shape: BoxShape.circle,
          ),
          child: SvgPicture.asset(
            'assets/icon/airqo_home.svg',
            height: 16,
            width: 24,
            semanticsLabel: 'Search',
          ),
        ),
        trailing: notification.isNew
            ? Container(
                padding: const EdgeInsets.fromLTRB(8.0, 1.0, 8.0, 1.0),
                constraints: const BoxConstraints(
                  maxHeight: 16,
                  maxWidth: 43.35,
                ),
                decoration: BoxDecoration(
                    color: ColorConstants.appColorPaleBlue,
                    borderRadius:
                        const BorderRadius.all(Radius.circular(535.87))),
                child: Column(
                  children: [
                    Text(
                      'New',
                      style: TextStyle(
                          fontSize: 10, color: ColorConstants.appColorBlue),
                    ),
                  ],
                ))
            : Container(
                color: Colors.transparent,
                constraints: const BoxConstraints(
                  maxHeight: 16,
                  maxWidth: 43.35,
                ),
              ),
        title: Text(
          notification.title,
          style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: ColorConstants.appColorBlack),
        ),
        subtitle: Text(
          notification.message,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
              fontSize: 12,
              color: ColorConstants.appColorBlack.withOpacity(0.4)),
        ),
      ),
    );
  }

  Future<void> refreshData() async {
    await _cloudStore.getNotifications(_customAuth.getId()).then((value) => {
          if (mounted)
            {
              setState(() {
                notifications = value;
              })
            }
        });
  }

  Widget singleSection() {
    return AnimatedOpacity(
      opacity: 1.0,
      duration: const Duration(milliseconds: 100),
      child: Container(
        padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 8.0),
        color: ColorConstants.appBodyColor,
        child: Column(
          children: [
            Container(
                padding: const EdgeInsets.all(8.0),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(16.0))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              isViewNotification = false;
                            });
                          },
                          child: SvgPicture.asset(
                            'assets/icon/close.svg',
                            semanticsLabel: 'Pm2.5',
                            height: 20,
                            width: 20,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    Container(
                      padding: const EdgeInsets.only(
                          left: 54.0, right: 54.0, bottom: 54.0),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(15.0),
                            decoration: BoxDecoration(
                              color: ColorConstants.appColorPaleBlue,
                              shape: BoxShape.circle,
                            ),
                            child: SvgPicture.asset(
                              'assets/icon/airqo_home.svg',
                              height: 24,
                              width: 36,
                            ),
                          ),
                          const SizedBox(
                            height: 17,
                          ),
                          Text(
                            selectedNotification.title,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: ColorConstants.appColorBlack),
                          ),
                          const SizedBox(
                            height: 8.0,
                          ),
                          Text(
                            selectedNotification.message,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 14,
                                color: ColorConstants.appColorBlack
                                    .withOpacity(0.4)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ))
          ],
        ),
      ),
    );
  }

  Widget _renderWidget() {
    return isViewNotification ? singleSection() : mainSection();
  }
}
