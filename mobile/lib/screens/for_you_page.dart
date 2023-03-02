import 'package:app/screens/settings/settings_page.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:app/services/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/constants/constants.dart';

import 'analytics/analytics_view.dart';
import 'kya/know_your_air_view.dart';

class ForYouPage extends StatefulWidget {
  const ForYouPage({
    super.key,
    this.analytics,
  });
  final bool? analytics;

  @override
  State<ForYouPage> createState() => _ForYouPageState();
}

class _ForYouPageState extends State<ForYouPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late bool _analytics;
  final AppService _appService = AppService();
  late GlobalKey _analyticsTabShowcaseKey;
  late GlobalKey _kyaTabShowcaseKey;
  late BuildContext _showcaseContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('For You'),
      body: AppSafeArea(
        horizontalPadding: 16,
        widget: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.all(
                  Radius.circular(7.0),
                ),
                child: ShowCaseWidget(
                  onStart: (index, key) {
                    if (key == _kyaTabShowcaseKey) {
                      _tabController.animateTo(1);
                      setState(() => _analytics = false);
                    }
                  },
                  onFinish: () async {
                    final prefs = await SharedPreferences.getInstance();
                    if (prefs.getBool(Config.restartTourShowcase) == true) {
                      Future.delayed(
                        Duration.zero,
                        () => _appService.navigateShowcaseToScreen(
                          context,
                          const SettingsPage(),
                        ),
                      );
                    }
                  },
                  builder: Builder(
                    builder: (context) {
                      _showcaseContext = context;

                      return TabBar(
                        controller: _tabController,
                        indicatorColor: Colors.transparent,
                        labelColor: Colors.transparent,
                        unselectedLabelColor: Colors.transparent,
                        labelPadding: const EdgeInsets.all(3.0),
                        physics: const NeverScrollableScrollPhysics(),
                        onTap: (value) {
                          setState(
                            () => _analytics = value == 0 ? true : false,
                          );
                        },
                        tabs: <Widget>[
                          CustomShowcaseWidget(
                            showcaseKey: _analyticsTabShowcaseKey,
                            description: "This is the analytics Tab",
                            childWidget: TabButton(
                              text: 'Analytics',
                              index: 0,
                              tabController: _tabController,
                            ),
                          ),
                          CustomShowcaseWidget(
                            showcaseKey: _kyaTabShowcaseKey,
                            descriptionHeight: 160,
                            descriptionWidth: 100,
                            description:
                                "Do you want to know more about air quality? Know your air in this section",
                            childWidget: TabButton(
                              text: 'Know your Air',
                              index: 1,
                              tabController: _tabController,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                physics: const NeverScrollableScrollPhysics(),
                children: const <Widget>[
                  AnalyticsView(),
                  KnowYourAirView(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _analytics = widget.analytics ?? true;
    _tabController = TabController(length: 2, vsync: this);
    _tabController.animateTo(_analytics ? 0 : 1);
    _analyticsTabShowcaseKey = GlobalKey();
    _kyaTabShowcaseKey = GlobalKey();
    WidgetsBinding.instance.addPostFrameCallback((_) => _showcaseToggle());
  }

  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ShowCaseWidget.of(_showcaseContext).startShowCase(
        [
          _analyticsTabShowcaseKey,
          _kyaTabShowcaseKey,
        ],
      );
    });
  }

  Future<void> _showcaseToggle() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(Config.forYouPageShowcase) == null) {
      _startShowcase();
      _appService.stopShowcase(Config.forYouPageShowcase);
    }
  }
}
