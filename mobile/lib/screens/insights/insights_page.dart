import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_tab.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/insights/insights_bloc.dart';
import '../../themes/colors.dart';
import '../../utils/network.dart';
import '../../widgets/buttons.dart';

class InsightsPage extends StatefulWidget {
  const InsightsPage(
    this.airQualityReading, {
    super.key,
  });
  final AirQualityReading airQualityReading;

  @override
  State<InsightsPage> createState() => _InsightsPageState();
}

class _InsightsPageState extends State<InsightsPage>
    with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  late TabController _tabController;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      appBar: const AppTopBar('More Insights'),
      body: Container(
        padding: const EdgeInsets.only(right: 0, left: 0),
        color: CustomColors.appBodyColor,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(
                top: 10,
                bottom: 10,
                right: 16,
                left: 16,
              ),
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.all(
                  Radius.circular(8.0),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: Colors.transparent,
                  labelColor: Colors.transparent,
                  unselectedLabelColor: Colors.transparent,
                  labelPadding: const EdgeInsets.all(3.0),
                  onTap: (value) {
                    if (value == 0) {
                      context
                          .read<InsightsBloc>()
                          .add(const LoadHourlyInsights());
                      context
                          .read<InsightsBloc>()
                          .add(const SwitchTab(frequency: Frequency.hourly));
                    } else {
                      context
                          .read<InsightsBloc>()
                          .add(const LoadDailyInsights());
                      context
                          .read<InsightsBloc>()
                          .add(const SwitchTab(frequency: Frequency.daily));
                    }
                  },
                  tabs: <Widget>[
                    TabButton(
                      text: 'Day',
                      index: 0,
                      tabController: _tabController,
                    ),
                    TabButton(
                      text: 'Week',
                      index: 1,
                      tabController: _tabController,
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                physics: const NeverScrollableScrollPhysics(),
                children: const <Widget>[
                  InsightsTab(),
                  InsightsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
    );
    context.read<InsightsBloc>().add(InitializeInsightsPage(
          siteId: widget.airQualityReading.referenceSite,
          airQualityReading: widget.airQualityReading,
        ));
    context.read<InsightsBloc>().add(const LoadHourlyInsights());
    context.read<InsightsBloc>().add(const LoadDailyInsights());
    checkNetworkConnection(
      context,
      notifyUser: true,
    );
  }
}
