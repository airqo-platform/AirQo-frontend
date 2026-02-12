import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/lesson_page.dart';
import 'package:flutter/material.dart';

class KyaLessonContainer extends StatelessWidget {
  final KyaLesson kyaLesson;

  const KyaLessonContainer(this.kyaLesson);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () =>
          Navigator.of(context).push(MaterialPageRoute(builder: (context) {
        return LessonPage(kyaLesson);
      })),
      child: Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(),
          width: MediaQuery.of(context).size.width,
          height: 288,
          child: Stack(
            children: [
              Container(
                width: double.infinity,
                height: double.infinity,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    kyaLesson.image,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Container(
                alignment: Alignment.bottomLeft,
                padding: const EdgeInsets.all(8),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Color(0xff34373B)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(4)),
                  width: 240,
                  height: 116,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(kyaLesson.title,
                          style: TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 16)),
                      Spacer(),
                      Row(
                        children: [
                          Container(
                            height: 32,
                            width: 38,
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(40),
                                color: Color(0xff57D175)),
                            child: Center(
                              child: Icon(
                                Icons.arrow_forward_ios,
                                color: Colors.black,
                                size: 17,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              )
            ],
          )),
    );
  }
}
