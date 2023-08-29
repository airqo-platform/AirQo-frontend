import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/screens/quiz/quiz_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

Future<dynamic> bottomSheetQuizConffeti(
    Quiz quiz, BuildContext parentContext) async {
  final bottomSheet = showModalBottomSheet(
    useRootNavigator: true,
    useSafeArea: true,
    transitionAnimationController: bottomSheetTransition(parentContext),
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: parentContext,
    builder: (context) {
      return Flexible(
        child: Stack(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.9,
              width: MediaQuery.of(context).size.width,
              child: Column(
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(9.0),
                        child: InkWell(
                          onTap: () async {
                            Navigator.pop(context);
                          },
                          child: SvgPicture.asset(
                            'assets/icon/close.svg',
                            height: 35,
                            width: 35,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        width: MediaQuery.of(context).size.width * 0.87,
                        height: MediaQuery.of(context).size.height * 0.8,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 15, vertical: 10),
                        decoration: const ShapeDecoration(
                          color: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(32),
                              topRight: Radius.circular(32),
                            ),
                          ),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(
                              height: 25,
                            ),
                            Container(
                              width: 130,
                              height: 130,
                              decoration: ShapeDecoration(
                                color: const Color(0xFFD1FADF),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                              ),
                              child: const Icon(
                                Icons.check_circle,
                                color: Color.fromARGB(188, 7, 77, 50),
                                size: 100,
                              ),
                            ),
                            const SizedBox(height: 32),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  child: AutoSizeText(
                                    AppLocalizations.of(context)!
                                        .youHaveCompletedTheQuiz,
                                    maxLines: 2,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Color.fromARGB(255, 31, 35, 45),
                                      fontSize: 24,
                                      fontFamily: 'Inter',
                                      fontWeight: FontWeight.w700,
                                      height: 1.70,
                                      letterSpacing: -0.90,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  child: AutoSizeText(
                                    quiz.completionMessage,
                                    textAlign: TextAlign.center,
                                    maxLines: 3,
                                    style: const TextStyle(
                                      color: Color(0xFF6F87A1),
                                      fontSize: 20,
                                      fontFamily: 'Inter',
                                      fontWeight: FontWeight.w500,
                                      height: 1.50,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Positioned(
              child: Confetti(),
            ),
          ],
        ),
      );
    },
  );
  Future.delayed(const Duration(seconds: 6), () {
    Navigator.pop(bottomSheet as BuildContext);
  });
}
