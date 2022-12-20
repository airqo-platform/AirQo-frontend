import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'kya_title_page.dart';
import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(
      builder: (context, state) {
        final completeKya = state.kya.filterCompleteKya();

        if (completeKya.isEmpty) {
          final inCompleteKya = state.kya.filterIncompleteKya();
          return NoKyaWidget(
            callBack: () async {
              if (inCompleteKya.isEmpty) {
                showSnackBar(context, 'Oops.. No Lessons at the moment');
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
                child: KyaViewWidget(
                  completeKya[index],
                ),
              );
            },
            childCount: completeKya.length,
          ),
          onRefresh: () async {
            _refresh(context);
          },
        );
      },
    );
  }

  void _refresh(BuildContext context) {
    context.read<AccountBloc>().add(const RefreshKya());
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
