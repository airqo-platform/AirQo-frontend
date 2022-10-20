import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../blocs/insights/insights_bloc.dart';
import '../../themes/colors.dart';
import '../../utils/network.dart';
import '../../widgets/buttons.dart';
import 'daily_insights_tab.dart';
import 'hourly_insights_tab.dart';

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
      body: WillPopScope(
        onWillPop: onWillPop,
        child: Container(
          color: CustomColors.appBodyColor,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 10,
                  horizontal: 16,
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
                      setState(() => _tabController.index = value);
                      if (value == 0) {
                        context
                            .read<HourlyInsightsBloc>()
                            .add(LoadHourlyInsights(
                              siteId: widget.airQualityReading.referenceSite,
                              airQualityReading: widget.airQualityReading,
                            ));
                      } else {
                        context.read<DailyInsightsBloc>().add(LoadDailyInsights(
                              siteId: widget.airQualityReading.referenceSite,
                              airQualityReading: widget.airQualityReading,
                            ));
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
                  children: <Widget>[
                    HourlyInsightsTab(),
                    DailyInsightsTab(),
                  ],
                ),
              ),
            ],
          ),
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

    context.read<HourlyInsightsBloc>().add(LoadHourlyInsights(
          siteId: widget.airQualityReading.referenceSite,
          airQualityReading: widget.airQualityReading,
        ));

    context.read<DailyInsightsBloc>().add(LoadDailyInsights(
          siteId: widget.airQualityReading.referenceSite,
          airQualityReading: widget.airQualityReading,
        ));

    checkNetworkConnection(
      context,
      notifyUser: true,
    );
  }

  Future<bool> onWillPop() {
    context.read<HourlyInsightsBloc>().add(const ClearHourlyInsightsTab());
    context.read<DailyInsightsBloc>().add(const ClearDailyInsightsTab());
    return Future.value(true);
  }
}
