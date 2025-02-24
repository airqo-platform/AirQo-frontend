import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class NavPage extends StatefulWidget {
  const NavPage({super.key});

  @override
  State<NavPage> createState() => _NavPageState();
}

class _NavPageState extends State<NavPage> with AutomaticKeepAliveClientMixin {
  int currentIndex = 0;

  void changeCurrentIndex(int index) {
    setState(() {
      currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      body: IndexedStack(index: currentIndex, children: [
        DashboardPage(),
        MapScreen(),
        KyaPage(),
      ]),
      bottomNavigationBar: BottomNavigationBar(
        enableFeedback: false,
        useLegacyColorScheme: true,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        currentIndex: currentIndex,
        onTap: changeCurrentIndex,
        items: [
          BottomNavigationBarItem(
              icon: Column(
                children: [
                  SvgPicture.asset(
                    Theme.of(context).brightness == Brightness.dark
                        ? "assets/icons/home_icon.svg"
                        : "assets/icons/home_icon_white.svg",
                    // ignore: deprecated_member_use
                    height: 18,
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Home",
                    style: TextStyle(fontSize: 12),
                  )
                ],
              ),
              label: ""),
          BottomNavigationBarItem(
              icon: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Container(
                  height: 54,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SvgPicture.asset(
                        "assets/icons/search_icon.svg",
                        height: 20,
                      ),
                      SizedBox(width: 5),
                      Text(
                        "Search",
                        style: TextStyle(color: Colors.white),
                      )
                    ],
                  ),
                ),
              ),
              label: ""),
          BottomNavigationBarItem(
              icon: Column(
                children: [
                  SvgPicture.asset(
                    Theme.of(context).brightness == Brightness.dark
                        ? "assets/icons/learn_icon.svg"
                        : "assets/icons/learn_icon_white.svg",
                    // ignore: deprecated_member_use
                    height: 23,
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Learn",
                    style: TextStyle(fontSize: 12),
                  )
                ],
              ),
              label: ""),
        ],
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
