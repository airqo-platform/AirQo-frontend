import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'kya_title_page.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state.lessons.isEmpty) {
          return NoKyaWidget(
            callBack: () {
              context.read<KyaBloc>().add(const FetchKya());
            },
          );
        }
        final completeKya = state.lessons
            .where((lesson) => lesson.status == KyaLessonStatus.complete)
            .take(3)
            .toList();

        if (completeKya.isEmpty) {
          List<KyaLesson> inCompleteLessons =
              state.lessons.filterInCompleteLessons();
          return NoCompleteKyaWidget(
            callBack: () async {
              if (inCompleteLessons.isEmpty) {
                showSnackBar(context, 'Oops.. No Lessons at the moment');
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
                child: KyaCardWidget(
                  completeKya[index],
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
