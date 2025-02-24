import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/lesson_finished.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:flutter/material.dart';

class LessonPage extends StatefulWidget {
  final KyaLesson lesson;

  const LessonPage(this.lesson);
  @override
  State<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends State<LessonPage> {
  CardSwiperController? controller;

  int currentIndex = 0;

  void changeIndex(int index) {
    setState(() {
      currentIndex = index;
    });
  }

  bool finished = false;

  @override
  void initState() {
    controller = CardSwiperController();
    super.initState();
  }

  @override
  void dispose() {
    controller!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Scaffold(
        appBar: AppBar(
          title: Text("Lesson"),
          centerTitle: true,
        ),
        body: finished
            ? LessonFinishedWidget()
            : Column(
                children: [
                  Container(
                      height: 6,
                      child: StepperWidget(
                          green: true,
                          currentIndex: currentIndex,
                          count: widget.lesson.tasks.length)),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 400,
                      child: CardSwiper(
                        allowedSwipeDirection: AllowedSwipeDirection.none(),
                        onSwipe: (previousIndex, idx, direction) async {
                          changeIndex(idx!);

                          if (currentIndex == widget.lesson.tasks.length - 1) {
                            await Future.delayed(Duration(seconds: 3));

                            setState(() {
                              finished = true;
                            });
                          }

                          return true;
                        },
                        onUndo: (previousIndex, idx, direction) {
                          changeIndex(idx);
                          return true;
                        },
                        controller: controller,
                        cardsCount: widget.lesson.tasks.length,
                        cardBuilder: (context, index, percentThresholdX,
                                percentThresholdY) =>
                            CardContent(data: widget.lesson.tasks[index]),
                      ),
                    ),
                  ),
                  Expanded(
                      flex: 1,
                      child: Container(
                        child: Column(
                          children: [
                            SizedBox(height: 16),
                            Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap: () => controller!.undo(),
                                    child: Container(
                                      height: 62,
                                      width: 78,
                                      decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(40),
                                          color:
                                              Theme.of(context).highlightColor),
                                      child: Center(
                                        child: Icon(
                                          Icons.arrow_back_ios,
                                          color: Colors.white,
                                          size: 17,
                                        ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () => controller!
                                        .swipe(CardSwiperDirection.left),
                                    child: Container(
                                      height: 62,
                                      width: 78,
                                      decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(40),
                                          color: Color(0xff57D175)),
                                      child: Center(
                                        child: Icon(
                                          Icons.arrow_forward_ios,
                                          color: Colors.black,
                                          size: 17,
                                        ),
                                      ),
                                    ),
                                  ),
                                ])
                          ],
                        ),
                      ))
                ],
              ),
      ),
    );
  }
}

class CardContent extends StatelessWidget {
  final Task data;
  const CardContent({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
          image: DecorationImage(
              image: NetworkImage(data.image), fit: BoxFit.cover),
          color: Colors.blue,
          borderRadius: BorderRadius.circular(8)),
      alignment: Alignment.center,
      child: Column(
        children: [
          Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: Color(0xff57D175),
                borderRadius: BorderRadius.only(
                    bottomRight: Radius.circular(8),
                    bottomLeft: Radius.circular(8))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Colors.black),
                ),
                SizedBox(height: 8),
                Text(
                  data.content,
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w500,
                      color: Colors.black),
                ),
                SizedBox(height: 4),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class CardContentData {
  final String title;
  final String text;

  const CardContentData({required this.title, required this.text});
}
