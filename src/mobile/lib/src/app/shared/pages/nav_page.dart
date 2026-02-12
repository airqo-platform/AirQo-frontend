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
        enableFeedback: true, // Enable feedback for better UX
        type: BottomNavigationBarType.fixed, // Keep items fixed
        selectedItemColor: Theme.of(context).primaryColor, // Use primary color for selected items
        unselectedItemColor: Colors.grey, // Use grey for unselected items
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        currentIndex: currentIndex,
        onTap: changeCurrentIndex,
        items: [
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/home_icon.svg", 
                "Home", 
                0,
                Theme.of(context).brightness == Brightness.dark
                    ? "assets/icons/home_icon.svg"
                    : "assets/icons/home_icon_white.svg",
              ),
              label: ""), // Empty label
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/search_icon.svg", 
                "Search", 
                1,
                Theme.of(context).brightness == Brightness.dark
                    ? "assets/icons/search_icon_light.svg"
                    : "assets/icons/search_icon_dark.svg",
      
              ),
              label: ""), // Empty label
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/learn_icon.svg", 
                "Learn", 
                2,
                Theme.of(context).brightness == Brightness.dark
                    ? "assets/icons/learn_icon.svg"
                    : "assets/icons/learn_icon_white.svg",
              ),
              label: "")
        ],
      ),
    );
  }

  Widget _buildNavIcon(String assetPath, String label, int index, String iconPath) {
    final bool isSelected = currentIndex == index;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SvgPicture.asset(
          iconPath,
          height: index == 2 ? 23 : (index == 0 ? 18 : 20),
          // Use the primary color when selected
          color: isSelected ? Theme.of(context).primaryColor : null,
        ),
        SizedBox(height: 5),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        )
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}