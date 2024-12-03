import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_details.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AnalyticsCard extends StatelessWidget {
  final Measurement measurement;

  const AnalyticsCard(this.measurement);
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => showBottomSheet(
          backgroundColor: Colors.transparent,
          context: context,
          builder: (context) {
            return AnalyticsDetails(
              measurement: measurement,
            );
          }),
      child: Container(
        color: Theme.of(context).highlightColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 4, top: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                SvgPicture.asset(Theme.of(context).brightness ==
                                        Brightness.light
                                    ? "assets/images/shared/pm_rating_white.svg"
                                    : 'assets/images/shared/pm_rating.svg'),
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
                                measurement.pm25!.value != null
                                    ? measurement.pm25!.value!
                                        .toStringAsFixed(2)
                                    : "-",
                                style: Theme.of(context).textTheme.titleLarge
                              ),
                              Text(" μg/m3",
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 20,
                                      color: AppColors.secondaryHeadlineColor))
                            ]),
                          ]),
                      SizedBox(
                        child: Center(
                          child: SvgPicture.asset(
                            getAirQualityIcon(measurement.pm25!.value ?? 10),
                            height: 96,
                            width: 96,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Divider(
                thickness: .5,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.black
                    : Colors.white),
            Padding(
              padding: const EdgeInsets.only(
                  left: 16, right: 16, bottom: 16, top: 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(measurement.siteDetails!.locationName ?? "",
                      style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: AppColors.boldHeadlineColor)),
                  Text(measurement.healthTips![0].description!,
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: AppColors.secondaryHeadlineColor))
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
