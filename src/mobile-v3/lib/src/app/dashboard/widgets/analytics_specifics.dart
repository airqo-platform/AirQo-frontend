import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_forecast_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class AnalyticsSpecifics extends StatefulWidget {
  final Measurement measurement;
  const AnalyticsSpecifics({super.key, required this.measurement});

  @override
  State<AnalyticsSpecifics> createState() => _AnalyticsSpecificsState();
}

class _AnalyticsSpecificsState extends State<AnalyticsSpecifics> {
  double containerHeight = 90;
  bool expanded = false;

  void toggleContainer() {
    setState(() {
      if (expanded) {
        containerHeight = 90;
        expanded = false;
      } else {
        containerHeight = 180;
        expanded = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Column(
              children: [
                SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(widget.measurement.siteDetails!.city!,
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 24,
                            color: AppColors.textMedium)),
                    InkWell(
                      onTap: () => Navigator.pop(context),
                      child: Icon(
                        Icons.close,
                        color: AppColors.textMedium,
                      ),
                    )
                  ],
                ),
                SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text("Today",
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 20,
                            color: AppColors.textMedium)),
                    Row(children: [
                      // Container(
                      //   decoration: BoxDecoration(
                      //       color: Theme.of(context).highlightColor,
                      //       borderRadius: BorderRadius.circular(100)),
                      //   height: 40,
                      //   width: 52,
                      //   child: Center(
                      //     child: Padding(
                      //       padding: const EdgeInsets.only(left: 8.0),
                      //       child: Icon(
                      //         size: 20,
                      //         Icons.arrow_back_ios,
                      //         color: AppColors.boldHeadlineColor,
                      //       ),
                      //     ),
                      //   ),
                      // ),
                      SizedBox(width: 8),
                      // Container(
                      //   decoration: BoxDecoration(
                      //       color: Theme.of(context).highlightColor,
                      //       borderRadius: BorderRadius.circular(100)),
                      //   height: 40,
                      //   width: 52,
                      //   child: Center(
                      //     child: Icon(
                      //       Icons.arrow_forward_ios,
                      //       size: 20,
                      //       color: AppColors.boldHeadlineColor,
                      //     ),
                      //   ),
                      // )
                    ])
                  ],
                ),
                SizedBox(height: 16),
                AnalyticsForecastWidget(
                  siteId: widget.measurement.siteDetails!.id!,
                ),
                SizedBox(height: 16),
              ],
            ),
          ),
          AnalyticsCard(widget.measurement),
          // Container(
          //   padding: const EdgeInsets.symmetric(horizontal: 16),
          //   height: 41,
          //   color: Theme.of(context).highlightColor,
          //   child: Row(
          //     children: [
          //       SizedBox(
          //         child: Row(
          //           children: [
          //             SvgPicture.asset("assets/icons/share-icon.svg"),
          //             SizedBox(width: 6),
          //             Text("Share"),
          //           ],
          //         ),
          //       ),
          //       SizedBox(width: 24),
          //       SizedBox(
          //         child: Row(
          //           children: [
          //             SvgPicture.asset("assets/icons/save-icon.svg"),
          //             SizedBox(width: 6),
          //             Text("Save"),
          //           ],
          //         ),
          //       ),
          //       Spacer(),
          //       Icon(Icons.more_vert)
          //     ],
          //   ),
          // ),
          // SizedBox(height: 8 + 4),
          // InkWell(
          //   onTap: () => toggleContainer(),
          //   child: AnimatedContainer(
          //       duration: Duration(milliseconds: 300),
          //       padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          //       height: containerHeight,
          //       color: Theme.of(context).highlightColor,
          //       child: Container(
          //         padding: const EdgeInsets.symmetric(horizontal: 16),
          //         child: Column(
          //           children: [
          //             Row(
          //               mainAxisAlignment: MainAxisAlignment.spaceBetween,
          //               crossAxisAlignment: CrossAxisAlignment.center,
          //               children: [
          //                 Text(
          //                   "🚨 Air Quality Alerts",
          //                   style: TextStyle(
          //                       fontSize: 16, fontWeight: FontWeight.w600),
          //                 ),
          //                 Icon(
          //                   expanded 
          //                       ? Icons.arrow_drop_up 
          //                       : Icons.arrow_drop_down
          //                 )
          //               ],
          //             ),
          //             if (expanded) ...[
          //               SizedBox(height: 16),
          //               Text(""),
          //             ],
          //           ],
          //         ),
          //         decoration: BoxDecoration(
          //             color: Theme.of(context).scaffoldBackgroundColor,
          //             borderRadius: BorderRadius.circular(44)),
          //       )),
          // )
        ],
      ),
    );
  }
}