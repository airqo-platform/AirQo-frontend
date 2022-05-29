import 'dart:io';
import 'dart:ui' as ui;

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:location/location.dart' as locate_api;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/enum_constants.dart';
import '../models/profile.dart';
import '../themes/app_theme.dart';
import '../utils/exception.dart';
import 'firebase_service.dart';

class LocationService {
  static Future<bool> allowLocationAccess() async {
    var enabled = await PermissionService.checkPermission(
        AppPermission.location,
        request: true);
    if (enabled) {
      await Future.wait([
        CloudAnalytics.logEvent(AnalyticsEvent.allowLocation, true),
        Profile.getProfile().then((profile) => profile.saveProfile())
      ]);
    }

    return enabled;
  }

  static Future<Measurement?> defaultLocationPlace() async {
    final dbHelper = DBHelper();
    var measurement = await dbHelper.getNearestMeasurement(
        Config.defaultLatitude, Config.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    return measurement;
  }

  static Future<String> getAddress(double lat, double lng) async {
    var placeMarks = await placemarkFromCoordinates(lat, lng);
    var place = placeMarks[0];
    var name = place.thoroughfare ?? place.name;
    name = name ?? place.subLocality;
    name = name ?? place.locality;
    name = name ?? '';

    return name;
  }

  static Future<List<String>> getAddresses(double lat, double lng) async {
    var placeMarks = await placemarkFromCoordinates(lat, lng);
    var addresses = <String>[];
    for (var place in placeMarks) {
      var name = place.thoroughfare ?? place.name;
      name = name ?? place.subLocality;
      name = name ?? place.locality;
      name = name ?? '';
      if (name != '') {
        addresses.add(name);
      }
    }
    return addresses;
  }

  static Future<locate_api.LocationData?> getLocation() async {
    bool _serviceEnabled;
    locate_api.PermissionStatus _permissionGranted;
    final location = locate_api.Location();
    _serviceEnabled = await location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await location.requestService();
      if (!_serviceEnabled) {
        return null;
      }
    }

    _permissionGranted = await location.hasPermission();
    if (_permissionGranted == locate_api.PermissionStatus.denied) {
      _permissionGranted = await location.requestPermission();
      if (_permissionGranted != locate_api.PermissionStatus.granted) {
        return null;
      }
    }

    // await location.changeSettings(accuracy: LocationAccuracy.balanced);
    // await location.enableBackgroundMode(enable: true);
    // location.onLocationChanged.listen((LocationData locationData) {
    //   print('${locationData.longitude} : ${locationData.longitude}');
    // });

    var locationData = await location.getLocation();
    return locationData;
  }

