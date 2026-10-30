import 'dart:async';

import 'package:airqo/src/app/dashboard/pages/dashboard_page.dart';
import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/exposure/pages/exposure_dashboard_view.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_launch_announcement.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/app/map/pages/map_page.dart';
import 'package:airqo/src/app/map/services/map_navigation_service.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/services/local_notification_bootstrap.dart';
import 'package:airqo/src/app/shared/services/notification_helper.dart';
import 'package:airqo/src/app/shared/services/push_notification_service.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/services/survey_notification_service.dart';
import 'package:airqo/src/app/surveys/services/survey_trigger_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NavPage extends StatefulWidget {
  const NavPage({super.key});

  @override
  State<NavPage> createState() => _NavPageState();
}

class _NavPageState extends State<NavPage> with AutomaticKeepAliveClientMixin {
  int currentIndex = 0;
  int newSurveysCount = 0;
  final SurveyNotificationService _notificationService =
      SurveyNotificationService();

  bool get _surveysEnabled =>
      FeatureFlagService.instance.isEnabled(AppFeatureFlag.surveys);

  late final HomeTourHold _homeTourHold;

  static const int _learnTabIndex = 3;

  static const List<String> _tabNames = [
    'dashboard',
    'map',
    'exposure',
    'learn',
  ];

  static const _permissionPromptShownKey =
      'notification_permission_prompt_shown';

  @override
  void initState() {
    super.initState();
    // Before DashboardPage builds, so its forecast tour cannot cover this sheet.
    _homeTourHold = ExposureLaunchAnnouncement.holdHomeTour();
    MapNavigationService.instance.requestedMeasurement.addListener(
      _handleMapNavigationRequest,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      unawaited(_initializeLocalNotifications());
    });
  }

  void _handleMapNavigationRequest() {
    if (MapNavigationService.instance.requestedMeasurement.value == null ||
        !mounted ||
        currentIndex == 1) {
      return;
    }
    changeCurrentIndex(1);
  }

  @override
  void dispose() {
    ExposureLaunchAnnouncement.releaseHomeTour(_homeTourHold);
    MapNavigationService.instance.requestedMeasurement.removeListener(
      _handleMapNavigationRequest,
    );
    super.dispose();
  }

  Future<void> _initializeLocalNotifications() async {
    try {
      try {
        await LocalNotificationBootstrap.instance.ensureInitialized();
        await _maybePromptNotificationPermission();
      } catch (_) {
        // Push setup can fail on local debug builds without Firebase.
      }

      if (_surveysEnabled) {
        if (!mounted) return;
        context.read<SurveyBloc>().add(const LoadSurveys());
        await SurveyTriggerService().initialize();
      }

      await _maybeShowExposureLaunchAnnouncement();
    } finally {
      ExposureLaunchAnnouncement.releaseHomeTour(_homeTourHold);
    }
  }

  Future<void> _maybeShowExposureLaunchAnnouncement() async {
    if (!mounted) return;
    await ExposureLaunchAnnouncement.showIfNeeded(
      context,
      exposureEnabled: true,
      primaryLabel: 'Try Exposure',
      onPrimary: () => changeCurrentIndex(2),
      hold: _homeTourHold,
    );
  }

  Future<void> _maybePromptNotificationPermission() async {
    if (!mounted) return;

    final hasPermission = await PushNotificationService().hasPermission();
    if (hasPermission) return;

    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(_permissionPromptShownKey) == true) return;

    await prefs.setBool(_permissionPromptShownKey, true);
    if (!mounted) return;

    await NotificationHelper().checkAndShowPermissionPrompt(context);
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
    final previousIndex = currentIndex;
    if (index == _learnTabIndex && _surveysEnabled) {
      _notificationService.updateLastSeenTimestamp();
    }
    setState(() {
      currentIndex = index;
    });
    if (previousIndex == 2 && index != 2) {
      context.read<DashboardBloc>().add(
            const LoadUserPreferences(forceRefresh: true),
          );
    }
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
        DashboardPage(isActive: currentIndex == 0),
        MapScreen(isActive: currentIndex == 1),
        ExposureDashboardView(isActive: currentIndex == 2),
        KyaPage(),
      ]),
      bottomNavigationBar: BottomNavigationBar(
        enableFeedback: true,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: AppTextColors.muted(context),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        currentIndex: currentIndex,
        onTap: changeCurrentIndex,
        items: [
          BottomNavigationBarItem(
            icon: _buildNavIcon(
                "Home",
                0,
                isDark
                    ? "assets/icons/home_icon.svg"
                    : "assets/icons/home_icon_white.svg"),
            label: "",
          ),
          BottomNavigationBarItem(
            icon: _buildNavIcon(
                "Search",
                1,
                isDark
                    ? "assets/icons/search_icon_light.svg"
                    : "assets/icons/search_icon_dark.svg"),
            label: "",
          ),
          BottomNavigationBarItem(
            icon: _buildNavIcon(
              "Exposure",
              2,
              "assets/icons/exposure_icon.svg",
              badgeLabel: 'NEW',
            ),
            label: "",
          ),
          BottomNavigationBarItem(
            icon: _surveysEnabled
                ? _buildNavIconWithBadge(
                    "Learn",
                    _learnTabIndex,
                    isDark
                        ? "assets/icons/learn_icon.svg"
                        : "assets/icons/learn_icon_white.svg",
                    badgeCount: newSurveysCount)
                : _buildNavIcon(
                    "Learn",
                    _learnTabIndex,
                    isDark
                        ? "assets/icons/learn_icon.svg"
                        : "assets/icons/learn_icon_white.svg"),
            label: "",
          ),
        ],
      ),
    );

    if (!_surveysEnabled) return body;

    // When surveys are enabled, listen for badge updates
    return BlocListener<SurveyBloc, SurveyState>(
      listener: (context, state) {
        if (state is SurveysLoaded) {
          _updateBadgeCount();
          if (_surveysEnabled) {
            SurveyTriggerService().setActiveSurveys(state.surveys);
          }
        }
      },
      child: body,
    );
  }

  double _iconHeight(String label) {
    if (label == 'Learn') return 23;
    if (label == 'Home') return 18;
    return 20;
  }

  Widget _buildNavIcon(
    String label,
    int index,
    String iconPath, {
    String? badgeLabel,
  }) {
    final bool isSelected = currentIndex == index;
    final iconColor = isSelected
        ? Theme.of(context).primaryColor
        : AppTextColors.muted(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            SvgPicture.asset(
              iconPath,
              height: _iconHeight(label),
              colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
            ),
            if (badgeLabel != null)
              Positioned(
                top: -7,
                right: -25,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: AppColors.primaryColor.withValues(alpha: 0.45),
                    ),
                  ),
                  child: Text(
                    badgeLabel,
                    style: TextStyle(
                      color: AppColors.primaryColor,
                      fontSize: 7,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.25,
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
            color: iconColor,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildNavIconWithBadge(String label, int index, String iconPath,
      {required int badgeCount}) {
    final bool isSelected = currentIndex == index;
    final iconColor = isSelected
        ? Theme.of(context).primaryColor
        : AppTextColors.muted(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            SvgPicture.asset(
              iconPath,
              height: _iconHeight(label),
              colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
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
                  constraints:
                      const BoxConstraints(minWidth: 18, minHeight: 18),
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
            color: iconColor,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}
