import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:app/blocs/kya/kya_bloc.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_final_page.dart';
import 'package:app/screens/quiz/quiz_title_page.dart';
import 'package:app/screens/quiz/quiz_widgets.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/themes/colors.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
        left: Radius.circular(32),
        right: Radius.circular(32),
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
      {super.key,
      required this.parentContent,
      required this.quiz,
      required this.currentQuestion});
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
    int questiontotal = widget.quiz.questions.length;
    int questionPosition = widget.currentQuestion.questionPosition;
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
                      GestureDetector(
                          child: const CircularQuizButton(
                            icon: 'assets/icon/previous_arrow.svg',
                          ),
                          onTap: () => {
                                if (questionPosition > 1)
                                  {
                                    context.read<KyaBloc>().add(
                                          UpdateQuizProgress(
                                            quiz.copyWith(
                                              activeQuestion:
                                                  questionPosition - 1,
                                            ),
                                          ),
                                        ),
                                    context
                                        .read<CurrentQuizQuestionCubit>()
                                        .setQuestion(quiz
                                            .questions[questionPosition - 2]),
                                    setState(() => {
                                          showAnswer = !showAnswer,
                                          questionPosition =
                                              questionPosition - 1,
                                        }),
                                  }
                              }),
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
                            context.read<KyaBloc>().add(
                                  UpdateQuizProgress(
                                    quiz.copyWith(
                                        activeQuestion: widget
                                            .currentQuestion.questionPosition),
                                    updateRemote: true,
                                  ),
                                );
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
                    color: Color(0xff1F232D),
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(
                height: 10,
              ),
              SizedBox(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20.0),
                  child: QuizProgressBar(questionPosition, questiontotal),
                ),
              ),
              Visibility(
                visible: showAnswer,
                child: QuizAnswerWidget(selectedOption, quiz: widget.quiz,
                    nextButtonClickCallback: () {
                  int currentQuestion = widget.currentQuestion.questionPosition;
                  if (currentQuestion == widget.quiz.questions.length) {
                    context.read<CurrentQuizQuestionCubit>().setQuestion(null);
                  } else {
                    QuizQuestion nextQuestion =
                        widget.quiz.questions[currentQuestion];
                    context
                        .read<CurrentQuizQuestionCubit>()
                        .setQuestion(nextQuestion);
                  }
                  setState(() => {
                        showAnswer = false,
                        questionPosition = currentQuestion,
                      });
                  context.read<KyaBloc>().add(UpdateQuizProgress(
                      quiz.copyWith(activeQuestion: currentQuestion)));
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
                        maxLines: 2,
                        widget.currentQuestion.context,
                        style: const TextStyle(
                          color: Color(0xff6F87A1),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
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
                              color: Color(0xff1F232D),
                              fontSize: 24,
                              fontWeight: FontWeight.w500,
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
                          child: OptionsButton(
                              buttonColor: const Color(0xffEBF5FF),
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
          currentQuestion: state,
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
        if (quiz.status != QuizStatus.todo) {
          dynamic response = await bottomSheetQuizQuestion(quiz, context);
          if (response != null && response == true) {
            response = await bottomSheetQuizConffeti(quiz, context);
            context.read<KyaBloc>().add(
                  UpdateQuizProgress(
                    quiz.copyWith(
                      activeQuestion: 1,
                      status: QuizStatus.complete,
                    ),
                    updateRemote: true,
                  ),
                );
            context
                .read<CurrentQuizQuestionCubit>()
                .setQuestion(quiz.questions.first);
          }
        } else {
          context
              .read<CurrentQuizQuestionCubit>()
              .setQuestion(quiz.questions.first);
          dynamic response = await bottomSheetQuizTitle(quiz, context);
          if (response != null &&
              response == true &&
              quiz.status != QuizStatus.complete) {
            context.read<KyaBloc>().add(
                  UpdateQuizProgress(
                      quiz.copyWith(
                        status: QuizStatus.inProgress,
                      ),
                      updateRemote: true),
                );
            response = await bottomSheetQuizQuestion(quiz, context);
            if (response != null && response == true) {
              response = await bottomSheetQuizConffeti(quiz, context);
              context.read<KyaBloc>().add(
                    UpdateQuizProgress(
                      quiz.copyWith(
                        activeQuestion: 1,
                        status: QuizStatus.complete,
                      ),
                      updateRemote: true,
                    ),
                  );
              context
                  .read<CurrentQuizQuestionCubit>()
                  .setQuestion(quiz.questions.first);
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
                QuizMessageChip(quiz),
                Visibility(
                  visible: quiz.status != QuizStatus.todo &&
                      quiz.activeQuestion != 1,
                  child: QuizProgressBar(
                      quiz.activeQuestion, quiz.questions.length),
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.05,
          ),
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.27,
            height: 112,
            child: CachedNetworkImage(
              imageUrl: quiz.imageUrl,
              imageBuilder: (context, imageProvider) => Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  image: DecorationImage(
                    fit: BoxFit.cover,
                    image: imageProvider,
                  ),
                ),
              ),
              placeholder: (context, url) => const ContainerLoadingAnimation(
                radius: 8,
                height: 112,
              ),
              errorWidget: (context, url, error) => Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.grey,
                ),
                child: const Center(
                  child: Icon(
                    Icons.error,
                    color: Colors.white,
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
      height: MediaQuery.of(context).size.height * 0.71,
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 255, 255, 255),
        borderRadius: BorderRadius.circular(32),
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
              selectedOption.title,
              style: const TextStyle(
                color: Color(0xff1F232D),
                // Color.fromARGB(255, 0, 0, 0),
                fontSize: 15,
                fontFamily: 'Inter',
                fontWeight: FontWeight.w700,
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
              color: const Color(0xffD6E9FF),
              borderRadius: BorderRadius.circular(24),
            ),
            height: MediaQuery.of(context).size.height * 0.62,
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
                        child: Icon(
                          Icons.circle,
                          color: CustomColors.appColorBlue,
                          size: 15,
                        ),
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: AutoSizeText(
                        'AIRQO',
                        style: TextStyle(
                          color: Color(0xff6F87A1),
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
                            color: Color(0xff1F232D),
                            fontSize: 15.8,
                            fontFamily: 'Inter',
                            fontWeight: FontWeight.w500,
                          ),
                          child: AnimatedTextKit(
                            displayFullTextOnTap: true,
                            totalRepeatCount: 1,
                            animatedTexts: [
                              //TODO see this animation in detail
                              TypewriterAnimatedText(
                                speed: const Duration(milliseconds: 40),
                                selectedOption
                                    .content[selectedOption.content.length - 1],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          child: const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: NextQuizButton(
                              icon: 'assets/icon/next_arrow.svg',
                            ),
                          ),
                          onTap: () => {
                            nextButtonClickCallback(),
                          },
                        )
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
