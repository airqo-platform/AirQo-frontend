import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/services/survey_notification_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class NavPage extends StatefulWidget {
  const NavPage({super.key});

  @override
  State<NavPage> createState() => _NavPageState();
}

class _NavPageState extends State<NavPage> with AutomaticKeepAliveClientMixin {
  int currentIndex = 0;
  int newSurveysCount = 0;
  final SurveyNotificationService _notificationService = SurveyNotificationService();

  bool get _exposureEnabled =>
      FeatureFlagService.instance.isEnabled(AppFeatureFlag.exposureTracking);

  bool get _surveysEnabled =>
      FeatureFlagService.instance.isEnabled(AppFeatureFlag.surveys);

  // Learn tab index shifts by 1 when the Exposure tab is present.
  int get _learnTabIndex => _exposureEnabled ? 3 : 2;

  List<String> get _tabNames => _exposureEnabled
      ? ['dashboard', 'map', 'exposure', 'learn']
      : ['dashboard', 'map', 'learn'];

  @override
  void initState() {
    super.initState();
    if (_surveysEnabled) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<SurveyBloc>().add(const LoadSurveys());
      });
    }
  }

  Future<void> _updateBadgeCount() async {
    if (!_surveysEnabled) return;
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
    if (index == _learnTabIndex && _surveysEnabled) {
      _notificationService.updateLastSeenTimestamp();
    }
    setState(() {
      currentIndex = index;
    });
    AnalyticsService().trackNavigationChanged(
      tabIndex: index,
      tabName: _tabNames[index],
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget body = Scaffold(
      body: IndexedStack(index: currentIndex, children: [
        DashboardPage(),
        MapScreen(),
        if (_exposureEnabled) const ExposureDashboardView(),
        KyaPage(),
      ]),
      bottomNavigationBar: BottomNavigationBar(
        enableFeedback: true,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        currentIndex: currentIndex,
        onTap: changeCurrentIndex,
        items: [
          BottomNavigationBarItem(
            icon: _buildNavIcon("Home", 0,
                isDark ? "assets/icons/home_icon.svg" : "assets/icons/home_icon_white.svg"),
            label: "",
          ),
          BottomNavigationBarItem(
            icon: _buildNavIcon("Search", 1,
                isDark ? "assets/icons/search_icon_light.svg" : "assets/icons/search_icon_dark.svg"),
            label: "",
          ),
          if (_exposureEnabled)
            BottomNavigationBarItem(
              icon: _buildNavIcon("Exposure", 2, "assets/icons/exposure_icon.svg"),
              label: "",
            ),
          BottomNavigationBarItem(
            icon: _surveysEnabled
                ? _buildNavIconWithBadge("Learn", _learnTabIndex,
                    isDark ? "assets/icons/learn_icon.svg" : "assets/icons/learn_icon_white.svg",
                    badgeCount: newSurveysCount)
                : _buildNavIcon("Learn", _learnTabIndex,
                    isDark ? "assets/icons/learn_icon.svg" : "assets/icons/learn_icon_white.svg"),
            label: "",
          ),
        ],
      ),
    );

    if (!_surveysEnabled) return body;

    // When surveys are enabled, listen for badge updates
    return BlocListener<SurveyBloc, SurveyState>(
      listener: (context, state) {
        if (state is SurveysLoaded) _updateBadgeCount();
      },
      child: body,
    );
  }

  double _iconHeight(String label) {
    if (label == 'Learn') return 23;
    if (label == 'Home') return 18;
    return 20;
  }

  Widget _buildNavIcon(String label, int index, String iconPath) {
    final bool isSelected = currentIndex == index;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SvgPicture.asset(
          iconPath,
          height: _iconHeight(label),
          colorFilter: isSelected
              ? ColorFilter.mode(Theme.of(context).primaryColor, BlendMode.srcIn)
              : null,
        ),
        const SizedBox(height: 5),
        TranslatedText(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildNavIconWithBadge(String label, int index, String iconPath,
      {required int badgeCount}) {
    final bool isSelected = currentIndex == index;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            SvgPicture.asset(
              iconPath,
              height: _iconHeight(label),
              colorFilter: isSelected
              ? ColorFilter.mode(Theme.of(context).primaryColor, BlendMode.srcIn)
              : null,
            ),
            if (badgeCount > 0)
              Positioned(
                right: -8,
                top: -4,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      width: 1.5,
                    ),
                  ),
                  constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                  child: Center(
                    child: Text(
                      '$badgeCount',
                      style: const TextStyle(
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
        const SizedBox(height: 5),
        TranslatedText(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}
