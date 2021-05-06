
import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

Future<void> showSnackBar(context, String message) async {

    var snackBar = SnackBar(
      behavior: SnackBarBehavior.floating,
      content:
      Text(
        message,
        softWrap: true,
        textAlign: TextAlign.center,
      ),
      backgroundColor: appColor,
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);

}

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
