import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/date.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';

part 'analytics_widgets.dart';

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
    await Future.wait([
      AppService().refreshAirQualityReadings(),
      AppService().refreshAnalytics(context),
    ]);
  }
}
