import 'package:app/constants/app_constants.dart';
import 'package:app/models/insights_chart_data.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/suggestion.dart';
import 'package:app/utils/pm.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:show_more_text_popup/show_more_text_popup.dart';

PreferredSizeWidget actionsAppBar(context) {
  return AppBar(
    centerTitle: true,
    elevation: 0,
    backgroundColor: Colors.transparent,
    foregroundColor: Colors.transparent,
    leading: Padding(
      padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: backButton(context),
    ),
    title: const Text(
      'title',
      style: TextStyle(color: Colors.white),
    ),
  );
}

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
              fontSize: fontSize),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'UNit',
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
    centerTitle: true,
    elevation: 0,
    backgroundColor: ColorConstants.appBodyColor,
    leading: Padding(
      padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: backButton(context),
    ),
    title: Text(
      title,
      style: TextStyle(color: ColorConstants.appColorBlack),
    ),
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

Widget backButtonV1(context) {
  return Container(
    constraints: const BoxConstraints(maxHeight: 32),
    padding: const EdgeInsets.all(0.0),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(8.0))),
    child: IconButton(
      icon: const Icon(
        Icons.arrow_back,
        color: Colors.black,
        size: 20,
      ),
      onPressed: () {
        Navigator.pop(context);
      },
    ),
  );
}

Widget customInputField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    padding: const EdgeInsets.only(left: 16.0, right: 8.0),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(8.0))),
    child: Row(
      children: [
        Text('$text'),
        const Spacer(),
        IconButton(
          icon: Icon(
            Icons.edit,
            color: ColorConstants.appColorBlue,
          ),
          onPressed: () {},
        )
      ],
    ),
  );
}

Widget customSearchField(context, text) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.maxFinite),
    decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(8.0))),
    child: Row(
      children: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {},
        ),
        Expanded(
          child: TextFormField(
            maxLines: 1,
            autofocus: true,
            decoration: InputDecoration(
              hintText: '$text',
              border: InputBorder.none,
            ),
          ),
        ),
      ],
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
        style: const TextStyle(fontSize: 14, color: Colors.black),
      )
    ],
  );
}

Widget insightsAvatar(
    context, InsightsChartData measurement, double size, String pollutant) {
  if (!measurement.available) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: ColorConstants.greyColor,
          border: Border.all(color: Colors.transparent)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            pollutant.trim().toLowerCase() == 'pm2.5'
                ? 'assets/icon/PM2.5.svg'
                : 'assets/icon/PM10.svg',
            semanticsLabel: 'Pm2.5',
            height: 6,
            width: 32.45,
            color: ColorConstants.darkGreyColor,
          ),
          Text(
            '--',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
              fontStyle: FontStyle.normal,
              fontSize: 32,
              color: ColorConstants.darkGreyColor,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'UNit',
            height: 6,
            width: 32,
            color: ColorConstants.darkGreyColor,
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
        color: measurement.time.isAfter(DateTime.now())
            ? ColorConstants.appColorPaleBlue
            : pollutant == 'pm2.5'
                ? pm2_5ToColor(measurement.value)
                : pm10ToColor(measurement.value),
        border: Border.all(color: Colors.transparent)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Spacer(),
        SvgPicture.asset(
          pollutant.trim().toLowerCase() == 'pm2.5'
              ? 'assets/icon/PM2.5.svg'
              : 'assets/icon/PM10.svg',
          semanticsLabel: 'Pm2.5',
          height: 6,
          width: 32.45,
          color: measurement.time.isAfter(DateTime.now())
              ? ColorConstants.appColorBlue
              : pollutant == 'pm2.5'
                  ? pm2_5TextColor(measurement.value)
                  : pm10TextColor(measurement.value),
        ),
        Text(
          measurement.value.toStringAsFixed(0),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.robotoMono(
            fontStyle: FontStyle.normal,
            fontSize: 32,
            color: measurement.time.isAfter(DateTime.now())
                ? ColorConstants.appColorBlue
                : pollutant == 'pm2.5'
                    ? pm2_5TextColor(measurement.value)
                    : pm10TextColor(measurement.value),
          ),
        ),
        SvgPicture.asset(
          'assets/icon/unit.svg',
          semanticsLabel: 'UNit',
          height: 6,
          width: 32,
          color: measurement.time.isAfter(DateTime.now())
              ? ColorConstants.appColorBlue
              : pollutant == 'pm2.5'
                  ? pm2_5TextColor(measurement.value)
                  : pm10TextColor(measurement.value),
        ),
        const Spacer(),
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
      padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: backButton(context),
    ),
    title: Text(
      title,
      style: const TextStyle(color: Colors.white),
    ),
  );
}

