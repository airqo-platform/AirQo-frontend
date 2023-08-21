import 'dart:math';

import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_final_page.dart';
import 'package:app/screens/quiz/quiz_title_page.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/themes/theme.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

import '../../widgets/buttons.dart';

class QuizSkipButton extends StatelessWidget {
  const QuizSkipButton({
    super.key,
    required this.text,
  });
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 197,
      decoration: const BoxDecoration(
        color: Color.fromARGB(0, 0, 0, 0),
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            style: const TextStyle(
              color: Color.fromARGB(197, 0, 0, 0),
              fontSize: 14,
              letterSpacing: 16 * -0.022,
            ),
          ),
          const SizedBox(
            width: 6,
          ),
        ],
      ),
    );
  }
}

class QuizCard extends StatelessWidget {
  const QuizCard(this.quiz, {super.key});
  final Quiz quiz;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(112),
        foregroundColor: CustomColors.appColorBlue,
        elevation: 0,
        side: const BorderSide(
          color: Colors.transparent,
          width: 0,
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(16),
          ),
        ),
        backgroundColor: Colors.white,
        padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
      ),
      onPressed: () async {
        QuizQuestion? question = context.read<CurrentQuizQuestionCubit>().state;
        if (question != null) {
          dynamic response = await bottomSheetQuizQuestion(quiz, context);
          if (response != null && response == true) {
            //response = await QuizCompletionSheetContent();
            response = await bottomSheetQuizConffeti(quiz, context);
          }
        } else {
          context
              .read<CurrentQuizQuestionCubit>()
              .setQuestion(quiz.questions.first);
          dynamic response = await bottomSheetQuizTitle(quiz, context);
          if (response != null && response == true) {
            //response = await QuizCompletionSheetContent();
            response = await bottomSheetQuizQuestion(quiz, context);
            if (response != null && response == true) {
              //response = await QuizCompletionSheetContent();
              response = await bottomSheetQuizConffeti(quiz, context);
            }
          }
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.5,
            height: 104,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: AutoSizeText(
                    quiz.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline10(context),
                  ),
                ),
                const Spacer(),
                const QuizMessageChip(),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.05,
          ),
          Container(
            width: MediaQuery.of(context).size.width * 0.27,
            height: 112,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              image: const DecorationImage(
                fit: BoxFit.cover,
                image: AssetImage('assets/images/quizImage.png'),
                //   image: NetworkImage(
                //       "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"),
                // ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
class QuizActionButton extends StatelessWidget {
  const QuizActionButton({
    super.key,
    required this.text,
  });
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 197,
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              letterSpacing: 16 * -0.022,
            ),
          ),
          const SizedBox(
            width: 6,
          ),
        ],
      ),
    );
  }
}
class QuizQuestionsWidget extends StatefulWidget {
  const QuizQuestionsWidget(this.quiz, {super.key});
  final Quiz quiz;
  @override
  State<QuizQuestionsWidget> createState() => _QuizQuestionsWidgetState();
}

class _QuizQuestionsWidgetState extends State<QuizQuestionsWidget> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CurrentQuizQuestionCubit, QuizQuestion?>(
      builder: (context, state) {
        if (state == null) {
          Navigator.pop(context, true);
          return Text(
            AppLocalizations.of(context)!.noQuestions,
          );
        }
        return QuizQuestionWidget(
          state,
          parentContent: context,
          quiz: widget.quiz,
        );
      },
    );
  }
}

class QuizQuestionWidget extends StatefulWidget {
  const QuizQuestionWidget(
    this.currentQuestion, {
    super.key,
    required this.parentContent,
    required this.quiz,
  });
  final BuildContext parentContent;
  final QuizQuestion currentQuestion;
  final Quiz quiz;

  @override
  State<QuizQuestionWidget> createState() => _QuizQuestionWidgetState();
}

class _QuizQuestionWidgetState extends State<QuizQuestionWidget> {
  bool showAnswer = false;
  late QuizQuestionOption selectedOption;

