import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'enum_constants.g.dart';

enum Environment { dev, prod }

enum AuthenticationStatus {
  initial,
  error,
  success;
}

enum KyaLessonStatus {
  @JsonValue("TODO")
  todo,
  @JsonValue("IN_PROGRESS")
  inProgress,
  @JsonValue("PENDING_COMPLETION")
  pendingCompletion,
  @JsonValue("COMPLETE")
  complete;
}

enum CloudAnalyticsEvent {
  browserAsAppGuest('browser_as_guest'),
  createUserProfile('created_profile'),
  shareAirQualityInformation('share_air_quality_information'),
  completeOneKYA('complete_kya_lesson'),
  allowNotification('allow_notification'),
  allowLocation('allow_location'),
  uploadProfilePicture('upload_profile_picture'),
  savesFiveFavorites('save_five_favorite_places'),
  maleUser('male_user'),
  femaleUser('female_user'),
  undefinedGender('undefined_gender'),
  iosUser('ios_user'),
  androidUser('android_user'),
  rateApp('rate_app'),
  mtnUser('mtn_user'),
  airtelUser('airtel_user'),
  otherNetwork('other_network'),
  deletedAccount('deleted_account'),
  notificationOpen('notification_open'),
  notificationReceive('notification_receive');

  const CloudAnalyticsEvent(this.snakeCaseValue);

  final String snakeCaseValue;

  String snakeCase() {
    return '${kReleaseMode ? 'prod_' : 'stage_'}$snakeCaseValue';
  }
}

enum AppPermission {
  notification,
  location,
  photosStorage,
}

enum FeedbackStep {
  channelStep,
  typeStep,
  formStep;
}

// TODO translate this, remove un unsed enums
enum FirebaseAuthError {
  noInternetConnection(
    message: 'Check your internet connection',
    snackBarDuration: 5,
  ),
  accountInvalid(
    message: 'Invalid Account',
    snackBarDuration: 5,
  ),
  invalidAuthCode(
    message: 'Invalid code',
    snackBarDuration: 5,
  ),
  authSessionTimeout(
    message: 'Session time out. Sending another verification code',
    snackBarDuration: 5,
  ),
  authFailure(
    message: 'Authentication failed. Try again later',
    snackBarDuration: 5,
  ),
  logInRequired(
    message: 'Log in required.',
    snackBarDuration: 5,
  ),
  phoneNumberTaken(
    message: 'Phone number taken',
    snackBarDuration: 5,
  ),
  invalidPhoneNumber(
    message: 'Invalid Phone number',
    snackBarDuration: 5,
  ),
  invalidEmailAddress(
    message: 'Invalid Email address',
    snackBarDuration: 5,
  ),
  accountTaken(
    message: 'Invalid email address',
    snackBarDuration: 5,
  ),
  emailTaken(
    message: 'Email Taken',
    snackBarDuration: 5,
  );

  const FirebaseAuthError({
    required this.message,
    required this.snackBarDuration,
  });

  final String message;
  final int snackBarDuration;

  @override
  String toString() => message;
}

@HiveType(typeId: 110, adapterName: 'AppNotificationTypeAdapter')
enum AppNotificationType {
  @HiveField(0)
  appUpdate,
  @HiveField(1)
  reminder,
  @HiveField(2)
  welcomeMessage,
}

