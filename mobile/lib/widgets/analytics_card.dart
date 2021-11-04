import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/insights_page.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/share.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import 'custom_widgets.dart';

class AnalyticsCard extends StatefulWidget {
  final Measurement measurement;
  final isRefreshing;

  const AnalyticsCard(this.measurement, this.isRefreshing, {Key? key})
      : super(key: key);

  @override
  _AnalyticsCardState createState() => _AnalyticsCardState();
}

class MapAnalyticsCard extends StatefulWidget {
  final Measurement measurement;
  final closeCallBack;

  const MapAnalyticsCard(this.measurement, this.closeCallBack, {Key? key})
      : super(key: key);

  @override
  _MapAnalyticsCardState createState() => _MapAnalyticsCardState();
}

class _AnalyticsCardState extends State<AnalyticsCard> {
  _AnalyticsCardState();

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.only(top: 12, bottom: 12),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(16.0)),
            border: Border.all(color: Colors.transparent)),
        child: Column(
          children: [
            GestureDetector(
              onTap: () {
                pmInfoDialog(context, widget.measurement);
              },
              child: Container(
                padding: const EdgeInsets.only(right: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    SvgPicture.asset(
                      'assets/icon/info_icon.svg',
                      semanticsLabel: 'Pm2.5',
                      height: 20,
                      width: 20,
                    ),
                  ],
                ),
              ),
            ),

            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return InsightsPage(widget.measurement.site);
                }));
              },
              child: Container(
                padding: const EdgeInsets.only(left: 20, right: 20),
                child: Column(
                  children: [
                    // Details section
                    Row(
                      children: [
                        analyticsAvatar(widget.measurement, 104, 40, 12),
                        const SizedBox(width: 16.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.measurement.site.getName(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 20),
                              ),
                              Text(
                                widget.measurement.site.getLocation(),
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
                                    color: pm2_5ToColor(
                                            widget.measurement.getPm2_5Value())
                                        .withOpacity(0.4),
                                    border:
                                        Border.all(color: Colors.transparent)),
                                child: Text(
                                  pm2_5ToString(
                                      widget.measurement.getPm2_5Value()),
                                  maxLines: 1,
                                  textAlign: TextAlign.center,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: pm2_5TextColor(
                                        widget.measurement.getPm2_5Value()),
                                  ),
                                ),
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
                                        dateToString(
                                            widget.measurement.time, true),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                            fontSize: 8,
                                            color:
                                                Colors.black.withOpacity(0.3)),
                                      )),
                                  const SizedBox(
                                    width: 8.0,
                                  ),
                                  Visibility(
                                    visible: widget.isRefreshing,
                                    child: SizedBox(
                                      height: 8.0,
                                      width: 8.0,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 1.2,
                                        color: ColorConstants.appColorBlue,
                                      ),
                                    ),
                                  ),
                                  Visibility(
                                    visible: !widget.isRefreshing,
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

                    const SizedBox(height: 30),
                    // Analytics
                    Row(
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
                              fontSize: 12, color: ColorConstants.appColorBlue),
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
                  ],
                ),
              ),
            ),

            // Info Icon

            const SizedBox(height: 12),

            const Divider(color: Color(0xffC4C4C4)),
            // Actions
            const SizedBox(
              height: 10,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                  onTap: () {
                    shareMeasurement(widget.measurement);
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
                    await DBHelper().updateFavouritePlaces(
                        widget.measurement.site, context);
                  },
                  child: iconTextButton(Consumer<MeasurementModel>(
                    builder: (context, measurementModel, child) {
                      if (Measurement.isFavouritePlace(
                          measurementModel.favouritePlaces,
                          widget.measurement)) {
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
                  ), 'Favorite'),
                ),
              ],
            ),
            const SizedBox(
              height: 10,
            ),
          ],
        ));
  }
}

class _MapAnalyticsCardState extends State<MapAnalyticsCard> {
  _MapAnalyticsCardState();

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.only(top: 12, bottom: 12),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(16.0)),
            border: Border.all(color: const Color(0xffC4C4C4))),
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

            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (context) {
                  return InsightsPage(widget.measurement.site);
                }));
              },
              child: Container(
                padding: const EdgeInsets.only(left: 20, right: 20),
                child: Column(
                  children: [
                    // Details section
                    Row(
                      children: [
                        analyticsAvatar(widget.measurement, 104, 40, 12),
                        const SizedBox(width: 16.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.measurement.site.getName(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 20),
                              ),
                              Text(
                                widget.measurement.site.getLocation(),
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
                                    color: pm2_5ToColor(
                                            widget.measurement.getPm2_5Value())
                                        .withOpacity(0.4),
                                    border:
                                        Border.all(color: Colors.transparent)),
                                child: Text(
                                  pm2_5ToString(
                                      widget.measurement.getPm2_5Value()),
                                  maxLines: 1,
                                  textAlign: TextAlign.center,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: pm2_5TextColor(
                                        widget.measurement.getPm2_5Value()),
                                  ),
                                ),
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
                                        dateToString(
                                            widget.measurement.time, true),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                            fontSize: 8,
                                            color:
                                                Colors.black.withOpacity(0.3)),
                                      )),
                                  const SizedBox(
                                    width: 8.0,
                                  ),
                                  SvgPicture.asset(
                                    'assets/icon/loader.svg',
                                    semanticsLabel: 'loader',
                                    height: 8,
                                    width: 8,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )
                      ],
                    ),

                    const SizedBox(height: 30),
                    // Analytics
                    Row(
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
                              fontSize: 12, color: ColorConstants.appColorBlue),
                        ),
                        const Spacer(),
                        SvgPicture.asset(
                          'assets/icon/more_arrow.svg',
                          semanticsLabel: 'more',
                          height: 10.99,
                          width: 4,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Info Icon

            const SizedBox(height: 12),

            const Divider(color: Color(0xffC4C4C4)),
            // Actions
            const SizedBox(
              height: 10,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                  onTap: () {
                    shareMeasurement(widget.measurement);
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
                  onTap: () {
                    DBHelper().updateFavouritePlaces(
                        widget.measurement.site, context);
                  },
                  child: iconTextButton(Consumer<MeasurementModel>(
                    builder: (context, measurementModel, child) {
                      if (Measurement.isFavouritePlace(
                          measurementModel.favouritePlaces,
                          widget.measurement)) {
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
                  ), 'Favorite'),
                ),
              ],
            ),
            const SizedBox(
              height: 10,
            ),
          ],
        ));
  }
}
