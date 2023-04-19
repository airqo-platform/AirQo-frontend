import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:showcaseview/showcaseview.dart';

import 'buttons.dart';
import 'custom_shimmer.dart';

class HealthTipContainer extends StatelessWidget {
  const HealthTipContainer(this.healthTip, {super.key});
  final HealthTip healthTip;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 304,
      height: 128,
      constraints: const BoxConstraints(
        minWidth: 304,
        minHeight: 128,
        maxWidth: 304,
        maxHeight: 128,
      ),
      padding: const EdgeInsets.all(8.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(16.0),
        ),
      ),
      child: Row(
        children: [
          Container(
            constraints: const BoxConstraints(
              maxWidth: 83,
              maxHeight: 112,
              minWidth: 83,
              minHeight: 112,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              image: DecorationImage(
                fit: BoxFit.cover,
                image: CachedNetworkImageProvider(
                  healthTip.image,
                ),
              ),
            ),
          ),
          const SizedBox(
            width: 12,
          ),
          Expanded(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AutoSizeText(
                    healthTip.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: CustomTextStyle.headline10(context),
                  ),
                  const SizedBox(
                    height: 4,
                  ),
                  AutoSizeText(
                    healthTip.description,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.5),
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(
            width: 12,
          ),
        ],
      ),
    );
  }
}

class AirQualityChip extends StatelessWidget {
  const AirQualityChip(this.airQuality, {super.key});
  final AirQuality airQuality;

  @override
  Widget build(BuildContext context) {
    return Chip(
      backgroundColor: airQuality.color.withOpacity(0.3),
      label: Text(airQuality.title),
      labelStyle: CustomTextStyle.airQualityChip(context),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      padding: const EdgeInsets.all(2),
      labelPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: -8),
      avatar: CircleAvatar(
        backgroundColor: airQuality.color,
      ),
    );
  }
}

class AppRefreshIndicator extends StatelessWidget {
  const AppRefreshIndicator({
    super.key,
    this.onRefresh,
    required this.sliverChildDelegate,
  });
  final Future<void> Function()? onRefresh;
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
    super.key,
    this.actions,
    this.centerTitle,
  });
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
  const AppIconTopBar({super.key});

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
  const AqiStringContainer(this.airQualityReading, {super.key});
  final AirQualityReading airQualityReading;

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
              airQualityReading.pm2_5,
            )
            .withOpacity(0.4),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: AutoSizeText(
        Pollutant.pm2_5
            .stringValue(
              airQualityReading.pm2_5,
            )
            .trimEllipsis(),
        maxFontSize: 14,
        maxLines: 1,
        textAlign: TextAlign.start,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.button2(context)?.copyWith(
          color: Pollutant.pm2_5.textColor(
            value: airQualityReading.pm2_5,
            graph: true,
          ),
        ),
      ),
    );
  }
}