enum AirQuality {
  // TODO translate the remaining texts
  good(
    title: 'Good',
    description: 'The air is clean and healthy to breathe.',
    color: CustomColors.aqiGreen,
    svgEmoji: 'assets/icon/good_emoji.svg',
    searchNearbyLocationsText: 'Good Quality Air around you',
    searchOtherLocationsText: 'Locations with Good Quality Air',
    value: 6,
    minimumValue: 0,
    maximumValue: 12.09,
  ),
  moderate(
    title: 'Moderate',
    description:
        'The air is acceptable, but sensitive groups may experience some health effects.',
    color: CustomColors.aqiYellow,
    svgEmoji: 'assets/icon/moderate_emoji.svg',
    searchNearbyLocationsText: 'Moderate Quality Air around you',
    searchOtherLocationsText: 'Locations with Moderate Quality Air',
    value: 23.8,
    minimumValue: 12.1,
    maximumValue: 35.49,
  ),
  ufsgs(
    title: 'Unhealthy For Sensitive Groups',
    description:
        'People with respiratory or heart diseases, children, and elderly may experience health effects.',
    color: CustomColors.aqiOrange,
    svgEmoji: 'assets/icon/ufgs_emoji.svg',
    searchNearbyLocationsText:
        'Nearby locations with air quality Unhealthy For Sensitive Groups',
    searchOtherLocationsText:
        'Locations with air quality Unhealthy For Sensitive Groups',
    value: 44,
    minimumValue: 35.5,
    maximumValue: 55.49,
  ),
  unhealthy(
    title: 'Unhealthy',
    description:
        'People with respiratory or heart diseases, children, and elderly may experience health effects.',
    color: CustomColors.aqiRed,
    svgEmoji: 'assets/icon/unhealthy_emoji.svg',
    searchNearbyLocationsText: 'Unhealthy Quality Air around you',
    searchOtherLocationsText: 'Locations with Unhealthy Quality Air',
    value: 103,
    minimumValue: 55.5,
    maximumValue: 150.49,
  ),
  veryUnhealthy(
    title: 'Very Unhealthy',
    description:
        'Everyone may begin to experience some adverse health effects and sensitive groups are at higher risk.',
    color: CustomColors.aqiPurple,
    svgEmoji: 'assets/icon/very_unhealthy_emoji.svg',
    searchNearbyLocationsText: 'Very Unhealthy Quality Air around you',
    searchOtherLocationsText: 'Locations with Very Unhealthy Quality Air',
    value: 200.5,
    minimumValue: 150.5,
    maximumValue: 250.49,
  ),
  hazardous(
    title: 'Hazardous',
    description:
        'Health warnings of emergency conditions. The entire population is more likely to be affected, with serious health effects on sensitive groups.',
    color: CustomColors.aqiMaroon,
    svgEmoji: 'assets/icon/hazardous_emoji.svg',
    searchNearbyLocationsText: 'Hazardous Quality Air around you',
    searchOtherLocationsText: 'Locations with Hazardous Quality Air',
    value: 300,
    minimumValue: 250.5,
    maximumValue: 500,
  );

  String getSearchNearbyLocationsText(BuildContext context) {
    switch (this) {
      case AirQuality.good:
        return AppLocalizations.of(context)!.goodQualityAirAroundYou;
      case AirQuality.moderate:
        return AppLocalizations.of(context)!.moderateQualityAirAroundYou;
      case AirQuality.ufsgs:
        return AppLocalizations.of(context)!
            .nearbyLocationsWithAirQualityUnhealthyForSensitiveGroups;
      case AirQuality.unhealthy:
        return AppLocalizations.of(context)!.veryUnhealthyQualityAirAroundYou;
      case AirQuality.veryUnhealthy:
        return AppLocalizations.of(context)!.veryUnhealthyQualityAirAroundYou;
      case AirQuality.hazardous:
        return AppLocalizations.of(context)!.hazardousQualityAirAroundYou;
    }
  }

  String getTitle(BuildContext context) {
    switch (this) {
      case AirQuality.good:
        return AppLocalizations.of(context)!.good;
      case AirQuality.moderate:
        return AppLocalizations.of(context)!.moderate;
      case AirQuality.ufsgs:
        return AppLocalizations.of(context)!.unhealthyForSensitiveGroups;
      case AirQuality.unhealthy:
        return AppLocalizations.of(context)!.unhealthy;
      case AirQuality.veryUnhealthy:
        return AppLocalizations.of(context)!.veryUnhealthy;
      case AirQuality.hazardous:
        return AppLocalizations.of(context)!.hazardous;
    }
  }

  String getSearchOtherLocationsText(BuildContext context) {
    switch (this) {
      case AirQuality.good:
        return AppLocalizations.of(context)!.locationsWithGoodQualityAir;
      case AirQuality.moderate:
        return AppLocalizations.of(context)!.locationsWithModerateQualityAir;
      case AirQuality.ufsgs:
        return AppLocalizations.of(context)!
            .locationsWithAirQualityUnhealthyForSensitiveGroups;
      case AirQuality.unhealthy:
        return AppLocalizations.of(context)!.locationsWithUnhealthyQualityAir;
      case AirQuality.veryUnhealthy:
        return AppLocalizations.of(context)!
            .locationsWithVeryUnhealthyQualityAir;
      case AirQuality.hazardous:
        return AppLocalizations.of(context)!.locationsWithHazardousQualityAir;
    }
  }

