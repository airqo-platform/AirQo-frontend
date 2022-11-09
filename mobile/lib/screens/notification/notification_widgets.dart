import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class NotificationView extends StatefulWidget {
  const NotificationView({
    super.key,
    required this.appNotification,
  });
  final AppNotification appNotification;

  @override
  State<NotificationView> createState() => _NotificationViewState();
}

class _NotificationViewState extends State<NotificationView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppIconTopBar(),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 500),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: AnimatedOpacity(
          opacity: 1.0,
          duration: const Duration(milliseconds: 100),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 8.0),
            color: CustomColors.appBodyColor,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(
                      Radius.circular(16.0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(context);
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
                          left: 54.0,
                          right: 54.0,
                          bottom: 54.0,
                        ),
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(15.0),
                              decoration: BoxDecoration(
                                color:
                                    CustomColors.appColorBlue.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: SvgPicture.asset(
                                widget.appNotification.icon,
                                height: 24,
                                width: 36,
                              ),
                            ),
                            const SizedBox(
                              height: 17,
                            ),
                            AutoSizeText(
                              widget.appNotification.title,
                              textAlign: TextAlign.center,
                              style: CustomTextStyle.headline10(context),
                            ),
                            const SizedBox(
                              height: 8.0,
                            ),
                            AutoSizeText(
                              widget.appNotification.body,
                              textAlign: TextAlign.center,
                              maxLines: 4,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyText2
                                  ?.copyWith(
                                    color: CustomColors.appColorBlack
                                        .withOpacity(0.4),
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _updateNotification(widget.appNotification);
  }

  void _updateNotification(AppNotification appNotification) {
    appNotification
      ..read = true
      ..saveNotification();
  }
}

class NotificationCard extends StatelessWidget {
  const NotificationCard({
    super.key,
    required this.appNotification,
  });
  final AppNotification appNotification;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10.0),
            decoration: BoxDecoration(
              color: CustomColors.appColorBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: SvgPicture.asset(
              appNotification.icon,
              height: 16,
              width: 24,
              semanticsLabel: 'notification_icon',
            ),
          ),
          const SizedBox(
            width: 12,
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AutoSizeText(
                  appNotification.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: CustomTextStyle.button2(context),
                ),
                AutoSizeText(
                  appNotification.subTitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.caption?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.4),
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(
            width: 12,
          ),
          Visibility(
            visible: !appNotification.read,
            child: Container(
              padding: const EdgeInsets.fromLTRB(8.0, 1.0, 8.0, 1.0),
              constraints: const BoxConstraints(
                maxHeight: 16,
                maxWidth: 43.35,
              ),
              decoration: BoxDecoration(
                color: CustomColors.appColorBlue.withOpacity(0.1),
                borderRadius: const BorderRadius.all(
                  Radius.circular(535.87),
                ),
              ),
              child: Text(
                'New',
                style: CustomTextStyle.newNotification(context),
              ),
            ),
          ),
          Visibility(
            visible: appNotification.read,
            child: Container(
              constraints: const BoxConstraints(
                maxHeight: 16,
                maxWidth: 43.35,
              ),
              child: Column(
                children: [
                  Text(
                    appNotification.dateTime.notificationDisplayDate(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 10,
                      color: CustomColors.appColorBlack,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class EmptyNotifications extends StatelessWidget {
  const EmptyNotifications({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 33),
        child: Column(
          children: [
            Spacer(),
            SvgPicture.asset(
              'assets/icon/empty_notifications.svg',
              semanticsLabel: 'Empty notifications',
            ),
            SizedBox(height: 53),
            Text(
              'No notifications',
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline7(context),
            ),
            SizedBox(height: 23),
            Text(
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyText2,
                'Here you’ll find all updates on our Air Quality network.'),
            Spacer(),
          ],
        ),
      ),
    );
  }
}
