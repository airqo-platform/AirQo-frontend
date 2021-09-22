import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:app/widgets/tips.dart';
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
        title: TabBar(
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
      body: TabBarView(
        children: <Widget>[
          WeeklyView(),
          WeeklyView(),

        ],
        controller: _tabController,
      ),
    );
  }
}

class MainView extends StatefulWidget {
  @override
  _MainViewState createState() => _MainViewState();
}
class _MainViewState extends State<MainView>
    with TickerProviderStateMixin {
  var _nestedTabController;
  @override
  void initState() {
    super.initState();
    _nestedTabController = new TabController(length: 2, vsync: this);
  }
  @override
  void dispose() {
    super.dispose();
    _nestedTabController.dispose();
  }
  @override
  Widget build(BuildContext context) {
    double screenHeight = MediaQuery.of(context).size.height;
    return Scaffold(
      body: Container(
          color: ColorConstants.appBodyColor,
          child:  Column(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: <Widget>[
              TabBar(
                controller: _nestedTabController,
                indicatorColor: ColorConstants.appColorBlue,
                labelColor: ColorConstants.appColorBlue,
                unselectedLabelColor: Colors.black54,
                isScrollable: true,
                tabs: <Widget>[
                  Tab(
                    text: "Inside Pokhara",
                  ),
                  Tab(
                    text: "Outside Pokhara",
                  ),

                ],
              ),
              Container(
                height: screenHeight * 0.70,
                margin: EdgeInsets.only(left: 16.0, right: 16.0),
                child: TabBarView(
                  controller: _nestedTabController,
                  children: <Widget>[
                    WeeklyView(),
                    WeeklyView(),

                  ],
                ),
              )
            ],
          )
      ),
    );
  }
}

class WeeklyView extends StatefulWidget {
  @override
  _WeeklyViewState createState() => _WeeklyViewState();
}
class _WeeklyViewState extends State<WeeklyView>
    with TickerProviderStateMixin {
  var _weeklyTabController;
  @override
  void initState() {
    super.initState();
    _weeklyTabController = new TabController(length: 2, vsync: this);
  }
  @override
  void dispose() {
    super.dispose();
    _weeklyTabController.dispose();
  }
  @override
  Widget build(BuildContext context) {
    // double screenHeight = MediaQuery.of(context).size.height;
    return Container(
        color: ColorConstants.appBodyColor,
      child:  Column(
        children: <Widget>[
          TabBar(
            controller: _weeklyTabController,
            indicatorColor: Colors.transparent,
            labelColor: ColorConstants.appColorBlue,
            unselectedLabelColor: Colors.black54,
            isScrollable: true,
            tabs: <Widget>[
              Tab(
                text: "Inside Pokhara",
              ),
              Tab(
                text: "Outside Pokhara",
              ),

            ],
          ),

          Expanded(child:  Container(
            margin: EdgeInsets.only(left: 16.0, right: 16.0),
            child: TabBarView(
              controller: _weeklyTabController,
              children: <Widget>[
                ListView(
                  shrinkWrap: true,
                  children: [
                    ReadingsCard(),
                    SizedBox(height: 16,),
                    Text('Wellness & Health tips',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    SizedBox(height: 4,),
                    TipCard(),
                    SizedBox(height: 8,),
                    TipCard(),
                    SizedBox(height: 8,),
                    TipCard(),
                    SizedBox(height: 8,),
                    TipCard(),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    color: ColorConstants.appBodyColor,
                  ),
                ),
              ],
            ),
          )
          ),

        ],
      )
    );
  }

}