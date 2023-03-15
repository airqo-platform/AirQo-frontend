import 'dart:async';
import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import 'hive_service.dart';
import 'rest_api.dart';

class LocationService {
  static Future<void> locationRequestDialog(BuildContext context) async {
    Profile profile = context.read<ProfileBloc>().state;
    await Permission.location.request().then((status) {
      switch (status) {
        case PermissionStatus.granted:
        case PermissionStatus.limited:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(location: true)));
          context
              .read<NearbyLocationBloc>()
              .add(const SearchLocationAirQuality());
          break;
        case PermissionStatus.restricted:
        case PermissionStatus.denied:
        case PermissionStatus.permanentlyDenied:
          context
              .read<ProfileBloc>()
              .add(UpdateProfile(profile.copyWith(location: false)));
          context
              .read<NearbyLocationBloc>()
              .add(const SearchLocationAirQuality());
          break;
      }
    });
  }

  static Future<bool> locationGranted() async {
    final permissionStatus = await Permission.location.status;

    switch (permissionStatus) {
      case PermissionStatus.permanentlyDenied:
      case PermissionStatus.denied:
      case PermissionStatus.restricted:
        return false;
      case PermissionStatus.limited:
      case PermissionStatus.granted:
        break;
    }

    return true;
  }

  static Future<void> requestLocation(
    BuildContext context,
    bool allow,
  ) async {
    Profile profile = context.read<ProfileBloc>().state;
    late String enableLocationMessage;
    late String disableLocationMessage;

    if (Platform.isAndroid) {
      enableLocationMessage =
          'To turn on location, go to\nApp Info > Permissions > Location > Allow only while using the app';
      disableLocationMessage =
          'To turn off location, go to\nApp Info > Permissions > Location > Deny';
    } else {
      enableLocationMessage =
          'To turn on location, go to\nSettings > AirQo > Location > Always';
      disableLocationMessage =
          'To turn off location, go to\nSettings > AirQo > Location > Never';
    }

    if (allow) {
      await Permission.location.status.then((status) async {
        switch (status) {
          case PermissionStatus.permanentlyDenied:
            await openPhoneSettings(context, enableLocationMessage);
            break;
          case PermissionStatus.denied:
            if (Platform.isAndroid) {
              await openPhoneSettings(context, enableLocationMessage);
            } else {
              await locationRequestDialog(context);
            }
            break;
          case PermissionStatus.restricted:
          case PermissionStatus.limited:
            await locationRequestDialog(context);
            break;
          case PermissionStatus.granted:
            context
                .read<ProfileBloc>()
                .add(UpdateProfile(profile.copyWith(location: true)));
            context
                .read<NearbyLocationBloc>()
                .add(const SearchLocationAirQuality());
            break;
        }
      });
    } else {
      await openPhoneSettings(context, disableLocationMessage);
    }
  }

  static Future<String> getAddress({
    required double latitude,
    required double longitude,
  }) async {
    List<Placemark> landMarks = await placemarkFromCoordinates(
      latitude,
      longitude,
    );

    if (landMarks.isEmpty) {
      return '';
    }

    final Placemark landMark = landMarks.first;

    String? address = landMark.thoroughfare ?? landMark.subLocality;
    address = address ?? landMark.locality;

    return address ?? '';
  }

  static Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        forceAndroidLocationManager: true,
        timeLimit: const Duration(seconds: 60),
      );
    } on TimeoutException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } on PlatformException catch (exception, stackTrace) {
      debugPrint(exception.message);
      debugPrintStack(stackTrace: stackTrace);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return null;
  }

  static Future<List<AirQualityReading>> getNearbyAirQualityReadings({
    Position? position,
  }) async {
    position ??= await getCurrentPosition();

    if (position == null) {
      final geoCoordinates = await AirqoApiClient().getLocation();
      if (!geoCoordinates.keys.contains('latitude') ||
          !geoCoordinates.keys.contains('longitude')) {
        return [];
      }

      position = Position(
        longitude: geoCoordinates['longitude'] as double,
        latitude: geoCoordinates['latitude'] as double,
        timestamp: DateTime.now(),
        accuracy: 0.0,
        altitude: 0.0,
        heading: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
      );
    }

    List<AirQualityReading> airQualityReadings = await getNearestSites(
      position.latitude,
      position.longitude,
    );
    airQualityReadings = airQualityReadings.sortByDistanceToReferenceSite();

    String address = await getAddress(
      latitude: position.latitude,
      longitude: position.longitude,
    );

    if (airQualityReadings.isNotEmpty && address.isNotEmpty) {
      airQualityReadings.first = airQualityReadings.first.copyWith(
        name: address,
      );
    }

    return airQualityReadings;
  }

  static Future<AirQualityReading?> getNearestSite(
    double latitude,
    double longitude,
  ) async {
    List<AirQualityReading> nearestSites = await getNearestSites(
      latitude,
      longitude,
    );

    return nearestSites.isEmpty
        ? null
        : nearestSites.sortByDistanceToReferenceSite().first;
  }

  static Future<List<AirQualityReading>> getNearestSites(
    double latitude,
    double longitude,
  ) async {
    List<AirQualityReading> airQualityReadings =
        HiveService.getAirQualityReadings();

    airQualityReadings = airQualityReadings.map((element) {
      final double distanceInMeters = metersToKmDouble(
        Geolocator.distanceBetween(
          element.latitude,
          element.longitude,
          latitude,
          longitude,
        ),
      );

      return element.copyWith(distanceToReferenceSite: distanceInMeters);
    }).toList();

    return airQualityReadings
        .where((element) =>
            element.distanceToReferenceSite < Config.searchRadius.toDouble())
        .toList();
  }

  static Future<AirQualityReading?> getSearchAirQuality(
    SearchResult result,
  ) async {
    final SearchResult? searchResult =
        await SearchApiClient().getPlaceDetails(result);

    if (searchResult == null) {
      return null;
    }

    AirQualityReading? airQualityReading = await LocationService.getNearestSite(
      searchResult.latitude,
      searchResult.longitude,
    );

    if (airQualityReading != null) {
      airQualityReading = airQualityReading.copyWith(
        name: searchResult.name,
        location: searchResult.location,
        latitude: searchResult.latitude,
        longitude: searchResult.longitude,
      );
      await HiveService.updateSearchHistory(airQualityReading);
    }

    return airQualityReading;
  }
}
