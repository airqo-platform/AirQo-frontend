import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'analytics_widgets.dart';

class AnalyticsView extends StatelessWidget {
  const AnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      color: appColors.appBodyColor,
      child: BlocBuilder<AccountBloc, AccountState>(
          buildWhen: (previous, current) {
        return previous.analytics != current.analytics;
      }, builder: (context, state) {
        if (state.analytics.isEmpty) {
          context.read<AccountBloc>().add(RefreshAnalytics());
        }

        return Column(
          children: [
            Visibility(
              visible: state.analytics.isEmpty,
              child: Container(), // TODO replace with error page
            ),
            Visibility(
              visible: state.analytics.isNotEmpty,
              child: AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final airQualityReading =
                        Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                            .get(state.analytics[index].site);

                    if (airQualityReading == null) {
                      return Container();
                    }

                    return Padding(
                      padding: EdgeInsets.only(
                        top: Config.refreshIndicatorPadding(
                          index,
                        ),
                      ),
                      child: MiniAnalyticsCard(
                        airQualityReading,
                        animateOnClick: true,
                      ),
                    );
                  },
                  childCount: state.analytics.length,
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
    context.read<AccountBloc>().add(RefreshAnalytics());
  }
}
