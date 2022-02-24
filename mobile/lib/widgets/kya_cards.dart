import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../constants/config.dart';
import '../models/kya.dart';

Widget kyaCard(KyaLesson kyaItem, Size screenSize) {
  return Padding(
    padding: const EdgeInsets.only(top: 45, bottom: 45, left: 20, right: 20),
    child: Card(
      color: Colors.white,
      elevation: 20.0,
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        alignment: Alignment.center,
        width: screenSize.width,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(
              height: 8.0,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 8.0, right: 8.0),
              child: Container(
                height: 180,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    fit: BoxFit.cover,
                    image: CachedNetworkImageProvider(
                      kyaItem.imageUrl,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 12,
            ),
            Padding(
              padding: const EdgeInsets.only(left: 36, right: 36),
              child: Text(
                kyaItem.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Config.appColorBlack,
                    fontSize: 20,
                    fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(
              height: 8.0,
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(left: 16, right: 16),
                child: Text(
                  kyaItem.body,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.black.withOpacity(0.5), fontSize: 16),
                ),
              ),
            ),
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/tips_graphics.svg',
              semanticsLabel: 'tips_graphics',
            ),
            const SizedBox(
              height: 30,
            ),
          ],
        ),
      ),
    ),
  );
}

Widget kyaDummyLessonCard(KyaLesson kyaItem, BuildContext context) {
  var screenSize = MediaQuery.of(context).size;
  return kyaCard(kyaItem, screenSize);
}

Positioned kyaLessonCard(
    KyaLesson kyaLesson,
    double right,
    double left,
    double rotation,
    double skew,
    BuildContext context,
    Function dismissKyaLesson,
    int flag,
    Function addKyaLesson,
    Function swipeRight,
    Function swipeLeft) {
  var screenSize = MediaQuery.of(context).size;

  return Positioned(
    right: flag == 0
        ? right != 0.0
            ? right
            : null
        : null,
    left: flag == 1
        ? right != 0.0
            ? right
            : null
        : null,
    child: Dismissible(
      key: UniqueKey(),
      crossAxisEndOffset: -0.3,
      onResize: () {
      },
      onDismissed: (DismissDirection direction) {
        if (direction == DismissDirection.endToStart) {
          dismissKyaLesson(kyaLesson);
        } else {
          addKyaLesson(kyaLesson);
        }
      },
      child: Transform(
        alignment: flag == 0 ? Alignment.bottomRight : Alignment.bottomLeft,
        transform: Matrix4.skewX(skew),
        child: RotationTransition(
          turns: AlwaysStoppedAnimation(
              flag == 0 ? rotation / 360 : -rotation / 360),
          child: kyaCard(kyaLesson, screenSize),
        ),
      ),
    ),
  );
}
