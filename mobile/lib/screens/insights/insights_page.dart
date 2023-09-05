import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../offline_banner.dart';
import 'insights_widgets.dart';

Future<void> navigateToInsights(
  BuildContext context,
  AirQualityReading airQualityReading,
) async {
  context.read<InsightsBloc>().add(InitializeInsightsPage(airQualityReading));

  await Navigator.of(context).push(
    PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) =>
          InsightsPage(airQualityReading),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        const curve = Curves.ease;

        var tween = Tween(
          begin: begin,
          end: end,
        ).chain(CurveTween(curve: curve));

        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
    ),
  );
}

class InsightsPage extends StatelessWidget {
  const InsightsPage(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
        child: Scaffold(
      backgroundColor: CustomColors.appBodyColor,
      appBar: InsightsPageAppBar(airQualityReading),
      body: AppSafeArea(
        child: SingleChildScrollView(
          child: BlocBuilder<InsightsBloc, InsightsState>(
            builder: (context, state) {
              AirQualityReading selectedAirQualityReading =
                  airQualityReading.copyWith(
                pm2_5: state.selectedInsight.pm2_5,
              );
              return Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(
                    height: 38,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Text(
                      state.selectedInsight.shortDate(context),
                      style: CustomTextStyle.headline8(context)
                          ?.copyWith(fontSize: 20),
                    ),
                  ),
                  const SizedBox(
                    height: 14,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Text(
                      state.selectedInsight.dateTime.timelineString(context),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black.withOpacity(0.5),
                          ),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  InsightsCalendar(selectedAirQualityReading),
                  Visibility(
                    visible: state.selectedInsight.dateTime.isToday() &&
                        DateTime.now().hour < 12,
                    child: ForecastContainer(state.selectedInsight),
                  ),
                  HealthTipsWidget(state.selectedInsight),
                  const SizedBox(
                    height: 21,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    ));
  }
}
