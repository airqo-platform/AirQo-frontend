import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:charts_flutter/flutter.dart' as charts;
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../utils/data_formatter.dart';
import '../../utils/date.dart';
import '../../utils/pm.dart';
import '../../widgets/buttons.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/dialogs.dart';
import '../../widgets/recommendation.dart';
import '../../widgets/tooltip.dart';

part 'daily_insights_tab.dart';
part 'hourly_insights_tab.dart';
part 'insights_widgets.dart';

class InsightsPage extends StatefulWidget {
  const InsightsPage(
    this.airQualityReading, {
    super.key,
  });
  final AirQualityReading airQualityReading;

  @override
  State<InsightsPage> createState() => _InsightsPageState();
}

class _InsightsPageState extends State<InsightsPage>
    with AutomaticKeepAliveClientMixin, TickerProviderStateMixin {
  late TabController _tabController;

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      appBar: const AppTopBar('More Insights'),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: Container(
          color: CustomColors.appBodyColor,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 10,
                  horizontal: 16,
                ),
                child: Material(
                  color: Colors.white,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(8.0),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.transparent,
                    labelColor: Colors.transparent,
                    unselectedLabelColor: Colors.transparent,
                    labelPadding: const EdgeInsets.all(3.0),
                    onTap: (value) {
                      setState(() => _tabController.index = value);
                      if (value == 0) {
                        context.read<HourlyInsightsBloc>().add(LoadInsights(
                              siteId: widget.airQualityReading.referenceSite,
                              airQualityReading: widget.airQualityReading,
                              frequency: Frequency.hourly,
                            ));
                      } else {
                        context.read<DailyInsightsBloc>().add(LoadInsights(
                              siteId: widget.airQualityReading.referenceSite,
                              airQualityReading: widget.airQualityReading,
                              frequency: Frequency.daily,
                            ));
                      }
                    },
                    tabs: <Widget>[
                      TabButton(
                        text: 'Day',
                        index: 0,
                        tabController: _tabController,
                      ),
                      TabButton(
                        text: 'Week',
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
                  children: <Widget>[
                    HourlyInsightsTab(),
                    DailyInsightsTab(),
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
    _tabController = TabController(
      length: 2,
      vsync: this,
    );

    context.read<HourlyInsightsBloc>().add(LoadInsights(
          siteId: widget.airQualityReading.referenceSite,
          airQualityReading: widget.airQualityReading,
          frequency: Frequency.hourly,
        ));

    context.read<DailyInsightsBloc>().add(LoadInsights(
          siteId: widget.airQualityReading.referenceSite,
          airQualityReading: widget.airQualityReading,
          frequency: Frequency.daily,
        ));
  }

  Future<bool> onWillPop() {
    context.read<HourlyInsightsBloc>().add(const ClearInsightsTab());
    context.read<DailyInsightsBloc>().add(const ClearInsightsTab());

    return Future.value(true);
  }
}
