import 'package:flutter/material.dart';

class NewsAndStatsPage extends StatefulWidget {
  @override
  _NewsAndStatsPageState createState() => _NewsAndStatsPageState();
}

class _NewsAndStatsPageState extends State<NewsAndStatsPage>
    with SingleTickerProviderStateMixin, RestorationMixin {
  late TabController _tabController;

  final RestorableInt tabIndex = RestorableInt(0);

  @override
  String get restorationId => 'tab_scrollable';

  @override
  void restoreState(RestorationBucket? oldBucket, bool initialRestore) {
    registerForRestoration(tabIndex, 'tab_index');
    _tabController.index = tabIndex.value;
  }

  @override
  void initState() {
    _tabController = TabController(
      initialIndex: 0,
      length: 9,
      vsync: this,
    );
    _tabController.addListener(() {
      setState(() {
        tabIndex.value = _tabController.index;
      });
    });
    super.initState();
  }

  @override
  void dispose() {
    _tabController.dispose();
    tabIndex.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      "News",
      "Statistics",
      "Resources",
    ];

    return Container(

      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: <Widget>[
        DefaultTabController(
            length: tabs.length, // length of tabs
            initialIndex: 0,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: <Widget>[
              Container(
                child: TabBar(
                  isScrollable: true,
                  labelColor: Colors.blue,
                  unselectedLabelColor: Colors.black,
                    tabs: [
                      for (final tab in tabs) Tab(text: tab),]
                ),
              ),
              Container(
                  height: 400,
                  decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: Colors.blue, width: 0.5))
                  ),
                  child: TabBarView(children: <Widget>[
                    for (final tab in tabs)
                    Center(child: Text(tab),),
                  ])
              )
            ])
        ),
      ]),
    );
  }
}


