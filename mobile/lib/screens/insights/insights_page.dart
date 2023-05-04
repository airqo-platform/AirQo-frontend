import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

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
    return Scaffold(
      backgroundColor: CustomColors.appBodyColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: CustomColors.appBodyColor,
        centerTitle: false,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () async {
                await popNavigation(context);
              },
              child: SvgPicture.asset(
                'assets/icon/close.svg',
                height: 40,
                width: 40,
              ),
            ),
            Text('More Insights', style: CustomTextStyle.headline8(context)),
            FutureBuilder<Uri>(
              future: ShareService.createShareLink(
                airQualityReading: airQualityReading,
              ),
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  showSnackBar(context, 'Could not create a share link.');
                }
                if (snapshot.hasData) {
                  return InkWell(
                    onTap: () async {
                      Uri? link = snapshot.data;
                      if (link != null) {
                        await ShareService.shareLink(
                          link,
                          context,
                          airQualityReading: airQualityReading,
                        );
                      }
                    },
                    child: SvgPicture.asset(
                      'assets/icon/share_icon.svg',
                      theme: SvgTheme(currentColor: CustomColors.greyColor),
                      colorFilter: ColorFilter.mode(
                        CustomColors.greyColor,
                        BlendMode.srcIn,
                      ),
                      height: 26,
                      width: 26,
                    ),
                  );
                }

                return GestureDetector(
                  onTap: () {
                    showSnackBar(context, 'Creating share link. Hold on tight');
                  },
                  child: const Center(
                    child: LoadingIcon(radius: 20),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      body: AppSafeArea(
        child: SingleChildScrollView(
          child: BlocBuilder<InsightsBloc, InsightsState>(
            builder: (context, state) {
              Insight? selectedInsight = state.selectedInsight;
              if (selectedInsight == null) {
                return NoAirQualityDataWidget(callBack: () {
                  context
                      .read<InsightsBloc>()
                      .add(InitializeInsightsPage(airQualityReading));
                });
              }

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
                      selectedInsight.shortDate(),
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
                      selectedInsight.dateTime.timelineString(),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.black.withOpacity(0.5),
                          ),
                    ),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  InsightsCalendar(airQualityReading),
                  Visibility(
                    visible: selectedInsight.dateTime.isToday() &&
                        DateTime.now().hour < 12,
                    child: ForecastContainer(selectedInsight),
                  ),
                  HealthTipsWidget(selectedInsight),
                  const SizedBox(
                    height: 21,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
