import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class CustomLocalizations {
  static const LocalizationsDelegate<CustomLocalizations> delegate =
      CustomLocalizationsDelegate();

  static final Map<String, Map<String, String>> _resources = {
    'en': {'title': 'AirQo English', 'message': 'English'},
    'lg': {
      'title': 'AirQó Luganda',
      'message': 'Luganda',
    },
  };

  final Locale locale;

  CustomLocalizations(this.locale);

  String? get message {
    return _resources[locale.languageCode]!['message'];
  }

  String get title {
    var title = _resources[locale.languageCode]!['title'];
    if (title == null) {
      return 'AirQo null';
    }
    // title ??= 'AirQo';
    return title;
  }

  static CustomLocalizations? of(BuildContext context) {
    return Localizations.of<CustomLocalizations>(context, CustomLocalizations);
  }
}

class CustomLocalizationsDelegate
    extends LocalizationsDelegate<CustomLocalizations> {
  const CustomLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'lg'].contains(locale.languageCode);

  @override
  Future<CustomLocalizations> load(Locale locale) {
    return SynchronousFuture<CustomLocalizations>(CustomLocalizations(locale));
  }

  @override
  bool shouldReload(CustomLocalizationsDelegate old) => false;
}
