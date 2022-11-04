import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'insights_widgets.dart';

class HourlyInsightsTab extends StatelessWidget {
  HourlyInsightsTab({super.key});

  final GlobalKey _globalKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return CustomSafeArea(
      backgroundColor: CustomColors.appBodyColor,
      widget: BlocConsumer<HourlyInsightsBloc, InsightsState>(
        listenWhen: (previous, current) {
          return (current.insightsStatus == InsightsStatus.error ||
                  current.insightsStatus == InsightsStatus.failed) &&
              current.errorMessage != '';
        },
        listener: (context, state) {
          showSnackBar(context, state.errorMessage);
        },
        builder: (context, state) {
          switch (state.insightsStatus) {
            case InsightsStatus.loading:
              return const InsightsLoadingWidget();
            case InsightsStatus.failed:
              return InsightsFailedWidget(frequency: state.frequency);
            case InsightsStatus.loaded:
            case InsightsStatus.error:
            case InsightsStatus.refreshing:
              break;
          }

          return AppRefreshIndicator(
            sliverChildDelegate: SliverChildBuilderDelegate(
              (context, index) {
                final items = [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ListView(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        InsightsToggleBar(
                          frequency: state.frequency,
                          isEmpty: state.insightsCharts.isEmpty,
                          pollutant: state.pollutant,
                        ),
                        const SizedBox(
                          height: 12,
                        ),
                        RepaintBoundary(
                          key: _globalKey,
                          child: const HourlyInsightsGraph(),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        InsightsActionBar(
                          shareKey: _globalKey,
                          airQualityReading: state.airQualityReading,
                        ),
                        const SizedBox(
                          height: 32,
                        ),
                      ],
                    ),
                  ),
                  InsightsHealthTips(
                    pollutant: state.pollutant,
                    insight: state.selectedInsight,
                  ),
                ];

                return items[index];
              },
              childCount: 2,
            ),
            onRefresh: () => _refreshPage(context),
          );
        },
      ),
    );
  }

  Future<void> _refreshPage(BuildContext context) async {
    context.read<HourlyInsightsBloc>().add(const RefreshInsightsCharts());
  }
}
