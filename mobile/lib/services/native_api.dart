import 'dart:io';
import 'dart:ui' as ui;

import 'package:app/constants/config.dart';
import 'package:app/models/measurement.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/site.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/date.dart';
import 'package:app/utils/distance.dart';
import 'package:app/utils/pm.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:location/location.dart' as locate_api;
import 'package:path_provider/path_provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import 'fb_notifications.dart';
import 'local_notifications.dart';

class LocationService {
  final locate_api.Location _location = locate_api.Location();
  final DBHelper _dbHelper = DBHelper();
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();

  Future<bool> allowLocationAccess() async {
    var enabled = await requestLocationAccess();
    if (enabled) {
      await _cloudAnalytics.logEvent(AnalyticsEvent.allowLocation);
    }
    return requestLocationAccess();
  }

  Future<bool> checkPermission() async {
    try {
      var status = await _location.hasPermission();
      if (status == locate_api.PermissionStatus.granted) {
        return true;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
    return false;
  }

  bool containsWord(String body, String term) {
    var words = body.toLowerCase().split(' ');
    var terms = term.toLowerCase().split(' ');
    for (var word in words) {
      if (terms.first.trim() == word.trim()) {
        return true;
      }
    }
    return false;
  }

  // Future<Address> getAddress(double lat, double lng) async {
  //   var addresses = await getAddressGoogle(lat, lng);
  //   if (addresses.isEmpty) {
  //     addresses = await getLocalAddress(lat, lng);
  //   }
  //   return addresses.first;
  // }

  Future<Measurement?> defaultLocationPlace() async {
    var measurement = await _dbHelper.getNearestMeasurement(
        Config.defaultLatitude, Config.defaultLongitude);

    if (measurement == null) {
      return null;
    }

    // var returnMeasurement = measurement;
    // var address =
    //     await getAddress(AppConfig.defaultLatitude,
    //     AppConfig.defaultLongitude);
    // returnMeasurement.site.name = address.thoroughfare;
    // returnMeasurement.site.description = address.thoroughfare;

    return measurement;
  }

  // Future<List<Address>> getAddressGoogle(double lat, double lang) async {
  //   final coordinates = Coordinates(lat, lang);
  //   List<Address> googleAddresses =
  //       await Geocoder.google(AppConfig.googleApiKey)
  //           .findAddressesFromCoordinates(coordinates);
  //   return googleAddresses;
  // }

  Future<String> getAddress(double lat, double lng) async {
    var placeMarks = await placemarkFromCoordinates(lat, lng);
    var place = placeMarks[0];
    var name = place.thoroughfare ?? place.name;
    name = name ?? place.subLocality;
    name = name ?? place.locality;
    name = name ?? '';

    return name;
  }

  // Future<List<Address>> getLocalAddress(double lat, double lang) async {
  //   final coordinates = Coordinates(lat, lang);
  //   List<Address> localAddresses =
  //       await Geocoder.local.findAddressesFromCoordinates(coordinates);
  //   return localAddresses;
  // }

  Future<Measurement?> getCurrentLocationReadings() async {
    try {
      var nearestMeasurements = <Measurement>[];
      double distanceInMeters;

      var location = await getLocation();
      if (location == null) {
        return null;
      }
      if (location.longitude != null && location.latitude != null) {
        var address = await getAddress(location.latitude!, location.longitude!);
        Measurement? nearestMeasurement;
        var latestMeasurements = await _dbHelper.getLatestMeasurements();

        for (var measurement in latestMeasurements) {
          distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
              measurement.site.latitude,
              measurement.site.longitude,
              location.latitude!,
              location.longitude!));
          if (distanceInMeters < Config.maxSearchRadius.toDouble()) {
            measurement.site.distance = distanceInMeters;
            try {
              // if (!address.thoroughfare.isNull()) {
              //   measurement.site.name = address.thoroughfare;
              //   measurement.site.description = address.thoroughfare;
              // }

              if (!address.isNull()) {
                measurement.site.name = address;
                measurement.site.searchName = address;
                measurement.site.description = address;
              }
            } catch (exception, stackTrace) {
              debugPrint('$exception\n$stackTrace');
            }
            nearestMeasurements.add(measurement);
          }
        }

        if (nearestMeasurements.isNotEmpty) {
          nearestMeasurement = nearestMeasurements.first;
          for (var measurement in nearestMeasurements) {
            if (nearestMeasurement!.site.distance > measurement.site.distance) {
              nearestMeasurement = measurement;
            }
          }
        }
        return nearestMeasurement;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      return null;
    }
  }

  Future<locate_api.LocationData?> getLocation() async {
    bool _serviceEnabled;
    locate_api.PermissionStatus _permissionGranted;

    _serviceEnabled = await _location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await _location.requestService();
      if (!_serviceEnabled) {
        return null;
      }
    }

    _permissionGranted = await _location.hasPermission();
    if (_permissionGranted == locate_api.PermissionStatus.denied) {
      _permissionGranted = await _location.requestPermission();
      if (_permissionGranted != locate_api.PermissionStatus.granted) {
        return null;
      }
    }

    // await location.changeSettings(accuracy: LocationAccuracy.balanced);
    // await location.enableBackgroundMode(enable: true);
    // location.onLocationChanged.listen((LocationData locationData) {
    //   print('${locationData.longitude} : ${locationData.longitude}');
    // });

    var _locationData = await _location.getLocation();
    return _locationData;
  }

