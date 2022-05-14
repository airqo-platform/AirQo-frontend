import 'dart:io';

Future<bool> hasFirebaseConnection() async {
  try {
    final result = await InternetAddress.lookup('firebase.google.com');
    if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
      return true;
    }
  } on Exception catch (_) {}
  return false;
}
