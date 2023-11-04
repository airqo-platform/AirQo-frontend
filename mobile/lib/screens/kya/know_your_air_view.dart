import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
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
              //context.read<KyaBloc>().add(const FetchQuizzes());
            },
          );
        }

        final allQuizzes = state.quizzes.toList();
        final allLessons = state.lessons.toList();
        List<Widget> children = [];

        if (allQuizzes.isNotEmpty) {
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

//   Future<void> _startKyaLessons(BuildContext context, KyaLesson kya) async {
//     await Navigator.push(
//       context,
//       MaterialPageRoute(
//         builder: (context) {
//           return KyaTitlePage(kya);
//         },
//       ),
//     );
//   }
}
