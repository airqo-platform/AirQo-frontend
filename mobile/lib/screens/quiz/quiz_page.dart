import 'dart:math';

import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_view.dart';
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
          // ignore: use_build_context_synchronously
          response = await bottomSheetQuizQuestion(quiz, context);
          if (response != null && response == true) {
            // ignore: use_build_context_synchronously
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
                            fontFamily: 'Inter',
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
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                            //height: 1.50,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      InkWell(
                        onTap: () async {
                          //Navigator.pop(context, true);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                // ignore: prefer_const_constructors
                                builder: (context) => QuizQuestionPage()),
                          );
                        },
                        child: const QuizActionButton(
                          text: 'Take Air Quality Quiz',
                        ),
                      ),
                      const SizedBox(height: 10),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, false);
                        },
                        child: const QuizSkipButton(
                          text: 'Skip this for later',
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



class QuizQuestionPage extends StatefulWidget {
  const QuizQuestionPage({super.key});

  @override
  QuizQuestionPageState createState() => QuizQuestionPageState();
}

class QuizQuestionPageState extends State<QuizQuestionPage> {
  int currentQuestionIndex = 0;
  int totalScore = 0;

  List<Map<String, dynamic>> questions = [
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "Berlin", "London"],
      "correctOption": 0,
      "score": 10,
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "options": ["Mars", "Jupiter", "Venus"],
      "correctOption": 0,
      "score": 10,
    },
    // Add more questions
  ];

  void _answerQuestion(int selectedOption) {
    if (selectedOption == questions[currentQuestionIndex]["correctOption"]) {
      setState(() {
        totalScore += questions[currentQuestionIndex]["score"] as int;
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizResultPage(totalScore: totalScore),
            ),
          );
        }
      });
    } else {
      // Handle incorrect answer if needed
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Question ${currentQuestionIndex + 1}')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(questions[currentQuestionIndex]["question"] as String),
            const SizedBox(height: 20),
            Column(
              children: List.generate(
                questions[currentQuestionIndex]["options"].length as int,
                (index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(
                      onPressed: () {
                        _answerQuestion(index);
                      },
                      child: Text(questions[currentQuestionIndex]["options"]
                          [index] as String),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class QuizResultPage extends StatelessWidget {
  final int totalScore;

  const QuizResultPage({super.key, required this.totalScore});

  String getResultMessage() {
    if (totalScore >= 30) {
      return 'Excellent! You are a quiz master!';
    } else if (totalScore >= 20) {
      return 'Great job! You really know your stuff!';
    } else if (totalScore >= 10) {
      return 'Good job! Keep up the good work!';
    } else {
      return "Keep practicing! You'll improve with time.";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Result')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(getResultMessage(), style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 20),
            Text('Your total score: $totalScore'),
            ElevatedButton(
              onPressed: () {
                Navigator.popUntil(context, ModalRoute.withName('/'));
              },
              child: const Text('Back to Home'),
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
AnimationController bottomSheetTransition(BuildContext context) {
  return AnimationController(
    animationBehavior: AnimationBehavior.preserve,
    vsync: Navigator.of(context).overlay!,
    duration: const Duration(milliseconds: 500),
    reverseDuration: const Duration(milliseconds: 500),
  );
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


