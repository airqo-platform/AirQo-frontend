import 'package:app/models/kya.dart';
import 'package:app/screens/kya/kya_lessons_new.dart';
import 'package:flutter/material.dart';

import 'dragwidget.dart';

//
class CardsStackWidget extends StatefulWidget {
  const CardsStackWidget({Key? key}) : super(key: key);

  @override
  State<CardsStackWidget> createState() => _CardsStackWidgetState();
}

class _CardsStackWidgetState extends State<CardsStackWidget> {
  List<Kya> dragabbleItems = [
    Kya(
        //Random values
        title: 'Thanks',
        imageUrl:
            'https://media-cldnry.s-nbcnews.com/image/upload/newscms/2018_12/2371046/180320-flying-car-aeromobil50-se-143p.jpg',
        id: 're34',
        lessons: [],
        progress: 0,
        completionMessage: 'Good',
        secondaryImageUrl:
            'https://media-cldnry.s-nbcnews.com/image/upload/newscms/2018_12/2371046/180320-flying-car-aeromobil50-se-143p.jpg'),
  ];

  ValueNotifier<Swipe> swipeNotifier = ValueNotifier(Swipe.none);

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: ValueListenableBuilder(
            valueListenable: swipeNotifier,
            builder: (context, swipe, _) => Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: List.generate(dragabbleItems.length, (index) {
                return DragWidget(
                  kya: dragabbleItems[index],
                  index: index,
                  swipeNotifier: swipeNotifier,
                  kyaItem: null,
                );
              }),
            ),
          ),
        ),
        Positioned(
          left: 0,
          child: DragTarget<int>(
            builder: (
              BuildContext context,
              List<dynamic> accepted,
              List<dynamic> rejected,
            ) {
              return IgnorePointer(
                child: Container(
                  height: 700.0,
                  width: 80.0,
                  color: Colors.transparent,
                ),
              );
            },
            onAccept: (int index) {
              setState(() {
                dragabbleItems.removeAt(index);
              });
            },
          ),
        ),
        Positioned(
          right: 0,
          child: DragTarget<int>(
            builder: (
              BuildContext context,
              List<dynamic> accepted,
              List<dynamic> rejected,
            ) {
              return IgnorePointer(
                child: Container(
                  height: 700.0,
                  width: 80.0,
                  color: Colors.transparent,
                ),
              );
            },
            onAccept: (int index) {
              setState(() {
                dragabbleItems.removeAt(index);
              });
            },
          ),
        ),
      ],
    );
  }
}
