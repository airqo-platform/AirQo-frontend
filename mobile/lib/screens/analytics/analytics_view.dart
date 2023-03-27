import 'package:app/blocs/blocs.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../settings/settings_page.dart';
import 'analytics_widgets.dart';

class AnalyticsView extends StatelessWidget {
  const AnalyticsView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationHistoryBloc, List<LocationHistory>>(
      buildWhen: (previous, current) {
        return previous != current;
      },
      builder: (context, state) {
        if (state.isEmpty) {
          context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
        }

        List<LocationHistory> locationHistory = state.sortByDateTime();

        if (locationHistory.isEmpty) {
          return NoAnalyticsWidget(
            callBack: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const SettingsPage();
                  },
                ),
              );
            },
          );
        }

        return AppRefreshIndicator(
          sliverChildDelegate: SliverChildBuilderDelegate(
            (context, index) {
              final airQualityReading =
                  Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
                      .get(locationHistory[index].site);

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
            childCount: locationHistory.length,
          ),
          onRefresh: () {
            _refresh(context);

            return Future(() => null);
          },
        );
      },
    );
  }

  void _refresh(BuildContext context) {
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
  }
}
