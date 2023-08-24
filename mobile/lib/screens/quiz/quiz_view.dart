import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:app/blocs/kya/kya_bloc.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_final_page.dart';
import 'package:app/screens/quiz/quiz_title_page.dart';
import 'package:app/screens/quiz/quiz_widgets.dart';
import 'package:app/services/native_api.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/themes/colors.dart';
import 'package:app/widgets/buttons.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class CurrentQuizQuestionCubit extends Cubit<QuizQuestion?> {
  CurrentQuizQuestionCubit() : super(null);
  void setQuestion(QuizQuestion? question) => emit(question);
}

AnimationController bottomSheetTransition(BuildContext context) {
  return AnimationController(
    animationBehavior: AnimationBehavior.preserve,
    vsync: Navigator.of(context).overlay!,
    duration: const Duration(milliseconds: 500),
    reverseDuration: const Duration(milliseconds: 500),
  );
}

Future<dynamic> bottomSheetQuizQuestion(Quiz quiz, BuildContext context) {
  return showModalBottomSheet(
    useRootNavigator: true,
    useSafeArea: true,
    transitionAnimationController: bottomSheetTransition(context),
    isScrollControlled: true,
    enableDrag: false,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.horizontal(
        left: Radius.circular(16),
        right: Radius.circular(16),
      ),
    ),
    isDismissible: false,
    context: context,
    builder: (context) {
      return QuizQuestionsWidget(quiz);
    },
  );
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
  late QuizAnswer selectedOption;

  @override
  void initState() {
    super.initState();
    selectedOption = widget.currentQuestion.answers[0];
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, KyaState>(builder: (context, state) {
      Quiz quiz = state.quizzes.firstWhere(
        (element) => element == widget.quiz,
      );
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
              SizedBox(
                height: 25,
                child: AutoSizeText(
                  AppLocalizations.of(context)!.airQualityQuiz,
                  style: const TextStyle(
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
              Visibility(
                visible: quiz.activeQuestion > 1,
                child: SizedBox(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20.0),
                    child: QuizProgressBar(quiz),
                  ),
                ),
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
                        widget.currentQuestion.context,
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
                        QuizAnswer option =
                            widget.currentQuestion.answers[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 50,
                          ),
                          child: SizedBox(
                            width: MediaQuery.of(context).size.width * 0.62,
                            child: OptionsButton(
                              buttonColor:
                                  const Color.fromARGB(69, 70, 168, 248),
                              callBack: () {
                                if (option.content.isNotEmpty) {
                                  setState(() {
                                    selectedOption = option;
                                    widget.currentQuestion.answers[index] =
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
                      itemCount: widget.currentQuestion.answers.length,
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
    });
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
              image: DecorationImage(
                fit: BoxFit.cover,
                image: CachedNetworkImageProvider(
                  quiz.imageUrl,
                  cacheKey: quiz.imageUrlCacheKey(),
                  cacheManager: CacheManager(
                    CacheService.cacheConfig(
                      quiz.imageUrlCacheKey(),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class QuizAnswerWidget extends StatelessWidget {
  const QuizAnswerWidget(this.selectedOption,
      {super.key, required this.quiz, required this.nextButtonClickCallback});
  final QuizAnswer selectedOption;
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
              '$selectedOption.title',
              // AppLocalizations.of(context)!.leavingNearBusyRoads,
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
                          child: ListView.builder(
                            itemCount: selectedOption.content.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 8.0),
                                child: ListTile(
                                  leading: Icon(Icons.circle,
                                      size: 8, color: Colors.black),
                                  title: AnimatedTextKit(
                                    onNext: (int index, bool isLast) => {
                                      Future.delayed(
                                          const Duration(seconds: 3), () {})
                                    },
                                    displayFullTextOnTap: true,
                                    totalRepeatCount: 1,
                                    animatedTexts: [
                                      TypewriterAnimatedText(
                                        selectedOption.content[index],
                                        speed: const Duration(milliseconds: 40),
                                      ),
                                    ],
                                  ), 
                                ),
                              );
                            },
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
