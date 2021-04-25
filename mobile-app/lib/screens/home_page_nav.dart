import 'package:app/config/languages/CustomLocalizations.dart';
import 'package:app/screens/feedback_page.dart';
import 'package:app/screens/map_page_nav.dart';
import 'package:app/screens/search_page.dart';
import 'package:app/screens/settings_page.dart';
import 'package:flutter/material.dart';

import 'dashboard_page.dart';


class HomePage extends StatefulWidget {
  final String title = 'Airqo';

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  final PageController _myPage = PageController(initialPage: 0);

  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
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
              const PopupMenuItem<String>(
                value: 'Settings',
                child: ListTile(
                  leading: Icon(Icons.settings),
                  title: Text(
                    'Settings',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Help',
                child: ListTile(
                  leading: const Icon(Icons.help_outline_outlined),
                  title: Text(
                    'Help',
                  ),
                ),
              ),
              const PopupMenuItem<String>(
                value: 'Feedback',
                child: ListTile(
                  leading: const Icon(Icons.feedback_outlined),
                  title: Text(
                    'Feedback',
                  ),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<String>(
                value: 'Invite Friends',
                child: ListTile(
                  leading: const Icon(Icons.person_add_alt),
                  title: Text(
                    'Invite Friends',
                    // style: Theme.of(context).textTheme.headline1,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        child: Container(
          // height: 50,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              IconButton(
                // iconSize: 30.0,
                padding: const EdgeInsets.only(left: 28.0),
                icon: const Icon(Icons.home_outlined),
                onPressed: () {
                  setState(() {
                    _myPage.jumpToPage(0);
                  });
                },
              ),
              IconButton(
                // iconSize: 30.0,
                padding: const EdgeInsets.only(right: 28.0),
                icon: const Icon(Icons.search),
                onPressed: () {
                  setState(() {
                    _myPage.jumpToPage(1);
                  });
                },
              ),
              IconButton(
                // iconSize: 30.0,
                padding: const EdgeInsets.only(left: 28.0),
                icon: const Icon(Icons.notifications_none_outlined),
                onPressed: () {
                  setState(() {
                    _myPage.jumpToPage(2);
                  });
                },
              ),
              IconButton(
                // iconSize: 30.0,
                padding: const EdgeInsets.only(right: 28.0),
                icon: const Icon(Icons.list),
                onPressed: () {
                  setState(() {
                    _myPage.jumpToPage(3);
                  });
                },
              )
            ],
          ),
        ),
      ),
      body: PageView(
        controller: _myPage,
        onPageChanged: (int) {
          print('Page Changes to index $int');
        },
        children: <Widget>[
          DashboardPage(),
          Center(
            child: Container(
              child: Text('Page 1'),
            ),
          ),
          Center(
            child: Container(
              child: Text('Page 2'),
            ),
          ),
          Center(
            child: Container(
              child: Text('Page 3'),
            ),
          )
        ],
        // physics: NeverScrollableScrollPhysics(), // Comment this if you need to use Swipe.
      ),
      floatingActionButton: Container(
        // height: 60.0,
        // width: 60.0,
        child: FittedBox(
          child: FloatingActionButton(
            backgroundColor: Colors.deepPurple,
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return MapPage();
              }));
            },
            child: Icon(
              Icons.public_sharp,
              color: Colors.white,
            ),
            // elevation: 5.0,
          ),
        ),
      ),
    );
  }

  void navigateToMenuItem(dynamic position) {

    var menuItem = position.toString();

    if (menuItem.trim().toLowerCase() == 'feedback'){
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return FeedbackPage();
      }));
    }
    else{
      Navigator.push(context, MaterialPageRoute(builder: (context) {
        return SettingsPage();
      }));
    }



  }

}