  String getDescription(BuildContext context) {
    switch (this) {
      case AirQuality.good:
        return AppLocalizations.of(context)!
            .theAirIsCleanAndHealthyToBreathe; // TODO: rename to goodAirQualityDescription
      case AirQuality.moderate:
        return AppLocalizations.of(context)!
            .theAirIsAcceptableButSensitiveGroupsMayExperienceSomeHealthEffects;
      case AirQuality.ufsgs:
        return AppLocalizations.of(context)!
            .peopleWithRespiratoryOrHeartDiseasesChildrenAndElderlyMayExperienceHealthEffects;
      case AirQuality.unhealthy:
        return AppLocalizations.of(context)!
            .peopleWithRespiratoryOrHeartDiseasesChildrenAndElderlyMayExperienceHealthEffects;
      case AirQuality.veryUnhealthy:
        return AppLocalizations.of(context)!
            .everyoneMayBeginToExperienceSomeAdverseHealthEffectsAndSensitiveGroupsAreAtHigherRisk;
      case AirQuality.hazardous:
        return AppLocalizations.of(context)!
            .healthWarningsOfEmergencyConditionsTheEntirePopulationIsMoreLikelyToBeAffectedWithSeriousHealthEffectsOnSensitiveGroups; // TODO: rename to hazardousAirQualityDescription
    }
  }

  const AirQuality({
    required this.title,
    required this.description,
    required this.color,
    required this.svgEmoji,
    required this.searchNearbyLocationsText,
    required this.searchOtherLocationsText,
    required this.value,
    required this.minimumValue,
    required this.maximumValue,
  });

  final String title;
  final String description;
  final String svgEmoji;
  final Color color;
  final String searchOtherLocationsText;
  final String searchNearbyLocationsText;
  final double value;
  final double minimumValue;
  final double maximumValue;

  @override
  String toString() => title;
}

enum FeedbackType {
  inquiry('Inquiry'),
  suggestion('Suggestion'),
  appBugs('App Bugs'),
  reportAirPollution('Report Air Pollution'),
  none('');

  const FeedbackType(this.string);

  final String string;

  @override
  String toString() => string;

  String getStringValue(BuildContext context) {
    switch (this) {
      case FeedbackType.inquiry:
        return AppLocalizations.of(context)!.inquiry;
      case FeedbackType.suggestion:
        return AppLocalizations.of(context)!.suggestion;
      case FeedbackType.appBugs:
        return AppLocalizations.of(context)!.appBugs;
      case FeedbackType.reportAirPollution:
        return AppLocalizations.of(context)!.reportAirPollution;
      case FeedbackType.none:
        return '';
    }
  }
}

enum FeedbackChannel {
  whatsApp('Whatsapp'),
  email('Email'),
  none('');

  const FeedbackChannel(this.string);

  final String string;

  @override
  String toString() => string;
}

enum AuthMethod {
  phone(
    updateMessage:
        'You will not be able to sign in with your previous phone number after changing it',
    codeVerificationText: 'Enter the 6 digits code sent to',
    editEntryText: 'Change your number',
    invalidInputErrorMessage: 'Looks like you missed a digit.',
    invalidInputMessage: 'Oops, Something’s wrong with your phone number',
  ),
  email(
    updateMessage:
        'You will not be able to sign in with your previous email address after changing it',
    codeVerificationText: 'Enter the 6 digits code sent to',
    editEntryText: 'Change your email',
    invalidInputErrorMessage: 'Looks like you missed a letter',
    invalidInputMessage: 'Oops, Something’s wrong with your email',
  );

  const AuthMethod({
    required this.updateMessage,
    required this.codeVerificationText,
    required this.editEntryText,
    required this.invalidInputErrorMessage,
    required this.invalidInputMessage,
  });

  final String updateMessage;
  final String codeVerificationText; // TODO remove this
  final String editEntryText;
  final String invalidInputErrorMessage; // TODO remove this
  final String invalidInputMessage; // TODO remove this

