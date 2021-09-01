import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

class ClearAppDialog extends StatefulWidget {
  @override
  State createState() => ClearAppDialogState();
}

class ClearAppDialogState extends State<ClearAppDialog> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(0, 0, 5, 0),
            child: Icon(
              Icons.warning_rounded,
              color: ColorConstants().appColor,
            ),
          ),
          Expanded(
              child: Text(
            'This procedure is irreversible, do you wish to proceed?',
            style: TextStyle(
                fontSize: 15,
                color: ColorConstants().appColor,
                fontWeight: FontWeight.normal),
          ))
        ],
      ),
      actions: [
        ElevatedButton(
          style: ElevatedButton.styleFrom(
              primary: Colors.red,
              textStyle: const TextStyle(color: Colors.white)),
          onPressed: () async {
            Navigator.pop(context);
          },
          child: const Text('Yes'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
              primary: Colors.green,
              textStyle: const TextStyle(color: Colors.white)),
          onPressed: () {
            setState(() {
              Navigator.pop(context);
            });
          },
          child: const Text('No'),
        ),
      ],
    );
  }
}
