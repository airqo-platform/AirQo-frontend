import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive_flutter/hive_flutter.dart';

class DashboardLoadingWidget extends StatelessWidget {
  const DashboardLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      itemCount: 6,
      itemBuilder: (BuildContext context, int index) {
        double height;
        switch (index) {
          case 0:
            height = 50;
            break;
          case 1:
            height = 75;
            break;
          case 2:
            height = 100;
            break;
          default:
            height = 251;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(top: 16),
          child: ContainerLoadingAnimation(
            radius: 16,
            height: height,
          ),
        );
      },
    );
  }
}

class DashboardLocationButton extends StatelessWidget {
  const DashboardLocationButton(this.error, {super.key});
  final NearbyAirQualityError error;
  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () async {
        if (error == NearbyAirQualityError.locationDenied) {
          await Geolocator.openAppSettings();
        } else if (error == NearbyAirQualityError.locationDisabled) {
          await Geolocator.openLocationSettings();
        }
      },
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(40),
        elevation: 2,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(13),
          ),
        ),
        backgroundColor: CustomColors.appColorBlue,
        padding: const EdgeInsets.symmetric(
          vertical: 12,
          horizontal: 14,
        ),
      ),
      child: Text(
        error.message,
        textAlign: TextAlign.center,
        overflow: TextOverflow.ellipsis,
        maxLines: 2,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          height: 22 / 14,
          letterSpacing: 16 * -0.022,
        ),
      ),
    );
  }
}

class DashboardTopCard extends StatelessWidget {
  const DashboardTopCard({
    super.key,
    required this.widgetKey,
    required this.title,
    required this.children,
    required this.toolTipType,
    required this.nextScreenClickHandler,
  });

  final GlobalKey widgetKey;
  final String title;
  final List<Widget> children;
  final ToolTipType toolTipType;
  final VoidCallback nextScreenClickHandler;

  double getWidth(int length) {
    if (length <= 1) {
      return 31.9;
    }

    if (length <= 2) {
      return 40.0;
    }

    return 46.0;
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      key: widgetKey,
      child: GestureDetector(
        onTap: nextScreenClickHandler,
        child: Container(
          height: 56,
          padding: const EdgeInsets.all(12.0),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                height: 32,
                width: getWidth(children.length),
                child: Stack(
                  children: children,
                ),
              ),
              const SizedBox(
                width: 8,
              ),
              Text(
                title,
                style: CustomTextStyle.bodyText4(context)?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FavouritePlaceDashboardAvatar extends StatelessWidget {
  const FavouritePlaceDashboardAvatar({
    super.key,
    required this.rightPadding,
    required this.favouritePlace,
  });

  final double rightPadding;
  final FavouritePlace favouritePlace;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: rightPadding,
      child: ValueListenableBuilder<Box<AirQualityReading>>(
        valueListenable: Hive.box<AirQualityReading>(HiveBox.airQualityReadings)
            .listenable(keys: [favouritePlace.referenceSite]),
        builder: (context, box, widget) {
          final airQualityReading = box.get(favouritePlace.referenceSite);
          if (airQualityReading == null) {
            return const CircularLoadingAnimation(
              size: 32,
            );
          }

          return Container(
            height: 32.0,
            width: 32.0,
            padding: const EdgeInsets.all(2.0),
            decoration: BoxDecoration(
              border: Border.fromBorderSide(
                BorderSide(
                  color: CustomColors.appBodyColor,
                  width: 2,
                ),
              ),
              color: Pollutant.pm2_5.color(
                airQualityReading.pm2_5,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${airQualityReading.pm2_5}',
                style: TextStyle(
                  fontSize: 7,
                  color: Pollutant.pm2_5.textColor(
                    value: airQualityReading.pm2_5,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class KyaDashboardAvatar extends StatelessWidget {
  const KyaDashboardAvatar({
    super.key,
    required this.kya,
    required this.rightPadding,
  });
  final Kya kya;
  final double rightPadding;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: rightPadding,
      child: Container(
        height: 32.0,
        width: 32.0,
        padding: const EdgeInsets.all(2.0),
        decoration: BoxDecoration(
          border: Border.fromBorderSide(
            BorderSide(
              color: CustomColors.appBodyColor,
              width: 2,
            ),
          ),
          color: CustomColors.greyColor,
          shape: BoxShape.circle,
          image: DecorationImage(
            fit: BoxFit.cover,
            image: CachedNetworkImageProvider(
              kya.imageUrl,
              cacheKey: kya.imageUrlCacheKey(),
              cacheManager: CacheManager(
                CacheService.cacheConfig(
                  kya.imageUrlCacheKey(),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

List<Widget> completeKyaWidgets(List<Kya> completeKya) {
  final widgets = <Widget>[];

  try {
    switch (completeKya.length) {
      case 0:
        widgets.add(
          SvgPicture.asset(
            'assets/icon/add_avator.svg',
          ),
        );
        break;
      case 1:
        widgets.add(
          KyaDashboardAvatar(rightPadding: 0, kya: completeKya.first),
        );
        break;
      case 2:
        widgets
          ..add(KyaDashboardAvatar(rightPadding: 0, kya: completeKya.first))
          ..add(
            KyaDashboardAvatar(rightPadding: 7, kya: completeKya[1]),
          );
        break;
      default:
        if (completeKya.length >= 3) {
          widgets
            ..add(KyaDashboardAvatar(rightPadding: 0, kya: completeKya.first))
            ..add(KyaDashboardAvatar(rightPadding: 7, kya: completeKya[1]))
            ..add(
              KyaDashboardAvatar(rightPadding: 14, kya: completeKya[2]),
            );
        }
        break;
    }
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);
  }

  return widgets;
}

List<Widget> favouritePlacesWidgets(List<FavouritePlace> favouritePlaces) {
  final widgets = <Widget>[];

  try {
    switch (favouritePlaces.length) {
      case 0:
        widgets.add(
          SvgPicture.asset(
            'assets/icon/add_avator.svg',
          ),
        );
        break;
      case 1:
        widgets.add(
          FavouritePlaceDashboardAvatar(
            rightPadding: 0,
            favouritePlace: favouritePlaces.first,
          ),
        );
        break;
      case 2:
        widgets
          ..add(FavouritePlaceDashboardAvatar(
            rightPadding: 0,
            favouritePlace: favouritePlaces.first,
          ))
          ..add(
            FavouritePlaceDashboardAvatar(
              rightPadding: 7,
              favouritePlace: favouritePlaces[1],
            ),
          );
        break;
      default:
        if (favouritePlaces.length >= 3) {
          widgets
            ..add(FavouritePlaceDashboardAvatar(
              rightPadding: 0,
              favouritePlace: favouritePlaces.first,
            ))
            ..add(FavouritePlaceDashboardAvatar(
              rightPadding: 7,
              favouritePlace: favouritePlaces[1],
            ))
            ..add(
              FavouritePlaceDashboardAvatar(
                rightPadding: 14,
                favouritePlace: favouritePlaces[2],
              ),
            );
        }
        break;
    }
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);
  }

  return widgets;
}
