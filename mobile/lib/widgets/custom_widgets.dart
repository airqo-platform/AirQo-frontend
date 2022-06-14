import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/utils/extensions.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../models/enum_constants.dart';
import '../models/place_details.dart';
import '../themes/app_theme.dart';
import '../themes/colors.dart';
import 'buttons.dart';

class AppRefreshIndicator extends StatelessWidget {
  const AppRefreshIndicator({
    Key? key,
    this.onRefresh,
    required this.sliverChildDelegate,
  }) : super(key: key);
  final Future Function()? onRefresh;
  final SliverChildDelegate sliverChildDelegate;

  @override
  Widget build(BuildContext context) {
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
}

class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar(
    this.title, {
    Key? key,
    this.actions,
    this.centerTitle,
  }) : super(key: key);
  final String title;
  final List<Widget>? actions;
  final bool? centerTitle;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 72,
      centerTitle: centerTitle ?? true,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      automaticallyImplyLeading: false,
      leading: const Padding(
        padding: EdgeInsets.only(
          top: 6.5,
          bottom: 6.5,
          left: 16,
        ),
        child: AppBackButton(),
      ),
      title: Text(
        title,
        style: CustomTextStyle.headline8(context),
      ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}

class AppIconTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppIconTopBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 72,
      centerTitle: true,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      automaticallyImplyLeading: false,
      leading: const Padding(
        padding: EdgeInsets.only(
          top: 6.5,
          bottom: 6.5,
          left: 16,
        ),
        child: AppBackButton(),
      ),
      title: SvgPicture.asset(
        'assets/icon/airqo_logo.svg',
        height: 40,
        width: 58,
        semanticsLabel: 'AirQo',
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}

class AqiStringContainer extends StatelessWidget {
  const AqiStringContainer({
    Key? key,
    required this.measurement,
  }) : super(key: key);
  final Measurement measurement;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        10.0,
        2.0,
        10.0,
        2.0,
      ),
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(
          Radius.circular(40.0),
        ),
        color: Pollutant.pm2_5
            .color(
              measurement.getPm2_5Value(),
            )
            .withOpacity(0.4),
        border: Border.all(color: Colors.transparent),
      ),
      child: AutoSizeText(
        Pollutant.pm2_5
            .stringValue(
              measurement.getPm2_5Value(),
            )
            .trimEllipsis(),
        maxFontSize: 14,
        maxLines: 1,
        textAlign: TextAlign.start,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.button2(context)?.copyWith(
          color: Pollutant.pm2_5.textColor(
            value: measurement.getPm2_5Value(),
            graph: true,
          ),
        ),
      ),
    );
  }
}

class KnowYourAirAppBar extends StatelessWidget implements PreferredSizeWidget {
  const KnowYourAirAppBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
          'Know Your Air',
          style:
              CustomTextStyle.headline8(context)?.copyWith(color: Colors.white),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(60);
}

class MiniAnalyticsAvatar extends StatelessWidget {
  const MiniAnalyticsAvatar({
    Key? key,
    required this.measurement,
  }) : super(key: key);
  final Measurement measurement;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Pollutant.pm2_5.color(
          measurement.getPm2_5Value(),
        ),
        border: Border.all(
          color: Colors.transparent,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/PM2.5.svg',
            semanticsLabel: 'Pm2.5',
            height: 5,
            width: 32.45,
            color: Pollutant.pm2_5.textColor(
              value: measurement.getPm2_5Value(),
            ),
          ),
          Text(
            measurement.getPm2_5Value().toStringAsFixed(0),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.robotoMono(
              color: Pollutant.pm2_5.textColor(
                value: measurement.getPm2_5Value(),
              ),
              fontStyle: FontStyle.normal,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              height: 1,
              letterSpacing: 16 * -0.06,
            ),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 5,
            width: 32,
            color: Pollutant.pm2_5.textColor(
              value: measurement.getPm2_5Value(),
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class HeartIcon extends StatelessWidget {
  const HeartIcon({
    Key? key,
    required this.showAnimation,
    required this.placeDetails,
  }) : super(key: key);

  final bool showAnimation;
  final PlaceDetails placeDetails;

  @override
  Widget build(BuildContext context) {
    if (showAnimation) {
      return SizedBox(
        height: 16.67,
        width: 16.67,
        child: Lottie.asset(
          'assets/lottie/animated_heart.json',
          repeat: false,
          reverse: false,
          animate: true,
          fit: BoxFit.cover,
        ),
      );
    }

    return Consumer<PlaceDetailsModel>(
      builder: (context, placeDetailsModel, child) {
        return SvgPicture.asset(
          PlaceDetails.isFavouritePlace(
            placeDetailsModel.favouritePlaces,
            placeDetails,
          )
              ? 'assets/icon/heart.svg'
              : 'assets/icon/heart_dislike.svg',
          semanticsLabel: 'Favorite',
          height: 16.67,
          width: 16.67,
        );
      },
    );
  }
}
