import 'dart:ui';

import 'package:app/constants/constants.dart';
import 'package:app/main_common.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    // Pass all uncaught "fatal" errors from the framework to Crashlytics
    FlutterError.onError = (errorDetails) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    };
    // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };

    await initializeMainMethod();
    final PendingDynamicLinkData? initialLink =
        await FirebaseDynamicLinks.instance.getInitialLink();

    AppConfig configuredApp = AppConfig(
      appTitle: 'AirQo',
      environment: Environment.prod,
      child: AirQoApp(initialLink),
    );
    runApp(configuredApp);
  } catch (exception, stackTrace) {
    runApp(
      MaterialApp(
        title: 'AirQo',
        theme: customTheme(),
        home: AppCrushWidget(exception, stackTrace),
      ),
    );
  }
}
