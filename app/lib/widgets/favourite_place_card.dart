import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:app/screens/insights_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'custom_widgets.dart';

class FavouritePlacesCard extends StatelessWidget {
  final Measurement measurement;

  const FavouritePlacesCard(this.measurement, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: Container(
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.all(Radius.circular(16.0)),
              border: Border.all(color: Colors.transparent)),
          child: Column(
            children: [
              const SizedBox(
                height: 12,
              ),
              Container(
                padding: const EdgeInsets.only(left: 32, right: 32),
                child: Row(
                  children: [
                    favPlaceAvatar(context, measurement, 40),
                    const SizedBox(
                      width: 12,
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Text(
                            '${measurement.site.getName()}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            '${measurement.site.getLocation()}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 14,
                                color: Colors.black.withOpacity(0.3)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    SvgPicture.asset(
                      'assets/icon/fav_icon.svg',
                      semanticsLabel: 'Favorite',
                    ),
                  ],
                ),
              ),

              const SizedBox(
                height: 12,
              ),

              const Divider(color: Color(0xffC4C4C4)),

              const SizedBox(
                height: 12,
              ),
              GestureDetector(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) {
                    return InsightsView(measurement.site);
                  }));
                },
                child: Container(
                  padding: const EdgeInsets.only(left: 32, right: 32),
                  child: Row(
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
                ),
              ),

              const SizedBox(
                height: 12,
              ),

              // GestureDetector(
              //   onTap: () {
              //     Navigator.push(context, MaterialPageRoute(builder: (context) {
              //       return InsightsView(measurement.site);
              //     }));
              //   },
              //   child: Container(
              //     padding: const EdgeInsets.only(left: 24, right: 24),
              //     child: Column(
              //       children: [
              //         // Details section
              //         Row(
              //           children: [
              //             analyticsAvatar(context, measurement, 104),
              //             const SizedBox(width: 16),
              //             Expanded(
              //               child: Column(
              //                 crossAxisAlignment: CrossAxisAlignment.start,
              //                 children: [
              //                   Text(
              //                     '${measurement.site.getName()}',
              //                     maxLines: 1,
              //                     overflow: TextOverflow.ellipsis,
              //                     style: const TextStyle(
              //                         fontWeight: FontWeight.bold, fontSize: 20),
              //                   ),
              //                   Text(
              //                     '${measurement.site.getLocation()}',
              //                     maxLines: 1,
              //                     overflow: TextOverflow.ellipsis,
              //                     style: TextStyle(
              //                         fontSize: 14,
              //                         color: Colors.black.withOpacity(0.3)),
              //                   ),
              //                   const SizedBox(
              //                     height: 12,
              //                   ),
              //                   Container(
              //                     padding: const EdgeInsets.fromLTRB(
              //                         10.0, 2.0, 10.0, 2.0),
              //                     decoration: BoxDecoration(
              //                         borderRadius: const BorderRadius.all(
              //                             Radius.circular(40.0)),
              //                         color:
              //                         pm2_5ToColor(measurement.getPm2_5Value())
              //                             .withOpacity(0.3),
              //                         border:
              //                         Border.all(color: Colors.transparent)),
              //                     child: Text(
              //                       pmToString(measurement.getPm2_5Value()),
              //                       maxLines: 1,
              //                       textAlign: TextAlign.center,
              //                       overflow: TextOverflow.ellipsis,
              //                       style: TextStyle(
              //                         fontSize: 14,
              //                         color:
              //                         pmToString(measurement.getPm2_5Value())
              //                             .trim().toLowerCase() == 'moderate'
              //                             ?
              //                         Colors.black.withOpacity(0.5)
              //                             :
              //                         pm2_5ToColor(measurement.getPm2_5Value()),
              //                       ),
              //                     ),
              //                   ),
              //                   const SizedBox(
              //                     height: 8,
              //                   ),
              //                   Row(
              //                     crossAxisAlignment: CrossAxisAlignment.start,
              //                     children: [
              //                       Text(
              //                         'Updated today at '
              //                             '${dateToString(measurement.time, true)}',
              //                         maxLines: 1,
              //                         overflow: TextOverflow.ellipsis,
              //                         style: TextStyle(
              //                             fontSize: 8,
              //                             color: Colors.black.withOpacity(0.3)),
              //                       ),
              //                       const SizedBox(
              //                         width: 8.0,
              //                       )
              //                     ],
              //                   ),
              //                 ],
              //               ),
              //             )
              //           ],
              //         ),
              //
              //         const SizedBox(height: 30),
              //         // Analytics
              //         Row(
              //           children: [
              //             Container(
              //               height: 16,
              //               width: 16,
              //               decoration: BoxDecoration(
              //                   color: ColorConstants.appColorBlue,
              //                   borderRadius:
              //                   const BorderRadius.all(Radius.circular(3.0)),
              //                   border: Border.all(color: Colors.transparent)),
              //               child: const Icon(
              //                 Icons.bar_chart,
              //                 size: 14,
              //                 color: Colors.white,
              //               ),
              //             ),
              //             const SizedBox(width: 8.0),
              //             Text(
              //               'View More Insights',
              //               style: TextStyle(
              //                   fontSize: 12, color: ColorConstants.appColorBlue),
              //             ),
              //             const Spacer(),
              //             Container(
              //               height: 16,
              //               width: 16,
              //               decoration: BoxDecoration(
              //                   color: ColorConstants.appColorPaleBlue,
              //                   borderRadius:
              //                   const BorderRadius.all(Radius.circular(3.0)),
              //                   border: Border.all(color: Colors.transparent)),
              //               child: Icon(
              //                 Icons.arrow_forward_ios,
              //                 size: 12,
              //                 color: ColorConstants.appColorBlue,
              //               ),
              //             ),
              //           ],
              //         ),
              //       ],
              //     ),
              //   ),
              // ),
              //
              // // Info Icon
              //
              // const SizedBox(height: 12),
              //
              // const Divider(color: Color(0xffC4C4C4)),
              // // Actions
              // const SizedBox(height: 10,),
              // Row(
              //   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              //   children: [
              //     iconTextButton(
              //         SvgPicture.asset(
              //           'assets/icon/share_icon.svg',
              //           semanticsLabel: 'Share',
              //         ),
              //         'Share'),
              //     iconTextButton(
              //         SvgPicture.asset(
              //           'assets/icon/fav_icon.svg',
              //           semanticsLabel: 'Favorite',
              //         ),
              //         'Favorite'),
              //   ],
              // ),
              // const SizedBox(height: 10,),
            ],
          )),
    );
  }
}