  static Future<Position> getLocationUsingGeoLocator() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Please enable'
            ' permission to access your location');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied, '
          'please enable permission to access your location');
    }
    return await Geolocator.getCurrentPosition();
  }

  static Future<List<Measurement>> getNearbyLocationReadings() async {
    try {
      var nearestMeasurements = <Measurement>[];
      double distanceInMeters;

      var location = await getLocation();
      if (location == null) {
        return [];
      }

      if (location.longitude != null && location.latitude != null) {
        var addresses =
            await getAddresses(location.latitude!, location.longitude!);
        Measurement? nearestMeasurement;
        final dbHelper = DBHelper();
        var latestMeasurements = await dbHelper.getLatestMeasurements();

        for (var measurement in latestMeasurements) {
          distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
              measurement.site.latitude,
              measurement.site.longitude,
              location.latitude!,
              location.longitude!));
          if (distanceInMeters < (Config.maxSearchRadius.toDouble() * 2)) {
            measurement.site.distance = distanceInMeters;
            nearestMeasurements.add(measurement);
          }
        }

        var measurements = <Measurement>[];

        /// Get Actual location measurements
        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }
          nearestMeasurements.remove(nearestMeasurement);

          for (var address in addresses) {
            nearestMeasurement?.site.name = address;
            measurements.add(nearestMeasurement!);
          }
        }

        /// Get Alternative location measurements
        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }

          measurements.add(nearestMeasurement!);
        }

        return measurements;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return [];
    }
    return [];
  }

  static Future<Site?> getNearestSite(double latitude, double longitude) async {
    try {
      var nearestSites = await getNearestSites(latitude, longitude);
      if (nearestSites.isEmpty) {
        return null;
      }

      var nearestSite = nearestSites.first;

      for (var site in nearestSites) {
        if (nearestSite.site.distance > site.site.distance) {
          nearestSite = site;
        }
      }

      return nearestSite.site;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return null;
    }
  }

  static Future<List<Measurement>> getNearestSites(
      double latitude, double longitude) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    var latestMeasurements = await dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      }
    }

    return nearestSites;
  }

  static Future<bool> revokePermission() async {
    // TODO: implement revoke permission

    final profile = await Profile.getProfile();
    await profile.saveProfile();
    return false;
  }

  static Future<List<Measurement>> searchNearestSites(
      double latitude, double longitude, String term) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;
    final dbHelper = DBHelper();
    var latestMeasurements = await dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (measurement.site.name.inStatement(term)) {
        measurement.site.distance = distanceInMeters;
        nearestSites.add(measurement);
      } else {
        if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
          measurement.site.distance = distanceInMeters;
          nearestSites.add(measurement);
        }
      }
    }

    return nearestSites;
  }

  static List<Measurement> textSearchNearestSites(
      String term, List<Measurement> measurements) {
    var nearestSites = <Measurement>[];

    for (var measurement in measurements) {
      if (measurement.site.name
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site.location
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }

  static Future<List<Measurement>> textSearchNearestSitesV1(String term) async {
    var nearestSites = <Measurement>[];
    final dbHelper = DBHelper();
    var latestMeasurements = await dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      if (measurement.site.name
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site.location
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }
}

class SystemProperties {
  static Future<void> setDefault() async {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));

    await SystemChrome.setPreferredOrientations(
        [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);

    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: [SystemUiOverlay.bottom, SystemUiOverlay.top]);
  }
}

