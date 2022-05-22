import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../constants/config.dart';
import '../../models/enum_constants.dart';
import '../../models/kya.dart';
import '../../models/measurement.dart';
import '../../themes/app_theme.dart';
import '../../utils/pm.dart';
import '../../widgets/custom_shimmer.dart';
import '../kya/kya_widgets.dart';
import '../search/search_page.dart';

class DashboardFavPlaceAvatar extends StatelessWidget {
  final double rightPadding;
  final Measurement measurement;
  const DashboardFavPlaceAvatar(
      {Key? key, required this.rightPadding, required this.measurement})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: pollutantValueColor(
                value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '${measurement.getPm2_5Value()}',
              style: TextStyle(
                  fontSize: 7,
                  color: pollutantTextColor(
                      value: measurement.getPm2_5Value(),
                      pollutant: Pollutant.pm2_5)),
            ),
          ),
        ));
  }
}

class KyaDashboardAvatar extends StatelessWidget {
  final Kya kya;
  final double rightPadding;
  const KyaDashboardAvatar(
      {Key? key, required this.kya, required this.rightPadding})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: Config.greyColor,
            shape: BoxShape.circle,
            image: DecorationImage(
              fit: BoxFit.cover,
              image: CachedNetworkImageProvider(
                kya.imageUrl,
              ),
            ),
          ),
        ));
  }
}

class DashboardEmptyAvatar extends StatelessWidget {
  final double rightPadding;
  const DashboardEmptyAvatar({Key? key, required this.rightPadding})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
        right: rightPadding,
        child: Container(
          height: 32.0,
          width: 32.0,
          padding: const EdgeInsets.all(2.0),
          decoration: BoxDecoration(
            border: Border.all(color: Config.appBodyColor, width: 2),
            color: Config.greyColor,
            shape: BoxShape.circle,
          ),
        ));
  }
}

class DashboardTopBar extends StatelessWidget implements PreferredSizeWidget {
  const DashboardTopBar({Key? key}) : super(key: key);

  @override
  PreferredSizeWidget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      title: Container(
        padding: const EdgeInsets.only(top: 24),
        child: Row(
          children: [
            SvgPicture.asset(
              'assets/icon/airqo_logo.svg',
              height: 40,
              width: 58,
              semanticsLabel: 'AirQo',
            ),
            const Spacer(),
            GestureDetector(
              onTap: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const SearchPage();
                }));
              },
              child: Container(
                height: 40,
                width: 40,
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.rectangle,
                    borderRadius: BorderRadius.all(Radius.circular(10.0))),
                child: SvgPicture.asset(
                  'assets/icon/search.svg',
                  semanticsLabel: 'Search',
                ),
              ),
            ),
          ],
        ),
      ),
      elevation: 0,
      toolbarHeight: 65,
      backgroundColor: Config.appBodyColor,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(72);
}

class DashboardKyaCard extends StatelessWidget {
  final Kya kya;
  final Function(Kya) kyaClickCallBack;
  const DashboardKyaCard(
      {Key? key, required this.kya, required this.kyaClickCallBack})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        await kyaClickCallBack(kya);
      },
      child: Container(
        padding: const EdgeInsets.fromLTRB(16.0, 8.0, 8.0, 8.0),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(16.0))),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                children: [
                  SizedBox(
                    height: 40,
                    child: AutoSizeText(kya.title,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: CustomTextStyle.headline8(context)),
                  ),
                  const SizedBox(
                    height: 28,
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      KyaMessage(
                        kya: kya,
                      ),
                      const SizedBox(
                        width: 6,
                      ),
                      SvgPicture.asset(
                        'assets/icon/more_arrow.svg',
                        semanticsLabel: 'more',
                        height: 6.99,
                        width: 4,
                      ),
                    ],
                  ),
                  SizedBox(
                    height: getKyaMessage(kya: kya).toLowerCase() == 'continue'
                        ? 2
                        : 0,
                  ),
                  KyaProgressBar(kya: kya),
                ],
              ),
            ),
            const SizedBox(
              width: 16,
            ),
            ClipRRect(
              borderRadius: BorderRadius.circular(8.0),
              child: CachedNetworkImage(
                fit: BoxFit.cover,
                width: 104,
                height: 104,
                placeholder: (context, url) => const SizedBox(
                  width: 104,
                  height: 104,
                  child: ContainerLoadingAnimation(height: 104, radius: 8),
                ),
                imageUrl: kya.imageUrl,
                errorWidget: (context, url, error) => Icon(
                  Icons.error_outline,
                  color: Config.red,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