  String optionsText(AuthProcedure procedure, BuildContext context) {
    switch (this) {
      case AuthMethod.phone:
        return procedure == AuthProcedure.login
            ? AppLocalizations.of(context)!.loginWithYourMobileNumber
            : AppLocalizations.of(context)!.signUpWithYourMobileNumberOrEmail;
      case AuthMethod.email:
        return procedure == AuthProcedure.login
            ? AppLocalizations.of(context)!.loginWithYourEmail
            : AppLocalizations.of(context)!.signUpWithYourMobileNumberOrEmail;
      default:
        return '';
    }
  }

  String optionsButtonText(AuthProcedure procedure, BuildContext context) {
    switch (this) {
      case AuthMethod.phone:
        return procedure == AuthProcedure.login
            ? AppLocalizations.of(context)!.loginWithAnEmailInstead
            : AppLocalizations.of(context)!.signUpWithAnEmailInstead;
      case AuthMethod.email: // TODO translate this
        return procedure == AuthProcedure.login
            ? 'Login with a mobile number instead'
            : 'Sign up with a mobile number instead';
      default:
        throw UnimplementedError(
          '$name does’nt have options button text implementation',
        );
    }
  }
}

enum AuthProcedure {
  login(
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  signup(
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  anonymousLogin(
    // TODO remove this
    confirmationTitle: '',
    confirmationBody: '',
    confirmationOkayText: '',
    confirmationCancelText: '',
  ),
  deleteAccount(
    // TODO translate this
    confirmationTitle: 'Heads up!!!.. you are about to delete your account!',
    confirmationBody: 'You will lose all your saved places',
    confirmationOkayText: 'Proceed',
    confirmationCancelText: 'Cancel',
  ),
  logout(
    // TODO translate this
    confirmationTitle: 'Heads up!!!.. you are about to logout!',
    confirmationBody:
        'You will miss out on notifications and won’t be able to save favourite places',
    confirmationOkayText: 'Proceed',
    confirmationCancelText: 'Cancel',
  );

  const AuthProcedure({
    required this.confirmationTitle,
    required this.confirmationBody,
    required this.confirmationOkayText,
    required this.confirmationCancelText,
  });

  final String confirmationTitle;
  final String confirmationBody;
  final String confirmationOkayText;
  final String confirmationCancelText;

  String getConfirmationTitle(BuildContext context) {
    switch (this) {
      case AuthProcedure.login:
        return "AppLocalizations.of(context)!.loginConfirmationTitle";
      case AuthProcedure.signup:
        return " AppLocalizations.of(context)!.signupConfirmationTitle";
      case AuthProcedure.anonymousLogin:
        return "AppLocalizations.of(context)!.anonymousLoginConfirmationTitle";
      case AuthProcedure.deleteAccount:
        return "AppLocalizations.of(context)!.deleteAccountConfirmationTitle";
      case AuthProcedure.logout:
        return "AppLocalizations.of(context)!.logoutConfirmationTitle";
    }
  }
}

enum Gender {
  male,
  female,
  undefined,
}

enum ConfirmationAction {
  cancel,
  ok,
}

enum OnBoardingPage {
  signup('signup'),
  profile('profile'),
  notification('notification'),
  location('location'),
  complete('complete'),
  home('home'),
  welcome('welcome');

  const OnBoardingPage(this.string);

  final String string;

  @override
  String toString() => string;
}

enum Pollutant {
  pm2_5(svg: 'assets/icon/PM2.5.svg'),
  pm10(svg: 'assets/icon/PM10.svg');

  const Pollutant({required this.svg});

  final String svg;

  AirQuality airQuality(double value) {
    switch (this) {
      case Pollutant.pm2_5:
        if (value <= 12.09) {
          return AirQuality.good;
        } else if (value.isWithin(12.1, 35.49)) {
          return AirQuality.moderate;
        } else if (value.isWithin(35.5, 55.49)) {
          return AirQuality.ufsgs;
        } else if (value.isWithin(55.5, 150.49)) {
          return AirQuality.unhealthy;
        } else if (value.isWithin(150.5, 250.49)) {
          return AirQuality.veryUnhealthy;
        } else if (value >= 250.5) {
          return AirQuality.hazardous;
        } else {
          return AirQuality.good;
        }
      case Pollutant.pm10:
        if (value <= 50.99) {
          return AirQuality.good;
        } else if (value.isWithin(51, 100.99)) {
          return AirQuality.moderate;
        } else if (value.isWithin(101, 250.99)) {
          return AirQuality.ufsgs;
        } else if (value.isWithin(251, 350.99)) {
          return AirQuality.unhealthy;
        } else if (value.isWithin(351, 430.99)) {
          return AirQuality.veryUnhealthy;
        } else if (value >= 431) {
          return AirQuality.hazardous;
        } else {
          return AirQuality.good;
        }
    }
  }

  String infoDialogText(double value, BuildContext context) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return AppLocalizations.of(context)!.airQualityIsSafeForEveryone;
      case AirQuality.moderate:
        return AppLocalizations.of(context)!
            .unusuallySensitivePeopleShouldConsiderReducingProlongedOrIntenseOutdoorActivities;
      case AirQuality.ufsgs:
        return AppLocalizations.of(context)!
            .theElderlyAndChildrenShouldLimitIntenseOutdoorActivitiesSensitivePeopleShouldReduceProlongedOrIntenseOutDoorActivities;
      case AirQuality.unhealthy:
        return AppLocalizations.of(context)!
            .peopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldAvoidIntenseOutdoorActivitiesEveryoneElseShouldLimitIntenseOutdoorActivities;

      case AirQuality.veryUnhealthy:
        return AppLocalizations.of(context)!
            .peopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldAvoidIntenseOutdoorActivitiesEveryoneElseShouldLimitIntenseOutdoorActivities;
      case AirQuality.hazardous:
        return AppLocalizations.of(context)!
            .everyoneMayBeginToExperienceSomeAdverseHealthEffectsAndSensitiveGroupsAreAtHigherRisk;
    }
  }

