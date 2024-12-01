import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class AnalyticsCardLoader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return InkWell(
      child: Container(
        // margin: const EdgeInsets.only(bottom: 5),
        padding: const EdgeInsets.all(16),
        color: Theme.of(context).highlightColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(
                    children: [
                      SvgPicture.asset('assets/images/shared/pm_rating.svg'),
                      SizedBox(width: 2),
                      Text(
                        " PM2.5",
                        style: TextStyle(
                          color: Color(0xff7A7F87),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(children: [
                    ShimmerText(
                      width: 150,
                      height: 20,
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
                    child: ShimmerContainer(
                      height: 96,
                      width: 96,
                      borderRadius: 100,
                    ),
                  ),
                ),
              ],
            ),
            Divider(color: AppColors.secondaryHeadlineColor),
            ShimmerText(
              width: 200,
              height: 20,
            ),
            SizedBox(height: 16),
            ShimmerText(
              width: 200,
              height: 20,
            ),
          ],
        ),
      ),
    );
  }
}
