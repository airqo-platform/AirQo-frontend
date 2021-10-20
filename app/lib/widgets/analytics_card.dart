import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';

import 'custom_widgets.dart';

class AnalyticsCard extends StatelessWidget {
  final Measurement measurement;

  const AnalyticsCard(this.measurement, {Key? key}) : super(key: key);

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
            Container(
              padding: const EdgeInsets.only(right: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    height: 20,
                    width: 20,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: ColorConstants.appColorPaleBlue,
                        border: Border.all(color: Colors.transparent)),
                    child: const Icon(
                      Icons.info_outline,
                      size: 15,
                    ),
                  )
                ],
              ),
            ),

            Container(
              padding: const EdgeInsets.only(left: 24, right: 24),
              child: Column(
                children: [
                  // Details section
                  Row(
                    children: [
                      Container(
                        height: 104,
                        width: 104,
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: pm2_5ToColor(measurement.getPm2_5Value()),
                            border: Border.all(color: Colors.transparent)),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const Spacer(),
                            RichText(
                                text: TextSpan(
                              style: DefaultTextStyle.of(context).style,
                              children: <TextSpan>[
                                TextSpan(
                                  text: 'PM',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: ColorConstants.appColor,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                TextSpan(
                                  text: '2.5',
                                  style: TextStyle(
                                    fontSize: 8,
                                    color: ColorConstants.appColor,
                                  ),
                                )
                              ],
                            )),
                            Text(
                              '${measurement.getPm2_5Value().toStringAsFixed(0)}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.robotoMono(
                                  fontStyle: FontStyle.normal, fontSize: 40),
                            ),
                            const Text(
                              'µg/m\u00B3',
                              style: TextStyle(fontSize: 12),
                            ),
                            const Spacer(),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${measurement.site.getName()}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 20),
                            ),
                            Text(
                              '${measurement.site.getLocation()}',
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
                                  color:
                                      pm2_5ToColor(measurement.getPm2_5Value()),
                                  border:
                                      Border.all(color: Colors.transparent)),
                              child: Text(
                                pmToString(measurement.getPm2_5Value()),
                                maxLines: 1,
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                            const SizedBox(
                              height: 8,
                            ),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Updated today at '
                                  '${dateToString(measurement.time, true)}',
                                  style: TextStyle(
                                      fontSize: 8,
                                      color: Colors.black.withOpacity(0.3)),
                                ),
                                const SizedBox(
                                  width: 8.0,
                                )
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
                      Container(
                        height: 16,
                        width: 16,
                        decoration: BoxDecoration(
                            color: ColorConstants.appColorBlue,
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
                        style: TextStyle(
                            fontSize: 12, color: ColorConstants.appColorBlue),
                      ),
                      const Spacer(),
                      Container(
                        height: 16,
                        width: 16,
                        decoration: BoxDecoration(
                            color: ColorConstants.appColorPaleBlue,
                            borderRadius:
                                const BorderRadius.all(Radius.circular(3.0)),
                            border: Border.all(color: Colors.transparent)),
                        child: Icon(
                          Icons.arrow_forward_ios,
                          size: 12,
                          color: ColorConstants.appColorBlue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Info Icon

            const SizedBox(height: 12),

            const Divider(color: Color(0xffC4C4C4)),
            // Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                iconTextButton(
                    SvgPicture.asset(
                      'assets/icon/share_icon.svg',
                      semanticsLabel: 'Share',
                    ),
                    'Share'),
                iconTextButton(
                    SvgPicture.asset(
                      'assets/icon/fav_icon.svg',
                      semanticsLabel: 'Favorite',
                    ),
                    'Favorite'),
              ],
            )
          ],
        ));
  }
}