class RateService {
  static Future<void> rateApp({bool inApp = false}) async {
    if (await InAppReview.instance.isAvailable()) {
      inApp
          ? await InAppReview.instance.requestReview()
          : await InAppReview.instance
              .openStoreListing(
                appStoreId: Config.iosStoreId,
              )
              .then((value) => logAppRating);
    } else {
      if (Platform.isIOS || Platform.isMacOS) {
        try {
          await launchUrl(Uri.parse(Config.appStoreUrl))
              .then((value) => logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      } else {
        try {
          await launchUrl(Uri.parse(Config.playStoreUrl))
              .then((value) => logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      }
    }
  }

  static Future<void> logAppRating() async {
    await CloudAnalytics.logEvent(AnalyticsEvent.rateApp, true);
  }
}

class ShareService {
  static Widget analyticsCardImage(Measurement measurement,
      PlaceDetails placeDetails, BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 200, maxWidth: 300),
      padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 8),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(16.0)),
          border: Border.all(color: Colors.transparent)),
      child: Column(
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnalyticsAvatar(measurement: measurement),
              const SizedBox(width: 10.0),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AutoSizeText(
                      placeDetails.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 17,
                      style: CustomTextStyle.headline9(context),
                    ),
                    AutoSizeText(
                      placeDetails.location,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      minFontSize: 12,
                      style: CustomTextStyle.bodyText4(context)?.copyWith(
                          color: Config.appColorBlack.withOpacity(0.3)),
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color: pollutantValueColor(
                                  value: measurement.getPm2_5Value(),
                                  pollutant: Pollutant.pm2_5)
                              .withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: AutoSizeText(
                        pollutantValueString(
                            value: measurement.getPm2_5Value(),
                            pollutant: Pollutant.pm2_5),
                        maxLines: 2,
                        textAlign: TextAlign.start,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          color: pollutantTextColor(
                              value: measurement.getPm2_5Value(),
                              pollutant: Pollutant.pm2_5),
                        ),
                      ),
                    ),
                    const SizedBox(
                      height: 8,
                    ),
                    Text(
                      dateToShareString(measurement.time),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 8, color: Colors.black.withOpacity(0.3)),
                    ),
                  ],
                ),
              )
            ],
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '© ${DateTime.now().year} AirQo',
                style: TextStyle(
                  fontSize: 9,
                  color: Config.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'www.airqo.africa',
                style: TextStyle(
                  fontSize: 9,
                  color: Config.appColorBlack.withOpacity(0.5),
                  height: 32 / 9,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  static String getShareMessage() {
    return 'Download the AirQo app from Google play\nhttps://play.google.com/store/apps/details?id=com.airqo.app\nand App Store\nhttps://itunes.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091\n';
  }

  static Future<void> shareCard(BuildContext buildContext, GlobalKey globalKey,
      Measurement measurement) async {
    try {
      var boundary =
          globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      var image = await boundary.toImage(pixelRatio: 10.0);
      var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      var pngBytes = byteData!.buffer.asUint8List();

      final directory = (await getApplicationDocumentsDirectory()).path;
      var imgFile = File('$directory/airqo_analytics_card.png');
      await imgFile.writeAsBytes(pngBytes);

      await Share.shareFiles([imgFile.path], text: getShareMessage())
          .then((value) => {updateUserShares()});
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  static Future<void> shareGraph(BuildContext buildContext, GlobalKey globalKey,
      PlaceDetails placeDetails) async {
    var boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    var image = await boundary.toImage(pixelRatio: 10.0);
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();

    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/airqo_analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    await Share.shareFiles([imgFile.path], text: getShareMessage())
        .then((value) => {updateUserShares()});
  }

  static Future<void> shareKya(
      BuildContext buildContext, GlobalKey globalKey) async {
    var boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    var image = await boundary.toImage(pixelRatio: 10.0);
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();
    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    await Share.shareFiles([imgFile.path], text: getShareMessage())
        .then((value) => {updateUserShares()});
  }

  static void shareMeasurementText(Measurement measurement) {
    var recommendationList =
        getHealthRecommendations(measurement.getPm2_5Value(), Pollutant.pm2_5);
    var recommendations = '';
    for (var value in recommendationList) {
      recommendations = '$recommendations\n- ${value.body}';
    }
    Share.share(
            '${measurement.site.name}, Current Air Quality. \n\n'
            'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pollutantValueString(value: measurement.getPm2_5Value(), pollutant: Pollutant.pm2_5)}) \n'
            'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 \n'
            '$recommendations\n\n'
            'Source: AirQo App',
            subject: 'AirQo, ${measurement.site.name}!')
        .then((value) => {updateUserShares()});
  }

  static Future<void> updateUserShares() async {
    var preferences = await SharedPreferencesHelper.getPreferences();
    var value = preferences.aqShares + 1;
    if (CustomAuth.isLoggedIn()) {
      var profile = await Profile.getProfile();
      profile.preferences.aqShares = value;
      await profile.saveProfile();
    } else {
      await SharedPreferencesHelper.updatePreference('aqShares', value, 'int');
    }

    if (value >= 5) {
      await CloudAnalytics.logEvent(
          AnalyticsEvent.shareAirQualityInformation, true);
    }
  }
}

class PermissionService {
  static Future<bool> checkPermission(AppPermission permission,
      {bool request = false}) async {
    PermissionStatus status;
    switch (permission) {
      case AppPermission.notification:
        status = await Permission.notification.status;
        break;
      case AppPermission.location:
        status = await Permission.location.status;
        break;
    }

    if (status != PermissionStatus.granted && request) {
      if (status == PermissionStatus.permanentlyDenied) {
        return await openAppSettings();
      } else {
        switch (permission) {
          case AppPermission.notification:
            return await Permission.notification.request() ==
                PermissionStatus.granted;
          case AppPermission.location:
            return await Permission.location.request() ==
                PermissionStatus.granted;
        }
      }
    }

    return status == PermissionStatus.granted;
  }
}