  @override
  void initState() {
    super.initState();
    selectedOption = widget.currentQuestion.options[0];
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.93,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(2, 2, 2, 0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(
              height: 1,
            ),
            Padding(
              padding: const EdgeInsets.all(4.0),
              child: SizedBox(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const AppBackButton(),
                    const SizedBox(
                      width: 10,
                    ),
                    const Padding(
                      padding: EdgeInsets.all(4.0),
                      child: QuizDraggingHandle(),
                    ),
                    const SizedBox(
                      width: 10,
                    ),
                    Padding(
                      padding: const EdgeInsets.all(6.0),
                      child: InkWell(
                        onTap: () async {
                          Navigator.pop(widget.parentContent);
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
              ),
            ),
            const SizedBox(
              height: 25,
              child: AutoSizeText(
                'Air Quality Quiz',
                style: TextStyle(
                  color: Color.fromARGB(255, 0, 0, 0),
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  //height: 1.50,
                ),
              ),
            ),
            const SizedBox(
              height: 20,
            ),
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: QuizProgressBar(),
            ),
            const SizedBox(
              height: 20,
            ),
            Visibility(
              visible: showAnswer,
              child: QuizAnswerWidget(selectedOption, quiz: widget.quiz,
                  nextButtonClickCallback: () {
                int currentIndex =
                    widget.quiz.questions.indexOf(widget.currentQuestion);
                if (currentIndex + 1 == widget.quiz.questions.length) {
                  context.read<CurrentQuizQuestionCubit>().setQuestion(null);
                } else {
                  QuizQuestion nextQuestion =
                      widget.quiz.questions[currentIndex + 1];
                  context
                      .read<CurrentQuizQuestionCubit>()
                      .setQuestion(nextQuestion);
                }
                setState(() => showAnswer = false);
              }),
            ),
            Visibility(
              visible: !showAnswer,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      widget.currentQuestion.category,
                      style: const TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        //height: 1.50,
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  Container(
                    padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          widget.currentQuestion.title,
                          style: const TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  ListView.builder(
                    shrinkWrap: true,
                    itemBuilder: (context, index) {
                      QuizQuestionOption option =
                          widget.currentQuestion.options[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 50,
                        ),
                        child: SizedBox(
                          width: MediaQuery.of(context).size.width * 0.62,
                          child: OptionsButton(
                            buttonColor: const Color.fromARGB(69, 70, 168, 248),
                            callBack: () {
                              if (option.answer.isNotEmpty) {
                                setState(() {
                                  selectedOption = option;
                                  widget.currentQuestion.options[index] =
                                      option;
                                  showAnswer = true;
                                });
                              }
                            },
                            text: option.title,
                          ),
                        ),
                      );
                    },
                    itemCount: widget.currentQuestion.options.length,
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class QuizDraggingHandle extends StatelessWidget {
  const QuizDraggingHandle({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      width: 100,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}

class QuizProgressBar extends StatelessWidget {
  const QuizProgressBar({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 6,
      width: MediaQuery.of(context).size.width * 0.87,
      child: ClipRRect(
        borderRadius: const BorderRadius.all(Radius.circular(10)),
        child: LinearProgressIndicator(
          color: CustomColors.appColorBlue,
          value: 0.5,
          backgroundColor: CustomColors.appColorBlue.withOpacity(0.24),
          valueColor: AlwaysStoppedAnimation<Color>(CustomColors.appColorBlue),
        ),
      ),
    );
  }
}

class OptionsButton extends StatelessWidget {
  const OptionsButton({
    super.key,
    required this.buttonColor,
    required this.callBack,
    this.text,
    this.textColor,
  });
  final String? text;
  final Color buttonColor;
  final Function callBack;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () {
          callBack();
        },
        style: OutlinedButton.styleFrom(
          elevation: 0,
          side: const BorderSide(
            color: Colors.transparent,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8),
            ),
          ),
          backgroundColor: buttonColor,
          foregroundColor: buttonColor,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AutoSizeText(
              maxLines: 2,
              text ?? AppLocalizations.of(context)!.next,
              style: TextStyle(
                color: CustomColors.appColorBlue,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class Confetti extends StatefulWidget {
  const Confetti({super.key});

  @override
  State<Confetti> createState() => _ConfettiState();
}

class _ConfettiState extends State<Confetti> {
  late ConfettiController _controllerTopCenter;

  @override
  void initState() {
    super.initState();
    _controllerTopCenter =
        ConfettiController(duration: const Duration(seconds: 20));
    _controllerTopCenter.play();
  }

  @override
  void dispose() {
    _controllerTopCenter.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topCenter,
      children: [
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: _controllerTopCenter,
            blastDirectionality: BlastDirectionality.explosive,
            blastDirection: pi,
            maxBlastForce: 5, // set a lower max blast force
            minBlastForce: 2, // set a lower min blast force
            emissionFrequency: 0.05,
            numberOfParticles: 100, // a lot of particles at once
            gravity: 0.5,
            shouldLoop: false,
          ),
        ),
      ],
    );
  }
}

class QuizMessageChip extends StatelessWidget {
  const QuizMessageChip({super.key});

  @override
  Widget build(BuildContext context) {
    Widget widget = AutoSizeText(
      AppLocalizations.of(context)!.takeQuiz,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
      style: CustomTextStyle.caption3(context)?.copyWith(
        color: CustomColors.appColorBlue,
      ),
    );
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        widget,
        Icon(
          Icons.chevron_right_rounded,
          size: 17,
          color: CustomColors.appColorBlue,
        ),
        Visibility(
          visible: false,
          child: Chip(
            shadowColor: Colors.transparent,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            label: widget,
            elevation: 0,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            padding: EdgeInsets.zero,
            labelPadding: EdgeInsets.zero,
            deleteIconColor: CustomColors.appColorBlue,
            labelStyle: null,
            deleteIcon: Icon(
              Icons.chevron_right_rounded,
              size: 17,
              color: CustomColors.appColorBlue,
            ),
          ),
        ),
      ],
    );
  }
}

class QuizAnswerWidget extends StatelessWidget {
  const QuizAnswerWidget(this.selectedOption,
      {super.key, required this.quiz, required this.nextButtonClickCallback});
  final QuizQuestionOption selectedOption;
  final Quiz quiz;
  final Function() nextButtonClickCallback;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.9,
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 255, 255, 255),
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Color.fromARGB(61, 0, 0, 0),
            blurRadius: 1,
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: AutoSizeText(
              AppLocalizations.of(context)!.leavingNearBusyRoads,
              style: const TextStyle(
                color: Color.fromARGB(255, 0, 0, 0),
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: FontWeight.w500,
                //height: 1.50,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: const Color.fromARGB(10, 0, 0, 0),
                width: 1,
              ),
              color: const Color.fromARGB(61, 85, 181, 236),
              borderRadius: BorderRadius.circular(14),
            ),
            height: MediaQuery.of(context).size.height * 0.633,
            width: MediaQuery.of(context).size.width * 0.845,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  //crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: InkWell(
                        onTap: () async {},
                        child: SvgPicture.asset(
                          'assets/icon/sparkles.svg',
                          height: 15,
                          width: 15,
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: AutoSizeText(
                        'AIRQO',
                        style: TextStyle(
                          color: CustomColors.appColorBlue,
                          fontSize: 15,
                          fontFamily: 'Inter',
                          fontWeight: FontWeight.w500,
                          //height: 1.50,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
                      child: SizedBox(
                        height: MediaQuery.of(context).size.height * 0.40,
                        child: DefaultTextStyle(
                          style: const TextStyle(
                            color: Color.fromARGB(255, 0, 0, 0),
                            fontSize: 14,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                          ),
                          child: AnimatedTextKit(
                            displayFullTextOnTap: true,
                            totalRepeatCount: 1,
                            animatedTexts: [
                              TypewriterAnimatedText(
                                selectedOption.answer,
                                speed: const Duration(milliseconds: 40),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 40,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: MediaQuery.of(context).size.height * 0.05,
                          width: MediaQuery.of(context).size.width * 0.3,
                          child: NextButton(
                            showIcon: false,
                            buttonColor: CustomColors.appColorBlue,
                            text: AppLocalizations.of(context)!.next,
                            callBack: () {
                              nextButtonClickCallback();

                              // bottomSheet4(context);
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
