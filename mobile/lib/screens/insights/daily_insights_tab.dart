part of 'insights_page.dart';

class DailyInsightsTab extends StatelessWidget {
  DailyInsightsTab({super.key});

  final GlobalKey _globalKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return CustomSafeArea(
      verticalPadding: 10,
      backgroundColor: CustomColors.appBodyColor,
      widget: BlocConsumer<DailyInsightsBloc, InsightsState>(
        listenWhen: (previous, current) {
          return current.insightsStatus == InsightsStatus.error &&
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
                          frequency: Frequency.daily,
                          isEmpty: state.insightsCharts.isEmpty,
                          pollutant: state.pollutant,
                        ),
                        const SizedBox(
                          height: 12,
                        ),
                        RepaintBoundary(
                          key: _globalKey,
                          child: const DailyInsightsGraph(),
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
    context.read<DailyInsightsBloc>().add(const RefreshInsightsCharts());
  }
}
