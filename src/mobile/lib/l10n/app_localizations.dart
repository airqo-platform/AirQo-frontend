import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_lg.dart';
import 'app_localizations_pcm.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_sw.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fr'),
    Locale('lg'),
    Locale('pcm'),
    Locale('pt'),
    Locale('sw'),
  ];

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @unableDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Can\'t delete account now. Try again later'**
  String get unableDeleteAccount;

  /// No description provided for @location.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// No description provided for @nortification.
  ///
  /// In en, this message translates to:
  /// **'Notification'**
  String get nortification;

  /// No description provided for @rateAirQoApp.
  ///
  /// In en, this message translates to:
  /// **'Rate the AirQo App'**
  String get rateAirQoApp;

  /// No description provided for @selectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// No description provided for @sendFeedback.
  ///
  /// In en, this message translates to:
  /// **'Send feedback'**
  String get sendFeedback;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @takeTour.
  ///
  /// In en, this message translates to:
  /// **'Take a tour of the App'**
  String get takeTour;

  /// No description provided for @restartTour.
  ///
  /// In en, this message translates to:
  /// **'You can always restart the App Tour from here anytime.'**
  String get restartTour;

  /// No description provided for @sendFeedbackEmail.
  ///
  /// In en, this message translates to:
  /// **'Send Us Feedback Via Email'**
  String get sendFeedbackEmail;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'E-mail'**
  String get email;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @thanksFeedback.
  ///
  /// In en, this message translates to:
  /// **'Thanks for your feedback.'**
  String get thanksFeedback;

  /// No description provided for @tellUsDetails.
  ///
  /// In en, this message translates to:
  /// **'Please tell us the details'**
  String get tellUsDetails;

  /// No description provided for @goAheadTellUsMore.
  ///
  /// In en, this message translates to:
  /// **'Go Ahead, Tell Us More?'**
  String get goAheadTellUsMore;

  /// No description provided for @feedBackType.
  ///
  /// In en, this message translates to:
  /// **'What Type Of Feedback?'**
  String get feedBackType;

  /// No description provided for @reportAirPollution.
  ///
  /// In en, this message translates to:
  /// **'Report Air Pollution'**
  String get reportAirPollution;

  /// No description provided for @inquiry.
  ///
  /// In en, this message translates to:
  /// **'Inquiry'**
  String get inquiry;

  /// No description provided for @suggestion.
  ///
  /// In en, this message translates to:
  /// **'Suggestion'**
  String get suggestion;

  /// No description provided for @appBugs.
  ///
  /// In en, this message translates to:
  /// **'App Bugs'**
  String get appBugs;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete your account'**
  String get deleteAccount;

  /// No description provided for @enterYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter your email'**
  String get enterYourEmail;

  /// No description provided for @favorites.
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get favorites;

  /// No description provided for @favorite.
  ///
  /// In en, this message translates to:
  /// **'Favorite'**
  String get favorite;

  /// No description provided for @forYou.
  ///
  /// In en, this message translates to:
  /// **'For You'**
  String get forYou;

  /// No description provided for @todayAirQuality.
  ///
  /// In en, this message translates to:
  /// **'Today\'s air quality'**
  String get todayAirQuality;

  /// No description provided for @unableToGetCurrentLocation.
  ///
  /// In en, this message translates to:
  /// **'We\'re unable to get your current location. Explore locations below in the meantime.'**
  String get unableToGetCurrentLocation;

  /// No description provided for @unableToGetAirQuality.
  ///
  /// In en, this message translates to:
  /// **'We\'re unable to get your location\'s air quality . Explore locations below as we expand our network.'**
  String get unableToGetAirQuality;

  /// No description provided for @viewMoreInsights.
  ///
  /// In en, this message translates to:
  /// **'View More Insights'**
  String get viewMoreInsights;

  /// No description provided for @goodMorning.
  ///
  /// In en, this message translates to:
  /// **'Good Morning '**
  String get goodMorning;

  /// No description provided for @goodAfternoon.
  ///
  /// In en, this message translates to:
  /// **'Good Afternoon '**
  String get goodAfternoon;

  /// No description provided for @goodEvening.
  ///
  /// In en, this message translates to:
  /// **'Good Evening '**
  String get goodEvening;

  /// No description provided for @good.
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get good;

  /// No description provided for @moderate.
  ///
  /// In en, this message translates to:
  /// **'Moderate'**
  String get moderate;

  /// No description provided for @unhealthySG.
  ///
  /// In en, this message translates to:
  /// **'Unhealthy for Sensitive Groups'**
  String get unhealthySG;

  /// No description provided for @unhealthy.
  ///
  /// In en, this message translates to:
  /// **'Unhealthy'**
  String get unhealthy;

  /// No description provided for @veryUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'Very Unhealthy'**
  String get veryUnhealthy;

  /// No description provided for @hazardous.
  ///
  /// In en, this message translates to:
  /// **'Hazardous'**
  String get hazardous;

  /// No description provided for @share.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get share;

  /// No description provided for @creatingShareLink.
  ///
  /// In en, this message translates to:
  /// **'Creating share link. Hang on tight'**
  String get creatingShareLink;

  /// No description provided for @welcomeTo.
  ///
  /// In en, this message translates to:
  /// **'Welcome to'**
  String get welcomeTo;

  /// No description provided for @newExperiencesForYou.
  ///
  /// In en, this message translates to:
  /// **'New experiences for You'**
  String get newExperiencesForYou;

  /// No description provided for @keepTrackOfAirQualityInLocationsThatMatterToYou.
  ///
  /// In en, this message translates to:
  /// **'Keep track of air quality in locations that matter to you'**
  String get keepTrackOfAirQualityInLocationsThatMatterToYou;

  /// No description provided for @saveYourFavoritePlaces.
  ///
  /// In en, this message translates to:
  /// **'Save your favorite places'**
  String get saveYourFavoritePlaces;

  /// No description provided for @accessAnalyticsAndContentCuratedJustForYou.
  ///
  /// In en, this message translates to:
  /// **'Access analytics and content curated just for you'**
  String get accessAnalyticsAndContentCuratedJustForYou;

  /// No description provided for @knowYourAirOnTheGo.
  ///
  /// In en, this message translates to:
  /// **'Know your air on the go'**
  String get knowYourAirOnTheGo;

  /// No description provided for @anEasyWayToPlanYourOutdoorActivitiesToMinimiseexcessiveExposureToBadAirQuality.
  ///
  /// In en, this message translates to:
  /// **'An easy way to plan your outdoor activities to minimise\n exposure to air pollution excessive exposure to bad air quality'**
  String
  get anEasyWayToPlanYourOutdoorActivitiesToMinimiseexcessiveExposureToBadAirQuality;

  /// No description provided for @letsGo.
  ///
  /// In en, this message translates to:
  /// **'Let\'s go'**
  String get letsGo;

  /// No description provided for @tapAgainToExit.
  ///
  /// In en, this message translates to:
  /// **'Tap again to exit !'**
  String get tapAgainToExit;

  /// No description provided for @enableLocations.
  ///
  /// In en, this message translates to:
  /// **'Enable locations'**
  String get enableLocations;

  /// No description provided for @allowAirQoToSendYouLocationAirQualityUpdateForYourWorkPlaceHome.
  ///
  /// In en, this message translates to:
  /// **'Allow AirQo to send you location air \n quality update for your work place, home'**
  String get allowAirQoToSendYouLocationAirQualityUpdateForYourWorkPlaceHome;

  /// No description provided for @yesKeepMeSafe.
  ///
  /// In en, this message translates to:
  /// **'Yes, keep me safe'**
  String get yesKeepMeSafe;

  /// No description provided for @knowYourAirInRealTime.
  ///
  /// In en, this message translates to:
  /// **'Know your air in real time'**
  String get knowYourAirInRealTime;

  /// No description provided for @getNotifiedWhenAirQualityIsGettingBetterOrWorse.
  ///
  /// In en, this message translates to:
  /// **'Get notified when air quality is getting better or worse'**
  String get getNotifiedWhenAirQualityIsGettingBetterOrWorse;

  /// No description provided for @yesKeepMeUpdated.
  ///
  /// In en, this message translates to:
  /// **'Yes, keep me updated'**
  String get yesKeepMeUpdated;

  /// No description provided for @turnOnLocationToGetAirQualityNearYou.
  ///
  /// In en, this message translates to:
  /// **'Turn on location to get air quality near you'**
  String get turnOnLocationToGetAirQualityNearYou;

  /// No description provided for @searchingForAirQualityNearYouHangOnTight.
  ///
  /// In en, this message translates to:
  /// **'Searching for air quality near you, Hang on tight.'**
  String get searchingForAirQualityNearYouHangOnTight;

  /// No description provided for @pleaseEnterYourName.
  ///
  /// In en, this message translates to:
  /// **'Please enter your name'**
  String get pleaseEnterYourName;

  /// No description provided for @enterYourName.
  ///
  /// In en, this message translates to:
  /// **'Enter your name'**
  String get enterYourName;

  /// No description provided for @noThanks.
  ///
  /// In en, this message translates to:
  /// **'No, thanks'**
  String get noThanks;

  /// No description provided for @breatheClean.
  ///
  /// In en, this message translates to:
  /// **'Breathe\nClean.'**
  String get breatheClean;

  /// No description provided for @greatPleaseEnterYourName.
  ///
  /// In en, this message translates to:
  /// **'Great!\nPlease enter your name?'**
  String get greatPleaseEnterYourName;

  /// No description provided for @allSet.
  ///
  /// In en, this message translates to:
  /// **'All Set!'**
  String get allSet;

  /// No description provided for @breathe.
  ///
  /// In en, this message translates to:
  /// **'Breathe'**
  String get breathe;

  /// No description provided for @invalidPhoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Invalid Phone number'**
  String get invalidPhoneNumber;

  /// No description provided for @checkYourInternetConnection.
  ///
  /// In en, this message translates to:
  /// **'Check your internet connection'**
  String get checkYourInternetConnection;

  /// No description provided for @phoneNumberNotFoundDidYouSignUp.
  ///
  /// In en, this message translates to:
  /// **'Phone number not found. Did you sign up?'**
  String get phoneNumberNotFoundDidYouSignUp;

  /// No description provided for @phoneNumberAlreadyRegisteredPleaseLogIn.
  ///
  /// In en, this message translates to:
  /// **'Phone number already registered. Please log in'**
  String get phoneNumberAlreadyRegisteredPleaseLogIn;

  /// No description provided for @tapAgainToCancel.
  ///
  /// In en, this message translates to:
  /// **'Tap again to cancel !'**
  String get tapAgainToCancel;

  /// No description provided for @wellSendYouAVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'We\'ll send you a verification code'**
  String get wellSendYouAVerificationCode;

  /// No description provided for @greatFewMoreStepsBeforeYouCanBreathe.
  ///
  /// In en, this message translates to:
  /// **'Great, few more steps before you can\nbreathe'**
  String get greatFewMoreStepsBeforeYouCanBreathe;

  /// No description provided for @oopsSomethingsWrongWithYourNumber.
  ///
  /// In en, this message translates to:
  /// **'Oops, Something\'s wrong with your number'**
  String get oopsSomethingsWrongWithYourNumber;

  /// No description provided for @success.
  ///
  /// In en, this message translates to:
  /// **'Success'**
  String get success;

  /// No description provided for @enterCodeToLogin.
  ///
  /// In en, this message translates to:
  /// **'Enter code to login'**
  String get enterCodeToLogin;

  /// No description provided for @verifyYourAccount.
  ///
  /// In en, this message translates to:
  /// **'Verify your account'**
  String get verifyYourAccount;

  /// No description provided for @oopsSomethingsWrongWithYourCode.
  ///
  /// In en, this message translates to:
  /// **'Oops, Something\'s wrong with your code'**
  String get oopsSomethingsWrongWithYourCode;

  /// No description provided for @loginSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Login successful'**
  String get loginSuccessful;

  /// No description provided for @yourPhoneNumberHasBeenVerified.
  ///
  /// In en, this message translates to:
  /// **'Your phone number has been verified'**
  String get yourPhoneNumberHasBeenVerified;

  /// No description provided for @enterThe6DigitsCodeSentTo.
  ///
  /// In en, this message translates to:
  /// **'Enter the 6 digits code sent to\n{placeholder}'**
  String enterThe6DigitsCodeSentTo(Object placeholder);

  /// No description provided for @sureYouReadItCorrectlyProTipCopyPaste.
  ///
  /// In en, this message translates to:
  /// **'Sure you read it correctly? Pro Tip: Copy & Paste'**
  String get sureYouReadItCorrectlyProTipCopyPaste;

  /// No description provided for @phewwAlmostDoneHangInThere.
  ///
  /// In en, this message translates to:
  /// **'Pheww, almost done, hang in there.'**
  String get phewwAlmostDoneHangInThere;

  /// No description provided for @resendCode.
  ///
  /// In en, this message translates to:
  /// **'Resend code'**
  String get resendCode;

  /// No description provided for @theCodeShouldArrive.
  ///
  /// In en, this message translates to:
  /// **'The code should arrive with in {placeholder} sec'**
  String theCodeShouldArrive(Object placeholder);

  /// No description provided for @noInternetConnection.
  ///
  /// In en, this message translates to:
  /// **'No Internet connection'**
  String get noInternetConnection;

  /// No description provided for @alreadyHaveAnAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get alreadyHaveAnAccount;

  /// No description provided for @logIn.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get logIn;

  /// No description provided for @dontHaveAnAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get dontHaveAnAccount;

  /// No description provided for @signUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// No description provided for @pleaseEnterTheCode.
  ///
  /// In en, this message translates to:
  /// **'Please enter the code'**
  String get pleaseEnterTheCode;

  /// No description provided for @pleaseEnterAllTheDigits.
  ///
  /// In en, this message translates to:
  /// **'Please enter all the digits'**
  String get pleaseEnterAllTheDigits;

  /// No description provided for @firstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get firstName;

  /// No description provided for @lastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get lastName;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Log Out'**
  String get logout;

  /// No description provided for @personaliseYourExperience.
  ///
  /// In en, this message translates to:
  /// **'Personalise your\nexperience'**
  String get personaliseYourExperience;

  /// No description provided for @createYourAccountTodayAndEnjoyAirQualityUpdatesAndHealthTips.
  ///
  /// In en, this message translates to:
  /// **'Create your account today and enjoy air quality updates and health tips.'**
  String get createYourAccountTodayAndEnjoyAirQualityUpdatesAndHealthTips;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @editProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get editProfile;

  /// No description provided for @failedToUpdateProfilePic.
  ///
  /// In en, this message translates to:
  /// **'Failed to update profile pic'**
  String get failedToUpdateProfilePic;

  /// No description provided for @guest.
  ///
  /// In en, this message translates to:
  /// **'Guest'**
  String get guest;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @thisIsTheAnalyticsTab.
  ///
  /// In en, this message translates to:
  /// **'This is the analytics Tab'**
  String get thisIsTheAnalyticsTab;

  /// No description provided for @analytics.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get analytics;

  /// No description provided for @doYouWantToKnowMoreAboutAirQualityKnowYourAirInThisSection.
  ///
  /// In en, this message translates to:
  /// **'Do you want to know more about air quality? Know your air in this section'**
  String get doYouWantToKnowMoreAboutAirQualityKnowYourAirInThisSection;

  /// No description provided for @knowYourair.
  ///
  /// In en, this message translates to:
  /// **'Know your Air'**
  String get knowYourair;

  /// No description provided for @exploreAirQualityHere.
  ///
  /// In en, this message translates to:
  /// **'Explore air quality here'**
  String get exploreAirQualityHere;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @seeReadingsFromOurMonitorsHere.
  ///
  /// In en, this message translates to:
  /// **'See readings from our monitors here'**
  String get seeReadingsFromOurMonitorsHere;

  /// No description provided for @airQoMap.
  ///
  /// In en, this message translates to:
  /// **'AirQo Map'**
  String get airQoMap;

  /// No description provided for @changeYourPreferencesAndSettingsHere.
  ///
  /// In en, this message translates to:
  /// **'Change your preferences and settings here'**
  String get changeYourPreferencesAndSettingsHere;

  /// No description provided for @clickToSkipTutorial.
  ///
  /// In en, this message translates to:
  /// **'Click to Skip Tutorial'**
  String get clickToSkipTutorial;

  /// No description provided for @findTheLatestAirQualityFromYourFavoriteLocations.
  ///
  /// In en, this message translates to:
  /// **'Find the latest air quality from your favorite locations'**
  String get findTheLatestAirQualityFromYourFavoriteLocations;

  /// No description provided for @findAmazingContentSpecificallyDesignedForYouHere.
  ///
  /// In en, this message translates to:
  /// **'Find amazing content specifically designed for you here.'**
  String get findAmazingContentSpecificallyDesignedForYouHere;

  /// No description provided for @findTheAirQualityOfDifferentLocationsAcrossAfricaHere.
  ///
  /// In en, this message translates to:
  /// **'Find the air quality of different locations across Africa here'**
  String get findTheAirQualityOfDifferentLocationsAcrossAfricaHere;

  /// No description provided for @thisCardShowsTheAirQualityOfYourNearestLocation.
  ///
  /// In en, this message translates to:
  /// **'This card shows the air quality of your nearest location'**
  String get thisCardShowsTheAirQualityOfYourNearestLocation;

  /// No description provided for @youCanAlwaysRestartTheAppTourFromHereAnytime.
  ///
  /// In en, this message translates to:
  /// **'You can always restart the App Tour from here anytime'**
  String get youCanAlwaysRestartTheAppTourFromHereAnytime;

  /// No description provided for @skipShowCase.
  ///
  /// In en, this message translates to:
  /// **'Skip Showcase'**
  String get skipShowCase;

  /// No description provided for @description.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get description;

  /// No description provided for @couldNotCreateAShareLink.
  ///
  /// In en, this message translates to:
  /// **'Could not create a share link'**
  String get couldNotCreateAShareLink;

  /// No description provided for @pleaseEnterAValidEmail.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email'**
  String get pleaseEnterAValidEmail;

  /// No description provided for @emailNotFoundDidYouSignUp.
  ///
  /// In en, this message translates to:
  /// **'Email not found. Did you sign up?'**
  String get emailNotFoundDidYouSignUp;

  /// No description provided for @emailAlreadyRegisteredPleaseLogIn.
  ///
  /// In en, this message translates to:
  /// **'Email already registered. Please log in'**
  String get emailAlreadyRegisteredPleaseLogIn;

  /// No description provided for @oopsSomethingsWrongWithYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Oops, Something’s wrong with your email'**
  String get oopsSomethingsWrongWithYourEmail;

  /// No description provided for @yourEmailHasBeenVerified.
  ///
  /// In en, this message translates to:
  /// **'Your email has been verified'**
  String get yourEmailHasBeenVerified;

  /// No description provided for @more.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get more;

  /// No description provided for @noAirQualityForThisPlace.
  ///
  /// In en, this message translates to:
  /// **'No air quality for this place'**
  String get noAirQualityForThisPlace;

  /// No description provided for @moreInsights.
  ///
  /// In en, this message translates to:
  /// **'More Insights'**
  String get moreInsights;

  /// No description provided for @oopsNoLessonsAtTheMoment.
  ///
  /// In en, this message translates to:
  /// **'Oops.. No Lessons at the moment'**
  String get oopsNoLessonsAtTheMoment;

  /// No description provided for @swipeLeftOrRightToMoveToNextCard.
  ///
  /// In en, this message translates to:
  /// **'Swipe left or right to move to next card'**
  String get swipeLeftOrRightToMoveToNextCard;

  /// No description provided for @resume.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get resume;

  /// No description provided for @begin.
  ///
  /// In en, this message translates to:
  /// **'Begin'**
  String get begin;

  /// No description provided for @completeMoveTo.
  ///
  /// In en, this message translates to:
  /// **'Complete! Move to'**
  String get completeMoveTo;

  /// No description provided for @oopsWeDontHaveAirQualityReadingsFor.
  ///
  /// In en, this message translates to:
  /// **'Oops!!.. We don’t have air quality readings for {placeholder}'**
  String oopsWeDontHaveAirQualityReadingsFor(Object placeholder);

  /// No description provided for @tryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Try again later'**
  String get tryAgainLater;

  /// No description provided for @termsPrivacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Terms & Privacy Policy'**
  String get termsPrivacyPolicy;

  /// No description provided for @noResultsFound.
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get noResultsFound;

  /// No description provided for @tryAdjustingYourSearchToFindWhatYoureLookingFor.
  ///
  /// In en, this message translates to:
  /// **'Try adjusting your search to find what you’re looking for.'**
  String get tryAdjustingYourSearchToFindWhatYoureLookingFor;

  /// No description provided for @weCantSeemToFindTheKYAContentYoureLookingFor.
  ///
  /// In en, this message translates to:
  /// **'We can’t seem to find the KYA content you’re looking for.'**
  String get weCantSeemToFindTheKYAContentYoureLookingFor;

  /// No description provided for @scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut.
  ///
  /// In en, this message translates to:
  /// **'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out'**
  String get scaredTakeADeepBreathOfCleanAirOnUsReadyBreatheInBreatheOut;

  /// No description provided for @returnHome.
  ///
  /// In en, this message translates to:
  /// **'Return home'**
  String get returnHome;

  /// No description provided for @noAirQualityData.
  ///
  /// In en, this message translates to:
  /// **'No Air Quality data'**
  String get noAirQualityData;

  /// No description provided for @wereHavingIssuesWithOurNetworkNoWorriesWellBeBackUpSoon.
  ///
  /// In en, this message translates to:
  /// **'We’re having issues with our network no worries, we’ll be back up soon.'**
  String get wereHavingIssuesWithOurNetworkNoWorriesWellBeBackUpSoon;

  /// No description provided for @reload.
  ///
  /// In en, this message translates to:
  /// **'Reload'**
  String get reload;

  /// No description provided for @viewYourFavoritPlaces.
  ///
  /// In en, this message translates to:
  /// **'View your favorite places'**
  String get viewYourFavoritPlaces;

  /// No description provided for @tapThe.
  ///
  /// In en, this message translates to:
  /// **'Tap the'**
  String get tapThe;

  /// No description provided for @favoriteIconOnAnyLocationToAddItToYourFavorites.
  ///
  /// In en, this message translates to:
  /// **'Favorite icon on any location to add it to your favorites'**
  String get favoriteIconOnAnyLocationToAddItToYourFavorites;

  /// No description provided for @addFavorites.
  ///
  /// In en, this message translates to:
  /// **'Add Favorites'**
  String get addFavorites;

  /// No description provided for @knowTheAirQualityTrends.
  ///
  /// In en, this message translates to:
  /// **'Know the Air Quality trends'**
  String get knowTheAirQualityTrends;

  /// No description provided for @stayOnTopOfChangesInAirQualityOfPlacesImportantToYou.
  ///
  /// In en, this message translates to:
  /// **' Stay on top of changes in Air Quality of places important to you'**
  String get stayOnTopOfChangesInAirQualityOfPlacesImportantToYou;

  /// No description provided for @turnOnLocation.
  ///
  /// In en, this message translates to:
  /// **'Turn on location'**
  String get turnOnLocation;

  /// No description provided for @keepUpWithYourLessons.
  ///
  /// In en, this message translates to:
  /// **'Keep up with your lessons'**
  String get keepUpWithYourLessons;

  /// No description provided for @trackYourCompletedKnowYourAirLessonsAndRevisitThemAnytime.
  ///
  /// In en, this message translates to:
  /// **'Track your completed \'Know Your Air\' lessons and revisit them anytime'**
  String get trackYourCompletedKnowYourAirLessonsAndRevisitThemAnytime;

  /// No description provided for @startLearning.
  ///
  /// In en, this message translates to:
  /// **'Start learning'**
  String get startLearning;

  /// No description provided for @noLessons.
  ///
  /// In en, this message translates to:
  /// **'No lessons'**
  String get noLessons;

  /// No description provided for @connectToTheInternetToSeeResults.
  ///
  /// In en, this message translates to:
  /// **'Connect to the internet to see results'**
  String get connectToTheInternetToSeeResults;

  /// No description provided for @weCantSeemToFindTheContentYoureLookingFor.
  ///
  /// In en, this message translates to:
  /// **'We can’t seem to find the content you’re looking for'**
  String get weCantSeemToFindTheContentYoureLookingFor;

  /// No description provided for @aFatalErrorHasOccurred.
  ///
  /// In en, this message translates to:
  /// **'A fatal error has occurred.'**
  String get aFatalErrorHasOccurred;

  /// No description provided for @reportHasBeenSuccessfullySent.
  ///
  /// In en, this message translates to:
  /// **'Report has been successfully sent.'**
  String get reportHasBeenSuccessfullySent;

  /// No description provided for @reportError.
  ///
  /// In en, this message translates to:
  /// **'Report Error'**
  String get reportError;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @congrats.
  ///
  /// In en, this message translates to:
  /// **'Congrats!'**
  String get congrats;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @recentSearches.
  ///
  /// In en, this message translates to:
  /// **'Recent Searches'**
  String get recentSearches;

  /// No description provided for @tryAdjustingYourFiltersToFindWhatYoureLookingFor.
  ///
  /// In en, this message translates to:
  /// **'Try adjusting your filters to find what you’re looking for'**
  String get tryAdjustingYourFiltersToFindWhatYoureLookingFor;

  /// No description provided for @cantFindAirQualityOfExploreTheseLocationsRelateToYourSearch.
  ///
  /// In en, this message translates to:
  /// **'Can\'t find air quality of {placeholder}?\nExplore these locations related to your search.'**
  String cantFindAirQualityOfExploreTheseLocationsRelateToYourSearch(
    Object placeholder,
  );

  /// No description provided for @suggestions.
  ///
  /// In en, this message translates to:
  /// **'Suggestions'**
  String get suggestions;

  /// No description provided for @enterCodeToDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Enter code to delete account'**
  String get enterCodeToDeleteAccount;

  /// No description provided for @invalidCode.
  ///
  /// In en, this message translates to:
  /// **'Invalid code'**
  String get invalidCode;

  /// No description provided for @failedToDeleteAccountTryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete account. Try again later'**
  String get failedToDeleteAccountTryAgainLater;

  /// No description provided for @failedToReAuthenticateTryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Failed to re-authenticate. Try again later'**
  String get failedToReAuthenticateTryAgainLater;

  /// No description provided for @codeExpiredTryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Code expired. try again later'**
  String get codeExpiredTryAgainLater;

  /// No description provided for @aNewUpdateIsNowAvailable.
  ///
  /// In en, this message translates to:
  /// **'A new update is now available'**
  String get aNewUpdateIsNowAvailable;

  /// No description provided for @airQoversionIsNowAvailableToKeepYouUpToDateOnTheLatestAirQualityData.
  ///
  /// In en, this message translates to:
  /// **'AirQo version {placeholder} is now available to keep you up to date on the latest air quality data.'**
  String airQoversionIsNowAvailableToKeepYouUpToDateOnTheLatestAirQualityData(
    Object placeholder,
  );

  /// No description provided for @updateNow.
  ///
  /// In en, this message translates to:
  /// **'Update Now'**
  String get updateNow;

  /// No description provided for @failedToReloadTryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Failed to reload. Try again later'**
  String get failedToReloadTryAgainLater;

  /// No description provided for @noAirQualityDataAvailable.
  ///
  /// In en, this message translates to:
  /// **'No air quality data available'**
  String get noAirQualityDataAvailable;

  /// No description provided for @theAirQualityIndexColorsCanBeUsedToShowHowPollutedTheAirIs.
  ///
  /// In en, this message translates to:
  /// **'The Air Quality Index (AQI) colors can be used to show how polluted the air is. '**
  String get theAirQualityIndexColorsCanBeUsedToShowHowPollutedTheAirIs;

  /// No description provided for @forecast.
  ///
  /// In en, this message translates to:
  /// **'Forecast'**
  String get forecast;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @areYouSureYouWantToRemove.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to remove\n'**
  String get areYouSureYouWantToRemove;

  /// No description provided for @fromYourFavorites.
  ///
  /// In en, this message translates to:
  /// **'\nfrom your favorites?'**
  String get fromYourFavorites;

  /// No description provided for @isAComplexMixtureOfExtremelySmallParticlesAndLiquidDroplets.
  ///
  /// In en, this message translates to:
  /// **'is a complex mixture of extremely small particles and liquid droplets.'**
  String get isAComplexMixtureOfExtremelySmallParticlesAndLiquidDroplets;

  /// No description provided for @whenMeasuringParticlesThereAreTwoSizeCategoriesCommonlyUsed.
  ///
  /// In en, this message translates to:
  /// **'When measuring particles, there are two size categories commonly used.'**
  String get whenMeasuringParticlesThereAreTwoSizeCategoriesCommonlyUsed;

  /// No description provided for @hasBeenAddedToYourFavorites.
  ///
  /// In en, this message translates to:
  /// **'{placeholder} has been added to your favorites'**
  String hasBeenAddedToYourFavorites(Object placeholder);

  /// No description provided for @pleaseSignInToSaveYourFavorites.
  ///
  /// In en, this message translates to:
  /// **'Please Sign in to save your favorites'**
  String get pleaseSignInToSaveYourFavorites;

  /// No description provided for @authenticationIsCurrentlyUnavailableYouWillBeAbleToSignupSignInLater.
  ///
  /// In en, this message translates to:
  /// **'Authentication is currently unavailable. You will be able to signup/sign in later.'**
  String
  get authenticationIsCurrentlyUnavailableYouWillBeAbleToSignupSignInLater;

  /// No description provided for @proceedAsGuest.
  ///
  /// In en, this message translates to:
  /// **'Proceed as Guest'**
  String get proceedAsGuest;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @proceed.
  ///
  /// In en, this message translates to:
  /// **'Proceed'**
  String get proceed;

  /// No description provided for @confirmEmailAddress.
  ///
  /// In en, this message translates to:
  /// **'Confirm Email Address'**
  String get confirmEmailAddress;

  /// No description provided for @confirmPhoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Confirm Phone Number'**
  String get confirmPhoneNumber;

  /// No description provided for @isTheEmailAddressAboveCorrect.
  ///
  /// In en, this message translates to:
  /// **'Is the email address above correct?'**
  String get isTheEmailAddressAboveCorrect;

  /// No description provided for @isThePhoneNumberAboveCorrect.
  ///
  /// In en, this message translates to:
  /// **'Is the phone number above correct?'**
  String get isThePhoneNumberAboveCorrect;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @reAuthenticationIsRequired.
  ///
  /// In en, this message translates to:
  /// **'Re authentication is required'**
  String get reAuthenticationIsRequired;

  /// No description provided for @youAreRequiredToSignInAgainInorderToDeleteYourAccountDoYouWantToProceed.
  ///
  /// In en, this message translates to:
  /// **'You are required to sign in again inorder to delete your account. Do you want to proceed?'**
  String
  get youAreRequiredToSignInAgainInorderToDeleteYourAccountDoYouWantToProceed;

  /// No description provided for @warning.
  ///
  /// In en, this message translates to:
  /// **'Warning !!!'**
  String get warning;

  /// No description provided for @update.
  ///
  /// In en, this message translates to:
  /// **'Update'**
  String get update;

  /// No description provided for @thankYouForUsingTheAirQoAppWeWouldGreatlyAppreciateItIfYouCouldTakeAMomentToRateYourExperience.
  ///
  /// In en, this message translates to:
  /// **'Thank you for using the AirQo app! We would greatly appreciate it if you could take a moment to rate your experience.'**
  String
  get thankYouForUsingTheAirQoAppWeWouldGreatlyAppreciateItIfYouCouldTakeAMomentToRateYourExperience;

  /// No description provided for @enjoyingAirQoApp.
  ///
  /// In en, this message translates to:
  /// **'Enjoying AirQo app'**
  String get enjoyingAirQoApp;

  /// No description provided for @rate.
  ///
  /// In en, this message translates to:
  /// **'\nRate\n'**
  String get rate;

  /// No description provided for @weValueYourFeedbackPleaseShareYourThoughtsAndSuggestionsOnOurFeedbackPageByClickingOK.
  ///
  /// In en, this message translates to:
  /// **'We value your feedback.\nPlease share your thoughts and suggestions on our feedback page by clicking OK.'**
  String
  get weValueYourFeedbackPleaseShareYourThoughtsAndSuggestionsOnOurFeedbackPageByClickingOK;

  /// No description provided for @oK.
  ///
  /// In en, this message translates to:
  /// **'Ok'**
  String get oK;

  /// No description provided for @proceedAs.
  ///
  /// In en, this message translates to:
  /// **'Proceed as'**
  String get proceedAs;

  /// No description provided for @exploreAfricanCities.
  ///
  /// In en, this message translates to:
  /// **'Explore African Cities'**
  String get exploreAfricanCities;

  /// No description provided for @searchForAirQualityByLocation.
  ///
  /// In en, this message translates to:
  /// **'Search for Air Quality by location'**
  String get searchForAirQualityByLocation;

  /// No description provided for @filterByAirQualityRange.
  ///
  /// In en, this message translates to:
  /// **'Filter By Air Quality Range'**
  String get filterByAirQualityRange;

  /// No description provided for @theAirQualityIndexColorsCanbBeUsedToShowHowPollutedTheAirIs.
  ///
  /// In en, this message translates to:
  /// **'The Air Quality Index (AQI) colors can be used to show how polluted the air is. '**
  String get theAirQualityIndexColorsCanbBeUsedToShowHowPollutedTheAirIs;

  /// No description provided for @complete.
  ///
  /// In en, this message translates to:
  /// **'Complete'**
  String get complete;

  /// No description provided for @welcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get welcome;

  /// No description provided for @toTurnOnNotificationsGoToAppInfoNotifications.
  ///
  /// In en, this message translates to:
  /// **'To turn on notifications, go to\nApp Info > Notifications'**
  String get toTurnOnNotificationsGoToAppInfoNotifications;

  /// No description provided for @toTurnOffNotificationsGoToAppInfoNotifications.
  ///
  /// In en, this message translates to:
  /// **'To turn off notifications, go to\nApp Info > Notifications'**
  String get toTurnOffNotificationsGoToAppInfoNotifications;

  /// No description provided for @toTurnOnNotificationsGoToSettingsAirQoNotifications.
  ///
  /// In en, this message translates to:
  /// **'turn on notifications, go to\nSettings > AirQo > Notifications'**
  String get toTurnOnNotificationsGoToSettingsAirQoNotifications;

  /// No description provided for @toTurnOffNotificationsGoToSettingsAirQoNotifications.
  ///
  /// In en, this message translates to:
  /// **'To turn off notifications, go to\nSettings > AirQo > Notifications'**
  String get toTurnOffNotificationsGoToSettingsAirQoNotifications;

  /// No description provided for @completeMoveToForYou.
  ///
  /// In en, this message translates to:
  /// **'Complete! Move to For You'**
  String get completeMoveToForYou;

  /// No description provided for @continueLearning.
  ///
  /// In en, this message translates to:
  /// **'Continue learning'**
  String get continueLearning;

  /// No description provided for @yesterday.
  ///
  /// In en, this message translates to:
  /// **'Yesterday'**
  String get yesterday;

  /// No description provided for @lastWeek.
  ///
  /// In en, this message translates to:
  /// **'Last Week'**
  String get lastWeek;

  /// No description provided for @nextWeek.
  ///
  /// In en, this message translates to:
  /// **'Next Week'**
  String get nextWeek;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @tomorrow.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow'**
  String get tomorrow;

  /// No description provided for @thisWeek.
  ///
  /// In en, this message translates to:
  /// **'This week'**
  String get thisWeek;

  /// No description provided for @todaysHealthTips.
  ///
  /// In en, this message translates to:
  /// **'Today’s health tips'**
  String get todaysHealthTips;

  /// No description provided for @tomorrowsHealthTips.
  ///
  /// In en, this message translates to:
  /// **'Tomorrow’s health tips'**
  String get tomorrowsHealthTips;

  /// No description provided for @thisDatesHealthTips.
  ///
  /// In en, this message translates to:
  /// **'{placeholder} health tips'**
  String thisDatesHealthTips(Object placeholder);

  /// No description provided for @hello.
  ///
  /// In en, this message translates to:
  /// **'Hello'**
  String get hello;

  /// No description provided for @goodMorningYourName.
  ///
  /// In en, this message translates to:
  /// **'Good morning {placeholder}'**
  String goodMorningYourName(Object placeholder);

  /// No description provided for @goodAfternoonYourName.
  ///
  /// In en, this message translates to:
  /// **'Good afternoon {placeholder}'**
  String goodAfternoonYourName(Object placeholder);

  /// No description provided for @goodEveningYourName.
  ///
  /// In en, this message translates to:
  /// **'Good evening {placeholder}'**
  String goodEveningYourName(Object placeholder);

  /// No description provided for @helloYourName.
  ///
  /// In en, this message translates to:
  /// **'Hello {placeholder}'**
  String helloYourName(Object placeholder);

  /// No description provided for @updatedYesterdayAtDateString.
  ///
  /// In en, this message translates to:
  /// **'Updated yesterday at {placeholder}'**
  String updatedYesterdayAtDateString(Object placeholder);

  /// No description provided for @updatedTodayAtDateString.
  ///
  /// In en, this message translates to:
  /// **'Updated today at {placeholder}'**
  String updatedTodayAtDateString(Object placeholder);

  /// No description provided for @goodQualityAirAroundYou.
  ///
  /// In en, this message translates to:
  /// **'Good Quality Air around you'**
  String get goodQualityAirAroundYou;

  /// No description provided for @moderateQualityAirAroundYou.
  ///
  /// In en, this message translates to:
  /// **'Moderate Quality Air around you'**
  String get moderateQualityAirAroundYou;

  /// No description provided for @nearbyLocationsWithAirQualityUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'Nearby locations with air quality Unhealthy For Sensitive Groups'**
  String get nearbyLocationsWithAirQualityUnhealthyForSensitiveGroups;

  /// No description provided for @veryUnhealthyQualityAirAroundYou.
  ///
  /// In en, this message translates to:
  /// **'Very Unhealthy Quality Air around you'**
  String get veryUnhealthyQualityAirAroundYou;

  /// No description provided for @hazardousQualityAirAroundYou.
  ///
  /// In en, this message translates to:
  /// **'Hazardous Quality Air around you'**
  String get hazardousQualityAirAroundYou;

  /// No description provided for @theAirIsCleanAndHealthyToBreathe.
  ///
  /// In en, this message translates to:
  /// **'The air is clean and healthy to breathe'**
  String get theAirIsCleanAndHealthyToBreathe;

  /// No description provided for @theAirIsAcceptableButSensitiveGroupsMayExperienceSomeHealthEffects.
  ///
  /// In en, this message translates to:
  /// **'The air is acceptable, but sensitive groups may experience some health effects.'**
  String get theAirIsAcceptableButSensitiveGroupsMayExperienceSomeHealthEffects;

  /// No description provided for @peopleWithRespiratoryOrHeartDiseasesChildrenAndElderlyMayExperienceHealthEffects.
  ///
  /// In en, this message translates to:
  /// **'People with respiratory or heart diseases, children, and elderly may experience health effects.'**
  String
  get peopleWithRespiratoryOrHeartDiseasesChildrenAndElderlyMayExperienceHealthEffects;

  /// No description provided for @everyoneMayBeginToExperienceSomeAdverseHealthEffectsAndSensitiveGroupsAreAtHigherRisk.
  ///
  /// In en, this message translates to:
  /// **'Everyone may begin to experience some adverse health effects and sensitive groups are at higher risk.'**
  String
  get everyoneMayBeginToExperienceSomeAdverseHealthEffectsAndSensitiveGroupsAreAtHigherRisk;

  /// No description provided for @healthWarningsOfEmergencyConditionsTheEntirePopulationIsMoreLikelyToBeAffectedWithSeriousHealthEffectsOnSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'Health warnings of emergency conditions. The entire population is more likely to be affected, with serious health effects on sensitive groups.'**
  String
  get healthWarningsOfEmergencyConditionsTheEntirePopulationIsMoreLikelyToBeAffectedWithSeriousHealthEffectsOnSensitiveGroups;

  /// No description provided for @locationsWithGoodQualityAir.
  ///
  /// In en, this message translates to:
  /// **'Locations with Good Quality Air'**
  String get locationsWithGoodQualityAir;

  /// No description provided for @locationsWithModerateQualityAir.
  ///
  /// In en, this message translates to:
  /// **'Locations with Moderate Quality Air'**
  String get locationsWithModerateQualityAir;

  /// No description provided for @locationsWithUnhealthyQualityAir.
  ///
  /// In en, this message translates to:
  /// **'Locations with Unhealthy Quality Air'**
  String get locationsWithUnhealthyQualityAir;

  /// No description provided for @locationsWithVeryUnhealthyQualityAir.
  ///
  /// In en, this message translates to:
  /// **'Locations with Very Unhealthy Quality Air'**
  String get locationsWithVeryUnhealthyQualityAir;

  /// No description provided for @locationsWithHazardousQualityAir.
  ///
  /// In en, this message translates to:
  /// **'Locations with Hazardous Quality Air'**
  String get locationsWithHazardousQualityAir;

  /// No description provided for @locationsWithAirQualityUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'Locations with Air Quality Unhealthy For Sensitive Groups'**
  String get locationsWithAirQualityUnhealthyForSensitiveGroups;

  /// No description provided for @unhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'Unhealthy For Sensitive Groups'**
  String get unhealthyForSensitiveGroups;

  /// No description provided for @airQualityIsSafeForEveryone.
  ///
  /// In en, this message translates to:
  /// **'Air quality is safe for everyone!'**
  String get airQualityIsSafeForEveryone;

  /// No description provided for @unusuallySensitivePeopleShouldConsiderReducingProlongedOrIntenseOutdoorActivities.
  ///
  /// In en, this message translates to:
  /// **'Unusually sensitive people should consider reducing prolonged or intense outdoor activities.'**
  String
  get unusuallySensitivePeopleShouldConsiderReducingProlongedOrIntenseOutdoorActivities;

  /// No description provided for @theElderlyAndChildrenShouldLimitIntenseOutdoorActivitiesSensitivePeopleShouldReduceProlongedOrIntenseOutDoorActivities.
  ///
  /// In en, this message translates to:
  /// **'The elderly and children should limit intense outdoor activities. Sensitive people should reduce prolonged or intense outdoor activities.'**
  String
  get theElderlyAndChildrenShouldLimitIntenseOutdoorActivitiesSensitivePeopleShouldReduceProlongedOrIntenseOutDoorActivities;

  /// No description provided for @peopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldAvoidIntenseOutdoorActivitiesEveryoneElseShouldLimitIntenseOutdoorActivities.
  ///
  /// In en, this message translates to:
  /// **'People with respiratory or heart disease, the elderly and children should avoid intense outdoor activities. Everyone else should limit intense outdoor activities.'**
  String
  get peopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldAvoidIntenseOutdoorActivitiesEveryoneElseShouldLimitIntenseOutdoorActivities;

  /// No description provided for @everyoneShouldAvoidAnyIntenseOutdoorActivitiesPeopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldRemainIndoors.
  ///
  /// In en, this message translates to:
  /// **'Everyone should avoid any intense outdoor activities. People with respiratory or heart disease, the elderly and children should remain indoors.'**
  String
  get everyoneShouldAvoidAnyIntenseOutdoorActivitiesPeopleWithRespiratoryOrHeartDiseaseTheElderlyAndChildrenShouldRemainIndoors;

  /// No description provided for @ms.
  ///
  /// In en, this message translates to:
  /// **'Ms'**
  String get ms;

  /// No description provided for @mr.
  ///
  /// In en, this message translates to:
  /// **'Mr'**
  String get mr;

  /// No description provided for @ratherNotSay.
  ///
  /// In en, this message translates to:
  /// **'Rather not say'**
  String get ratherNotSay;

  /// No description provided for @msAbbr.
  ///
  /// In en, this message translates to:
  /// **'Ms'**
  String get msAbbr;

  /// No description provided for @mrAbbr.
  ///
  /// In en, this message translates to:
  /// **'Mr'**
  String get mrAbbr;

  /// No description provided for @ratherNotSayAbbr.
  ///
  /// In en, this message translates to:
  /// **'Ra..'**
  String get ratherNotSayAbbr;

  /// No description provided for @goodMorningName.
  ///
  /// In en, this message translates to:
  /// **'Good morning {placeholder}'**
  String goodMorningName(Object placeholder);

  /// No description provided for @goodAfternoonName.
  ///
  /// In en, this message translates to:
  /// **'Good afternoon {placeholder}'**
  String goodAfternoonName(Object placeholder);

  /// No description provided for @goodEveningName.
  ///
  /// In en, this message translates to:
  /// **'Good evening {placeholder}'**
  String goodEveningName(Object placeholder);

  /// No description provided for @helloName.
  ///
  /// In en, this message translates to:
  /// **'Hello {placeholder}'**
  String helloName(Object placeholder);

  /// No description provided for @allYourCompleteTasksWillShowUpHere.
  ///
  /// In en, this message translates to:
  /// **'All your complete tasks will show up here'**
  String get allYourCompleteTasksWillShowUpHere;

  /// No description provided for @tapThis.
  ///
  /// In en, this message translates to:
  /// **'Tap this'**
  String get tapThis;

  /// No description provided for @iconToUnderstandWhatAirQualityAnalyticsMean.
  ///
  /// In en, this message translates to:
  /// **'icon to understand what air quality analytics mean'**
  String get iconToUnderstandWhatAirQualityAnalyticsMean;

  /// No description provided for @tapForecastToViewAirQualityAnalyticsForTheNext24Hours.
  ///
  /// In en, this message translates to:
  /// **'Tap forecast to view air quality analytics for the next 24 hours'**
  String get tapForecastToViewAirQualityAnalyticsForTheNext24Hours;

  /// No description provided for @forecastIsTemporarilyUnavailableWereWorkingToRestoreThisFeatureAsSoonAsPossible.
  ///
  /// In en, this message translates to:
  /// **'Forecast is temporarily unavailable. We’re working to restore this feature as soon as possible.'**
  String
  get forecastIsTemporarilyUnavailableWereWorkingToRestoreThisFeatureAsSoonAsPossible;

  /// No description provided for @loginWithYourMobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Login with your mobile number'**
  String get loginWithYourMobileNumber;

  /// No description provided for @signUpWithYourMobileNumberOrEmail.
  ///
  /// In en, this message translates to:
  /// **'Sign up with your mobile number or email'**
  String get signUpWithYourMobileNumberOrEmail;

  /// No description provided for @loginWithYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Login with your email'**
  String get loginWithYourEmail;

  /// No description provided for @loginWithAnEmailInstead.
  ///
  /// In en, this message translates to:
  /// **'Login with an email instead'**
  String get loginWithAnEmailInstead;

  /// No description provided for @signUpWithAnEmailInstead.
  ///
  /// In en, this message translates to:
  /// **'Sign up with an email instead'**
  String get signUpWithAnEmailInstead;

  /// No description provided for @particulateMatter.
  ///
  /// In en, this message translates to:
  /// **'Particulate matter(PM) '**
  String get particulateMatter;

  /// No description provided for @pleaseSelectAFeedbackType.
  ///
  /// In en, this message translates to:
  /// **'Please select a feedback type.'**
  String get pleaseSelectAFeedbackType;

  /// No description provided for @neW.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get neW;

  /// No description provided for @noNortifications.
  ///
  /// In en, this message translates to:
  /// **'No notifications'**
  String get noNortifications;

  /// No description provided for @hereYoullFindAllUpdatesOnOurAirQualityNetwork.
  ///
  /// In en, this message translates to:
  /// **'Here you’ll find all updates on our Air Quality network'**
  String get hereYoullFindAllUpdatesOnOurAirQualityNetwork;

  /// No description provided for @and.
  ///
  /// In en, this message translates to:
  /// **'and'**
  String get and;

  /// No description provided for @youWillNotBeAbleToSignInWithYourPreviousPhoneNumberAfterChangingIt.
  ///
  /// In en, this message translates to:
  /// **'You will not be able to sign in with your previous phone number after changing it.'**
  String get youWillNotBeAbleToSignInWithYourPreviousPhoneNumberAfterChangingIt;

  /// No description provided for @youWillNotBeAbleToSignInWithYourPreviousEmailAddressAfterChangingIt.
  ///
  /// In en, this message translates to:
  /// **'You will not be able to sign in with your previous email address changing it.'**
  String
  get youWillNotBeAbleToSignInWithYourPreviousEmailAddressAfterChangingIt;

  /// No description provided for @thisNameDoesntHaveUpdateMessageImplementation.
  ///
  /// In en, this message translates to:
  /// **'{placeholder} does’nt have update message implementation'**
  String thisNameDoesntHaveUpdateMessageImplementation(Object placeholder);

  /// No description provided for @loginWithAMobileNumberInstead.
  ///
  /// In en, this message translates to:
  /// **'Login with a mobile number instead'**
  String get loginWithAMobileNumberInstead;

  /// No description provided for @signUpWithAMobileNumberInstead.
  ///
  /// In en, this message translates to:
  /// **'Sign up with a mobile number instead'**
  String get signUpWithAMobileNumberInstead;

  /// No description provided for @changeYourNumber.
  ///
  /// In en, this message translates to:
  /// **'Change your number'**
  String get changeYourNumber;

  /// No description provided for @changeYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Change your email'**
  String get changeYourEmail;

  /// No description provided for @theAirQualityInCityWasGood.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was good.'**
  String theAirQualityInCityWasGood(Object placeholder);

  /// No description provided for @theAirQualityInCityWasModerate.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was moderate.'**
  String theAirQualityInCityWasModerate(Object placeholder);

  /// No description provided for @theAirQualityInCityWasUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was unhealthy for sensitive groups.'**
  String theAirQualityInCityWasUnhealthyForSensitiveGroups(Object placeholder);

  /// No description provided for @theAirQualityInCityWasUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was unhealthy.'**
  String theAirQualityInCityWasUnhealthy(Object placeholder);

  /// No description provided for @theAirQualityInCityWasVeryUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was very unhealthy.'**
  String theAirQualityInCityWasVeryUnhealthy(Object placeholder);

  /// No description provided for @theAirQualityInCityWasHazardous.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was hazardous.'**
  String theAirQualityInCityWasHazardous(Object placeholder);

  /// No description provided for @theAirQualityInCityWasUnavailable.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} was unavailable.'**
  String theAirQualityInCityWasUnavailable(Object placeholder);

  /// No description provided for @theAirQualityInCityIsGood.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is good.'**
  String theAirQualityInCityIsGood(Object placeholder);

  /// No description provided for @theAirQualityInCityIsModerate.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is moderate.'**
  String theAirQualityInCityIsModerate(Object placeholder);

  /// No description provided for @theAirQualityInCityIsUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is unhealthy for sensitive groups.'**
  String theAirQualityInCityIsUnhealthyForSensitiveGroups(Object placeholder);

  /// No description provided for @theAirQualityInCityIsUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is unhealthy.'**
  String theAirQualityInCityIsUnhealthy(Object placeholder);

  /// No description provided for @theAirQualityInCityIsVeryUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is very unhealthy.'**
  String theAirQualityInCityIsVeryUnhealthy(Object placeholder);

  /// No description provided for @theAirQualityInCityIsHazardous.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is hazardous.'**
  String theAirQualityInCityIsHazardous(Object placeholder);

  /// No description provided for @theAirQualityInCityIsUnavailable.
  ///
  /// In en, this message translates to:
  /// **'The air quality in {placeholder} is unavailable.'**
  String theAirQualityInCityIsUnavailable(Object placeholder);

  /// No description provided for @expectConditionsToBeGood.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be good.'**
  String get expectConditionsToBeGood;

  /// No description provided for @expectConditionsToBeModerate.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be moderate.'**
  String get expectConditionsToBeModerate;

  /// No description provided for @expectConditionsToBeUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be unhealthy for sensitive groups.'**
  String get expectConditionsToBeUnhealthyForSensitiveGroups;

  /// No description provided for @expectConditionsToBeUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be unhealthy.'**
  String get expectConditionsToBeUnhealthy;

  /// No description provided for @expectConditionsToBeVeryUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be very unhealthy.'**
  String get expectConditionsToBeVeryUnhealthy;

  /// No description provided for @expectConditionsToBeHazardous.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be hazardous.'**
  String get expectConditionsToBeHazardous;

  /// No description provided for @expectConditionsToBeUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Expect conditions to be unavailable.'**
  String get expectConditionsToBeUnavailable;

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyGood.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently good.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyGood(Object placeholder);

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyModerate.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently moderate.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyModerate(
    Object placeholder,
  );

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyUnhealthyForSensitiveGroups.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently unhealthy for sensitive groups.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyUnhealthyForSensitiveGroups(
    Object placeholder,
  );

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently unhealthy.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyUnhealthy(
    Object placeholder,
  );

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyVeryUnhealthy.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently very unhealthy.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyVeryUnhealthy(
    Object placeholder,
  );

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyHazardous.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently hazardous.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyHazardous(
    Object placeholder,
  );

  /// No description provided for @theHourlyAirQualityAverageInCityIsCurrentlyUnavailable.
  ///
  /// In en, this message translates to:
  /// **'The hourly air quality average in {placeholder} is currently unavailable.'**
  String theHourlyAirQualityAverageInCityIsCurrentlyUnavailable(
    Object placeholder,
  );

  /// No description provided for @headsUpYouAreAboutToDeleteYourAccount.
  ///
  /// In en, this message translates to:
  /// **'Heads up!!!.. you are about to delete your account!'**
  String get headsUpYouAreAboutToDeleteYourAccount;

  /// No description provided for @youWillLoseAllYourSavedPlaces.
  ///
  /// In en, this message translates to:
  /// **'You will lose all your saved places'**
  String get youWillLoseAllYourSavedPlaces;

  /// No description provided for @headsUpYouAreAboutToLogout.
  ///
  /// In en, this message translates to:
  /// **'Heads up!!!.. you are about to logout!'**
  String get headsUpYouAreAboutToLogout;

  /// No description provided for @youWillMissOutOnNotificationAndWontBeAbleToSaveFavouritePlaces.
  ///
  /// In en, this message translates to:
  /// **'You will miss out on notifications and won’t be able to save favourite places'**
  String get youWillMissOutOnNotificationAndWontBeAbleToSaveFavouritePlaces;

  /// No description provided for @selectCountry.
  ///
  /// In en, this message translates to:
  /// **'Select Country'**
  String get selectCountry;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// No description provided for @takeAirQualityQuiz.
  ///
  /// In en, this message translates to:
  /// **'Take Air Quality Quiz'**
  String get takeAirQualityQuiz;

  /// No description provided for @skipThisForLater.
  ///
  /// In en, this message translates to:
  /// **'Skip this for later'**
  String get skipThisForLater;

  /// No description provided for @noQuestions.
  ///
  /// In en, this message translates to:
  /// **'No questions'**
  String get noQuestions;

  /// No description provided for @leavingNearBusyRoads.
  ///
  /// In en, this message translates to:
  /// **'Leaving near busy roads'**
  String get leavingNearBusyRoads;

  /// No description provided for @takeQuiz.
  ///
  /// In en, this message translates to:
  /// **'Take Quiz'**
  String get takeQuiz;

  /// No description provided for @youHaveCompletedTheQuiz.
  ///
  /// In en, this message translates to:
  /// **'You have completed the quiz!'**
  String get youHaveCompletedTheQuiz;

  /// No description provided for @airQualityQuiz.
  ///
  /// In en, this message translates to:
  /// **'Air Quality Quiz'**
  String get airQualityQuiz;

  /// Actual date
  ///
  /// In en, this message translates to:
  /// **'{date}'**
  String actualDate(DateTime date);

  /// No description provided for @dismiss.
  ///
  /// In en, this message translates to:
  /// **'DISMISS'**
  String get dismiss;

  /// No description provided for @internetConnectionLost.
  ///
  /// In en, this message translates to:
  /// **'Internet Connection Lost'**
  String get internetConnectionLost;

  /// No description provided for @changeLanguage.
  ///
  /// In en, this message translates to:
  /// **'Change Language'**
  String get changeLanguage;

  /// No description provided for @doYouWantToSwitchToLanguage.
  ///
  /// In en, this message translates to:
  /// **'Do you want to switch to {placeholder}?    The app will restart to effect the changes'**
  String doYouWantToSwitchToLanguage(Object placeholder);

  /// No description provided for @languageChangedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'You have successfully changed  to {placeholder}'**
  String languageChangedSuccessfully(Object placeholder);

  /// No description provided for @ok.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// No description provided for @languages.
  ///
  /// In en, this message translates to:
  /// **'Languages'**
  String get languages;

  /// No description provided for @dataProvider.
  ///
  /// In en, this message translates to:
  /// **'Data Provider: {placeholder}'**
  String dataProvider(Object placeholder);

  /// No description provided for @reDOLesson.
  ///
  /// In en, this message translates to:
  /// **'Re-do lesson'**
  String get reDOLesson;

  /// No description provided for @reDoQuiz.
  ///
  /// In en, this message translates to:
  /// **'Re-do quiz'**
  String get reDoQuiz;

  /// No description provided for @addYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Add your Email'**
  String get addYourEmail;

  /// No description provided for @yourEmailHasBeenAdded.
  ///
  /// In en, this message translates to:
  /// **'Your Email has been added'**
  String get yourEmailHasBeenAdded;

  /// No description provided for @add.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// No description provided for @skip.
  ///
  /// In en, this message translates to:
  /// **'skip'**
  String get skip;

  /// No description provided for @oopsSomethingWentWrongPleaseTryAgainLater.
  ///
  /// In en, this message translates to:
  /// **'Oops something went wrong! Please try again later'**
  String get oopsSomethingWentWrongPleaseTryAgainLater;

  /// No description provided for @yourEmailIsAlreadyRegistered.
  ///
  /// In en, this message translates to:
  /// **'Your Email is already registered'**
  String get yourEmailIsAlreadyRegistered;

  /// No description provided for @weAreShufflingThingsAroundForYou.
  ///
  /// In en, this message translates to:
  /// **'We are shuffling things around for you.....'**
  String get weAreShufflingThingsAroundForYou;

  /// No description provided for @youWouldBeRequiredToAddYourEmailToYourProfileOnTheMobileAppToEnableYouAccessThe.
  ///
  /// In en, this message translates to:
  /// **' You would be required to add your email to your profile on the mobile app to enable you access the '**
  String
  get youWouldBeRequiredToAddYourEmailToYourProfileOnTheMobileAppToEnableYouAccessThe;

  /// No description provided for @withOneAccount.
  ///
  /// In en, this message translates to:
  /// **' with one account.'**
  String get withOneAccount;

  /// No description provided for @addMyEmail.
  ///
  /// In en, this message translates to:
  /// **'Add my email'**
  String get addMyEmail;

  /// No description provided for @remindMeLater.
  ///
  /// In en, this message translates to:
  /// **'Remind me later'**
  String get remindMeLater;

  /// No description provided for @addMyEmailToMyProfile.
  ///
  /// In en, this message translates to:
  /// **'Add my email to my profile'**
  String get addMyEmailToMyProfile;

  /// No description provided for @addYourEmailToYourProfileToEnableYouToAccessThe.
  ///
  /// In en, this message translates to:
  /// **'Add your email to your profile to enable you to access the '**
  String get addYourEmailToYourProfileToEnableYouToAccessThe;

  /// No description provided for @accessDeeperAirQualityInsights.
  ///
  /// In en, this message translates to:
  /// **'Access deeper Air Quality insights'**
  String get accessDeeperAirQualityInsights;

  /// No description provided for @usingYourAirQoMobileAppAccount.
  ///
  /// In en, this message translates to:
  /// **'using your AirQo mobile app account'**
  String get usingYourAirQoMobileAppAccount;

  /// No description provided for @all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// No description provided for @lessons.
  ///
  /// In en, this message translates to:
  /// **'Lessons'**
  String get lessons;

  /// No description provided for @quiz.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get quiz;

  /// No description provided for @enterYourEmailAddress.
  ///
  /// In en, this message translates to:
  /// **'Enter your email address'**
  String get enterYourEmailAddress;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'en',
    'fr',
    'lg',
    'pcm',
    'pt',
    'sw',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
    case 'lg':
      return AppLocalizationsLg();
    case 'pcm':
      return AppLocalizationsPcm();
    case 'pt':
      return AppLocalizationsPt();
    case 'sw':
      return AppLocalizationsSw();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
