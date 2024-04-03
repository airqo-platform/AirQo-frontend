import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../quiz/quiz_view.dart';
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
              context.read<KyaBloc>().add(const FetchQuizzes());
            },
          );
        }

        final allQuizzes = state.quizzes.toList();
        final allLessons = state.lessons.toList();
        List<Widget> children = [];

        if (allQuizzes.isNotEmpty) {
          children.add(
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(
                  bottom: 6,
                ),
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height * 0.05,
                decoration: const BoxDecoration(
                  color: Color.fromARGB(158, 255, 255, 255),
                  borderRadius: BorderRadius.all(
                    Radius.circular(16.0),
                  ),
                ),
                padding: const EdgeInsets.only(
                  bottom: 6,
                  left: 10,
                  top: 5,
                  right: 10,
                ),
                child: Text(
                  'Quiz',
                  style: CustomTextStyle.headline8(context),
                ),
              ),
            ),
          );

          children.addAll(
            allQuizzes
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
                .toList(),
          );
        }

        if (allLessons.isNotEmpty) {
          // Add section title for Lessons
          children.add(
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(
                  bottom: 6,
                ),
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height * 0.05,
                decoration: const BoxDecoration(
                  color: Color.fromARGB(158, 255, 255, 255),
                  borderRadius: BorderRadius.all(
                    Radius.circular(16.0),
                  ),
                ),
                padding: const EdgeInsets.only(
                  bottom: 6,
                  left: 10,
                  top: 5,
                  right: 10,
                ),
                child: Text(
                  'KYA',
                  style: CustomTextStyle.headline8(context),
                ),
              ),
            ),
          );

          children.addAll(allLessons
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
}
