import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:app/services/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
  static final GlobalKey _analyticsTabShowcaseKey = GlobalKey();
  static final GlobalKey _kyaTabShowcaseKey = GlobalKey();
  static BuildContext? myContext;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('For You'),
      body: Container(
        padding: const EdgeInsets.only(right: 16, left: 16),
        color: CustomColors.appBodyColor,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 10, bottom: 10),
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.all(
                  Radius.circular(7.0),
                ),
                child: ShowCaseWidget(
                  onStart: (index, key) {
                    if (key == _kyaTabShowcaseKey) {
                      _tabController.animateTo(1);
                    }
                  },
                  builder: Builder(
                    builder: (context) {
                      myContext = context;
                      return TabBar(
                        controller: _tabController,
                        indicatorColor: Colors.transparent,
                        labelColor: Colors.transparent,
                        unselectedLabelColor: Colors.transparent,
                        labelPadding: const EdgeInsets.all(3.0),
                        physics: const NeverScrollableScrollPhysics(),
                        onTap: (value) {
                          if (value == 0) {
                            setState(() => _analytics = true);
                          } else {
                            setState(() => _analytics = false);
                          }
                        },
                        tabs: <Widget>[
                          Showcase(
                            key: _analyticsTabShowcaseKey,
                            description: 'This is the analytics Tab',
                            child: TabButton(
                              text: 'Analytics',
                              index: 0,
                              tabController: _tabController,
                            ),
                          ),
                          Showcase(
                            key: _kyaTabShowcaseKey,
                            description:
                                'Do you want to know more about air quality? Know your air in this section',
                            child: TabButton(
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
    WidgetsBinding.instance.addPostFrameCallback((_) => showcasetoggle());
  }

  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      ShowCaseWidget.of(myContext!).startShowCase(
        [
          _analyticsTabShowcaseKey,
          _kyaTabShowcaseKey,
        ],
      );
    });
  }

  Future<void> showcasetoggle() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('forYouPageShowcase') == null) {
      _startShowcase();
      _appService.stopshowcase('forYouPageShowcase');
    }
  }
}
