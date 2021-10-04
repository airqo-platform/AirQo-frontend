import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:app/widgets/tips.dart';
import 'package:flutter/material.dart';

class WeeklyView extends StatefulWidget {
  @override
  _WeeklyViewState createState() => _WeeklyViewState();
}

class _WeeklyViewState extends State<WeeklyView> with TickerProviderStateMixin {
  var _weeklyTabController;

  @override
  Widget build(BuildContext context) {
    // double screenHeight = MediaQuery.of(context).size.height;
    return Container(
        color: ColorConstants.appBodyColor,
        child: Column(
          children: <Widget>[
            TabBar(
              controller: _weeklyTabController,
              indicatorColor: Colors.transparent,
              labelColor: ColorConstants.appColor,
              unselectedLabelColor: Colors.black54,
              isScrollable: true,
              tabs: <Widget>[
                Tab(
                  text: "01",
                ),
                Tab(
                  text: "02",
                ),
                Tab(
                  text: "03",
                ),
                Tab(
                  text: "04",
                ),
                Tab(
                  text: "05",
                ),
                Tab(
                  text: "06",
                ),
                Tab(
                  text: "07",
                ),
                Tab(
                  text: "08",
                ),
                Tab(
                  text: "09",
                ),
                Tab(
                  text: "10",
                ),
                Tab(
                  text: "11",
                ),
                Tab(
                  text: "12",
                ),
                Tab(
                  text: "13",
                ),
                Tab(
                  text: "14",
                ),
              ],
            ),
            Expanded(
                child: Container(
              margin: EdgeInsets.only(left: 16.0, right: 16.0),
              child: TabBarView(
                controller: _weeklyTabController,
                children: <Widget>[
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                  ListView(
                    shrinkWrap: true,
                    children: [
                      ReadingsCard(),
                      SizedBox(
                        height: 16,
                      ),
                      Text(
                        'Wellness & Health tips',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      SizedBox(
                        height: 4,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                      SizedBox(
                        height: 8,
                      ),
                      TipCard(),
                    ],
                  ),
                ],
              ),
            )),
          ],
        ));
  }

  @override
  void dispose() {
    super.dispose();
    _weeklyTabController.dispose();
  }

  @override
  void initState() {
    super.initState();
    _weeklyTabController = new TabController(length: 14, vsync: this);
  }
}
