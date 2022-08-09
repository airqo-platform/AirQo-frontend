import 'dart:async';

import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/date.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import '../../models/enum_constants.dart';
import '../../services/local_storage.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';

class AnalyticsAvatar extends StatelessWidget {
  const AnalyticsAvatar({
    super.key,
    required this.measurement,
  });
  final Measurement measurement;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      width: 104,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Pollutant.pm2_5.color(
          measurement.getPm2_5Value(),
        ),
        border: Border.all(color: Colors.transparent),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            Pollutant.pm2_5.svg(),
            semanticsLabel: 'Pm2.5',
            height: 9.7,
            width: 32.45,
            color: Pollutant.pm2_5.textColor(
              value: measurement.getPm2_5Value(),
            ),
          ),
          Text(
            measurement.getPm2_5Value().toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.insightsAvatar(
              context: context,
              pollutant: Pollutant.pm2_5,
              value: measurement.getPm2_5Value(),
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 12.14,
            width: 32.45,
            color: Pollutant.pm2_5.textColor(
              value: measurement.getPm2_5Value(),
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
    required this.placeDetails,
  });
  final PlaceDetails placeDetails;

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
  const AnalyticsMoreInsights({
    super.key,
    required this.placeDetails,
  });
  final PlaceDetails placeDetails;

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
    required this.measurement,
    required this.placeDetails,
  });

  final Measurement measurement;
  final PlaceDetails placeDetails;

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
        border: Border.all(color: Colors.transparent),
      ),
      child: Column(
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnalyticsAvatar(measurement: measurement),
              const SizedBox(width: 10.0),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AutoSizeText(
                      placeDetails.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 17,
                      style: CustomTextStyle.headline9(context),
                    ),
                    AutoSizeText(
                      placeDetails.location,
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
                      measurement: measurement,
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    Text(
                      dateToShareString(measurement.time),
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
    this.placeDetails,
    this.measurement,
    this.isRefreshing,
    this.showHelpTip, {
    super.key,
  });
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final bool isRefreshing;
  final bool showHelpTip;

  @override
  State<AnalyticsCard> createState() => _AnalyticsCardState();
}

class MapAnalyticsCard extends StatefulWidget {
  const MapAnalyticsCard(
    this.placeDetails,
    this.measurement,
    this.closeCallBack, {
    super.key,
  });
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final VoidCallback closeCallBack;

  @override
  State<MapAnalyticsCard> createState() => _MapAnalyticsCardState();
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
              measurement: widget.measurement,
              placeDetails: widget.placeDetails,
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
                            widget.measurement.getPm2_5Value(),
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
                                  measurement: widget.measurement,
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
                                      widget.placeDetails.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.headline9(context),
                                    ),
                                    Text(
                                      widget.placeDetails.location,
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
                                        measurement: widget.measurement,
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
                                              widget.measurement.time,
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
                      Padding(
                        padding: const EdgeInsets.only(
                          left: 24,
                          right: 24,
                        ),
                        child: AnalyticsMoreInsights(
                          placeDetails: widget.placeDetails,
                        ),
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
                      placeDetails: widget.placeDetails,
                      shareKey: _shareWidgetKey,
                      measurement: widget.measurement,
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
          return InsightsPage(widget.placeDetails);
        },
      ),
    );
  }
}

class _MapAnalyticsCardState extends State<MapAnalyticsCard> {
  final GlobalKey _shareWidgetKey = GlobalKey();

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
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(
            16.0,
          ),
        ),
        border: Border.all(
          color: const Color(0xffC4C4C4),
        ),
      ),
      child: Stack(
        children: [
          RepaintBoundary(
            key: _shareWidgetKey,
            child: AnalyticsShareCard(
              measurement: widget.measurement,
              placeDetails: widget.placeDetails,
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
                        onTap: () => widget.closeCallBack(),
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
                                measurement: widget.measurement,
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
                                      widget.placeDetails.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: CustomTextStyle.headline9(context),
                                    ),
                                    Text(
                                      widget.placeDetails.location,
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
                                    AqiStringContainer(
                                      measurement: widget.measurement,
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
                                              widget.measurement.time,
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
                      Padding(
                        padding: const EdgeInsets.only(
                          left: 24,
                          right: 24,
                        ),
                        child: AnalyticsMoreInsights(
                          placeDetails: widget.placeDetails,
                        ),
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
                      placeDetails: widget.placeDetails,
                      shareKey: _shareWidgetKey,
                      measurement: widget.measurement,
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
          return InsightsPage(widget.placeDetails);
        },
      ),
    );
  }
}

class MiniAnalyticsCard extends StatefulWidget {
  const MiniAnalyticsCard(
    this.placeDetails, {
    super.key,
  });
  final PlaceDetails placeDetails;

  @override
  State<MiniAnalyticsCard> createState() => _MiniAnalyticsCard();
}

class _MiniAnalyticsCard extends State<MiniAnalyticsCard> {
  late Measurement measurement;
  bool showHeartAnimation = false;
  bool isNull = true;

  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return InsightsPage(widget.placeDetails);
            },
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(
              Radius.circular(8.0),
            ),
            border: Border.all(color: Colors.transparent),
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
                    if (!isNull) MiniAnalyticsAvatar(measurement: measurement),
                    if (isNull) const CircularLoadingAnimation(size: 40),
                    const SizedBox(
                      width: 12,
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          AutoSizeText(
                            widget.placeDetails.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.headline8(context),
                          ),
                          AutoSizeText(
                            widget.placeDetails.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: CustomTextStyle.bodyText4(context)?.copyWith(
                              color: appColors.appColorBlack.withOpacity(0.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    InkWell(
                      onTap: () async => updateFavPlace(),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 32,
                          vertical: 24,
                        ),
                        child: Consumer<PlaceDetailsModel>(
                          builder: (context, placeDetailsModel, child) {
                            return HeartIcon(
                              showAnimation: showHeartAnimation,
                              placeDetails: widget.placeDetails,
                            );
                          },
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
                        border: Border.all(
                          color: Colors.transparent,
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
                        border: Border.all(color: Colors.transparent),
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
      ),
    );
  }

  void getMeasurement() {
    DBHelper().getMeasurement(widget.placeDetails.siteId).then(
          (value) => {
            if (value != null && mounted)
              {
                setState(
                  () {
                    measurement = value;
                    isNull = false;
                  },
                ),
              },
          },
        );
  }

  @override
  void initState() {
    super.initState();
    getMeasurement();
  }

  void updateFavPlace() async {
    setState(() => showHeartAnimation = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => showHeartAnimation = false);
      }
    });

    await _appService.updateFavouritePlace(widget.placeDetails, context);
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
