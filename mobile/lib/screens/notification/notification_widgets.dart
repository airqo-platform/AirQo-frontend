import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../themes/light_theme.dart';

class NotificationView extends StatefulWidget {
  final AppNotification appNotification;
  const NotificationView({Key? key, required this.appNotification})
      : super(key: key);

  @override
  State<NotificationView> createState() => _NotificationViewState();
}

class _NotificationViewState extends State<NotificationView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appIconTopBar(context: context),
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
            color: Config.appBodyColor,
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
                              left: 54.0, right: 54.0, bottom: 54.0),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(15.0),
                                decoration: BoxDecoration(
                                  color: Config.appColorBlue.withOpacity(0.1),
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
                                        color: Config.appColorBlack
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
      ..save();
  }
}

class NotificationCard extends StatelessWidget {
  final AppNotification appNotification;
  const NotificationCard({Key? key, required this.appNotification})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 24.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10.0),
            decoration: BoxDecoration(
              color: Config.appColorBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: SvgPicture.asset(
              'assets/icon/airqo_home.svg',
              height: 16,
              width: 24,
              semanticsLabel: 'home_icon',
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
                  style: Theme.of(context)
                      .textTheme
                      .caption
                      ?.copyWith(color: Config.appColorBlack.withOpacity(0.4)),
                )
              ],
            ),
          ),
          const SizedBox(
            width: 12,
          ),
          Visibility(
              visible: appNotification.read,
              child: Container(
                  padding: const EdgeInsets.fromLTRB(8.0, 1.0, 8.0, 1.0),
                  constraints: const BoxConstraints(
                    maxHeight: 16,
                    maxWidth: 43.35,
                  ),
                  decoration: BoxDecoration(
                      color: Config.appColorBlue.withOpacity(0.1),
                      borderRadius:
                          const BorderRadius.all(Radius.circular(535.87))),
                  child: Text(
                    'New',
                    style: CustomTextStyle.newNotification(context),
                  ))),
          Visibility(
              visible: !appNotification.read,
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
                            fontSize: 10, color: Config.appColorBlack),
                      ),
                    ],
                  )))
        ],
      ),
    );
  }
}

class EmptyNotifications extends StatelessWidget {
  const EmptyNotifications({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Config.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: Center(
        child: Text('No Notifications',
            style: Theme.of(context).textTheme.bodyText1),
      ),
    );
  }
}
