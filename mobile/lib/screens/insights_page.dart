import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/daily_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class InsightsPage extends StatefulWidget {
  Site site;

  InsightsPage(this.site);

  @override
  _InsightsPageState createState() => _InsightsPageState(this.site);
}

class _InsightsPageState extends State<InsightsPage>
    with SingleTickerProviderStateMixin {
  var _tabController;
  bool isWeekly = true;

  Site site;

  _InsightsPageState(this.site);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'More Insights',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: Container(
        padding: const EdgeInsets.only(right: 16, left: 16),
        color: ColorConstants.appBodyColor,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 10),
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.all(Radius.circular(7.0)),
                child: TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.transparent,
                    labelColor: Colors.transparent,
                    unselectedLabelColor: Colors.transparent,
                    labelPadding: const EdgeInsets.all(3.0),
                    onTap: (value) {
                      if (value == 0) {
                        setState(() {
                          isWeekly = true;
                        });
                      } else {
                        setState(() {
                          isWeekly = false;
                        });
                      }
                    },
                    tabs: <Widget>[
                      Container(
                        constraints: const BoxConstraints(
                            minWidth: double.infinity, maxHeight: 32),
                        decoration: BoxDecoration(
                            color: isWeekly
                                ? ColorConstants.appColorBlue
                                : Colors.white,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(5.0))),
                        child: Tab(
                            child: Text(
                          'Day',
                          style: TextStyle(
                            color: isWeekly ? Colors.white : Colors.black,
                          ),
                        )),
                      ),
                      Container(
                        constraints: const BoxConstraints(
                            minWidth: double.infinity, maxHeight: 32),
                        decoration: BoxDecoration(
                            color: isWeekly
                                ? Colors.white
                                : ColorConstants.appColorBlue,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(5.0))),
                        child: Tab(
                            child: Text(
                          'Week',
                          style: TextStyle(
                            color: isWeekly ? Colors.black : Colors.white,
                          ),
                        )),
                      )
                    ]),
              ),
            ),
            Expanded(
                child: TabBarView(
              controller: _tabController,
              physics: const NeverScrollableScrollPhysics(),
              children: <Widget>[
                DailyView(site, false),
                DailyView(site, true),
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
    super.dispose();
    _tabController.dispose();
  }

  @override
  void initState() {
    _tabController = TabController(length: 2, vsync: this);
    super.initState();
  }
}
