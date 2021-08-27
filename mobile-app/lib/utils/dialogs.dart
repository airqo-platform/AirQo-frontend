import 'package:app/constants/app_constants.dart';
import 'package:app/screens/my_places.dart';
import 'package:flutter/material.dart';

void showInfoDialog(BuildContext context, String text) {
  showDialog<void>(
    context: context,
    builder: (context) {
      return AlertDialog(
        content: Text(text),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('CLOSE'),
          ),
        ],
      );
    },
  );
}

Future<void> showSnackBar(context, String message) async {
  var snackBar = SnackBar(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 20,
    behavior: SnackBarBehavior.floating,
    content: Text(
      message,
      softWrap: true,
      textAlign: TextAlign.center,
    ),
    backgroundColor: ColorConstants().appColor,
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}

Future<void> showSnackBar2(context, String message) async {
  var snackBar = SnackBar(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 20,
    content: Text(
      message,
      softWrap: true,
      textAlign: TextAlign.center,
    ),
    backgroundColor: ColorConstants().appColor,
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}

Future<void> showSnackBarGoToMyPlaces(context, String message) async {
  var snackBar = SnackBar(
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 20,
    content: Text(
      message,
      softWrap: true,
      textAlign: TextAlign.start,
    ),
    backgroundColor: ColorConstants().appColor,
    action: SnackBarAction(
      textColor: Colors.white,
      label: 'View MyPlaces',
      onPressed: () async {
        await Navigator.push(context, MaterialPageRoute(builder: (context) {
          return const MyPlaces();
        }));
      },
    ),
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}
