import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geolocator/geolocator.dart';

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

class SearchingAirQuality extends StatelessWidget {
  const SearchingAirQuality({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(13.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(
            color: CustomColors.appColorBlue,
          ),
        ),
      ),
      child: Text(
        "Searching for air quality near you, hold on tight.",
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: CustomColors.appColorBlue,
          fontSize: 14,
        ),
      ),
    );
  }
}

class NoLocationAirQualityMessage extends StatelessWidget {
  const NoLocationAirQualityMessage(
    this.message, {
    super.key,
    this.dismiss = true,
  });
  final String message;
  final bool dismiss;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(13.0),
        ),
        border: Border.fromBorderSide(
          BorderSide(
            color: CustomColors.appColorBlue,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SvgPicture.asset(
            'assets/icon/info_icon.svg',
            height: 10,
            width: 10,
          ),
          const SizedBox(
            width: 8,
          ),
          Expanded(
            child: Text(
              message,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: CustomColors.appColorBlue,
                fontSize: 14,
              ),
            ),
          ),
          Visibility(
            visible: dismiss,
            child: InkWell(
              onTap: () {
                context
                    .read<NearbyLocationBloc>()
                    .add(const DismissErrorMessage());
              },
              child: SizedBox(
                width: 30,
                child: SvgPicture.asset(
                  'assets/icon/close.svg',
                  height: 20,
                  width: 20,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardLocationButton extends StatelessWidget {
  const DashboardLocationButton({super.key});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: () async {
        await Geolocator.requestPermission().then((value) async {
          switch (value) {
            case LocationPermission.deniedForever:
            case LocationPermission.denied:
              await Geolocator.openAppSettings();
              break;
            case LocationPermission.unableToDetermine:
              break;
            case LocationPermission.whileInUse:
            case LocationPermission.always:
              bool isLocationOn = await Geolocator.isLocationServiceEnabled();
              if(!isLocationOn){
                await Geolocator.openLocationSettings();
              }
              break;
          }
        });
      },
      style: OutlinedButton.styleFrom(
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
      child: const Text(
        "Turn on location to get air quality near you",
        textAlign: TextAlign.center,
        overflow: TextOverflow.ellipsis,
        maxLines: 2,
        style: TextStyle(color: Colors.white),
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
    return GestureDetector(
      onTap: nextScreenClickHandler,
      key: widgetKey,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(56),
          foregroundColor: CustomColors.appColorBlue,
          elevation: 0,
          side: const BorderSide(
            color: Colors.transparent,
            width: 0,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8),
            ),
          ),
          backgroundColor: Colors.white,
          padding: EdgeInsets.zero,
        ),
        onPressed: nextScreenClickHandler,
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
    AirQualityReading? airQualityReading = favouritePlace.airQualityReading;
    if (airQualityReading == null) {
      return Positioned(
        right: rightPadding,
        child: const CircularLoadingAnimation(
          size: 32,
        ),
      );
    }

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
