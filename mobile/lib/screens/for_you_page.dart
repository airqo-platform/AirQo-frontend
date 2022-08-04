import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';

import '../themes/colors.dart';
import '../widgets/buttons.dart';
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
                child: TabBar(
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
                    TabButton(
                      text: 'Analytics',
                      index: 0,
                      tabController: _tabController,
                    ),
                    TabButton(
                      text: 'Know your Air',
                      index: 1,
                      tabController: _tabController,
                    ),
                  ],
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
  }
}
