import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/screens/insights_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../themes/light_theme.dart';
import 'custom_widgets.dart';

class MiniAnalyticsCard extends StatefulWidget {
  final PlaceDetails placeDetails;

  const MiniAnalyticsCard(this.placeDetails, {Key? key}) : super(key: key);

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
                        miniAnalyticsAvatar(measurement: measurement),
                      if (isNull) circularLoadingAnimation(40),
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
                            color: Config.appColorPaleBlue,
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