class KnowYourAirAppBar extends StatelessWidget implements PreferredSizeWidget {
  const KnowYourAirAppBar({super.key});

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
    super.key,
    required this.airQualityReading,
  });
  final AirQualityReading airQualityReading;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      width: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Pollutant.pm2_5.color(
          airQualityReading.pm2_5,
        ),
        border: const Border.fromBorderSide(
          BorderSide(color: Colors.transparent),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            Pollutant.pm2_5.svg,
            semanticsLabel: 'Pm2.5',
            height: 5,
            width: 32.45,
            colorFilter: ColorFilter.mode(
              Pollutant.pm2_5.textColor(
                value: airQualityReading.pm2_5,
              ),
              BlendMode.srcIn,
            ),
          ),
          AutoSizeText(
            airQualityReading.pm2_5.toStringAsFixed(0),
            maxLines: 1,
            style: CustomTextStyle.insightsAvatar(
              pollutant: Pollutant.pm2_5,
              value: airQualityReading.pm2_5,
            )?.copyWith(fontSize: 20),
          ),
          SvgPicture.asset(
            'assets/icon/unit.svg',
            semanticsLabel: 'Unit',
            height: 5,
            width: 32,
            colorFilter: ColorFilter.mode(
              Pollutant.pm2_5.textColor(
                value: airQualityReading.pm2_5,
              ),
              BlendMode.srcIn,
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
    super.key,
    required this.showAnimation,
    required this.airQualityReading,
  });

  final bool showAnimation;
  final AirQualityReading? airQualityReading;

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

    return BlocBuilder<FavouritePlaceBloc, List<FavouritePlace>>(
      builder: (context, state) {
        final placesIds = state.map((e) => e.placeId).toList();

        final placeId =
            airQualityReading == null ? '' : airQualityReading?.placeId;

        return SvgPicture.asset(
          placesIds.contains(placeId)
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

class AnalyticsCardFooter extends StatefulWidget {
  const AnalyticsCardFooter(
    this.airQualityReading, {
    super.key,
    this.radius = 16,
  });

  final AirQualityReading airQualityReading;
  final double radius;

  @override
  State<AnalyticsCardFooter> createState() => _AnalyticsCardFooterState();
}

class _AnalyticsCardFooterState extends State<AnalyticsCardFooter> {
  bool _showHeartAnimation = false;

  late ButtonStyle _leftButtonStyle;
  late ButtonStyle _rightButtonStyle;

  @override
  void initState() {
    super.initState();
    _leftButtonStyle = OutlinedButton.styleFrom(
      foregroundColor: CustomColors.appColorBlue,
      elevation: 0,
      side: const BorderSide(
        color: Colors.transparent,
        width: 0,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(widget.radius),
        ),
      ),
      backgroundColor: Colors.white,
      padding: EdgeInsets.zero,
    );

    _rightButtonStyle = OutlinedButton.styleFrom(
      foregroundColor: CustomColors.appColorBlue,
      elevation: 0,
      side: const BorderSide(
        color: Colors.transparent,
        width: 0,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          bottomRight: Radius.circular(widget.radius),
        ),
      ),
      backgroundColor: Colors.white,
      padding: EdgeInsets.zero,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Expanded(
          child: FutureBuilder<Uri>(
            future: ShareService.createShareLink(
              airQualityReading: widget.airQualityReading,
            ),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                showSnackBar(context, 'Could not create a share link.');
              }
              if (snapshot.hasData) {
                Uri? link = snapshot.data;
                if (link != null) {
                  return OutlinedButton(
                    style: _leftButtonStyle,
                    onPressed: () async {
                      await ShareService.shareLink(
                        link,
                        context,
                        airQualityReading: widget.airQualityReading,
                      );
                      // disabling copying to clipboard
                      // if (link.toString().length > Config.shareLinkMaxLength) {
                      //   await Clipboard.setData(
                      //     ClipboardData(text: link.toString()),
                      //   ).then((_) {
                      //     showSnackBar(context, 'Copied to your clipboard !');
                      //   });
                      // } else {
                      //   await ShareService.shareLink(
                      //     link,
                      //     airQualityReading: widget.airQualityReading,
                      //   );
                      // }
                    },
                    child: Center(
                      child: IconTextButton(
                        iconWidget: SvgPicture.asset(
                          'assets/icon/share_icon.svg',
                          colorFilter: ColorFilter.mode(
                            CustomColors.greyColor,
                            BlendMode.srcIn,
                          ),
                          semanticsLabel: 'Share',
                        ),
                        text: 'Share',
                      ),
                    ),
                  );
                }
              }

              return OutlinedButton(
                style: _leftButtonStyle,
                onPressed: () {
                  showSnackBar(context, 'Creating share link. Hold on tight');
                },
                child: const Center(
                  child: LoadingIcon(radius: 14),
                ),
              );
            },
          ),
        ),
        Expanded(
          child: OutlinedButton(
            style: _rightButtonStyle,
            onPressed: () {
              _updateFavPlace(context);
            },
            child: Center(
              child: IconTextButton(
                iconWidget: HeartIcon(
                  showAnimation: _showHeartAnimation,
                  airQualityReading: widget.airQualityReading,
                ),
                text: 'Favorite',
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _updateFavPlace(BuildContext context) {
    setState(() => _showHeartAnimation = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _showHeartAnimation = false);
      }
    });

    context
        .read<FavouritePlaceBloc>()
        .add(UpdateFavouritePlace(widget.airQualityReading));
  }
}

class AppSafeArea extends StatelessWidget {
  const AppSafeArea({
    super.key,
    required this.child,
    this.verticalPadding,
    this.horizontalPadding,
    this.backgroundColor,
  });
  final Widget child;
  final double? verticalPadding;
  final double? horizontalPadding;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final mediaQueryData = MediaQuery.of(context);
    final num textScaleFactor = mediaQueryData.textScaleFactor.clamp(
      Config.minimumTextScaleFactor,
      Config.maximumTextScaleFactor,
    );

    return MediaQuery(
      data: mediaQueryData.copyWith(textScaleFactor: textScaleFactor as double),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: verticalPadding ?? 0),
        color: backgroundColor ?? CustomColors.appBodyColor,
        child: SafeArea(
          minimum: EdgeInsets.symmetric(
            vertical: verticalPadding ?? 0,
            horizontal: horizontalPadding ?? 0,
          ),
          child: child,
        ),
      ),
    );
  }
}

