import 'package:app/blocs/kya/kya_bloc.dart';
import 'package:app/constants/constants.dart';
import 'package:app/screens/settings/settings_page.dart';
import 'package:app/services/services.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'analytics/analytics_view.dart';
import 'kya/know_your_air_view.dart';
import 'offline_banner.dart';

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
    final Size screenSize = MediaQuery.of(context).size;

    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(AppLocalizations.of(context)!.forYou),
        body: AppSafeArea(
          horizontalPadding: 16,
          child: Column(
            children: [
              AnimatedPadding(
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeInCirc,
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
                      final prefs = await SharedPreferencesHelper.instance;
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
                            description: AppLocalizations.of(context)!
                                .thisIsTheAnalyticsTab,
                            child: TabButton(
                              text: AppLocalizations.of(context)!.analytics,
                              index: 0,
                              tabController: _tabController,
                            ),
                          ),
                          CustomShowcaseWidget(
                            showcaseKey: _kyaTabShowcaseKey,
                            descriptionHeight: screenSize.height * 0.16,
                            descriptionWidth: screenSize.width * 0.3,
                            description: AppLocalizations.of(context)!
                                .doYouWantToKnowMoreAboutAirQualityKnowYourAirInThisSection,
                            child: TabButton(
                              text: AppLocalizations.of(context)!.knowYourair,
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
    context.read<KyaBloc>().add(const FetchKya());
    context.read<KyaBloc>().add(const FetchQuizzes());
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
    final prefs = await SharedPreferencesHelper.instance;
    if (prefs.getBool(Config.forYouPageShowcase) == null) {
      _startShowcase();
      await _appService.stopShowcase(Config.forYouPageShowcase);
    }
  }
}
