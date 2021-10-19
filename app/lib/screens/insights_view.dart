import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/widgets/daily_view.dart';
import 'package:app/widgets/monthly_view.dart';
import 'package:app/widgets/weekly_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class InsightsView extends StatefulWidget {
  Site site;

  InsightsView(this.site);

  @override
  _InsightsViewState createState() => _InsightsViewState(this.site);
}

class _InsightsViewState extends State<InsightsView>
    with SingleTickerProviderStateMixin {
  var _tabController;
  bool isWeekly = true;

  Site site;

  int segmentedControlValue = 0;

  int currentSegment = 0;

  _InsightsViewState(this.site);

  Widget backButton() {
    return Container(
      constraints: const BoxConstraints(maxHeight: 32),
      padding: const EdgeInsets.all(0.0),
      decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.rectangle,
          borderRadius: BorderRadius.all(Radius.circular(10.0))),
      child: IconButton(
        icon: const Icon(
          Icons.arrow_back,
          color: Colors.black,
          size: 20,
        ),
        onPressed: () {
          Navigator.pop(context);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(),
        ),
        title: const Text('More Insights'),
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
              children: <Widget>[
                DailyView(site),
                MonthlyView(site),
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
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void onValueChanged(int? newValue) {
    if (newValue != null) {
      setState(() {
        currentSegment = newValue;
      });
    }
  }

  Widget segmentedControl() {
    return Container(
      width: 300,
      child: CupertinoSlidingSegmentedControl(
          groupValue: segmentedControlValue,
          backgroundColor: Colors.blue.shade200,
          children: const <int, Widget>{
            0: Text('One'),
            1: Text('Two'),
            2: Text('Three')
          },
          onValueChanged: (value) {
            setState(() {
              if (value != null) {
                segmentedControlValue = value as int;
              }
            });
          }),
    );
  }

  Widget topTabBar(text) {
    return Container(
      constraints:
          const BoxConstraints(minWidth: double.infinity, maxHeight: 32),
      decoration: BoxDecoration(
          color: isWeekly ? ColorConstants.appColorBlue : Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(5.0))),
      child: Tab(
          child: Text(
        text,
        style: TextStyle(
          color: isWeekly ? Colors.white : Colors.black,
        ),
      )),
    );
  }
}
