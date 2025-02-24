import 'package:app/constants/constants.dart';
import 'package:app/main_common.dart';
import 'package:app/models/models.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';

import 'firebase_options_dev.dart';
import 'package:app/services/services.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferencesHelper.instance;
  final savedLanguageCode = prefs.getString('selectedLanguage') ?? 'en';
  final savedLocale = Locale(savedLanguageCode);
  
  await Firebase.initializeApp(
    name: 'airqo-dev',
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await initializeMainMethod();
  final PendingDynamicLinkData? initialLink =
      await FirebaseDynamicLinks.instance.getInitialLink();

  AppConfig configuredApp = AppConfig(
    appTitle: 'AirQo Dev',
    environment: Environment.dev,
    child: AirQoApp(
      initialLink,
      locale: savedLocale,
    ),
  );

  runApp(configuredApp);
}
