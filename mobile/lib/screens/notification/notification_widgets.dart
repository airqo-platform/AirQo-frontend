import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../themes/light_theme.dart';

class NotificationView extends StatelessWidget {
  final AppNotification appNotification;
  const NotificationView({Key? key, required this.appNotification})
      : super(key: key);

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
                                  color: Config.appColorPaleBlue,
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
                                appNotification.title,
                                textAlign: TextAlign.center,
                                style: CustomTextStyle.headline10(context),
                              ),
                              const SizedBox(
                                height: 8.0,
                              ),
                              AutoSizeText(
                                appNotification.body,
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
      child: ListTile(
        horizontalTitleGap: 12,
        contentPadding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        tileColor: Colors.white,
        leading: Container(
          padding: const EdgeInsets.all(10.0),
          decoration: BoxDecoration(
            color: Config.appColorPaleBlue,
            shape: BoxShape.circle,
          ),
          child: SvgPicture.asset(
            'assets/icon/airqo_home.svg',
            height: 16,
            width: 24,
            semanticsLabel: 'Search',
          ),
        ),
        trailing: appNotification.read
            ? Container(
                padding: const EdgeInsets.fromLTRB(8.0, 1.0, 8.0, 1.0),
                constraints: const BoxConstraints(
                  maxHeight: 16,
                  maxWidth: 43.35,
                ),
                decoration: BoxDecoration(
                    color: Config.appColorPaleBlue,
                    borderRadius:
                        const BorderRadius.all(Radius.circular(535.87))),
                child: Column(
                  children: [
                    Text(
                      'New',
                      style:
                          TextStyle(fontSize: 10, color: Config.appColorBlue),
                    ),
                  ],
                ))
            : Container(
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
                      style:
                          TextStyle(fontSize: 10, color: Config.appColorBlack),
                    ),
                  ],
                )),
        title: AutoSizeText(
          appNotification.title,
          style: CustomTextStyle.button2(context),
        ),
        subtitle: AutoSizeText(
          appNotification.body,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context)
              .textTheme
              .caption
              ?.copyWith(color: Config.appColorBlack.withOpacity(0.4)),
        ),
      ),
    );
  }
}
