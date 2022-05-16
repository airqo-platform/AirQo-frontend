import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';
import 'buttons.dart';

Widget refreshIndicator(
    {required SliverChildDelegate sliverChildDelegate,
    Future Function()? onRefresh}) {
  return CustomScrollView(
    physics: Platform.isAndroid ? const BouncingScrollPhysics() : null,
    slivers: [
      CupertinoSliverRefreshControl(
        refreshTriggerPullDistance: Config.refreshTriggerPullDistance,
        refreshIndicatorExtent: Config.refreshIndicatorExtent,
        onRefresh: onRefresh,
      ),
      SliverList(
        delegate: sliverChildDelegate,
      ),
    ],
  );
}

class AnalyticsAvatar extends StatelessWidget {
  final Measurement measurement;
  const AnalyticsAvatar({Key? key, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 104,
      width: 104,
      decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: pollutantValueColor(
              value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
          border: Border.all(color: Colors.transparent)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/PM2.5.svg',
            semanticsLabel: 'Pm2.5',
            height: 20,
            width: 32.45,
            color: pollutantTextColor(
                value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
          ),
          Text(
            measurement.getPm2_5Value().toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
                color: pollutantTextColor(
                    value: measurement.getPm2_5Value(),
                    pollutant: Pollutant.pm2_5),
                fontStyle: FontStyle.normal,
                fontSize: 40,
                fontWeight: FontWeight.bold,
                height: 48 / 40,
                letterSpacing: 16 * -0.022),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 20,
            width: 32,
            color: pollutantTextColor(
                value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

PreferredSizeWidget appTopBar(
    {required BuildContext context,
    required String title,
    List<Widget>? actions,
    bool? centerTitle}) {
  return AppBar(
    toolbarHeight: 72,
    centerTitle: centerTitle ?? true,
    elevation: 0,
    backgroundColor: Config.appBodyColor,
    automaticallyImplyLeading: false,
    leading: const Padding(
      padding: EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: AppBackButton(),
    ),
    title: Text(
      title,
      style: CustomTextStyle.headline8(context),
    ),
    actions: actions,
  );
}

PreferredSizeWidget appIconTopBar(
    {required BuildContext context, List<Widget>? actions}) {
  return AppBar(
    toolbarHeight: 72,
    centerTitle: true,
    elevation: 0,
    backgroundColor: Config.appBodyColor,
    automaticallyImplyLeading: false,
    leading: const Padding(
      padding: EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
      child: AppBackButton(),
    ),
    title: SvgPicture.asset(
      'assets/icon/airqo_home.svg',
      height: 40,
      width: 58,
      semanticsLabel: 'AirQo',
    ),
    actions: actions,
  );
}

class AqiStringContainer extends StatelessWidget {
  final Measurement measurement;
  const AqiStringContainer({Key? key, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
      decoration: BoxDecoration(
          borderRadius: const BorderRadius.all(Radius.circular(40.0)),
          color: pollutantValueColor(
                  value: measurement.getPm2_5Value(),
                  pollutant: Pollutant.pm2_5)
              .withOpacity(0.4),
          border: Border.all(color: Colors.transparent)),
      child: AutoSizeText(
          pollutantValueString(
                  value: measurement.getPm2_5Value(),
                  pollutant: Pollutant.pm2_5)
              .trimEllipsis(),
          maxFontSize: 14,
          maxLines: 1,
          textAlign: TextAlign.start,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.button2(context)?.copyWith(
            color: pollutantTextColor(
                value: measurement.getPm2_5Value(),
                pollutant: Pollutant.pm2_5,
                graph: true),
          )),
    );
  }
}

PreferredSizeWidget knowYourAirAppBar(context, title) {
  return AppBar(
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.transparent,
      leading: const Padding(
        padding: EdgeInsets.only(top: 12, bottom: 6.5, left: 16),
        child: AppBackButton(),
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

class MiniAnalyticsAvatar extends StatelessWidget {
  final Measurement measurement;
  const MiniAnalyticsAvatar({Key? key, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: pollutantValueColor(
              value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
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
            color: pollutantTextColor(
                value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
          ),
          Text(
            measurement.getPm2_5Value().toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
                color: pollutantTextColor(
                    value: measurement.getPm2_5Value(),
                    pollutant: Pollutant.pm2_5),
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
            color: pollutantTextColor(
                value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class SearchLocationTile extends StatelessWidget {
  final Measurement measurement;
  const SearchLocationTile({Key? key, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
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
        leading: MiniAnalyticsAvatar(measurement: measurement),
      ),
    );
  }
}
