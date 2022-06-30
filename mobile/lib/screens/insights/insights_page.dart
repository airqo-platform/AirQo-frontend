import 'package:app/models/place_details.dart';
import 'package:app/screens/insights/insights_tab.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../themes/colors.dart';
import '../../utils/network.dart';
import '../../widgets/buttons.dart';

class InsightsPage extends StatefulWidget {
  const InsightsPage(
    this.placeDetails, {
    super.key,
  });
  final PlaceDetails placeDetails;

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
                    widget.placeDetails,
                    Frequency.hourly,
                  ),
                  InsightsTab(
                    widget.placeDetails,
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
