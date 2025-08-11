import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
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
        ExposureDashboardView(),
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
                "assets/icons/home_icon_new.svg", 
                "Home", 
                0,
                "assets/icons/home_icon_new.svg",
              ),
              label: ""), // Empty label
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/exposure_icon.svg", 
                "Exposure", 
                1,
                "assets/icons/exposure_icon.svg",
              ),
              label: ""), // Empty label
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/search_icon.svg", 
                "Search", 
                2,
                "assets/icons/search_icon.svg",
              ),
              label: ""), // Empty label
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/learn_icon_new.svg", 
                "Learn", 
                3,
                "assets/icons/learn_icon_new.svg",
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
          height: index == 3 ? 23 : (index == 0 ? 18 : (index == 1 ? 22 : 20)),
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