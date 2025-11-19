import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class NavPage extends StatefulWidget {
  const NavPage({super.key});

  @override
  State<NavPage> createState() => _NavPageState();
}

class _NavPageState extends State<NavPage> with AutomaticKeepAliveClientMixin {
  int currentIndex = 0;
  bool isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuthenticationStatus();
  }

  Future<void> _checkAuthenticationStatus() async {
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    setState(() {
      isAuthenticated = userId != null;
    });
  }

  void changeCurrentIndex(int index) {
    // Check if user is trying to access exposure tab (index 2) without authentication
    if (index == 2 && !isAuthenticated) {
      _showAuthRequiredDialog();
      return;
    }

    setState(() {
      currentIndex = index;
    });

    // Track navigation
    _trackNavigation(index);
  }

  Future<void> _trackNavigation(int tabIndex) async {
    final tabNames = ['dashboard', 'map', 'exposure', 'learn'];
    await AnalyticsService().trackNavigationChanged(
      tabIndex: tabIndex,
      tabName: tabNames[tabIndex],
    );
  }

  void _showAuthRequiredDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Authentication Required'),
        content: Text('Please sign in to access your exposure data. Exposure tracking requires a user account to maintain your personal health data.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      body: IndexedStack(index: currentIndex, children: [
        DashboardPage(),
        MapScreen(),
        isAuthenticated ? ExposureDashboardView() : _buildAuthRequiredWidget(),
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
                "assets/icons/exposure_icon.svg", 
                "Exposure", 
                2,
                Theme.of(context).brightness == Brightness.dark
                    ? "assets/icons/exposure_icon.svg"
                    : "assets/icons/exposure_icon.svg",
              ),
              label: ""),
          BottomNavigationBarItem(
              icon: _buildNavIcon(
                "assets/icons/learn_icon.svg", 
                "Learn", 
                3,
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
          height: index == 3 ? 23 : (index == 0 ? 18 : 20),
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

  Widget _buildAuthRequiredWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lock_outline,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'Authentication Required',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'Please sign in to access your exposure data. Exposure tracking requires a user account to maintain your personal health data.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool get wantKeepAlive => true;
}