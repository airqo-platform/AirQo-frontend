import 'package:flutter/foundation.dart';

enum AnalyticsEvent {
  browserAsAppGuest,
  createUserProfile,
  shareAirQualityInformation,
  completeOneKYA,
  allowNotification,
  allowLocation,
  uploadProfilePicture,
  savesFiveFavorites,
  maleUser,
  femaleUser,
  undefinedGender,
  iosUser,
  androidUser,
  rateApp,
}

extension AnalyticsEventExtension on AnalyticsEvent {
  String getName(String loggedInStatus) {
    var prefix = 'prod_$loggedInStatus';
    if (!kReleaseMode) {
      prefix = 'stage_$loggedInStatus';
    }
    switch (this) {
      case AnalyticsEvent.browserAsAppGuest:
        return '${prefix}browser_as_guest';
      case AnalyticsEvent.createUserProfile:
        return '${prefix}created_a_profile';
      case AnalyticsEvent.rateApp:
        return '${prefix}rate_app';
      case AnalyticsEvent.shareAirQualityInformation:
        return '${prefix}share_air_quality_information';
      case AnalyticsEvent.allowLocation:
        return '${prefix}allow_location';
      case AnalyticsEvent.allowNotification:
        return '${prefix}allow_notification';
      case AnalyticsEvent.uploadProfilePicture:
        return '${prefix}upload_profile_picture';
      case AnalyticsEvent.completeOneKYA:
        return '${prefix}complete_one_kya_lesson';
      case AnalyticsEvent.savesFiveFavorites:
        return '${prefix}saves_five_favorite_place';
      case AnalyticsEvent.maleUser:
        return '${prefix}male_user';
      case AnalyticsEvent.femaleUser:
        return '${prefix}female_user';
      case AnalyticsEvent.undefinedGender:
        return '${prefix}undefined_gender';
      case AnalyticsEvent.iosUser:
        return '${prefix}ios_user';
      case AnalyticsEvent.androidUser:
        return '${prefix}android_user';
      default:
        return '';
    }
  }
}
