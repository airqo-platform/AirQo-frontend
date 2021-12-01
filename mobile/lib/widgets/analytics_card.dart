import 'dart:async';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/insights_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import 'custom_shimmer.dart';
import 'custom_widgets.dart';

Widget analyticsCardLoading() {
  return Container(
    padding: const EdgeInsets.only(top: 32, bottom: 22),
    constraints: const BoxConstraints(
      maxHeight: 251,
      minHeight: 251,
    ),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: const BorderRadius.all(Radius.circular(16.0)),
      border: Border.all(color: Colors.transparent),
    ),
    child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Row(
            children: [
              circularLoadingAnimation(104),
              const SizedBox(width: 16.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    sizedContainerLoadingAnimation(15, 139, 1000),
                    const SizedBox(
                      height: 9,
                    ),
                    sizedContainerLoadingAnimation(10, 115, 1000),
                    const SizedBox(
                      height: 12,
                    ),
                    sizedContainerLoadingAnimation(24, 115, 1000),
                  ],
                ),
              )
            ],
          ),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: containerLoadingAnimation(9, 1000),
        ),
        const Divider(color: Color(0xffC4C4C4)),
        const SizedBox(
          height: 16,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            sizedContainerLoadingAnimation(20, 105, 1000),
            sizedContainerLoadingAnimation(20, 105, 1000),
          ],
        ),
      ],
    ),
  );
}

