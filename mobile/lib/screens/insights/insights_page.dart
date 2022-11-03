import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';

import 'insights_tab.dart';

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
  Frequency frequency = Frequency.hourly;

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
                      setState(() => frequency = Frequency.hourly);
                    } else {
                      setState(() => frequency = Frequency.daily);
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
                  InsightsTab(
                    widget.airQualityReading,
                    Frequency.hourly,
                  ),
                  InsightsTab(
                    widget.airQualityReading,
                    Frequency.daily,
                  ),
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
    checkNetworkConnection(
      context,
      notifyUser: true,
    );
  }
}
