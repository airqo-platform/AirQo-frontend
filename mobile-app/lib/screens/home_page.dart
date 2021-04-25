import 'package:app/config/languages/CustomLocalizations.dart';
import 'package:app/constants/app_constants.dart';
import 'package:app/screens/mapPage.dart';
import 'package:app/screens/resources_page.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:flutter/material.dart';

import 'dashboard_page.dart';
import 'news_and_stats_page.dart';

class HomePage extends StatefulWidget {
  final String title = 'Airqo';

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentPage = 1;
  final List<Widget> _pages = [
    MapPage(),
    DashboardPage(),
    ResourcesPage(),
  ];

  bool _showAppBar = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _showAppBar
          ? AppBar(
              title: Text(widget.title),
              actions: [
                IconButton(
                  icon: const Icon(
                    Icons.search,
                  ),
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return SearchPage();
                    }));
                  },
                ),
                PopupMenuButton<dynamic>(
                  onSelected: (value) => {navigateToMenuItem(value)},
                  itemBuilder: (context) => <PopupMenuEntry<String>>[
                    PopupMenuItem<String>(
                      value: 'Settings',
                      child: ListTile(
                        leading: const Icon(Icons.settings),
                        title: Text(
                          'Settings',
                        ),
                      ),
                    ),
                    PopupMenuItem<String>(
                      value: 'Help',
                      child: ListTile(
                        leading: const Icon(Icons.help_outline_outlined),
                        title: Text(
                          'Help',
                        ),
                      ),
                    ),
                    const PopupMenuDivider(),
                    PopupMenuItem<String>(
                      value: 'Invite Firends',
                      child: ListTile(
                        leading: const Icon(Icons.person_add_alt),
                        title: Text(
                          CustomLocalizations.of(context)!.message!,
                          style: Theme.of(context).textTheme.headline1,
                        ),
                      ),
                    ),
                  ],
                )
              ],
            )
          : null,
      body: _pages[_currentPage],
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          onTabTapped(1, true);
        },
        tooltip: 'Home',
        child: const Icon(Icons.home_outlined),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        // color: Colors.blue,
        child: IconTheme(
          // data: IconThemeData(color: Theme.of(context).colorScheme.onPrimary),
          data: IconThemeData(color: Theme.of(context).primaryColor),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: <Widget>[
              const Spacer(flex: 1),

              IconButton(
                tooltip: 'Library',
                icon: const Icon(Icons.library_books_outlined),
                onPressed: () {
                  onTabTapped(2, true);
                },
              ),
              const Spacer(flex: 1),

              IconButton(
                tooltip: 'Map',
                icon: const Icon(Icons.map_outlined),
                onPressed: () {
                  onTabTapped(0, false);
                },
              ),

              const Spacer(flex: 3),

              // ElevatedButton(
              //   onPressed: () {},
              //   child: Text(''),
              // ),
              IconButton(
                tooltip: 'Library',
                icon: const Icon(Icons.library_books_outlined),
                onPressed: () {
                  onTabTapped(2, true);
                },
              ),
              const Spacer(flex: 1),

              IconButton(
                tooltip: 'Library',
                icon: const Icon(Icons.library_books_outlined),
                onPressed: () {
                  onTabTapped(2, true);
                },
              ),

              const Spacer(flex: 1),
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

  void navigateToMenuItem(dynamic position) {
    Navigator.push(context, MaterialPageRoute(builder: (context) {
      return SettingsPage();
    }));
  }
}
