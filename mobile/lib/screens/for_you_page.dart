import 'package:app/constants/config.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

import 'analytics_view.dart';
import 'know_your_air_view.dart';

class ForYouPage extends StatefulWidget {
  const ForYouPage({Key? key}) : super(key: key);

  @override
  _ForYouPageState createState() => _ForYouPageState();
}

class _ForYouPageState extends State<ForYouPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool analytics = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Config.appBodyColor,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'For You',
          style: TextStyle(color: Colors.black),
        ),
      ),
      body: Container(
        padding: const EdgeInsets.only(right: 16, left: 16),
        color: Config.appBodyColor,
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
                    physics: const NeverScrollableScrollPhysics(),
                    onTap: (value) {
                      if (value == 0) {
                        setState(() {
                          analytics = true;
                        });
                      } else {
                        setState(() {
                          analytics = false;
                        });
                      }
                    },
                    tabs: <Widget>[
                      Container(
                        constraints: const BoxConstraints(
                            minWidth: double.infinity, maxHeight: 32),
                        decoration: BoxDecoration(
                            color:
                                analytics ? Config.appColorBlue : Colors.white,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(5.0))),
                        child: Tab(
                            child: Text(
                          'Analytics',
                          style: TextStyle(
                            color: analytics ? Colors.white : Colors.black,
                          ),
                        )),
                      ),
                      Container(
                        constraints: const BoxConstraints(
                            minWidth: double.infinity, maxHeight: 32),
                        decoration: BoxDecoration(
                            color:
                                analytics ? Colors.white : Config.appColorBlue,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(5.0))),
                        child: Tab(
                            child: Text(
                          'Know you Air',
                          style: TextStyle(
                            color: analytics ? Colors.black : Colors.white,
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
              children: const <Widget>[
                AnalyticsView(),
                KnowYourAirView(),
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

  Widget topTabBar(text) {
    return Container(
      constraints:
          const BoxConstraints(minWidth: double.infinity, maxHeight: 32),
      decoration: BoxDecoration(
          color: analytics ? Config.appColorBlue : Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(5.0))),
      child: Tab(
          child: Text(
        text,
        style: TextStyle(
          color: analytics ? Colors.white : Colors.black,
        ),
      )),
    );
  }
}
