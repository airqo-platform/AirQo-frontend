import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../quiz/quiz_view.dart';
import 'kya_title_page.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({super.key});

  @override
  State<KnowYourAirView> createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state.lessons.isEmpty && state.quizzes.isEmpty) {
          return NoKyaWidget(
            callBack: () {
              context.read<KyaBloc>().add(const FetchKya());
              //context.read<KyaBloc>().add(const FetchQuizzes());
            },
          );
        }

        final inCompleteLessons =
            state.lessons.filterInCompleteLessons().toList();
        final completeKya = state.lessons
            .where((lesson) => lesson.status == KyaLessonStatus.complete)
            .toList();
        // final completeQuizzes = state.quizzes
        //     .where((quiz) => quiz.status == QuizStatus.complete)
        //     .toList();

        // final inCompleteQuizzes = state.quizzes
        //     .where((quiz) =>
        //         (quiz.status == QuizStatus.inProgress) ||
        //         (quiz.status == QuizStatus.todo) ||
        //         (quiz.status == QuizStatus.redo))
        //     .toList();
        final allQuizzes = state.quizzes.toList();

        List<Widget> children = [];

        if (allQuizzes.isNotEmpty) {
          children.addAll(allQuizzes
              .map(
                (quiz) => Column(
                  children: [
                    QuizCard(
                      quiz,
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              )
              .toList());
        }
        // else if (completeQuizzes.isNotEmpty) {
        //   children.addAll(completeQuizzes
        //       .map(
        //         (quiz) => Column(
        //           children: [
        //             QuizCard(quiz),
        //             const SizedBox(height: 10),
        //           ],
        //         ),
        //       )
        //       .toList());
        // } else if (inCompleteQuizzes.isNotEmpty) {
        //   children.add(QuizCard(
        //     inCompleteQuizzes.first,
        //   ));
        // }

        if (completeKya.isNotEmpty) {
          children.addAll(completeKya
              .map(
                (lesson) => Column(
                  children: [
                    KyaLessonCardWidget(
                      lesson,
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              )
              .toList());
        } else if (inCompleteLessons.isNotEmpty) {
          children.add(KyaLessonCardWidget(
            inCompleteLessons.first,
          ));
        }

        return AppRefreshIndicator(
          sliverChildDelegate: SliverChildBuilderDelegate(
            (context, _) {
              return Padding(
                padding: EdgeInsets.only(
                  top: Config.refreshIndicatorPadding(
                    0,
                  ),
                ),
                child: Column(
                  children: children,
                ),
              );
            },
            childCount: 1,
          ),
          onRefresh: () {
            _refresh(context);

            return Future(() => null);
          },
        );
      },
    );
  }

  void _refresh(BuildContext context) {
    context.read<KyaBloc>().add(const FetchKya());
    context.read<KyaBloc>().add(const FetchQuizzes());
  }

  Future<void> _startKyaLessons(BuildContext context, KyaLesson kya) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return KyaTitlePage(kya);
        },
      ),
    );
  }
}
