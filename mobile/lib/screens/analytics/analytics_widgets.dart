import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AnalyticsAvatar extends StatelessWidget {
  const AnalyticsAvatar(this.airQualityReading, {super.key});

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      width: 104,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Pollutant.pm2_5.color(
          airQualityReading.pm2_5,
        ),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            Pollutant.pm2_5.svg,
            semanticsLabel: 'Pm2.5',
            height: 9.7,
            width: 32.45,
            colorFilter: ColorFilter.mode(
              Pollutant.pm2_5.textColor(
                value: airQualityReading.pm2_5,
              ),
              BlendMode.srcIn,
            ),
          ),
          Text(
            airQualityReading.pm2_5.toInt().toString(),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.airQualityValue(
              pollutant: Pollutant.pm2_5,
              value: airQualityReading.pm2_5,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 12.14,
            width: 32.45,
            colorFilter: ColorFilter.mode(
              Pollutant.pm2_5.textColor(
                value: airQualityReading.pm2_5,
              ),
              BlendMode.srcIn,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class AnalyticsMoreInsights extends StatelessWidget {
  const AnalyticsMoreInsights({super.key});

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Row(
      children: [
        Container(
          height: 16,
          width: 16,
          decoration: BoxDecoration(
            color: CustomColors.appColorBlue,
            borderRadius: BorderRadius.circular(4),
          ),
          child: const Icon(
            color: Colors.white,
            size: 15,
            Icons.bar_chart_rounded,
            semanticLabel: 'Chart',
          ),
        ),
        const SizedBox(
          width: 8.0,
        ),
        Text(
          AppLocalizations.of(context)!.viewMoreInsights,
          style: CustomTextStyle.caption4(context)?.copyWith(
            color: appColors.appColorBlue,
          ),
        ),
        const Spacer(),
        const Icon(
          Icons.arrow_forward_ios_rounded,
          size: 10,
          semanticLabel: 'more',
          weight: 1000,
        ),
      ],
    );
  }
}

class AnalyticsCard extends StatelessWidget {
  AnalyticsCard(
    this.airQualityReading,
    this.showHelpTip, {
    super.key,
  });

  final AirQualityReading airQualityReading;
  final bool showHelpTip;
  final GlobalKey _infoToolTipKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return SizedBox(
      height: 251,
      width: double.infinity,
      child: Column(
        children: [
          Expanded(
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: CustomColors.appColorBlue,
                elevation: 0,
                side: const BorderSide(
                  color: Colors.transparent,
                  width: 0,
                ),
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                backgroundColor: Colors.white,
                padding: EdgeInsets.zero,
              ),
              onPressed: () async {
                await navigateToInsights(context, airQualityReading);
              },
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      InkWell(
                        onTap: () {
                          pmInfoDialog(
                            context,
                            airQualityReading.pm2_5,
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(
                            right: 12,
                            top: 12,
                            left: 20,
                          ),
                          child: SizedBox(
                            height: 20,
                            width: 20,
                            child: SvgIcons.information(),
                          ),
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      SizedBox(
                        height: 104,
                        child: Padding(
                          padding: const EdgeInsets.only(
                            left: 24,
                            right: 24,
                          ),
                          child: Row(
                            children: [
                              GestureDetector(
                                child: AnalyticsAvatar(airQualityReading),
                                onTap: () {
                                  ToolTip(context, ToolTipType.info).show(
                                    widgetKey: _infoToolTipKey,
                                  );
                                },
                              ),
                              const SizedBox(
                                width: 16.0,
                              ),
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      airQualityReading.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.headline9(
                                        context,
                                      ),
                                    ),
                                    Text(
                                      airQualityReading.location,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.bodyText4(context)
                                          ?.copyWith(
                                        color: appColors.appColorBlack
                                            .withOpacity(0.3),
                                      ),
                                    ),
                                    const SizedBox(
                                      height: 12,
                                    ),
                                    GestureDetector(
                                      child:
                                          AqiStringContainer(airQualityReading),
                                      onTap: () {
                                        ToolTip(
                                          context,
                                          ToolTipType.info,
                                        ).show(
                                          widgetKey: _infoToolTipKey,
                                        );
                                      },
                                    ),
                                    const SizedBox(
                                      height: 8,
                                    ),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          constraints: BoxConstraints(
                                            maxWidth: MediaQuery.of(context)
                                                    .size
                                                    .width /
                                                3.2,
                                          ),
                                          child: Text(
                                            airQualityReading.dateTime
                                                .analyticsCardString(context),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 8,
                                              color:
                                                  Colors.black.withOpacity(0.3),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(
                                          width: 4.0,
                                        ),
                                        BlocBuilder<DashboardBloc,
                                            DashboardState>(
                                          buildWhen: (previous, current) {
                                            return previous.status !=
                                                current.status;
                                          },
                                          builder: (context, state) {
                                            return CircularLoadingIndicator(
                                              loading: state.status ==
                                                  DashboardStatus.refreshing,
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 30,
                      ),
                      const Padding(
                        padding: EdgeInsets.only(
                          left: 24,
                          right: 24,
                        ),
                        child: AnalyticsMoreInsights(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const Divider(
            color: Color(0xffC4C4C4),
            height: 1.0,
          ),
          SizedBox(
            height: 57,
            child: AirQualityActions(airQualityReading),
          ),
        ],
      ),
    );
  }
}

class MiniAnalyticsCard extends StatefulWidget {
  const MiniAnalyticsCard(
    this.airQualityReading, {
    super.key,
    required this.animateOnClick,
  });

  final AirQualityReading airQualityReading;
  final bool animateOnClick;

  @override
  State<MiniAnalyticsCard> createState() => _MiniAnalyticsCard();
}

class _MiniAnalyticsCard extends State<MiniAnalyticsCard> {
  late final AirQualityReading airQualityReading;
  bool _showHeartAnimation = false;

  @override
  void initState() {
    super.initState();
    airQualityReading = widget.airQualityReading;
  }

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return InkWell(
      onTap: () async {
        await navigateToInsights(context, airQualityReading);
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
            border: Border.fromBorderSide(
              BorderSide(
                color: Colors.transparent,
              ),
            ),
          ),
          child: Column(
            children: [
              const SizedBox(
                height: 5,
              ),
              Container(
                padding: const EdgeInsets.only(left: 32),
                child: Row(
                  children: [
                    MiniAnalyticsAvatar(airQualityReading: airQualityReading),
                    const SizedBox(
                      width: 12,
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Text(
                            airQualityReading.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.headline8(context),
                          ),
                          Text(
                            airQualityReading.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.bodyText4(context)?.copyWith(
                              color: appColors.appColorBlack.withOpacity(0.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: () async => _updateFavPlace(),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 24,
                        ),
                        child: HeartIcon(
                          showAnimation: _showHeartAnimation,
                          placeId: airQualityReading.placeId,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(
                color: Color(0xffC4C4C4),
              ),
              const SizedBox(
                height: 11,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Row(
                  children: [
                    Container(
                      height: 16,
                      width: 16,
                      decoration: BoxDecoration(
                        color: appColors.appColorBlue,
                        borderRadius: const BorderRadius.all(
                          Radius.circular(3.0),
                        ),
                        border: const Border.fromBorderSide(
                          BorderSide(
                            color: Colors.transparent,
                          ),
                        ),
                      ),
                      child: const Icon(
                        Icons.bar_chart,
                        size: 14,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Text(
                      AppLocalizations.of(context)!.viewMoreInsights,
                      style: CustomTextStyle.caption3(context)?.copyWith(
                        color: appColors.appColorBlue,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      height: 16,
                      width: 16,
                      decoration: BoxDecoration(
                        color: appColors.appColorBlue.withOpacity(0.24),
                        borderRadius: const BorderRadius.all(
                          Radius.circular(3.0),
                        ),
                      ),
                      child: const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 10,
                        semanticLabel: 'more',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(
                height: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _updateFavPlace() {
    setState(() => _showHeartAnimation = true);

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _showHeartAnimation = false);
      }
    });

    context.read<FavouritePlaceBloc>().add(
          UpdateFavouritePlace(
            FavouritePlace.fromAirQualityReading(widget.airQualityReading),
          ),
        );
  }
}
