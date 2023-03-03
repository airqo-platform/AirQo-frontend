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

class InsightsPage extends StatefulWidget {
  const InsightsPage(
    this.airQualityReading, {
    super.key,
  });

  final AirQualityReading airQualityReading;

  @override
  State<InsightsPage> createState() => _InsightsPageState();
}

class _InsightsPageState extends State<InsightsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CustomColors.appBodyColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: false,
        titleSpacing: 20,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () async {
                context.read<InsightsBloc>().add(const ClearInsight());
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
                airQualityReading: widget.airQualityReading,
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
                          airQualityReading: widget.airQualityReading,
                        );
                      }
                    },
                    child: SvgPicture.asset(
                      'assets/icon/share_icon.svg',
                      theme: SvgTheme(currentColor: CustomColors.greyColor),
                      colorFilter: ColorFilter.mode(CustomColors.greyColor, BlendMode.srcIn),
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
        widget: SingleChildScrollView(
          child: BlocBuilder<InsightsBloc, InsightsState>(
            builder: (context, state) {
              Insight? selectedInsight = state.selectedInsight;
              if (selectedInsight == null) {
                return Container(); // TODO  replace with error widget;
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
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      height: 290,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(
                          Radius.circular(16.0),
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            height: 21,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: state.insights
                                .map(
                                  (e) => InsightsDayReading(
                                    e,
                                    isActive: e == selectedInsight,
                                  ),
                                )
                                .toList(),
                          ),
                          const SizedBox(
                            height: 21,
                          ),
                          InsightContainer(selectedInsight),
                          const SizedBox(
                            height: 21,
                          ),
                          Visibility(
                            visible: selectedInsight.available,
                            child: Text(
                              'The hourly air quality average in ${selectedInsight.name} is currently ${selectedInsight.airQuality.string}.',
                            ),
                          ),
                          Visibility(
                            visible: !selectedInsight.available,
                            child: const Text(
                              'We’re having issues with our network no worries, we’ll be back up soon.',
                            ),
                          ),
                          const SizedBox(
                            height: 12,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 36,
                  ),
                  ForecastContainer(selectedInsight),
                  const SizedBox(
                    height: 32,
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

  @override
  void initState() {
    super.initState();
    context
        .read<InsightsBloc>()
        .add(InitializeInsightsPage(widget.airQualityReading));
  }
}
