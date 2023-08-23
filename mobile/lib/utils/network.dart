import 'dart:io';

import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<bool> hasNetworkConnection() async {
  try {
    final result = await InternetAddress.lookup('firebase.google.com');
    if (result.isNotEmpty && result.first.rawAddress.isNotEmpty) {
      return true;
    }
  } on Exception catch (_) {}

  return false;
}

Future<bool> checkNetworkConnection(
  BuildContext buildContext, {
  bool notifyUser = false,
}) async {
  bool hasConnection = false;
  await hasNetworkConnection().then((value) {
    hasConnection = value;
    if (!value && notifyUser) {
      showSnackBar(
        buildContext,
        AppLocalizations.of(buildContext)!.noInternetConnection,
      );
    }
  });

  return hasConnection;
}