class BottomNavIcon extends StatelessWidget {
  const BottomNavIcon({
    super.key,
    required this.selectedIndex,
    required this.label,
    required this.index,
    required this.icon,
  });
  final int selectedIndex;
  final String label;
  final int index;
  final IconData icon;
  @override
  Widget build(BuildContext context) {
    return ListView(
      shrinkWrap: true,
      children: [
        Theme(
          data: ThemeData(fontFamily: GoogleFonts.inter().fontFamily),
          child: Icon(
            icon,
            grade: 700,
            color: selectedIndex == index
                ? CustomColors.appColorBlue
                : CustomColors.appColorBlack.withOpacity(0.3),
            semanticLabel: label,
            size: 24,
          ),
        ),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: selectedIndex == index
                ? CustomColors.appColorBlue
                : CustomColors.appColorBlack.withOpacity(0.3),
            fontSize: 9,
          ),
        ),
      ],
    );
  }
}

class CustomShowcaseWidget extends StatelessWidget {
  const CustomShowcaseWidget({
    super.key,
    required this.showcaseKey,
    required this.description,
    required this.child,
    this.customize,
    this.descriptionWidth,
    this.descriptionHeight,
    this.showLine = true,
  });

  final GlobalKey showcaseKey;
  final Widget child;
  final ShowcaseOptions? customize;
  final bool showLine;
  final String description;
  final double? descriptionWidth, descriptionHeight;

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return Showcase.withWidget(
      key: showcaseKey,
      width: screenSize.width * 0.5,
      height: 100,
      overlayColor: CustomColors.appColorBlack,
      overlayOpacity: 0.8,
      container: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Visibility(
            visible: customize != ShowcaseOptions.up && showLine,
            child: SizedBox(
              width: 45,
              height: 45,
              child: SvgPicture.asset(
                'assets/icon/line.svg',
                height: 40,
                width: 58,
              ),
            ),
          ),
          const SizedBox(
            height: 10,
          ),
          Visibility(
            visible: customize == ShowcaseOptions.skip,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 45,
                  height: 45,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                  child: IconButton(
                    tooltip: "Skip Showcase",
                    icon: const Icon(Icons.skip_next),
                    onPressed: () async {
                      ShowCaseWidget.of(context).dismiss();
                      await AppService()
                          .stopShowcase(Config.restartTourShowcase);
                    },
                    color: CustomColors.appColorBlue,
                  ),
                ),
                const SizedBox(
                  height: 10,
                ),
              ],
            ),
          ),
          SizedBox(
            width: screenSize.width * 0.5,
            child: Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
              softWrap: true,
            ),
          ),
          const SizedBox(
            height: 10,
          ),
          Visibility(
            visible: customize == ShowcaseOptions.up && showLine,
            child: SizedBox(
              width: 45,
              height: 45,
              child: SvgPicture.asset(
                'assets/icon/line.svg',
                height: 40,
                width: 58,
              ),
            ),
          ),
        ],
      ),
      targetShapeBorder: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: CustomColors.appColorBlue,
          width: 3,
          strokeAlign: -5,
        ),
      ),
      child: child,
    );
  }
}
