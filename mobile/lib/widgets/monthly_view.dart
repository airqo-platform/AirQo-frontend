
import 'package:app/constants/app_constants.dart';
import 'package:app/widgets/readings_card.dart';
import 'package:app/widgets/tips.dart';
import 'package:flutter/material.dart';

class MonthlyView extends StatefulWidget {
  @override
  _MonthlyViewState createState() => _MonthlyViewState();
}
class _MonthlyViewState extends State<MonthlyView>
    with TickerProviderStateMixin {
  var _weeklyTabController;
  @override
  void initState() {
    super.initState();
    _weeklyTabController = new TabController(length: 9, vsync: this);
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
                  text: "JAN",
                ),
                Tab(
                  text: "FEB",
                ),
                Tab(
                  text: "MAR",
                ),
                Tab(
                  text: "APR",
                ),
                Tab(
                  text: "MAY",
                ),
                Tab(
                  text: "JUNE",
                ),
                Tab(
                  text: "JULY",
                ),
                Tab(
                  text: "AUG",
                ),
                Tab(
                  text: "SEPT",
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
                  // Container(
                  //   decoration: BoxDecoration(
                  //     color: ColorConstants.appBodyColor,
                  //   ),
                  // ),
                ],
              ),
            )
            ),

          ],
        )
    );
  }

}