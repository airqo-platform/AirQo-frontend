import 'package:app/constants/config.dart';
import 'package:app/models/insights.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';

Widget analyticsAvatar(
    Measurement measurement, double size, double fontSize, double iconHeight) {
  return Container(
    height: size,
    width: size,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: pm2_5ToColor(measurement.getPm2_5Value()),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Spacer(),
        SvgPicture.asset(
          'assets/icon/PM2.5.svg',
          semanticsLabel: 'Pm2.5',
          height: iconHeight,
          width: 32.45,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        Text(
          measurement.getPm2_5Value().toStringAsFixed(0),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
              color: pm2_5TextColor(measurement.getPm2_5Value()),
              fontStyle: FontStyle.normal,
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
              height: 48 / fontSize,
              letterSpacing: 16 * -0.022),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'Unit',
          height: iconHeight,
          width: 32,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        const Spacer(),
      ],
    ),
  );
}

PreferredSizeWidget appTopBar(context, String title) {
  return AppBar(
      toolbarHeight: 72,
      centerTitle: true,
      elevation: 0,
      backgroundColor: Config.appBodyColor,
      automaticallyImplyLeading: false,
      leading: Padding(
        padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
        child: backButton(context),
      ),
      title: Text(
        title,
        style: CustomTextStyle.headline8(context),
      ));
}

Widget aqiContainerString(
    {required Measurement measurement, required BuildContext context}) {
  return Container(
    padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
    decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(Radius.circular(40.0)),
        color: pm2_5ToColor(measurement.getPm2_5Value()).withOpacity(0.4),
        border: Border.all(color: Colors.transparent)),
    child:
        AutoSizeText(pm2_5ToString(measurement.getPm2_5Value()).trimEllipsis(),
            maxFontSize: 14,
            maxLines: 1,
            textAlign: TextAlign.start,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.button2(context)?.copyWith(
              color: pm2_5TextColor(measurement.getPm2_5Value()),
            )),
  );
}

Widget backButton(context) {
  return GestureDetector(
    onTap: () {
      Navigator.pop(context);
    },
    child: SvgPicture.asset(
      'assets/icon/back_button.svg',
      semanticsLabel: 'more',
      height: 40,
      width: 40,
    ),
  );
}

Widget iconTextButton(Widget icon, text) {
  return Row(
    children: [
      icon,
      const SizedBox(
        width: 10,
      ),
      Text(
        text,
        style: TextStyle(
            fontSize: 14, color: Config.appColorBlack, height: 18 / 14),
      )
    ],
  );
}

Widget insightsTabAvatar(
    context, Insights measurement, double size, Pollutant pollutant) {
  if (measurement.empty) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Config.greyColor,
          border: Border.all(color: Colors.transparent)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            pollutant == Pollutant.pm2_5
                ? 'assets/icon/PM2.5.svg'
                : 'assets/icon/PM10.svg',
            semanticsLabel: 'Pm2.5',
            height: 6,
            width: 32.45,
            color: Config.darkGreyColor,
          ),
          Text(
            '--',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
              fontStyle: FontStyle.normal,
              fontSize: 32,
              color: Config.darkGreyColor,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'UNit',
            height: 6,
            width: 32,
            color: Config.darkGreyColor,
          ),
          const Spacer(),
        ],
      ),
    );
  }
  return Container(
    height: size,
    width: size,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: measurement.forecast
            ? Config.appColorPaleBlue
            : pollutant == Pollutant.pm2_5
                ? pm2_5ToColor(measurement.getChartValue(pollutant))
                : pm10ToColor(measurement.getChartValue(pollutant)),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SvgPicture.asset(
          pollutant == Pollutant.pm2_5
              ? 'assets/icon/PM2.5.svg'
              : 'assets/icon/PM10.svg',
          semanticsLabel: 'Pm2.5',
          height: 6,
          width: 32.45,
          color: measurement.forecast
              ? Config.appColorBlue
              : pollutant == Pollutant.pm2_5
                  ? pm2_5TextColor(measurement.getChartValue(pollutant))
                  : pm10TextColor(measurement.getChartValue(pollutant)),
        ),
        Text(
          measurement.getChartValue(pollutant).toStringAsFixed(0),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
            fontStyle: FontStyle.normal,
            fontWeight: FontWeight.bold,
            height: 1,
            fontSize: 32,
            color: measurement.forecast
                ? Config.appColorBlue
                : pollutant == Pollutant.pm2_5
                    ? pm2_5TextColor(measurement.getChartValue(pollutant))
                    : pm10TextColor(measurement.getChartValue(pollutant)),
          ),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'UNit',
          height: 6,
          width: 32,
          color: measurement.forecast
              ? Config.appColorBlue
              : pollutant == Pollutant.pm2_5
                  ? pm2_5TextColor(measurement.getChartValue(pollutant))
                  : pm10TextColor(measurement.getChartValue(pollutant)),
        ),
      ],
    ),
  );
}

