import 'package:app/constants/constants.dart';
import 'package:app/main_common.dart';
import 'package:app/models/models.dart';
import 'package:app/services/widget_service.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:flutter/material.dart';
import 'package:workmanager/workmanager.dart';

import 'firebase_options.dart';

@pragma("vm:entry-point")
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) {
    return WidgetService.sendAndUpdate().then((_) => true);
  });
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Workmanager().initialize(callbackDispatcher, isInDebugMode: true);
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

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
