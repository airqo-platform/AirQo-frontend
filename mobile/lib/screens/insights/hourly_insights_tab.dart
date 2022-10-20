import 'package:app/blocs/blocs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/network.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../models/enum_constants.dart';
import '../../models/insights.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';
import 'insights_widgets.dart';

class HourlyInsightsTab extends StatelessWidget {
  HourlyInsightsTab({Key? key}) : super(key: key);

  final GlobalKey _globalKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0),
      child: AppRefreshIndicator(
        sliverChildDelegate: SliverChildBuilderDelegate(
          (context, index) {
            final items = [
              BlocBuilder<HourlyInsightsBloc, HourlyInsightsState>(
                  builder: (context, state) {
                return Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  child: InsightsToggleBar(
                    frequency: Frequency.hourly,
                    isEmpty: state.insights.isEmpty,
                    pollutant: state.pollutant,
                  ),
                );
              }),
              const SizedBox(
                height: 12,
              ),
              Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                child: RepaintBoundary(
                  key: _globalKey,
                  child: const HourlyInsightsGraph(),
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              BlocBuilder<HourlyInsightsBloc, HourlyInsightsState>(
                  builder: (context, state) {
                if (state.insights.isEmpty) {
                  return const ContainerLoadingAnimation(
                      height: 70.0, radius: 8.0);
                }

                final airQualityReading = state.airQualityReading;

                if (airQualityReading == null) {
                  return const SizedBox();
                }
                return Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  child: InsightsActionBar(
                    shareKey: _globalKey,
                    airQualityReading: airQualityReading,
                  ),
                );
              }),
              const SizedBox(
                height: 32,
              ),
              BlocBuilder<HourlyInsightsBloc, HourlyInsightsState>(
                  builder: (context, state) {
                if (state.selectedInsight != null) {
                  final insight = state.selectedInsight as Insights;
                  if (insight.time.isToday() || insight.time.isTomorrow()) {
                    return InsightsHealthTips(
                      pollutant: state.pollutant,
                      insight: insight,
                    );
                  }
                }
                return const SizedBox();
              }),
            ];

            return items[index];
          },
          childCount: 5,
        ),
        onRefresh: () async {
          await _refreshPage(context);
        },
      ),
    );
  }

  Future<void> _refreshPage(BuildContext context) async {
    context.read<HourlyInsightsBloc>().add(const LoadHourlyInsights());
    await checkNetworkConnection(
      context,
      notifyUser: true,
    );
  }
}
