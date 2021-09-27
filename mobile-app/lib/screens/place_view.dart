import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/monthly_view.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:app/widgets/tips.dart';
import 'package:app/widgets/weekly_view.dart';
import 'package:flutter/material.dart';

class PlaceView extends StatefulWidget {
  @override
  _PlaceViewState createState() => _PlaceViewState();
}

class _PlaceViewState extends State<PlaceView>
    with SingleTickerProviderStateMixin {
  var _tabController;
  bool isWeekly = true;
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }
  @override
  void dispose() {
    super.dispose();
    _tabController.dispose();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: ColorConstants.appBodyColor,
        leading: Padding(padding: EdgeInsets.all(5),
          child: backButton(context),
        ),
        title: Padding(padding: EdgeInsets.only(top: 10, bottom: 10),
          child:  TabBar(
              controller: _tabController,
              indicatorColor: Colors.transparent,
              labelColor: Colors.transparent,
              unselectedLabelColor: Colors.transparent,
              onTap: (value){
                if(value == 0){
                  setState(() {
                    isWeekly = true;
                  });
                }
                else{
                  setState(() {
                    isWeekly = false;
                  });
                }
              },
              tabs: <Widget>[

                Container(
                  constraints:
                  const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color: isWeekly ? ColorConstants.appColorBlue : Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))
                  ),
                  child: Tab(
                      child: Text(
                        'Week',
                        style: TextStyle(
                          color: isWeekly ? Colors.white : Colors.black,
                        ),
                      )
                  ),
                ),
                Container(
                  constraints:
                  const BoxConstraints(minWidth: double.infinity),
                  decoration: BoxDecoration(
                      color: isWeekly ? Colors.white : ColorConstants.appColorBlue,
                      borderRadius: BorderRadius.all(Radius.circular(5.0))
                  ),
                  child: Tab(
                      child: Text(
                        'Month',
                        style: TextStyle(
                          color: isWeekly ?  Colors.black : Colors.white,
                        ),
                      )
                  ),
                )
              ]),
        ),
      ),
      body: TabBarView(
        children: <Widget>[
          WeeklyView(),
          MonthlyView(),

        ],
        controller: _tabController,
      ),
    );
  }
}
