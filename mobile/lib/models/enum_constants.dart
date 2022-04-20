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

enum Frequency { daily, hourly }

enum Pollutant { pm2_5, pm10 }

enum TitleOptions { ms, mr, undefined }

enum Gender { male, female, undefined }

enum AuthMethod { phone, email }

enum AuthProcedure { login, signup }

enum ToolTipType { favouritePlaces, info, forYou, forecast }
