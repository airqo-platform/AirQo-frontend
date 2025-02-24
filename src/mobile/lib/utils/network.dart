import 'dart:io';

import 'package:app/constants/constants.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';

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
      showSnackBar(buildContext, Config.connectionErrorMessage);
    }
  });

  return hasConnection;
}
