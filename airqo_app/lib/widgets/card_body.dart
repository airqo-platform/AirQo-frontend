// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'package:flutter/material.dart';

class CardBody extends StatefulWidget {
  @override
  _CardBodyState createState() => _CardBodyState();
}

class _CardBodyState extends State<CardBody>
    with SingleTickerProviderStateMixin, RestorationMixin {
  late TabController _tabController;
  final searchController = TextEditingController();
  final List<Map<String, Widget>> tabs = [
    {'6:00 AM': CardBodySection()},
    {'9:00 AM': CardBodySection()},
    {'12:00 PM': CardBodySection()},
    {'3:00 PM': CardBodySection()}
  ];

  final RestorableInt tabIndex = RestorableInt(0);

  @override
  String get restorationId => 'card_body';

  @override
  void restoreState(RestorationBucket? oldBucket, bool initialRestore) {
    registerForRestoration(tabIndex, 'tab_index');
    _tabController.index = tabIndex.value;
  }

  @override
  void initState() {
    _tabController = TabController(
      initialIndex: 0,
      length: tabs.length,
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
    searchController.dispose();
    tabIndex.dispose();
    super.dispose();
  }

  void search(){

  }

  @override
  Widget build(BuildContext context) {

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
                      for (final tab in tabs) Tab(text: tab.keys.first),
                ]),
              ),
              Container(
                  height: 100,
                  decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: Colors.blue, width: 0.5))
                  ),
                  child: TabBarView(children: <Widget>[
                    for (final tab in tabs)
                      Center(child: tab[tab.keys.first],),
                  ])
              )
            ])
        ),
      ]),
    );
  }
}

class CardBodySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: const Center(
          child: Text("Body")
      ),
    );
  }
}
