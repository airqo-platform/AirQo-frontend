import 'dart:io';

import 'package:flutter/material.dart';

import '../constants/config.dart';
import 'dialogs.dart';

Future<bool> hasNetworkConnection() async {
  try {
    final result = await InternetAddress.lookup('firebase.google.com');
    if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
      return true;
    }
  } on Exception catch (_) {}
  return false;
}

Future<bool> checkNetworkConnection(BuildContext buildContext) async {
  var hasConnection = await hasNetworkConnection();
  if (!hasConnection) {
    await showSnackBar(buildContext, Config.connectionErrorMessage);
  }
  return hasConnection;
}
