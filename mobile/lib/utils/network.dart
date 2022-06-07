import 'dart:io';

import 'package:flutter/material.dart';

import '../constants/config.dart';
import '../widgets/dialogs.dart';

Future<bool> hasNetworkConnection() async {
  try {
    final result = await InternetAddress.lookup('firebase.google.com');
    if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
      return true;
    }
  } on Exception catch (_) {}

  return false;
}

Future<bool> checkNetworkConnection(
  BuildContext buildContext, {
  bool notifyUser = false,
}) async {
  final hasConnection = await hasNetworkConnection();
  if (!hasConnection && notifyUser) {
    await showSnackBar(buildContext, Config.connectionErrorMessage);
  }

  return hasConnection;
}
