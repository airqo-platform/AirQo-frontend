import 'package:app/utils/network.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/insights/insights_bloc.dart';
import '../../widgets/custom_widgets.dart';
import 'insights_widgets.dart';

class InsightsTab extends StatefulWidget {
  const InsightsTab({
    super.key,
  });

  @override
  State<InsightsTab> createState() => _InsightsTabState();
}

class _InsightsTabState extends State<InsightsTab> {
  final GlobalKey _globalKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0),
      child: AppRefreshIndicator(
        sliverChildDelegate: SliverChildBuilderDelegate(
          (context, index) {
            final items = [
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                child: InsightsToggleBar(),
              ),
              const SizedBox(
                height: 12,
              ),
              Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                child: RepaintBoundary(
                  key: _globalKey,
                  child: InsightsGraph(),
                ),
              ),
              const SizedBox(
                height: 16,
              ),
              Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                child: InsightsActionBar(shareKey: _globalKey),
              ),
              const SizedBox(
                height: 32,
              ),
              const HealthTipsSection(),
            ];

            return items[index];
          },
          childCount: 7,
        ),
        onRefresh: _refreshPage,
      ),
    );
  }

  Future<void> _refreshPage() async {
    context.read<InsightsBloc>().add(const LoadDailyInsights());
    context.read<InsightsBloc>().add(const LoadHourlyInsights());
    await checkNetworkConnection(
      context,
      notifyUser: true,
    );
  }
}
