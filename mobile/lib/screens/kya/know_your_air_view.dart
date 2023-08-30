import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'kya_title_page.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state.lessons.isEmpty && state.quizzes.isEmpty) {
          return NoKyaWidget(
            callBack: () {
              context.read<KyaBloc>().add(const FetchKya());
              context.read<KyaBloc>().add(const FetchQuizzes());
            },
          );
        }
        final completeKya = state.lessons
            .where((lesson) => lesson.status == KyaLessonStatus.complete)
            .take(3)
            .toList();
        final completeQuizzes = state.quizzes
            .where((quiz) => quiz.status == QuizStatus.complete)
            .take(3)
            .toList();
        const SizedBox(
          height: 10,
        );

        if (completeKya.isEmpty && completeQuizzes.isEmpty) {
          List<KyaLesson> inCompleteLessons =
              state.lessons.filterInCompleteLessons();
          return NoCompleteKyaWidget(
            callBack: () async {
              if (inCompleteLessons.isEmpty) {
                showSnackBar(
                  context,
                  AppLocalizations.of(context)!.oopsNoLessonsAtTheMoment,
                );
              } else {
                await _startKyaLessons(context, inCompleteLessons.first);
              }
            },
          );
        }

        return AppRefreshIndicator(
          sliverChildDelegate: SliverChildBuilderDelegate(
            (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  top: Config.refreshIndicatorPadding(
                    index,
                  ),
                ),
                child: Column(
                  children: [
                    KyaCardWidget(
                      completeKya[index],
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                    completeQuizzes.isNotEmpty
                        ? QuizCard(
                            completeQuizzes[index],
                          )
                        : Container(),
                  ],
                ),
              );
            },
            childCount: completeKya.length,
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
