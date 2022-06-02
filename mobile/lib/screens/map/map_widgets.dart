import 'package:app/utils/extensions.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../models/enum_constants.dart';
import '../../models/measurement.dart';
import '../../models/suggestion.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';

class DraggingHandle extends StatelessWidget {
  const DraggingHandle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      width: 32,
      decoration: BoxDecoration(
          color: Colors.grey[200], borderRadius: BorderRadius.circular(16)),
    );
  }
}

class RegionAvatar extends StatelessWidget {
  const RegionAvatar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 40,
        width: 40,
        decoration: BoxDecoration(
            color: CustomColors.appColorBlue.withOpacity(0.15),
            shape: BoxShape.circle),
        child: Center(
          child: SvgPicture.asset('assets/icon/location.svg',
              color: CustomColors.appColorBlue),
        ));
  }
}

class MapCardWidget extends StatelessWidget {
  const MapCardWidget({Key? key, required this.widget, required this.padding})
      : super(key: key);
  final Widget widget;
  final double padding;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 12.0,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16), topRight: Radius.circular(16))),
      child: Container(
        padding: EdgeInsets.fromLTRB(padding, 0, padding, 16.0),
        child: widget,
      ),
    );
  }
}

class SiteTile extends StatelessWidget {
  const SiteTile(
      {Key? key, required this.measurement, required this.onSiteTileTap})
      : super(key: key);
  final Measurement measurement;
  final Function(Measurement) onSiteTileTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      onTap: () => onSiteTileTap(measurement),
      title: AutoSizeText(
        measurement.site.name.trimEllipsis(),
        maxLines: 1,
        minFontSize: 16.0,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(measurement.site.location.trimEllipsis(),
          maxLines: 1,
          minFontSize: 14.0,
          style: CustomTextStyle.bodyText4(context)
              ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.4))),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
      leading: MiniAnalyticsAvatar(measurement: measurement),
    );
  }
}

class RegionTile extends StatelessWidget {
  const RegionTile(
      {Key? key, required this.showRegionSites, required this.region})
      : super(key: key);
  final Function(Region) showRegionSites;
  final Region region;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () {
        showRegionSites(region);
      },
      title: AutoSizeText(
        region.getName(),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
        'Uganda',
        style: CustomTextStyle.bodyText4(context)
            ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.3)),
      ),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
    );
  }
}

class SearchTile extends StatelessWidget {
  const SearchTile(
      {Key? key, required this.suggestion, required this.onSearchTileTap})
      : super(key: key);
  final Suggestion suggestion;
  final Function(Suggestion) onSearchTileTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.only(left: 0.0),
      leading: const RegionAvatar(),
      onTap: () => onSearchTileTap(suggestion),
      title: AutoSizeText(
        suggestion.suggestionDetails.mainText.trimEllipsis(),
        maxLines: 1,
        minFontSize: 16.0,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline8(context),
      ),
      subtitle: AutoSizeText(
          suggestion.suggestionDetails.secondaryText.trimEllipsis(),
          maxLines: 1,
          minFontSize: 14.0,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.bodyText4(context)
              ?.copyWith(color: CustomColors.appColorBlack.withOpacity(0.3))),
      trailing: SvgPicture.asset(
        'assets/icon/more_arrow.svg',
        semanticsLabel: 'more',
        height: 6.99,
        width: 4,
      ),
    );
  }
}

class EmptyView extends StatelessWidget {
  const EmptyView(
      {Key? key,
      required this.title,
      required this.bodyInnerText,
      required this.topBars,
      required this.showRegions})
      : super(key: key);
  final String title;
  final String bodyInnerText;
  final bool topBars;
  final VoidCallback showRegions;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Visibility(
            visible: topBars,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                    height: 32,
                    width: 32,
                    decoration: BoxDecoration(
                        color: CustomColors.appBodyColor,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(8.0))),
                    child: Center(
                      child: IconButton(
                        iconSize: 10,
                        icon: Icon(
                          Icons.clear,
                          color: CustomColors.appColor,
                        ),
                        onPressed: showRegions,
                      ),
                    ))
              ],
            )),
        const SizedBox(
          height: 80,
        ),
        Image.asset(
          'assets/icon/coming_soon.png',
          height: 80,
          width: 80,
        ),
        const SizedBox(
          height: 16,
        ),
        Padding(
            padding: const EdgeInsets.only(left: 30, right: 30),
            child: Text(
              '$title\nComing soon on the network'.trim(),
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline7(context)
                  ?.copyWith(letterSpacing: 16 * -0.01),
            )),
        const SizedBox(
          height: 8,
        ),
        Padding(
            padding: const EdgeInsets.only(left: 20, right: 20),
            child: Text(
              'We currently do not support air quality '
              'monitoring in this $bodyInnerText, but we’re working on it.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyText2?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.4)),
            )),
        const SizedBox(
          height: 158,
        ),
      ],
    );
  }
}