  Future<Position> getLocationUsingGeoLocator() async {
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

  Future<Site?> getNearestSite(double latitude, double longitude) async {
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

  // Future<bool> requestLocationAccess() async {
  //   try {
  //     var status = await location.requestPermission();
  //     var id = _customAuth.getId();
  //     if (id != '') {
  //       await _cloudStore.updatePreferenceFields(
  //           id, 'location', status == PermissionStatus.granted, 'bool');
  //     }
  //     return status == PermissionStatus.granted;
  //   } catch (exception, stackTrace) {
  //     debugPrint('$exception\n$stackTrace');
  //   }
  //   return false;
  // }

  Future<List<Measurement>> getNearestSites(
      double latitude, double longitude) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

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

  Future<bool> requestLocationAccess() async {
    try {
      var status = await Geolocator.requestPermission();
      return !(status == LocationPermission.denied);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
    return false;
  }

  Future<bool> revokePermission() async {
    // TODO: implement revoke permission

    var id = _customAuth.getId();

    if (id != '') {
      await _cloudStore.updatePreferenceFields(id, 'location', false, 'bool');
    }
    return false;
  }

  Future<List<Measurement>> searchNearestSites(
      double latitude, double longitude, String term) async {
    var nearestSites = <Measurement>[];
    double distanceInMeters;

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      distanceInMeters = metersToKmDouble(Geolocator.distanceBetween(
          measurement.site.latitude,
          measurement.site.longitude,
          latitude,
          longitude));
      if (containsWord(measurement.site.getName(), term)) {
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

  List<Measurement> textSearchNearestSites(
      String term, List<Measurement> measurements) {
    var nearestSites = <Measurement>[];

    for (var measurement in measurements) {
      if (measurement.site
              .getName()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site
              .getLocation()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }

  Future<List<Measurement>> textSearchNearestSitesV1(String term) async {
    var nearestSites = <Measurement>[];

    var latestMeasurements = await _dbHelper.getLatestMeasurements();

    for (var measurement in latestMeasurements) {
      if (measurement.site
              .getName()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase()) ||
          measurement.site
              .getLocation()
              .trim()
              .toLowerCase()
              .contains(term.trim().toLowerCase())) {
        nearestSites.add(measurement);
      }
    }
    return nearestSites;
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();

  Future<bool> allowNotifications() async {
    var enabled = await requestPermission();
    if (enabled) {
      await _cloudAnalytics.logEvent(AnalyticsEvent.allowNotification);
    }
    return enabled;
  }

  Future<bool> checkPermission() async {
    try {
      var settings = await _firebaseMessaging.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        return true;
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }

    return false;
  }

  Future<String?> getToken() async {
    try {
      var token = await _firebaseMessaging.getToken();
      return token;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }

  Future<bool> requestPermission() async {
    try {
      var settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      var status =
          settings.authorizationStatus == AuthorizationStatus.authorized;

      var id = _customAuth.getId();

      if (id != '') {
        await _cloudStore.updatePreferenceFields(
            id, 'notifications', status, 'bool');
      }
      return status;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return false;
  }

  Future<bool> revokePermission() async {
    // TODO: implement revoke permission
    var id = _customAuth.getId();

    if (id != '') {
      await _cloudStore.updatePreferenceFields(
          id, 'notifications', false, 'bool');
    }
    return false;
  }

  static Future<void> backgroundNotificationHandler(
      RemoteMessage message) async {
    try {
      var notificationMessage = UserNotification.composeNotification(message);
      if (notificationMessage != null) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  static Future<void> foregroundMessageHandler(RemoteMessage message) async {
    try {
      var notificationMessage = UserNotification.composeNotification(message);
      if (notificationMessage != null) {
        await LocalNotifications().showAlertNotification(notificationMessage);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
}

class RateService {
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final InAppReview _inAppReview = InAppReview.instance;

  Future<void> rateApp() async {
    if (await _inAppReview.isAvailable()) {
      // await _inAppReview.requestReview();
      await _inAppReview
          .openStoreListing(
            appStoreId: Config.iosStoreId,
          )
          .then((value) => _logAppRating);
    } else {
      if (Platform.isIOS || Platform.isMacOS) {
        try {
          await launch(Config.appStoreUrl).then((value) => _logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      } else {
        try {
          await launch(Config.playStoreUrl).then((value) => _logAppRating);
        } catch (exception, stackTrace) {
          debugPrint('${exception.toString()}\n${stackTrace.toString()}');
        }
      }
    }
  }

  Future<void> _logAppRating() async {
    await _cloudAnalytics.logEvent(AnalyticsEvent.rateApp);
  }
}

class ShareService {
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();

  Widget analyticsCardImage(Measurement measurement, PlaceDetails placeDetails,
      BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 12, bottom: 12, left: 10, right: 10),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.all(Radius.circular(16.0)),
          border: Border.all(color: Colors.transparent)),
      child: ListView(
        shrinkWrap: true,
        children: [
          Row(
            children: [
              analyticsAvatar(measurement, 104, 40, 12),
              const SizedBox(width: 10.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AutoSizeText(
                      placeDetails.getName(),
                      maxLines: 2,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                    AutoSizeText(
                      placeDetails.getLocation(),
                      maxLines: 1,
                      style: TextStyle(
                          fontSize: 12, color: Colors.black.withOpacity(0.3)),
                    ),
                    const SizedBox(
                      height: 12,
                    ),
                    Container(
                      padding: const EdgeInsets.fromLTRB(10.0, 2.0, 10.0, 2.0),
                      decoration: BoxDecoration(
                          borderRadius:
                              const BorderRadius.all(Radius.circular(40.0)),
                          color: pm2_5ToColor(measurement.getPm2_5Value())
                              .withOpacity(0.4),
                          border: Border.all(color: Colors.transparent)),
                      child: AutoSizeText(
                        pm2_5ToString(measurement.getPm2_5Value()),
                        maxLines: 1,
                        textAlign: TextAlign.start,
                        style: TextStyle(
                          fontSize: 12,
                          color: pm2_5TextColor(measurement.getPm2_5Value()),
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
          Text(
            '© ${DateTime.now().year} AirQo',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.right,
            style: TextStyle(fontSize: 6, color: Colors.black.withOpacity(0.5)),
          ),
        ],
      ),
    );
  }

  Future<void> shareCard(BuildContext buildContext, GlobalKey globalKey,
      Measurement measurement) async {
    var dialogResponse = await showDialog<String>(
      context: buildContext,
      builder: (BuildContext context) => AlertDialog(
        title: const Text('Sharing Options'),
        content: const Text('Share via'),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.pop(context, 'image'),
            child: const Text('Image'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, 'text'),
            child: const Text('Text'),
          ),
        ],
      ),
    );

    if (dialogResponse == 'image') {
      var boundary =
          globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      var image = await boundary.toImage(pixelRatio: 10.0);
      var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      var pngBytes = byteData!.buffer.asUint8List();

      final directory = (await getApplicationDocumentsDirectory()).path;
      var imgFile = File('$directory/airqo_analytics_card.png');
      await imgFile.writeAsBytes(pngBytes);

      var message = '${measurement.site.getName()}, Current Air Quality. \n\n'
          'Source: AiQo App';
      await Share.shareFiles([imgFile.path], text: message)
          .then((value) => {_updateUserShares()});
    } else if (dialogResponse == 'text') {
      shareMeasurementText(measurement);
    } else {
      return;
    }
  }

  Future<void> shareGraph(BuildContext buildContext, GlobalKey globalKey,
      PlaceDetails placeDetails) async {
    var boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    var image = await boundary.toImage(pixelRatio: 10.0);
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();

    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/airqo_analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    var message = '${placeDetails.getName()}, Current Air Quality. \n\n'
        'Source: AiQo App';
    await Share.shareFiles([imgFile.path], text: message)
        .then((value) => {_updateUserShares()});
  }

  Future<void> shareKya(BuildContext buildContext, GlobalKey globalKey) async {
    var boundary =
        globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
    var image = await boundary.toImage(pixelRatio: 10.0);
    var byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    var pngBytes = byteData!.buffer.asUint8List();
    final directory = (await getApplicationDocumentsDirectory()).path;
    var imgFile = File('$directory/analytics_graph.png');
    await imgFile.writeAsBytes(pngBytes);

    var message = 'Source: AiQo App';
    await Share.shareFiles([imgFile.path], text: message)
        .then((value) => {_updateUserShares()});
  }

  void shareMeasurementText(Measurement measurement) {
    var recommendationList =
        getHealthRecommendations(measurement.getPm2_5Value(), 'pm2.5');
    var recommendations = '';
    for (var value in recommendationList) {
      recommendations = '$recommendations\n- ${value.body}';
    }
    Share.share(
            '${measurement.site.getName()}, Current Air Quality. \n\n'
            'PM2.5 : ${measurement.getPm2_5Value().toStringAsFixed(2)} µg/m\u00B3 (${pm2_5ToString(measurement.getPm2_5Value())}) \n'
            'PM10 : ${measurement.getPm10Value().toStringAsFixed(2)} µg/m\u00B3 \n'
            '$recommendations\n\n'
            'Source: AiQo App',
            subject: '${Config.appName}, ${measurement.site.getName()}!')
        .then((value) => {_updateUserShares()});
  }

  Future<void> _updateUserShares() async {
    var preferences = await _preferencesHelper.getPreferences();
    var value = preferences.aqShares + 1;
    if (_customAuth.isLoggedIn()) {
      await _cloudStore.updatePreferenceFields(
          _customAuth.getId(), 'aqShares', value, 'int');
    } else {
      await _preferencesHelper.updatePreference('aqShares', value, 'int');
    }

    if (value >= 5) {
      await _cloudAnalytics.logEvent(AnalyticsEvent.shareAirQualityInformation);
    }
  }
}
