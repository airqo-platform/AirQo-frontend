import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
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
    // final appColors = Theme.of(context).extension<AppColors>()!;


    return InkWell(
      onTap: () => navigateToInsights(context, this.airQualityReading),
      child: Container(
        margin: const EdgeInsets.only(bottom: 5),
        padding: const EdgeInsets.all(16),
        color: CustomColors.appColorLightBlue,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(
                    children: [
                      SvgPicture.asset('assets/images/pm_rating.svg'),
                      SizedBox(width: 2),
                      Text(
                        " PM2.5",
                        style: TextStyle(
                          color: Color(0xff7A7F87),
                        ),
                      ),
                    ],
                  ),
                  Row(children: [
                    Text(
                      airQualityReading.pm2_5.toString(),
                      style: TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w600,
                          color: Color(0xff57D175)),
                    ),
                    Text(" μg/m3",
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 20,
                            color: Color(0xff536A87)))
                  ]),
                ]),
      
                // this is for the image of the air quality face guy.
      
                SizedBox(
                    child: Center(
                        child: Image.asset(
                  "assets/images/happy.png",
                  height: 96,
                  width: 96,
                ))),
              ],
            ),
            Divider(color: Colors.white),
            Text(airQualityReading.region,
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: Color(0xff6F87A1))),
            Text(airQualityReading.airQuality.description,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xff6F87A1)))
          ],
        ),
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
                    AutoSizeText(
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