PreferredSizeWidget knowYourAirAppBar(context, title) {
  return AppBar(
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.transparent,
      leading: Padding(
        padding: const EdgeInsets.only(top: 12, bottom: 6.5, left: 16),
        child: backButton(context),
      ),
      title: Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Text(
          title,
          style:
              CustomTextStyle.headline8(context)?.copyWith(color: Colors.white),
        ),
      ));
}

Widget miniAnalyticsAvatar({required Measurement measurement}) {
  return Container(
    height: 40,
    width: 40,
    decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: pm2_5ToColor(measurement.getPm2_5Value()),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Spacer(),
        SvgPicture.asset(
          'assets/icon/PM2.5.svg',
          semanticsLabel: 'Pm2.5',
          height: 5,
          width: 32.45,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        Text(
          measurement.getPm2_5Value().toStringAsFixed(0),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
              color: pm2_5TextColor(measurement.getPm2_5Value()),
              fontStyle: FontStyle.normal,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              height: 1,
              letterSpacing: 16 * -0.06),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'Unit',
          height: 5,
          width: 32,
          color: pm2_5TextColor(measurement.getPm2_5Value()),
        ),
        const Spacer(),
      ],
    ),
  );
}

Widget searchLocationTile(
    {required Measurement measurement, required BuildContext context}) {
  return Container(
    padding: const EdgeInsets.only(left: 16.0, right: 30.0),
    decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(Radius.circular(8.0)),
        border: Border.all(color: Colors.transparent)),
    child: ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      title: AutoSizeText(
        measurement.site.name,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        measurement.site.location,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.bodyText4(context)
            ?.copyWith(color: Config.appColorBlack.withOpacity(0.3)),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: miniAnalyticsAvatar(measurement: measurement),
    ),
  );
}

Widget searchPlaceTile(
    {required Suggestion searchSuggestion, required BuildContext context}) {
  return Container(
    padding: const EdgeInsets.only(left: 16.0, right: 30.0),
    decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(Radius.circular(8.0)),
        border: Border.all(color: Colors.transparent)),
    child: ListTile(
        contentPadding: const EdgeInsets.only(left: 0.0),
        title: Text(
          searchSuggestion.suggestionDetails.getMainText(),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline8(context),
        ),
        subtitle: Text(
          searchSuggestion.suggestionDetails.getSecondaryText(),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.bodyText4(context)
              ?.copyWith(color: Config.appColorBlack.withOpacity(0.3)),
        ),
        trailing: SvgPicture.asset(
          'assets/icon/more_arrow.svg',
          semanticsLabel: 'more',
          height: 6.99,
          width: 4,
        ),
        leading: Container(
            height: 40,
            width: 40,
            decoration: BoxDecoration(
                color: Config.appColorBlue.withOpacity(0.15),
                shape: BoxShape.circle),
            child: Center(
              child: SvgPicture.asset('assets/icon/location.svg',
                  color: Config.appColorBlue),
            ))),
  );
}
