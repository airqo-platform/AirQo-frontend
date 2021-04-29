
import 'package:flutter/material.dart';

Future<void> showSnackBar(context, String message) async {

    var snackBar = SnackBar(
      content:
      Text(
        message,
        softWrap: true,
      ),
      backgroundColor: const Color(0xff5f1ee8),
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
