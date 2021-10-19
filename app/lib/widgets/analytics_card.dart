import 'package:app/constants/app_constants.dart';
import 'package:app/models/measurement.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AnalyticsCard extends StatelessWidget {
  final Measurement measurement;

  const AnalyticsCard(this.measurement, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(16.0)),
            border: Border.all(color: Colors.transparent)),
        child: Column(
          children: [
            // Info Icon
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.all(2.0),
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: ColorConstants.appColorPaleBlue,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(16.0)),
                      border: Border.all(color: Colors.transparent)),
                  child: const Icon(
                    Icons.info_outline,
                  ),
                )
              ],
            ),

            // Details section
            Row(
              children: [
                Container(
                  height: 104,
                  width: 104,
                  padding: const EdgeInsets.all(2.0),
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: ColorConstants.appColorPaleBlue,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(16.0)),
                      border: Border.all(color: Colors.transparent)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      RichText(
                          text: TextSpan(
                        style: DefaultTextStyle.of(context).style,
                        children: <TextSpan>[
                          TextSpan(
                            text: 'PM',
                            style: TextStyle(
                              fontSize: 17,
                              color: ColorConstants.appColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(
                            text: '2.5',
                            style: TextStyle(
                              fontSize: 12,
                              color: ColorConstants.appColor,
                            ),
                          )
                        ],
                      )),
                      Text(
                        '${measurement.getPm2_5Value()}',
                        style: GoogleFonts.robotoMono(
                            fontStyle: FontStyle.normal, fontSize: 40),
                      ),
                      const Text(
                        'µg/m\u00B3',
                        style: TextStyle(fontSize: 12),
                      )
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        '${measurement.site.getName()}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                      Text(
                        '${measurement.site.getLocation()}',
                        style: const TextStyle(fontSize: 14),
                      )
                    ],
                  ),
                )
              ],
            )
          ],
        ));
  }
}
