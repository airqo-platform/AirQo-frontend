import 'package:airqo_app/screens/mapPage.dart';
import 'package:flutter/material.dart';

import 'dashboard_page.dart';
import 'news_and_stats_page.dart';

class HomePage extends StatefulWidget {
  final String title = "Airqo";


  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  
  int _currentPage = 1;
  final List<Widget> _pages = [
    MapPage(),
    DashboardPage(),
    NewsAndStatsPage(),
  ];

  bool _showAppBar = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _showAppBar ? AppBar(
        title: Text(widget.title),
      ) : null,
      body: _pages[_currentPage],
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          onTabTapped(1, true);
        },
        child: const Icon(Icons.home_outlined),
        tooltip: 'Create',
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        color: Colors.blue,
        child: IconTheme(
          data: IconThemeData(color: Theme.of(context).colorScheme.onPrimary),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: <Widget>[
              IconButton(
                tooltip: 'Map',
                icon: const Icon(Icons.map_outlined),
                onPressed: () {
                  onTabTapped(0, false);
                },
              ),
              // const Spacer(flex: 2),
              IconButton(
                tooltip: 'Library',
                icon: const Icon(Icons.library_books_outlined),
                onPressed: () {
                  onTabTapped(2, true);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void onTabTapped(int index, bool showAppBar) {
    setState(() {
      _currentPage = index;
      _showAppBar = showAppBar;
    });

  }
}
