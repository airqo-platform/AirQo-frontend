import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/insights/insights_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/tooltip.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../../models/enum_constants.dart';
import '../../services/native_api.dart';
import '../../themes/app_theme.dart';
import '../../widgets/buttons.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';

class MapAnalyticsMoreInsights extends StatelessWidget {
  const MapAnalyticsMoreInsights({Key? key, required this.placeDetails})
      : super(key: key);
  final PlaceDetails placeDetails;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 16,
      child: ListTile(
        contentPadding: const EdgeInsets.only(left: 20, right: 30),
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
              style: TextStyle(fontSize: 12, color: Config.appColorBlue),
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
  const AnalyticsMoreInsights({Key? key, required this.placeDetails})
      : super(key: key);
  final PlaceDetails placeDetails;

  @override
  Widget build(BuildContext context) {
    return Row(
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
          style: CustomTextStyle.caption4(context)
              ?.copyWith(color: Config.appColorBlue),
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

class AnalyticsCard extends StatefulWidget {
  const AnalyticsCard(
      this.placeDetails, this.measurement, this.isRefreshing, this.showHelpTip,
      {Key? key})
      : super(key: key);
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final bool isRefreshing;
  final bool showHelpTip;

  @override
  _AnalyticsCardState createState() => _AnalyticsCardState();
}

class MapAnalyticsCard extends StatefulWidget {
  const MapAnalyticsCard(
      this.placeDetails, this.measurement, this.closeCallBack,
      {Key? key})
      : super(key: key);
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final VoidCallback closeCallBack;

  @override
  _MapAnalyticsCardState createState() => _MapAnalyticsCardState();
}

class _AnalyticsCardState extends State<AnalyticsCard> {
  final AppService _appService = AppService();
  bool _showHeartAnimation = false;
  final GlobalKey _globalKey = GlobalKey();
  final GlobalKey _infoToolTipKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return InsightsPage(widget.placeDetails);
        }));
      },
      child: Container(
          constraints: const BoxConstraints(
              maxHeight: 251, minHeight: 251, minWidth: 328, maxWidth: 328),
          child: Stack(
            children: [
              RepaintBoundary(
                  key: _globalKey,
                  child: ShareService.analyticsCardImage(
                      widget.measurement, widget.placeDetails, context)),
              Container(
                padding: const EdgeInsets.only(top: 12, bottom: 12),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.all(Radius.circular(16.0)),
                    border: Border.all(color: Colors.transparent)),
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: () {
                        pmInfoDialog(
                            context, widget.measurement.getPm2_5Value());
                      },
                      child: Container(
                        padding: const EdgeInsets.only(right: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            SizedBox(
                              height: 20,
                              width: 20,
                              child: SvgPicture.asset(
                                'assets/icon/info_icon.svg',
                                semanticsLabel: 'Pm2.5',
                                key: _infoToolTipKey,
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                    SizedBox(
                      height: 104,
                      child: Padding(
                        padding: const EdgeInsets.only(left: 24, right: 24),
                        child: Row(
                          children: [
                            GestureDetector(
                              child: AnalyticsAvatar(
                                  measurement: widget.measurement),
                              onTap: () {
                                ToolTip(context, ToolTipType.info).show(
                                  widgetKey: _infoToolTipKey,
                                );
                              },
                            ),
                            const SizedBox(width: 16.0),
                            // TODO : investigate ellipsis
                            Flexible(
                                child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.placeDetails.name.trimEllipsis(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: CustomTextStyle.headline9(context),
                                ),
                                Text(
                                  widget.placeDetails.location.trimEllipsis(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: CustomTextStyle.bodyText4(context)
                                      ?.copyWith(
                                          color: Config.appColorBlack
                                              .withOpacity(0.3)),
                                ),
                                const SizedBox(
                                  height: 12,
                                ),
                                GestureDetector(
                                  child: AqiStringContainer(
                                      measurement: widget.measurement),
                                  onTap: () {
                                    ToolTip(context, ToolTipType.info).show(
                                      widgetKey: _infoToolTipKey,
                                    );
                                  },
                                ),
                                const SizedBox(
                                  height: 8,
                                ),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                        constraints: BoxConstraints(
                                            maxWidth: MediaQuery.of(context)
                                                    .size
                                                    .width /
                                                3.2),
                                        child: Text(
                                          dateToString(widget.measurement.time)
                                              .trimEllipsis(),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                              fontSize: 8,
                                              color: Colors.black
                                                  .withOpacity(0.3)),
                                        )),
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
                            ))
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),
                    Padding(
                      padding: const EdgeInsets.only(left: 24, right: 24),
                      child: AnalyticsMoreInsights(
                          placeDetails: widget.placeDetails),
                    ),
                    const SizedBox(height: 12),
                    const Divider(
                      color: Color(0xffC4C4C4),
                      height: 1.0,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () {
                            var shareMeasurement = widget.measurement;
                            shareMeasurement.site.name =
                                widget.placeDetails.name;
                            ShareService.shareCard(
                                context, _globalKey, shareMeasurement);
                          },
                          child: Padding(
                            padding: const EdgeInsets.only(top: 17),
                            child: IconTextButton(
                              iconWidget: SvgPicture.asset(
                                'assets/icon/share_icon.svg',
                                semanticsLabel: 'Share',
                                color: Config.greyColor,
                                height: 16,
                                width: 16,
                              ),
                              text: 'Share',
                            ),
                          ),
                        ),
                        GestureDetector(
                            onTap: () async {
                              updateFavPlace();
                            },
                            child: Padding(
                              padding: const EdgeInsets.only(top: 17),
                              child: IconTextButton(
                                  iconWidget: getHeartIcon(), text: 'Favorite'),
                            )),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          )),
    );
    // return ;
  }

  Widget getHeartIcon() {
    if (_showHeartAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset('assets/lottie/animated_heart.json',
            repeat: false, reverse: false, animate: true, fit: BoxFit.cover),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        if (PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces, widget.placeDetails)) {
          return SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 16.67,
            width: 16.67,
          );
        }
        return SvgPicture.asset(
          'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
  }

  void updateFavPlace() async {
    setState(() {
      _showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _appService.updateFavouritePlace(widget.placeDetails, context);
  }
}

class _MapAnalyticsCardState extends State<MapAnalyticsCard> {
  bool _showHeartAnimation = false;
  final GlobalKey _globalKey = GlobalKey();

  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return InsightsPage(widget.placeDetails);
        }));
      },
      child: Container(
          padding: const EdgeInsets.only(top: 12, bottom: 12),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.all(Radius.circular(16.0)),
              border: Border.all(color: const Color(0xffC4C4C4))),
          child: Stack(
            children: [
              RepaintBoundary(
                  key: _globalKey,
                  child: ShareService.analyticsCardImage(
                      widget.measurement, widget.placeDetails, context)),
              Container(
                color: Colors.white,
                child: Column(
                  children: [
                    GestureDetector(
                      onTap: () {
                        widget.closeCallBack();
                      },
                      child: Container(
                        padding: const EdgeInsets.only(right: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            SvgPicture.asset(
                              'assets/icon/close.svg',
                              height: 20,
                              width: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                    Column(
                      children: [
                        // Details section
                        Padding(
                          padding: const EdgeInsets.only(left: 20, right: 20),
                          child: Row(
                            children: [
                              AnalyticsAvatar(measurement: widget.measurement),
                              const SizedBox(width: 16.0),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.placeDetails.name.trimEllipsis(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20),
                                    ),
                                    Text(
                                      widget.placeDetails.location
                                          .trimEllipsis(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.black.withOpacity(0.3)),
                                    ),
                                    const SizedBox(
                                      height: 12,
                                    ),
                                    Container(
                                      padding: const EdgeInsets.fromLTRB(
                                          10.0, 2.0, 10.0, 2.0),
                                      decoration: BoxDecoration(
                                          borderRadius: const BorderRadius.all(
                                              Radius.circular(40.0)),
                                          color: pollutantValueColor(
                                                  value: widget.measurement
                                                      .getPm2_5Value(),
                                                  pollutant: Pollutant.pm2_5)
                                              .withOpacity(0.4),
                                          border: Border.all(
                                              color: Colors.transparent)),
                                      child: AutoSizeText(
                                        pollutantValueString(
                                                value: widget.measurement
                                                    .getPm2_5Value(),
                                                pollutant: Pollutant.pm2_5)
                                            .trimEllipsis(),
                                        maxLines: 1,
                                        maxFontSize: 14,
                                        textAlign: TextAlign.start,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: pollutantTextColor(
                                              value: widget.measurement
                                                  .getPm2_5Value(),
                                              pollutant: Pollutant.pm2_5,
                                              graph: true),
                                        ),
                                      ),
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
                                                    3.2),
                                            child: Text(
                                              dateToString(
                                                      widget.measurement.time)
                                                  .trimEllipsis(),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                  fontSize: 8,
                                                  color: Colors.black
                                                      .withOpacity(0.3)),
                                            )),
                                        const SizedBox(
                                          width: 8.0,
                                        ),
                                        // SvgPicture.asset(
                                        //   'assets/icon/loader.svg',
                                        //   semanticsLabel: 'loader',
                                        //   height: 8,
                                        //   width: 8,
                                        // ),
                                      ],
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),
                        // Analytics
                        MapAnalyticsMoreInsights(
                          placeDetails: PlaceDetails.measurementToPLace(
                              widget.measurement),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Padding(
                      padding: EdgeInsets.only(top: 12, bottom: 6),
                      child: Divider(color: Color(0xffC4C4C4)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        GestureDetector(
                          onTap: () {
                            var shareMeasurement = widget.measurement;
                            shareMeasurement.site.name =
                                widget.placeDetails.name;
                            ShareService.shareCard(
                                context, _globalKey, shareMeasurement);
                          },
                          child: IconTextButton(
                              iconWidget: SvgPicture.asset(
                                'assets/icon/share_icon.svg',
                                color: Config.greyColor,
                                semanticsLabel: 'Share',
                              ),
                              text: 'Share'),
                        ),
                        GestureDetector(
                          onTap: () async {
                            updateFavPlace();
                          },
                          child: IconTextButton(
                              iconWidget: getHeartIcon(), text: 'Favorite'),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 10,
                    ),
                  ],
                ),
              )
            ],
          )),
    );
  }

  Widget getHeartIcon() {
    if (_showHeartAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset('assets/lottie/animated_heart.json',
            repeat: false, reverse: false, animate: true, fit: BoxFit.cover),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        if (PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces, widget.placeDetails)) {
          return SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 16.67,
            width: 16.67,
          );
        }
        return SvgPicture.asset(
          'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
  }

  void updateFavPlace() async {
    setState(() {
      _showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _appService.updateFavouritePlace(widget.placeDetails, context);
  }
}

class MiniAnalyticsCard extends StatefulWidget {
  const MiniAnalyticsCard(this.placeDetails, {Key? key}) : super(key: key);
  final PlaceDetails placeDetails;

  @override
  _MiniAnalyticsCard createState() => _MiniAnalyticsCard();
}

class _MiniAnalyticsCard extends State<MiniAnalyticsCard> {
  late Measurement measurement;
  bool showHeartAnimation = false;
  bool isNull = true;

  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return InsightsPage(widget.placeDetails);
        }));
      },
      child: Padding(
        padding: const EdgeInsets.fromLTRB(0.0, 8.0, 0.0, 8.0),
        child: Container(
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.all(Radius.circular(8.0)),
                border: Border.all(color: Colors.transparent)),
            child: Column(
              children: [
                const SizedBox(
                  height: 24,
                ),
                Container(
                  padding: const EdgeInsets.only(left: 32, right: 32),
                  child: Row(
                    children: [
                      if (!isNull)
                        MiniAnalyticsAvatar(measurement: measurement),
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
                              style: CustomTextStyle.bodyText4(context)
                                  ?.copyWith(
                                      color: Config.appColorBlack
                                          .withOpacity(0.3)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        width: 12,
                      ),
                      Consumer<PlaceDetailsModel>(
                        builder: (context, placeDetailsModel, child) {
                          return GestureDetector(
                              onTap: () async {
                                updateFavPlace();
                              },
                              child: getHeartIcon());
                        },
                      )
                    ],
                  ),
                ),
                const SizedBox(
                  height: 24,
                ),
                const Divider(color: Color(0xffC4C4C4)),
                const SizedBox(
                  height: 11,
                ),
                Container(
                  padding: const EdgeInsets.only(left: 32, right: 32),
                  child: Row(
                    children: [
                      Container(
                        height: 16,
                        width: 16,
                        decoration: BoxDecoration(
                            color: Config.appColorBlue,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(3.0)),
                            border: Border.all(color: Colors.transparent)),
                        child: const Icon(
                          Icons.bar_chart,
                          size: 14,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Text(
                        'View More Insights',
                        style: CustomTextStyle.caption3(context)
                            ?.copyWith(color: Config.appColorBlue),
                      ),
                      const Spacer(),
                      Container(
                        height: 16,
                        width: 16,
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                            color: Config.appColorBlue.withOpacity(0.24),
                            borderRadius:
                                const BorderRadius.all(Radius.circular(3.0)),
                            border: Border.all(color: Colors.transparent)),
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
            )),
      ),
    );
  }

  Widget getHeartIcon() {
    if (showHeartAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset('assets/lottie/animated_heart.json',
            repeat: false, reverse: false, animate: true, fit: BoxFit.cover),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        if (PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces, widget.placeDetails)) {
          return SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 16.67,
            width: 16.67,
          );
        }
        return SvgPicture.asset(
          'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
  }

  void getMeasurement() {
    _appService.dbHelper
        .getMeasurement(widget.placeDetails.siteId)
        .then((value) => {
              if (value != null && mounted)
                {
                  setState(() {
                    measurement = value;
                    isNull = false;
                  })
                }
            });
  }

  @override
  void initState() {
    super.initState();
    getMeasurement();
  }

  void updateFavPlace() async {
    setState(() {
      showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        showHeartAnimation = false;
      });
    });

    await _appService.updateFavouritePlace(widget.placeDetails, context);
  }
}

class EmptyAnalytics extends StatelessWidget {
  const EmptyAnalytics({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Config.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: const Center(
        child: Text('No Analytics'),
      ),
    );
  }
}
