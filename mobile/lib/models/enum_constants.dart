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
  mtnUser,
  airtelUser,
  otherNetwork
}

enum Region {
  central,
  eastern,
  northern,
  western,
}

enum AuthMethod { phone, email }

enum AuthProcedure { login, signup }

enum Frequency { daily, hourly }

enum Gender { male, female, undefined }

enum OnBoardingPage {
  signup,
  profile,
  notification,
  location,
  complete,
  home,
  welcome
}

enum Pollutant { pm2_5, pm10 }

enum TitleOptions { ms, mr, undefined }

enum ToolTipType { favouritePlaces, info, forYou, forecast }
