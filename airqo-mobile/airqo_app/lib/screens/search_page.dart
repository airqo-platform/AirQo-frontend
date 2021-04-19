// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'package:flutter/material.dart';

import 'dashboard_page.dart';

class SearchPage extends StatefulWidget {
  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage>
    with SingleTickerProviderStateMixin, RestorationMixin {
  late TabController _tabController;
  final searchController = TextEditingController();
  final List<Map<String, Widget>> tabs = [
    {'All': DashboardPage()},
    {'Place': DashboardPage()},
    {'News': DashboardPage()},
    {'Resources': DashboardPage()}
  ];

  final RestorableInt tabIndex = RestorableInt(0);

  @override
  String get restorationId => 'search_page';

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

    return Scaffold(
      appBar: AppBar(
        title: TextFormField(
          controller: searchController,
          cursorColor: Colors.white,
          style: const TextStyle(
            color: Colors.white,
          ),
          // autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search',
            suffixIcon: IconButton(
              onPressed: search,
              icon: const Icon(Icons.search),
            ),
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: [
            for (final tab in tabs) Tab(text: tab.keys.first),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          for (final tab in tabs)
            Center(
              child: tab[tab.keys.first],
            ),
        ],
      ),
    );
  }
}

