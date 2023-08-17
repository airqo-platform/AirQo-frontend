import 'dart:math';

import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';

import '../../widgets/buttons.dart';

class QuizCardWidget extends StatelessWidget {
  const QuizCardWidget(this.quiz, {super.key});
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
        dynamic response = await bottomSheetQuizTitle(quiz, context);
        if (response != null && response == true) {
          response = await bottomSheetQuizQuestion(quiz, context);
          if (response != null && response == true) {
            response = await bottomSheetQuizConffeti(quiz, context);
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
                image: NetworkImage(
                    "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

AnimationController bottomSheetTransition(BuildContext context) {
  return AnimationController(
    animationBehavior: AnimationBehavior.preserve,
    vsync: Navigator.of(context).overlay!,
    duration: const Duration(milliseconds: 500),
    reverseDuration: const Duration(milliseconds: 500),
  );
}

Future<dynamic> bottomSheetQuizTitle(Quiz quiz, BuildContext context) {
  return showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    elevation: 1,
    transitionAnimationController: bottomSheetTransition(context),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.8,
        child: Flexible(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(2, 2, 2, 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(
                  height: 2,
                ),
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.28,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        // color: Colors.red,
                        image: const DecorationImage(
                          fit: BoxFit.cover,
                          image: NetworkImage(
                              "https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 0, 10, 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.8,
                        child: AutoSizeText(
                          quiz.title,
                          maxLines: 2,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color.fromARGB(255, 31, 35, 45),
                            fontSize: 25,
                            fontWeight: FontWeight.w700,
                            //height: 1.70,
                            //letterSpacing: -0.90,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.8,
                        child: AutoSizeText(
                          quiz.subTitle,
                          textAlign: TextAlign.justify,
                          maxLines: 2,
                          style: const TextStyle(
                            color: Color(0xFF6F87A1),
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, true);
                        },
                        child: const QuizActionButton(
                          text:
                              'Take Air Quality Quiz', // TODO: use localizations
                        ),
                      ),
                      const SizedBox(height: 10),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, false);
                        },
                        child: const QuizSkipButton(
                          text:
                              'Skip this for later', // TODO: use localizations
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
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

Future<dynamic> bottomSheetQuizQuestion(Quiz quiz, BuildContext context) {
  return showModalBottomSheet(
    useRootNavigator: true,
    useSafeArea: true,
    transitionAnimationController: bottomSheetTransition(context),
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return BottomSheetQuizContent(
        quiz.questions.first,
        parentContent: context,
      );
    },
  );
}

class BottomSheetQuizContent extends StatefulWidget {
  const BottomSheetQuizContent(
    this.quizQuestion, {
    super.key,
    required this.parentContent,
  });
  final BuildContext parentContent;
  final QuizQuestion quizQuestion;

  @override
  State<BottomSheetQuizContent> createState() => _BottomSheetQuizContentState();
}

class _BottomSheetQuizContentState extends State<BottomSheetQuizContent> {
  bool showAnswer = false;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.9,
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
              child: const QuizAnswerWidget(),
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
                      widget.quizQuestion.category,
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
                          widget.quizQuestion.title,
                          style: const TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
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
                          widget.quizQuestion.options[index];
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
                                setState(() => showAnswer = true);
                              }
                            },
                            text: option.title,
                          ),
                        ),
                      );
                    },
                    itemCount: widget.quizQuestion.options.length,
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

Future<dynamic> bottomSheetQuizConffeti(Quiz quiz, BuildContext parentContext) {
  return showModalBottomSheet(
    useRootNavigator: true,
    useSafeArea: true,
    transitionAnimationController: bottomSheetTransition(parentContext),
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: parentContext,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'Where is your home environment situated?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.62,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Next to busy roads',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.66,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Next to industrial areas',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.70,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'On a street with little traffic',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.50,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(127, 70, 168, 248),
                      callBack: () {},
                      text: 'No neither',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
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
      "Take Quiz",
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
  const QuizAnswerWidget({super.key});

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
          const Padding(
            padding: EdgeInsets.all(8.0),
            child: AutoSizeText(
              'Leaving near busy roads ',
              style: TextStyle(
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
                            totalRepeatCount: 1,
                            animatedTexts: [
                              TypewriterAnimatedText(
                                'Living next to a busy road tends to \n'
                                'increase ones exposure to air pollution.\n'
                                'Only open the windows that face the\n'
                                'road during hours when there is less\n'
                                'traffic. You can also plant trees or a \n'
                                'hedge around your home to act as a \n'
                                'barrier between you and the emissions.\n'
                                'Street with little traffic - Your exposure\n'
                                'to air pollution is limited since there are \n'
                                'less vehicle emissions.\n',
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
                            text: 'Next',
                            callBack: () {
                              bottomSheet4(context);
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

void bottomSheet3(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
                height: 5,
              ),
              Container(
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
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: AutoSizeText(
                        'Leaving near busy roads ',
                        style: TextStyle(
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
                                padding:
                                    const EdgeInsets.fromLTRB(10, 0, 10, 0),
                                child: SizedBox(
                                  height:
                                      MediaQuery.of(context).size.height * 0.40,
                                  child: DefaultTextStyle(
                                    style: const TextStyle(
                                      color: Color.fromARGB(255, 0, 0, 0),
                                      fontSize: 14,
                                      fontFamily: 'Inter',
                                      fontWeight: FontWeight.w500,
                                    ),
                                    child: AnimatedTextKit(
                                      totalRepeatCount: 1,
                                      animatedTexts: [
                                        TypewriterAnimatedText(
                                          'Living next to a busy road tends to \n'
                                          'increase ones exposure to air pollution.\n'
                                          'Only open the windows that face the\n'
                                          'road during hours when there is less\n'
                                          'traffic. You can also plant trees or a \n'
                                          'hedge around your home to act as a \n'
                                          'barrier between you and the emissions.\n'
                                          'Street with little traffic - Your exposure\n'
                                          'to air pollution is limited since there are \n'
                                          'less vehicle emissions.\n',
                                          speed:
                                              const Duration(milliseconds: 40),
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
                                    height: MediaQuery.of(context).size.height *
                                        0.05,
                                    width:
                                        MediaQuery.of(context).size.width * 0.3,
                                    child: NextButton(
                                      showIcon: false,
                                      buttonColor: CustomColors.appColorBlue,
                                      text: 'Next',
                                      callBack: () {
                                        bottomSheet4(context);
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
              ),
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet4(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'What cooking method do you use at home?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.60,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'A charcoal stove',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.55,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Gas cooker ',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.64,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {
                        bottomSheet5(context);
                      },
                      text: 'None of the above ',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet5(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'How often do you dust your home or living space?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.60,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Every week',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.55,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Once a month',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.64,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {
                        bottomSheet6(context);
                      },
                      text: 'After 4 months',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet6(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'How do you dispose of rubbish at home?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.52,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Burn it',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.66,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'At a waste disposal site',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.58,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {
                        bottomSheet7(context);
                      },
                      text: 'None of the above',
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet7(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'What is your most frequently used mode of transport?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.30,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'A car',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.42,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'Taxi/Bus',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.63,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {
                        bottomSheet8(context);
                      },
                      text: 'Boda Boda/motorcycle',
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet8(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
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
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
                            Navigator.pop(context);
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
                ),
              ),
              const SizedBox(
                height: 25,
                child: AutoSizeText(
                  'Air Quality Quiz',
                  style: TextStyle(
                    color: Color.fromARGB(255, 0, 0, 0),
                    fontSize: 20,
                    fontFamily: 'Inter',
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    height: 25,
                    child: AutoSizeText(
                      'Home environment',
                      style: TextStyle(
                        color: Color.fromARGB(117, 0, 0, 0),
                        fontSize: 10,
                        fontFamily: 'Inter',
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
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AutoSizeText(
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          'What kind of road do you frequently use?',
                          style: TextStyle(
                            color: Color.fromARGB(200, 0, 0, 0),
                            fontSize: 20,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.42,
                    child: OptionsButton(
                      buttonColor: const Color.fromARGB(69, 70, 168, 248),
                      callBack: () {},
                      text: 'A dusty road',
                    ),
                  ),
                  const SizedBox(
                    height: 10,
                  ),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.85,
                    child: OptionsButton(
                        buttonColor: const Color.fromARGB(69, 70, 168, 248),
                        callBack: () async {
                          //   await Navigator.push(
                          //     context,
                          //     MaterialPageRoute(
                          //       builder: (context) {
                          //         return const FinalPage();
                          //       },
                          //     ),
                          //   );
                          bottomSheet9(context);
                        },
                        text: 'Tarmacked road (little to no dust)'),
                  ),
                ],
              )
            ],
          ),
        ),
      );
    },
  );
}

void bottomSheet9(BuildContext context) {
  showModalBottomSheet(
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return Stack(
        children: [
          Positioned.fill(
            left: 0,
            right: 0,
            top: 1,
            bottom: 0,
            child: Confetti(
              key: UniqueKey(),
            ),
          ),
          OutlinedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.9,
              width: MediaQuery.of(context).size.width,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(2, 2, 2, 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: MediaQuery.of(context).size.width * 0.87,
                      height: MediaQuery.of(context).size.height * 0.87,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 15, vertical: 23),
                      decoration: const ShapeDecoration(
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(32),
                            topRight: Radius.circular(32),
                          ),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(31, 10, 31, 31),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Column(
                              children: [
                                const SizedBox(
                                  height: 40,
                                ),
                                SizedBox(
                                  width: 120,
                                  height: 120,
                                  child: Container(
                                    width: 100,
                                    height: 100,
                                    decoration: ShapeDecoration(
                                      color: const Color(0xFFD1FADF),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.check_circle,
                                      color: Color.fromARGB(188, 7, 77, 50),
                                      size: 80,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 32),
                            const Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  child: AutoSizeText(
                                    'You have completed the quiz!',
                                    maxLines: 2,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: Color.fromARGB(255, 31, 35, 45),
                                      fontSize: 24,
                                      fontFamily: 'Inter',
                                      fontWeight: FontWeight.w700,
                                      height: 1.70,
                                      letterSpacing: -0.90,
                                    ),
                                  ),
                                ),
                                SizedBox(height: 24),
                                SizedBox(
                                  //width: 307,
                                  //height: 89,
                                  child: AutoSizeText(
                                    'Way to go🎊. You have unlocked personalised air quality recommendations to empower you on your clean air journey.',
                                    textAlign: TextAlign.center,
                                    maxLines: 3,
                                    style: TextStyle(
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
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    },
  );
}
