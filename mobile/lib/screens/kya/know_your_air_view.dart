import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AccountBloc, AccountState>(
      builder: (context, state) {
        if (state.kya.isEmpty) {
          context.read<AccountBloc>().add(const RefreshKya());

          return Container(); // TODO replace with error page
        }

        final kya = state.kya.filterCompleteKya();

        if (kya.isEmpty) {
          return const EmptyKya(); // TODO replace with error page
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
                  kya[index],
                ),
              );
            },
            childCount: kya.length,
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
}