Widget locationTileV1(Measurement measurement) {
  return ListTile(
    title: Text(
      measurement.site.getName(),
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    ),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(measurement.site.getLocation(),
            style:
                TextStyle(color: ColorConstants.inactiveColor, fontSize: 12)),
        const SizedBox(
          height: 4,
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Container(
              height: 12,
              padding: const EdgeInsets.only(left: 3.0, right: 3.0),
              decoration: BoxDecoration(
                color:
                    pm2_5ToColor(measurement.getPm2_5Value()).withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.only(right: 1.0),
                    decoration: BoxDecoration(
                      color: pm2_5ToColor(measurement.getPm2_5Value()),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  Text(
                      pm2_5ToString(measurement.getPm2_5Value())
                          .replaceAll('\n', ' '),
                      style: TextStyle(
                          fontSize: 6,
                          color: pm2_5TextColor(measurement.getPm2_5Value()))),
                ],
              ),
            ),
            const SizedBox(
              width: 8,
            ),
            Container(
              height: 12,
              padding: const EdgeInsets.only(left: 3.0, right: 3.0),
              decoration: BoxDecoration(
                color:
                    pm2_5ToColor(measurement.getPm2_5Value()).withOpacity(0.2),
                borderRadius: const BorderRadius.all(Radius.circular(10.0)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    padding: const EdgeInsets.all(1.0),
                    decoration: BoxDecoration(
                      color: pm2_5ToColor(measurement.getPm2_5Value()),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(
                    width: 2,
                  ),
                  Text('${measurement.getPm2_5Value()}',
                      style: TextStyle(
                          fontSize: 6,
                          color: pm2_5TextColor(measurement.getPm2_5Value()))),
                ],
              ),
            ),
            const Spacer()
          ],
        )
      ],
    ),
    trailing: Padding(
      padding: const EdgeInsets.all(10),
      child: Container(
        width: 40,
        height: 80,
        decoration: BoxDecoration(
            color: ColorConstants.appBodyColor,
            borderRadius: const BorderRadius.all(Radius.circular(10.0))),
        child: const Icon(
          Icons.arrow_forward_ios_rounded,
          color: Colors.black,
          size: 15,
        ),
      ),
    ),
  );
}

Widget searchLocationTile(Measurement measurement) {
  return Container(
    padding: const EdgeInsets.only(left: 16.0, right: 30.0),
    decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(Radius.circular(8.0)),
        border: Border.all(color: Colors.transparent)),
    child: ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      title: Text(
        measurement.site.getName(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      subtitle: Text(
        measurement.site.getLocation(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(color: Colors.black.withOpacity(0.3), fontSize: 14),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: analyticsAvatar(measurement, 40, 15, 5),
    ),
  );
}

Widget searchPlaceTile(Suggestion searchSuggestion) {
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
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(
          searchSuggestion.suggestionDetails.getSecondaryText(),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(color: Colors.black.withOpacity(0.3), fontSize: 14),
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
                color: ColorConstants.appColorBlue.withOpacity(0.15),
                shape: BoxShape.circle),
            child: Center(
              child: SvgPicture.asset('assets/icon/location.svg',
                  color: ColorConstants.appColorBlue),
            ))),
  );
}

void showTipText(String text, GlobalKey tootTipKey, BuildContext context,
    VoidCallback dismissFn, bool small) {
  ShowMoreTextPopup(
    context,
    text: text,
    onDismiss: dismissFn,
    textStyle: const TextStyle(color: Colors.white, fontSize: 10),
    height: small ? 60.0 : 64.0,
    width: small ? 200.0 : 261.0,
    backgroundColor: ColorConstants.appColorBlack,
    padding: const EdgeInsets.fromLTRB(16.0, 18, 16, 18),
    borderRadius: BorderRadius.circular(8.0),
  ).show(
    widgetKey: tootTipKey,
  );
}
