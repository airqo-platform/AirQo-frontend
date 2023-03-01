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
                  airQualityReading: widget.airQualityReading),
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
                      color: CustomColors.greyColor,
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
              AirQualityReading? airQualityReading = state.airQualityReading;
              if (airQualityReading == null) {
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
                    child: Text(airQualityReading.insightsShortDate(),
                        style: CustomTextStyle.headline8(context)
                            ?.copyWith(fontSize: 20)),
                  ),
                  const SizedBox(
                    height: 14,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Text(
                      airQualityReading.dateTime.timelineString(),
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
                          SizedBox(
                            height: 21,
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: state.forecast
                                .map((e) => InsightsDayReading(e))
                                .toList(),
                          ),
                          const SizedBox(
                            height: 21,
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 11,
                            ),
                            height: 62,
                            decoration: const BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.all(
                                Radius.circular(16.0),
                              ),
                            ),
                          ),
                          const SizedBox(
                            height: 21,
                          ),
                          const Text(
                              'The hourly air quality average in Wandegeya is currently Unhealthy for Sensitive Groups.'),
                          SizedBox(
                            height: 12,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 36,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Text('Forecast',
                        style: CustomTextStyle.headline8(context)
                            ?.copyWith(fontSize: 20)),
                  ),
                  const SizedBox(
                    height: 14,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15.0),
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      height: 64,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(
                          Radius.circular(16.0),
                        ),
                      ),
                      child: Center(
                          child: Text(
                              'Expect conditions to range from good to moderate today.')),
                    ),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  const HealthTipsWidget(),
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
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
  }
}