  Color color(double value) {
    switch (airQuality(value)) {
      case AirQuality.good:
        return CustomColors.aqiGreen;
      case AirQuality.moderate:
        return CustomColors.aqiYellow;
      case AirQuality.ufsgs:
        return CustomColors.aqiOrange;
      case AirQuality.unhealthy:
        return CustomColors.aqiRed;
      case AirQuality.veryUnhealthy:
        return CustomColors.aqiPurple;
      case AirQuality.hazardous:
        return CustomColors.aqiMaroon;
    }
  }

  Color textColor({required double? value, bool graph = false}) {
    if (value == null) {
      return CustomColors.greyColor;
    }

    switch (airQuality(value)) {
      case AirQuality.good:
        return CustomColors.aqiGreenTextColor;
      case AirQuality.moderate:
        return CustomColors.aqiYellowTextColor;
      case AirQuality.ufsgs:
        return CustomColors.aqiOrangeTextColor;
      case AirQuality.unhealthy:
        return CustomColors.aqiRedTextColor;
      case AirQuality.veryUnhealthy:
        return CustomColors.aqiPurpleTextColor;
      case AirQuality.hazardous:
        if (graph) {
          return CustomColors.aqiMaroon;
        }
        return CustomColors.aqiMaroonTextColor;
    }
  }
}

enum TitleOptions {
  ms(value: 'Ms', displayValue: 'Ms.', abbr: 'Ms.'), // TODO translate this
  mr(value: 'Mr', displayValue: 'Mr.', abbr: 'Mr.'), // TODO translate this
  undefined(
    value: 'Rather Not Say',
    displayValue: 'Rather Not Say',
    abbr: 'Ra.',
  ); // TODO translate this

  const TitleOptions({
    required this.value,
    required this.displayValue,
    required this.abbr,
  });

  final String value;
  final String displayValue;
  final String abbr;

  // String getValue(BuildContext context) {
  //   switch (this) {
  //     case TitleOptions.ms:
  //       return AppLocalizations.of(context)!.ms;
  //     case TitleOptions.mr:
  //       return AppLocalizations.of(context)!.mr;
  //     case TitleOptions.undefined:
  //       return AppLocalizations.of(context)!.ratherNotSay;
  //   }
  // }
}

enum ToolTipType {
  favouritePlaces,
  info,
  forYou,
  forecast,
}

enum ShowcaseOptions {
  up,
  skip,
  none,
}
