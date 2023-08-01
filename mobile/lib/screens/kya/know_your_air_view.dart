import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
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
    return BlocBuilder<KyaBloc, List<Kya>>(
      builder: (context, state) {
        if (state.isEmpty) {
          return NoKyaWidget(
            callBack: () {
              context.read<KyaBloc>().add(const SyncKya());
            },
          );
        }
        final completeKya = state.filterComplete();
        if (completeKya.isEmpty) {
          final inCompleteKya = state.filterInProgressKya();

          return NoCompleteKyaWidget(
            callBack: () async {
              if (inCompleteKya.isEmpty) {
                showSnackBar(context,AppLocalizations.of(context)!.oopsNoLessonsAtTheMoment,
                );
              } else {
                await _startKyaLessons(context, inCompleteKya.first);
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
    context.read<KyaBloc>().add(const SyncKya());
  }

  Future<void> _startKyaLessons(BuildContext context, Kya kya) async {
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
