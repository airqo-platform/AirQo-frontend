import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/services/survey_notification_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class NavPage extends StatefulWidget {
  const NavPage({super.key});

  @override
  State<NavPage> createState() => NavPageState();
}

class NavPageState extends State<NavPage> with AutomaticKeepAliveClientMixin {
  int currentIndex = 0;
  bool isAuthenticated = false;
  int newSurveysCount = 0;
  final SurveyNotificationService _notificationService = SurveyNotificationService();

  @override
  void initState() {
    super.initState();
    _checkAuthenticationStatus();
    _loadSurveys();
  }

  Future<void> _checkAuthenticationStatus() async {
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    setState(() {
      isAuthenticated = userId != null;
    });
  }

  Future<void> _loadSurveys() async {
    // Load surveys to check for new ones
    context.read<SurveyBloc>().add(const LoadSurveys());
  }

  Future<void> _updateBadgeCount() async {
    final state = context.read<SurveyBloc>().state;
    if (state is SurveysLoaded) {
      final count = await _notificationService.getNewSurveysCount(
        state.surveys,
        state.userResponses,
      );
      if (mounted) {
        setState(() {
          newSurveysCount = count;
        });
      }
    }
  }

  void changeCurrentIndex(int index) {
    // Check if user is trying to access exposure tab (index 2) without authentication
    if (index == 2 && !isAuthenticated) {
      _showAuthRequiredDialog();
      return;
    }
    
    // If navigating to Learn tab (index 3), mark surveys as seen
    if (index == 3) {
      _notificationService.updateLastSeenTimestamp();
    }
    
    setState(() {
      currentIndex = index;
    });
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
    return BlocListener<SurveyBloc, SurveyState>(
      listener: (context, state) {
        if (state is SurveysLoaded) {
          _updateBadgeCount();
        }
      },
      child: Scaffold(
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
              icon: _buildNavIconWithBadge(
                "assets/icons/learn_icon.svg", 
                "Learn", 
                3,
                Theme.of(context).brightness == Brightness.dark
                    ? "assets/icons/learn_icon.svg"
                    : "assets/icons/learn_icon_white.svg",
                badgeCount: newSurveysCount,
              ),
              label: "")
        ],
      ),
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

  Widget _buildNavIconWithBadge(
    String assetPath,
    String label,
    int index,
    String iconPath,
    {required int badgeCount}
  ) {
    final bool isSelected = currentIndex == index;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            SvgPicture.asset(
              iconPath,
              height: index == 3 ? 23 : (index == 0 ? 18 : 20),
              color: isSelected ? Theme.of(context).primaryColor : null,
            ),
            if (badgeCount > 0)
              Positioned(
                right: -8,
                top: -4,
                child: Container(
                  padding: EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      width: 1.5,
                    ),
                  ),
                  constraints: BoxConstraints(
                    minWidth: 18,
                    minHeight: 18,
                  ),
                  child: Center(
                    child: Text(
                      '$badgeCount',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
          ],
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