
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
