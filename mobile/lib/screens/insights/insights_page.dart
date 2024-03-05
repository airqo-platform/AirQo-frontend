import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
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

class InsightsPage extends StatefulWidget {
  const InsightsPage(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

  @override
  State<InsightsPage> createState() => _InsightsPageState();
}

class _InsightsPageState extends State<InsightsPage> {
  AirQualityReading get airQualityReading => widget.airQualityReading;

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

              Insight todayInsight = Insight.fromAirQualityReading(
                airQualityReading,
              );
              List<Insight> updatedInsights = [
                todayInsight,
                ...state.insights.sublist(1),
              ];
              state = state.copyWith(
                name: airQualityReading.name,
                selectedInsight: todayInsight,
                insights: updatedInsights,
              );

              AirQualityReading selectedAirQualityReading =
                  airQualityReading.copyWith(
                pm2_5: airQualityReading.pm2_5,
              );
              return Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(
                    height: 38,
                  ),
                  
                  InsightsCalendar(selectedAirQualityReading),
                  
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