Widget mapMoreInsightsWidget(PlaceDetails placeDetails) {
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
            style: TextStyle(fontSize: 12, color: ColorConstants.appColorBlue),
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

Widget moreInsightsWidget(PlaceDetails placeDetails, context) {
  return SizedBox(
    height: 16,
    child: ListTile(
      contentPadding: const EdgeInsets.only(left: 24, right: 24),
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (context) {
          return InsightsPage(placeDetails);
        }));
      },
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
            style: TextStyle(fontSize: 12, color: ColorConstants.appColorBlue),
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

class AnalyticsCard extends StatefulWidget {
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final bool isRefreshing;
  final bool showHelpTip;

  const AnalyticsCard(
      this.placeDetails, this.measurement, this.isRefreshing, this.showHelpTip,
      {Key? key})
      : super(key: key);

  @override
  _AnalyticsCardState createState() => _AnalyticsCardState();
}

class MapAnalyticsCard extends StatefulWidget {
  final PlaceDetails placeDetails;
  final Measurement measurement;
  final VoidCallback closeCallBack;

  const MapAnalyticsCard(
      this.placeDetails, this.measurement, this.closeCallBack,
      {Key? key})
      : super(key: key);

  @override
  _MapAnalyticsCardState createState() => _MapAnalyticsCardState();
}

class _AnalyticsCardState extends State<AnalyticsCard> {
  final DBHelper _dbHelper = DBHelper();
  bool _showHeartAnimation = false;
  final GlobalKey _globalKey = GlobalKey();
  final String _infoToolTipText = 'Tap this icon'
      ' to understand what air quality analytics mean';
  final GlobalKey _infoToolTipKey = GlobalKey();
  final CustomAuth _customAuth = CustomAuth();

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
            maxHeight: 251,
            minHeight: 251,
          ),
          padding: const EdgeInsets.only(top: 12, bottom: 12),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.all(Radius.circular(16.0)),
              border: Border.all(color: Colors.transparent)),
          child: Stack(
            children: [
              RepaintBoundary(
                  key: _globalKey,
                  child: shareCardImage(
                      widget.measurement, widget.placeDetails, context)),
              Container(
                color: Colors.white,
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
                    Column(
                      children: [
                        // Details section
                        SizedBox(
                          height: 104,
                          child: Padding(
                            padding: const EdgeInsets.only(left: 24, right: 24),
                            child: Row(
                              children: [
                                GestureDetector(
                                  child: analyticsAvatar(
                                      widget.measurement, 104, 40, 12),
                                  onTap: () {
                                    showTipText(_infoToolTipText,
                                        _infoToolTipKey, context, () {}, false);
                                  },
                                ),
                                const SizedBox(width: 16.0),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        widget.placeDetails.getName(),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 20),
                                      ),
                                      Text(
                                        widget.placeDetails.getLocation(),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                            fontSize: 14,
                                            color:
                                                Colors.black.withOpacity(0.3)),
                                      ),
                                      const SizedBox(
                                        height: 12,
                                      ),
                                      GestureDetector(
                                        child: Container(
                                          padding: const EdgeInsets.fromLTRB(
                                              10.0, 2.0, 10.0, 2.0),
                                          decoration: BoxDecoration(
                                              borderRadius:
                                                  const BorderRadius.all(
                                                      Radius.circular(40.0)),
                                              color: pm2_5ToColor(widget
                                                      .measurement
                                                      .getPm2_5Value())
                                                  .withOpacity(0.4),
                                              border: Border.all(
                                                  color: Colors.transparent)),
                                          child: Text(
                                            pm2_5ToString(widget.measurement
                                                .getPm2_5Value()),
                                            maxLines: 1,
                                            textAlign: TextAlign.start,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: pm2_5TextColor(widget
                                                  .measurement
                                                  .getPm2_5Value()),
                                            ),
                                          ),
                                        ),
                                        onTap: () {
                                          showTipText(
                                              _infoToolTipText,
                                              _infoToolTipKey,
                                              context,
                                              () {},
                                              false);
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
                                                  maxWidth:
                                                      MediaQuery.of(context)
                                                              .size
                                                              .width /
                                                          3.2),
                                              child: Text(
                                                dateToString(
                                                    widget.measurement.time),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                    fontSize: 8,
                                                    color: Colors.black
                                                        .withOpacity(0.3)),
                                              )),

                                          // Visibility(
                                          //   visible: widget.isRefreshing,
                                          //   child: SizedBox(
                                          //     height: 8.0,
                                          //     width: 8.0,
                                          //     child: CircularProgressIndicator(
                                          //       strokeWidth: 1.2,
                                          //       color: ColorConstants
                                          //       .appColorBlue,
                                          //     ),
                                          //   ),
                                          // ),
                                          const SizedBox(
                                            width: 8.0,
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
                                )
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        // Analytics
                        moreInsightsWidget(widget.placeDetails, context),
                        const SizedBox(height: 12),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.only(top: 12, bottom: 6),
                      child: Divider(color: Color(0xffC4C4C4)),
                    ),
                    // const Divider(color: Color(0xffC4C4C4)),

                    SizedBox(
                      height: 28,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          GestureDetector(
                            onTap: () {
                              var shareMeasurement = widget.measurement;
                              shareMeasurement.site.name =
                                  widget.placeDetails.getName();
                              shareMeasurement.site.description =
                                  widget.placeDetails.getName();
                              shareCard(context, _globalKey, shareMeasurement);
                            },
                            child: iconTextButton(
                                SvgPicture.asset(
                                  'assets/icon/share_icon.svg',
                                  semanticsLabel: 'Share',
                                  color: ColorConstants.greyColor,
                                ),
                                'Share'),
                          ),
                          GestureDetector(
                            onTap: () async {
                              updateFavPlace();
                            },
                            child: iconTextButton(getHeartIcon(), 'Favorite'),
                          ),
                        ],
                      ),
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

  @override
  void initState() {
    showTips();
    super.initState();
  }

  void showTips() {
    return;
    if (widget.showHelpTip) {
      Future.delayed(const Duration(seconds: 2), () {
        try {
          showTipText(_infoToolTipText, _infoToolTipKey, context, () {}, false);
        } catch (e) {
          debugPrint(e.toString());
        }
      });
    }
  }

  void updateFavPlace() async {
    setState(() {
      _showHeartAnimation = true;
    });
    Future.delayed(const Duration(seconds: 2), () async {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _dbHelper.updateFavouritePlaces(
        widget.placeDetails, context, _customAuth.getId());
  }
}

class _MapAnalyticsCardState extends State<MapAnalyticsCard> {
  final DBHelper _dbHelper = DBHelper();
  bool _showHeartAnimation = false;
  final GlobalKey _globalKey = GlobalKey();
  final CustomAuth _customAuth = CustomAuth();

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
              borderRadius: BorderRadius.all(const Radius.circular(16.0)),
              border: Border.all(color: const Color(0xffC4C4C4))),
          child: Stack(
            children: [
              RepaintBoundary(
                  key: _globalKey,
                  child: shareCardImage(
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
                              analyticsAvatar(widget.measurement, 104, 40, 12),
                              const SizedBox(width: 16.0),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      widget.placeDetails.getName(),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20),
                                    ),
                                    Text(
                                      widget.placeDetails.getLocation(),
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
                                          color: pm2_5ToColor(widget.measurement
                                                  .getPm2_5Value())
                                              .withOpacity(0.4),
                                          border: Border.all(
                                              color: Colors.transparent)),
                                      child: Text(
                                        pm2_5ToString(
                                            widget.measurement.getPm2_5Value()),
                                        maxLines: 1,
                                        textAlign: TextAlign.start,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: pm2_5TextColor(widget
                                              .measurement
                                              .getPm2_5Value()),
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
                                                  widget.measurement.time),
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
                        mapMoreInsightsWidget(
                          PlaceDetails.measurementToPLace(widget.measurement),
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
                                widget.placeDetails.getName();
                            shareMeasurement.site.description =
                                widget.placeDetails.getName();
                            shareCard(context, _globalKey, shareMeasurement);
                          },
                          child: iconTextButton(
                              SvgPicture.asset(
                                'assets/icon/share_icon.svg',
                                color: ColorConstants.greyColor,
                                semanticsLabel: 'Share',
                              ),
                              'Share'),
                        ),
                        GestureDetector(
                          onTap: () async {
                            updateFavPlace();
                          },
                          child: iconTextButton(getHeartIcon(), 'Favorite'),
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
    Future.delayed(const Duration(seconds: 2), () async {
      setState(() {
        _showHeartAnimation = false;
      });
    });
    await _dbHelper.updateFavouritePlaces(
        widget.placeDetails, context, _customAuth.getId());
  }
}
