import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'kya_lesson_page.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<KyaBloc, List<KyaLesson>>(
      builder: (context, state) {
        if (state.isEmpty) {
          return NoKyaWidget(
            callBack: () {
              context.read<KyaBloc>().add(const LoadKyaLessons());
            },
          );
        }
        final transferredLessons = state.filterTransferredLessons();
        if (transferredLessons.isEmpty) {
          final kyaLesson = state.filterHomePageCardsLessons().firstOrNull;

          return NoCompleteKyaWidget(
            callBack: () async {
              if (kyaLesson == null) {
                showSnackBar(context, 'Oops.. No Lessons at the moment');
              } else {
                await _startKyaLessons(context, kyaLesson);
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
                  completeLessons[index],
                ),
              );
            },
            childCount: completeLessons.length,
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
    context.read<KyaBloc>().add(const LoadKyaLessons());
  }

  Future<void> _startKyaLessons(BuildContext context, KyaLesson kya) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return KyaLessonPage(kya);
        },
      ),
    );
  }
}
