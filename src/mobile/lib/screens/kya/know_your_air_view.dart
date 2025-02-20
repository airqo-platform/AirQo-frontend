import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/themes/colors.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../quiz/quiz_view.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatefulWidget {
  const KnowYourAirView({super.key});

  @override
  State<KnowYourAirView> createState() => _KnowYourAirViewState();
}

class _KnowYourAirViewState extends State<KnowYourAirView> {
  String _selectedFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        return Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _selectedFilter = 'ALL';
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _selectedFilter == 'ALL'
                        ? CustomColors.appColorBlue
                        : const Color(0xffB8D9FF),
                    foregroundColor: _selectedFilter == 'ALL'
                        ? Colors.white
                        : CustomColors.appColorBlue,
                  ),
                  child: Text(
                    AppLocalizations.of(context)!.all,
                    style: TextStyle(
                      color: _selectedFilter == 'ALL'
                          ? Colors.white
                          : CustomColors.appColorBlue.withOpacity(0.5),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _selectedFilter = 'LESSONS';
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _selectedFilter == 'LESSONS'
                        ? CustomColors.appColorBlue
                        : const Color(0xffB8D9FF),
                    foregroundColor: _selectedFilter == 'LESSONS'
                        ? Colors.white
                        : CustomColors.appColorBlue,
                  ),
                  child: AutoSizeText(
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                    AppLocalizations.of(context)!.lessons,
                    style: TextStyle(
                      color: _selectedFilter == 'LESSONS'
                          ? Colors.white
                          : CustomColors.appColorBlue.withOpacity(0.5),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _selectedFilter = 'QUIZ';
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _selectedFilter == 'QUIZ'
                        ? CustomColors.appColorBlue
                        : const Color(0xffB8D9FF),
                    foregroundColor: _selectedFilter == 'QUIZ'
                        ? Colors.white
                        : CustomColors.appColorBlue,
                  ),
                  child: Text(
                    AppLocalizations.of(context)!.quiz,
                    style: TextStyle(
                      color: _selectedFilter == 'QUIZ'
                          ? Colors.white
                          : CustomColors.appColorBlue.withOpacity(0.5),
                    ),
                  ),
                ),
              ],
            ),
            if (state.lessons.isEmpty && state.quizzes.isEmpty)
              NoKyaWidget(
                callBack: () {
                  context.read<KyaBloc>().add(const FetchKya());
                  context.read<KyaBloc>().add(const FetchQuizzes());
                },
              ),
            Expanded(
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, _) {
                    final allQuizzes = state.quizzes.toList();
                    final allLessons = state.lessons.toList();
                    List<Widget> children = [];

                    if (_selectedFilter == 'ALL' || _selectedFilter == 'QUIZ') {
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
                    }

                    if (_selectedFilter == 'ALL' ||
                        _selectedFilter == 'LESSONS') {
                      if (allLessons.isNotEmpty) {
                        children.addAll(
                          allLessons
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
                              .toList(),
                        );
                      }
                    }

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
              ),
            ),
          ],
        );
      },
    );
  }

  void _refresh(BuildContext context) {
    context.read<KyaBloc>().add(const FetchKya());
    context.read<KyaBloc>().add(const FetchQuizzes());
  }
}
