import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/monthly_view.dart';
import 'package:app/widgets/weekly_view.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PlaceView extends StatefulWidget {
  @override
  _PlaceViewState createState() => _PlaceViewState();
}

class _PlaceViewState extends State<PlaceView>
    with SingleTickerProviderStateMixin {
  var _tabController;
  bool isWeekly = true;

  int segmentedControlValue = 0;
  int currentSegment = 0;

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
              if(value != null) {
                segmentedControlValue = value as int;
              }
            });
          }
      ),
    );
  }

  void onValueChanged(int? newValue) {
    if(newValue != null) {
      setState(() {
      currentSegment = newValue;
    });
    }
  }


  @override
  Widget build(BuildContext context) {
    const segmentedControlMaxWidth = 500.0;
    final children = <int, Widget>{
      0: Text('Week'),
      1: Text('Month'),
    };

    return CupertinoPageScaffold(
      // navigationBar: CupertinoNavigationBar(
      //   automaticallyImplyLeading: false,
      //   middle: Text(
      //     'hi',
      //   ),
      // ),
      child: DefaultTextStyle(
        style: TextStyle(
            fontSize: 13
        ),
        child: SafeArea(
          child: ListView(
            children: [
              const SizedBox(height: 16),
              SizedBox(
                width: segmentedControlMaxWidth,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: CupertinoSlidingSegmentedControl<int>(
                    children: children,
                    onValueChanged: onValueChanged,
                    groupValue: currentSegment,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                height: 300,
                alignment: Alignment.center,
                child: children[currentSegment],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget builds(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.all(5),
          child: backButton(context),
        ),
        title: Padding(
          padding: const EdgeInsets.only(top: 10, bottom: 10),
          child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.transparent,
              labelColor: Colors.transparent,
              unselectedLabelColor: Colors.transparent,
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
                  constraints: const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color:
                          isWeekly ? ColorConstants.appColorBlue : Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))),
                  child: Tab(
                      child: Text(
                    'Week',
                    style: TextStyle(
                      color: isWeekly ? Colors.white : Colors.black,
                    ),
                  )),
                ),
                Container(
                  constraints: const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color:
                          isWeekly ? Colors.white : ColorConstants.appColorBlue,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))),
                  child: Tab(
                      child: Text(
                    'Month',
                    style: TextStyle(
                      color: isWeekly ? Colors.black : Colors.white,
                    ),
                  )),
                )
              ]),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: <Widget>[
          WeeklyView(),
          MonthlyView(),
        ],
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
}
