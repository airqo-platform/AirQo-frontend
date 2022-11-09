import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'kya_widgets.dart';

class KnowYourAirView extends StatelessWidget {
  const KnowYourAirView({super.key});

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      color: appColors.appBodyColor,
      child: BlocBuilder<AccountBloc, AccountState>(
          buildWhen: (previous, current) {
        return previous.kya != current.kya;
      }, builder: (context, state) {
        if (state.kya.isEmpty) {
          context.read<AccountBloc>().add(RefreshKya());
        }

        return Column(
          children: [
            Visibility(
              visible: state.kya.isEmpty,
              child: Container(), // TODO replace with error page
            ),
            Visibility(
              visible: state.kya.isNotEmpty,
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(
                        top: Config.refreshIndicatorPadding(
                          index,
                        ),
                      ),
                      child: KyaViewWidget(
                        kya: state.kya[index],
                      ),
                    );
                  },
                  childCount: state.kya.length,
                ),
                onRefresh: () async {
                  await _refresh(context);
                },
              ),
            ),
          ],
        );
      }),
    );
  }

  Future<void> _refresh(BuildContext context) async {
    context.read<AccountBloc>().add(RefreshKya());
  }
}
