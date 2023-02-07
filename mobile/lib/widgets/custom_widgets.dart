import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:lottie/lottie.dart';

import 'buttons.dart';
import 'custom_shimmer.dart';

class AirQualityChip extends StatelessWidget {
  const AirQualityChip(this.airQuality, {super.key});
  final AirQuality airQuality;

  @override
  Widget build(BuildContext context) {
    return Chip(
      backgroundColor: airQuality.color().withOpacity(0.3),
      label: Text(airQuality.string),
      labelStyle: CustomTextStyle.airQualityChip(context),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      padding: const EdgeInsets.all(2),
      labelPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: -8),
      avatar: CircleAvatar(
        backgroundColor: airQuality.color(),
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
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
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
            color: Pollutant.pm2_5.textColor(
              value: airQualityReading.pm2_5,
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

    return ValueListenableBuilder<Box<FavouritePlace>>(
      valueListenable:
          Hive.box<FavouritePlace>(HiveBox.favouritePlaces).listenable(),
      builder: (context, box, widget) {
        final placesIds = box.keys.toList();

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
                          color: CustomColors.greyColor,
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
    required this.widget,
    this.verticalPadding,
    this.horizontalPadding,
    this.backgroundColor,
  });
  final Widget widget;
  final double? verticalPadding;
  final double? horizontalPadding;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: verticalPadding ?? 0),
      color: backgroundColor ?? CustomColors.appBodyColor,
      child: SafeArea(
        minimum: EdgeInsets.symmetric(
          vertical: verticalPadding ?? 0,
          horizontal: horizontalPadding ?? 0,
        ),
        child: widget,
      ),
    );
  }
}

class BottomNavIcon extends StatelessWidget {
  const BottomNavIcon({
    super.key,
    required this.svg,
    required this.selectedIndex,
    required this.label,
    required this.index,
  });
  final String svg;
  final int selectedIndex;
  final String label;
  final int index;
  @override
  Widget build(BuildContext context) {
    return ListView(
      shrinkWrap: true,
      children: [
        SvgPicture.asset(
          svg,
          color: selectedIndex == index
              ? CustomColors.appColorBlue
              : CustomColors.appColorBlack.withOpacity(0.3),
          semanticsLabel: label,
        ),
        const SizedBox(height: 3),
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
