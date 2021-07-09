import 'package:flutter/material.dart';

class NewsAndStatsPage extends StatefulWidget {
  @override
  _NewsAndStatsPageState createState() => _NewsAndStatsPageState();
}

class _NewsAndStatsPageState extends State<NewsAndStatsPage> {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: const Center(child: Text("Resources")),
    );
  }

// @override
// Widget build(BuildContext context) {
//   final tabs = [
//     "News",
//     "Statistics",
//     "Resources",
//   ];
//
//     final _tabs = [
//       Tab(
//         // icon: Icon(Icons.menu),
//         text: 'News',
//       ),
//       Tab(
//         // icon: Icon(Icons.mode_comment),
//         text: 'Statistics',
//       ),
//       Tab(
//         // icon: Icon(Icons.mode_comment),
//         text: 'Resources',
//       )
//     ];
//
//   return DefaultTabController(
//       length: _tabs.length, // length of tabs
//       initialIndex: 0,
//       child: Column(children: <Widget>[
//         TabBar(
//             isScrollable: true,
//             labelColor: Colors.blue,
//             unselectedLabelColor: Colors.black,
//             tabs: _tabs
//         ),
//
//         TabBarView(children: <Widget>[
//           for (final tab in tabs)
//             Center(child: Text(tab),),
//         ]),
//         // Container(
//         //   child: TabBar(
//         //       isScrollable: true,
//         //       labelColor: Colors.blue,
//         //       unselectedLabelColor: Colors.black,
//         //       tabs: [
//         //         for (final tab in tabs) Tab(text: tab),]
//         //   ),
//         // ),
//         // Container(
//         //     height: 400,
//         //     decoration: BoxDecoration(
//         //         border: Border(top: BorderSide(color: Colors.blue, width: 0.5))
//         //     ),
//         //     child: TabBarView(children: <Widget>[
//         //       for (final tab in tabs)
//         //         Center(child: Text(tab),),
//         //     ])
//         // )
//       ])
//   );
// }
}
