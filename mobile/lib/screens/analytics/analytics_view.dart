import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../models/analytics.dart';
import '../../models/measurement.dart';
import '../../services/app_service.dart';
import '../../services/hive_service.dart';
import '../../services/local_storage.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import 'analytics_widgets.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({super.key});

  @override
  State<AnalyticsView> createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
  final AppService _appService = AppService();
  List<Measurement> _places = [];

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      color: appColors.appBodyColor,
      child: ValueListenableBuilder<Box>(
        valueListenable: Hive.box<Analytics>(HiveBox.analytics).listenable(),
        builder: (context, box, widget) {
          if (box.isNotEmpty) {
            final analytics = box.values.toList().cast<Analytics>();

            return AppRefreshIndicator(
              sliverChildDelegate: SliverChildBuilderDelegate(
                (context, index) {
                  return Padding(
                    padding: EdgeInsets.only(
                      top: Config.refreshIndicatorPadding(
                        index,
                      ),
                    ),
                    child: MiniAnalyticsCard(
                      analytics[index].toPlaceDetails(),
                    ),
                  );
                },
                childCount: analytics.length,
              ),
              onRefresh: _refresh,
            );
          }

          if (_places.isNotEmpty) {
            return AppRefreshIndicator(
              sliverChildDelegate: SliverChildBuilderDelegate(
                (context, index) {
                  return Padding(
                    padding: EdgeInsets.only(
                      top: Config.refreshIndicatorPadding(index),
                    ),
                    child: MiniAnalyticsCard(
                      PlaceDetails.measurementToPlace(
                        _places[index],
                      ),
                    ),
                  );
                },
                childCount: _places.length,
              ),
              onRefresh: _refresh,
            );
          }

          return const EmptyAnalytics();
        },
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _refresh() async {
    await _appService.refreshAnalytics(context).then(
          (value) => _initialize(),
        );
  }

  Future<void> _initialize() async {
    final places = await DBHelper().getLatestMeasurements();
    setState(() => _places = places);
  }
}
