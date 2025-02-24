import 'dart:async';

import 'package:app/blocs/kya/kya_bloc.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/screens/quiz/quiz_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

Future<dynamic> bottomSheetQuizConffeti(
    Quiz quiz, BuildContext parentContext) async {
  final completer = Completer();
  showModalBottomSheet(
    useRootNavigator: true,
    useSafeArea: true,
    transitionAnimationController: bottomSheetTransition(parentContext),
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(23),
        topRight: Radius.circular(23),
      ),
    ),
    isDismissible: false,
    context: parentContext,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setState) {
          Future.delayed(const Duration(seconds: 6), () {
            Navigator.of(context).pop();
            completer.complete();
          });
          context.read<KyaBloc>().add(
                UpdateQuizProgress(
                  quiz.copyWith(
                    status: QuizStatus.complete,
                    hasCompleted: true,
                    activeQuestion: 1,
                  ),
                ),
              );
          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.9,
            width: MediaQuery.of(context).size.width,
            child: Stack(
              children: [
                Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        AnimatedPadding(
                          duration: const Duration(milliseconds: 500),
                          curve: Curves.easeIn,
                          padding: const EdgeInsets.all(11.0),
                          child: InkWell(
                            onTap: () async {
                              Navigator.of(context).pop();
                              completer.complete();
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
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const SizedBox(
                                height: 20,
                              ),
                              Container(
                                width: 151,
                                height: 151,
                                decoration: ShapeDecoration(
                                  color: const Color(0xFFD1FADF),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.check_circle,
                                  color: Color(0xff074D32),
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
                                        color: Color(0xff1F232D),
                                        fontSize: 30,
                                        fontFamily: 'Inter',
                                        fontWeight: FontWeight.w700,
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
                                        fontSize: 16,
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
                const Confetti(),
              ],
            ),
          );
        },
      );
    },
  );
  await completer.future;
}
