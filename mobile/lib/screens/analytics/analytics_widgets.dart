import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

class AnalyticsAvatar extends StatelessWidget {
  const AnalyticsAvatar({
    super.key,
    required this.airQualityReading,
  });
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
        border: Border.fromBorderSide(
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
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
            ),
          ),
          Text(
            airQualityReading.pm2_5.toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.insightsAvatar(
              pollutant: Pollutant.pm2_5,
              value: airQualityReading.pm2_5,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 12.14,
            width: 32.45,
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class MapAnalyticsMoreInsights extends StatelessWidget {
  const MapAnalyticsMoreInsights({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return SizedBox(
      height: 16,
      child: ListTile(
        contentPadding: const EdgeInsets.only(
          left: 20,
          right: 30,
        ),
        title: Row(
          children: [
            SvgPicture.asset(
              'assets/icon/chart.svg',
              semanticsLabel: 'chart',
              height: 16,
              width: 16,
            ),
            const SizedBox(width: 8.0),
            Text(
              'View More Insights',
              style: TextStyle(
                fontSize: 12,
                color: appColors.appColorBlue,
              ),
            ),
            const Spacer(),
            SvgPicture.asset(
              'assets/icon/more_arrow.svg',
              semanticsLabel: 'more',
              height: 6.99,
              width: 4,
            ),
          ],
        ),
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
        SvgPicture.asset(
          'assets/icon/chart.svg',
          semanticsLabel: 'chart',
          height: 16,
          width: 16,
        ),
        const SizedBox(
          width: 8.0,
        ),
        Text(
          'View More Insights',
          style: CustomTextStyle.caption4(context)?.copyWith(
            color: appColors.appColorBlue,
          ),
        ),
        const Spacer(),
        SvgPicture.asset(
          'assets/icon/more_arrow.svg',
          semanticsLabel: 'more',
          height: 6.99,
          width: 4,
        ),
      ],
    );
  }
}

class AnalyticsShareCard extends StatelessWidget {
  const AnalyticsShareCard({
    super.key,
    required this.airQualityReading,
  });

  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      constraints: const BoxConstraints(
        maxHeight: 200,
        maxWidth: 300,
      ),
      padding: const EdgeInsets.symmetric(
        vertical: 5,
        horizontal: 8,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(16.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnalyticsAvatar(airQualityReading: airQualityReading),
              const SizedBox(width: 10.0),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AutoSizeText(
                      airQualityReading.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 17,
                      style: CustomTextStyle.headline9(context),
                    ),
                    AutoSizeText(
                      airQualityReading.location,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 12,
                      style: CustomTextStyle.bodyText4(context)?.copyWith(
                        color: appColors.appColorBlack.withOpacity(0.3),
                      ),
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    AqiStringContainer(
                      airQualityReading: airQualityReading,
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    Text(
                      dateToShareString(airQualityReading.dateTime),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 8,
                        color: Colors.black.withOpacity(0.3),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '© ${DateTime.now().year} AirQo',
                style: TextStyle(
                  fontSize: 9,
                  color: appColors.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'www.airqo.africa',
                style: TextStyle(
                  fontSize: 9,
                  color: appColors.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class AnalyticsCard extends StatefulWidget {
  const AnalyticsCard(
    this.airQualityReading,
    this.isRefreshing,
    this.showHelpTip, {
    super.key,
  });
  final AirQualityReading airQualityReading;
  final bool isRefreshing;
  final bool showHelpTip;

  @override
  State<AnalyticsCard> createState() => _AnalyticsCardState();
}

class MapAnalyticsCard extends StatefulWidget {
  const MapAnalyticsCard({
    super.key,
    required this.airQualityReading,
  });
  final AirQualityReading airQualityReading;

  @override
  State<MapAnalyticsCard> createState() => _MapAnalyticsCardState();
}

class _MapAnalyticsCardState extends State<MapAnalyticsCard> {
  final GlobalKey _shareWidgetKey = GlobalKey();
  late final AirQualityReading _airQualityReading;

  @override
  void initState() {
    super.initState();
    _airQualityReading = widget.airQualityReading;
  }

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return ValueListenableBuilder<Box<AirQualityReading>>(
      valueListenable: Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
          .listenable(keys: [_airQualityReading.placeId]),
      builder: (context, box, widget) {
        final airQualityReadings = box.values
            .cast<AirQualityReading>()
            .where((element) => element.placeId == _airQualityReading.placeId)
            .toList();
        var reading = _airQualityReading;
        if (airQualityReadings.isNotEmpty) {
          reading = _airQualityReading.copyWith(
            dateTime: airQualityReadings.first.dateTime,
            pm2_5: airQualityReadings.first.pm2_5,
            pm10: airQualityReadings.first.pm10,
          );
        }

        return Container(
          constraints: const BoxConstraints(
            maxHeight: 251,
            minHeight: 251,
            minWidth: 328,
            maxWidth: 328,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(
                16.0,
              ),
            ),
            border: Border.fromBorderSide(
              BorderSide(
                color: Color(0xffC4C4C4),
              ),
            ),
          ),
          child: Stack(
            children: [
              RepaintBoundary(
                key: _shareWidgetKey,
                child: AnalyticsShareCard(airQualityReading: reading),
              ),
              InkWell(
                onTap: () async => _goToInsights(),
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(
                      Radius.circular(16.0),
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Spacer(),
                          InkWell(
                            onTap: () {
                              context
                                  .read<MapBloc>()
                                  .add(ShowRegionSites(region: reading.region));
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
                                child: SvgPicture.asset(
                                  'assets/icon/close.svg',
                                  height: 20,
                                  width: 20,
                                ),
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
                                  AnalyticsAvatar(
                                    airQualityReading: reading,
                                  ),
                                  const SizedBox(
                                    width: 16.0,
                                  ),
                                  // TODO : investigate ellipsis
                                  Flexible(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          reading.name,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: CustomTextStyle.headline9(
                                            context,
                                          ),
                                        ),
                                        Text(
                                          reading.location,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style:
                                              CustomTextStyle.bodyText4(context)
                                                  ?.copyWith(
                                            color: appColors.appColorBlack
                                                .withOpacity(0.3),
                                          ),
                                        ),
                                        const SizedBox(
                                          height: 12,
                                        ),
                                        AqiStringContainer(
                                          airQualityReading: reading,
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
                                                dateToString(
                                                  reading.dateTime,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontSize: 8,
                                                  color: Colors.black
                                                      .withOpacity(0.3),
                                                ),
                                              ),
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
                          const SizedBox(height: 12),
                          const Divider(
                            color: Color(0xffC4C4C4),
                            height: 1.0,
                          ),
                        ],
                      ),
                      Expanded(
                        child: AnalyticsCardFooter(
                          shareKey: _shareWidgetKey,
                          airQualityReading: reading,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _goToInsights() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return InsightsPage(_airQualityReading);
        },
      ),
    );
  }
}

class _AnalyticsCardState extends State<AnalyticsCard> {
  final GlobalKey _shareWidgetKey = GlobalKey();
  final GlobalKey _infoToolTipKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      constraints: const BoxConstraints(
        maxHeight: 251,
        minHeight: 251,
        minWidth: 328,
        maxWidth: 328,
      ),
      child: Stack(
        children: [
          RepaintBoundary(
            key: _shareWidgetKey,
            child: AnalyticsShareCard(
              airQualityReading: widget.airQualityReading,
            ),
          ),
          InkWell(
            onTap: () async => _goToInsights(),
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(
                  Radius.circular(16.0),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Spacer(),
                      InkWell(
                        onTap: () {
                          pmInfoDialog(
                            context,
                            widget.airQualityReading.pm2_5,
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
                            child: SvgPicture.asset(
                              'assets/icon/info_icon.svg',
                              semanticsLabel: 'Pm2.5',
                              key: _infoToolTipKey,
                            ),
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
                                child: AnalyticsAvatar(
                                  airQualityReading: widget.airQualityReading,
                                ),
                                onTap: () {
                                  ToolTip(context, ToolTipType.info).show(
                                    widgetKey: _infoToolTipKey,
                                  );
                                },
                              ),
                              const SizedBox(
                                width: 16.0,
                              ),
                              // TODO : investigate ellipsis
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.airQualityReading.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.headline9(context),
                                    ),
                                    Text(
                                      widget.airQualityReading.location,
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
                                      child: AqiStringContainer(
                                        airQualityReading:
                                            widget.airQualityReading,
                                      ),
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
                                            dateToString(
                                              widget.airQualityReading.dateTime,
                                            ),
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
                                        Visibility(
                                          visible: widget.isRefreshing,
                                          child: SvgPicture.asset(
                                            'assets/icon/loader.svg',
                                            semanticsLabel: 'loader',
                                            height: 8.0,
                                            width: 8.0,
                                          ),
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
                      const SizedBox(height: 12),
                      const Divider(
                        color: Color(0xffC4C4C4),
                        height: 1.0,
                      ),
                    ],
                  ),
                  Expanded(
                    child: AnalyticsCardFooter(
                      shareKey: _shareWidgetKey,
                      airQualityReading: widget.airQualityReading,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _goToInsights() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return InsightsPage(widget.airQualityReading);
        },
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
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return InsightsPage(airQualityReading);
            },
          ),
        );
      },
      child: ValueListenableBuilder<Box<AirQualityReading>>(
        valueListenable: Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
            .listenable(keys: [airQualityReading.placeId]),
        builder: (context, box, widget) {
          final airQualityReadings = box.values
              .where((element) => element.placeId == airQualityReading.placeId)
              .toList();
          var reading = airQualityReading;
          if (airQualityReadings.isNotEmpty) {
            reading = airQualityReadings.first;
          }

          return Padding(
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
                        MiniAnalyticsAvatar(airQualityReading: reading),
                        const SizedBox(
                          width: 12,
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Text(
                                reading.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.headline8(context),
                              ),
                              Text(
                                reading.location,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: CustomTextStyle.bodyText4(context)
                                    ?.copyWith(
                                  color:
                                      appColors.appColorBlack.withOpacity(0.3),
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
                              airQualityReading: reading,
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
                          'View More Insights',
                          style: CustomTextStyle.caption3(context)?.copyWith(
                            color: appColors.appColorBlue,
                          ),
                        ),
                        const Spacer(),
                        Container(
                          height: 16,
                          width: 16,
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: appColors.appColorBlue.withOpacity(0.24),
                            borderRadius: const BorderRadius.all(
                              Radius.circular(3.0),
                            ),
                            border: const Border.fromBorderSide(
                              BorderSide(
                                color: Colors.transparent,
                              ),
                            ),
                          ),
                          child: SvgPicture.asset(
                            'assets/icon/more_arrow.svg',
                            semanticsLabel: 'more',
                            height: 6.99,
                            width: 4,
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
          );
        },
      ),
    );
  }

  void _updateFavPlace() async {
    if (!Hive.box<FavouritePlace>(HiveBox.favouritePlaces)
        .keys
        .contains(widget.airQualityReading.placeId)) {
      setState(() => _showHeartAnimation = true);

      if (!mounted) return;
      Future.delayed(const Duration(seconds: 2), () {
        setState(() => _showHeartAnimation = false);
      });
    }

    await HiveService.updateFavouritePlaces(widget.airQualityReading);
  }
}

class EmptyAnalytics extends StatelessWidget {
  const EmptyAnalytics({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Container(
      color: appColors.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: const Center(
        child: Text('No Analytics'),
      ),
    );
  }
}
