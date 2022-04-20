import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/insights_tab.dart';
import 'package:flutter/material.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';

class InsightsPage extends StatefulWidget {
  final PlaceDetails placeDetails;

  const InsightsPage(this.placeDetails, {Key? key}) : super(key: key);

  @override
  _InsightsPageState createState() => _InsightsPageState();
}

class _InsightsPageState extends State<InsightsPage>
    with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  TabController? _tabController;
  Frequency frequency = Frequency.hourly;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      appBar: appTopBar(context, 'More Insights'),
      body: Container(
        padding: const EdgeInsets.only(right: 0, left: 0),
        color: Config.appBodyColor,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  top: 10, bottom: 10, right: 16, left: 16),
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                child: TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.transparent,
                    labelColor: Colors.transparent,
                    unselectedLabelColor: Colors.transparent,
                    labelPadding: const EdgeInsets.all(3.0),
                    onTap: (value) {
                      if (value == 0) {
                        setState(() {
                          frequency = Frequency.hourly;
                        });
                      } else {
                        setState(() {
                          frequency = Frequency.daily;
                        });
                      }
                    },
                    tabs: <Widget>[
                      tabButton(text: 'Day'),
                      tabButton(text: 'Week'),
                    ]),
              ),
            ),
            Expanded(
                child: TabBarView(
              controller: _tabController,
              physics: const NeverScrollableScrollPhysics(),
              children: <Widget>[
                InsightsTab(widget.placeDetails, Frequency.hourly),
                InsightsTab(widget.placeDetails, Frequency.daily),
                // MonthlyView(site),
              ],
            )),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController!.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  Widget tabButton({required String text}) {
    return Container(
      constraints:
          const BoxConstraints(minWidth: double.infinity, maxHeight: 32),
      decoration: BoxDecoration(
          color: text.toLowerCase() == 'day'
              ? frequency == Frequency.hourly
                  ? Config.appColorBlue
                  : Colors.white
              : frequency == Frequency.hourly
                  ? Colors.white
                  : Config.appColorBlue,
          borderRadius: const BorderRadius.all(Radius.circular(4.0))),
      child: Tab(
          child: Text(text,
              style: CustomTextStyle.button1(context)?.copyWith(
                color: text.toLowerCase() == 'day'
                    ? frequency == Frequency.hourly
                        ? Colors.white
                        : Config.appColorBlue
                    : frequency == Frequency.hourly
                        ? Config.appColorBlue
                        : Colors.white,
              ))),
    );
  }
}
