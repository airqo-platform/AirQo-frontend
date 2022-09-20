import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/app_service.dart';
import '../../services/hive_service.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import 'analytics_widgets.dart';

class AnalyticsView extends StatefulWidget {
  const AnalyticsView({super.key});

  @override
  State<AnalyticsView> createState() => _AnalyticsViewState();
}

class _AnalyticsViewState extends State<AnalyticsView> {
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
                  final airQualityReading =
                      Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                          .get(analytics[index].site);

                  if (airQualityReading == null) {
                    return Container();
                  }

                  return Padding(
                    padding: EdgeInsets.only(
                      top: Config.refreshIndicatorPadding(
                        index,
                      ),
                    ),
                    child: MiniAnalyticsCard(
                      airQualityReading,
                      animateOnClick: true,
                    ),
                  );
                },
                childCount: analytics.length,
              ),
              onRefresh: _refresh,
            );
          }

          return ValueListenableBuilder<Box>(
            valueListenable:
                Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                    .listenable(),
            builder: (context, box, widget) {
              if (box.isNotEmpty) {
                final airQualityReadings =
                    box.values.toList().cast<AirQualityReading>();

                return AppRefreshIndicator(
                  sliverChildDelegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return Padding(
                        padding: EdgeInsets.only(
                          top: Config.refreshIndicatorPadding(index),
                        ),
                        child: MiniAnalyticsCard(
                          airQualityReadings[index],
                          animateOnClick: true,
                        ),
                      );
                    },
                    childCount: airQualityReadings.length,
                  ),
                  onRefresh: _refresh,
                );
              }

              return const EmptyAnalytics();
            },
          );
        },
      ),
    );
  }

  Future<void> _refresh() async {
    await AppService().refreshAnalytics(context);
  }
}
