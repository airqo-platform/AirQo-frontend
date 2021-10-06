import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

Widget inputField(String placeholder) {
  return TextField(
    decoration: InputDecoration(
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      hintText: placeholder,
    ),
  );
}

Widget optField(first, last, context) {
  return Container(
    height: 64,
    width: 64,
    alignment: Alignment.center,
    // color: const Color(0xff8D8D8D).withOpacity(0.1),
    child: TextField(
      autofocus: true,
      textAlignVertical: TextAlignVertical.center,
      onChanged: (value) {
        if (value.length == 1 && last == false) {
          FocusScope.of(context).nextFocus();
        }
        if (value.isEmpty && first == false) {
          FocusScope.of(context).previousFocus();
        }
      },
      showCursor: false,
      readOnly: false,
      textAlign: TextAlign.center,
      style: const TextStyle(
        fontSize: 24,
      ),
      keyboardType: TextInputType.number,
      maxLength: 1,
      decoration: InputDecoration(
        counter: const Offstage(),
        fillColor: const Color(0xff8D8D8D).withOpacity(0.1),
        filled: true,
        focusedBorder: OutlineInputBorder(
          borderSide:
              BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(10.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide:
              BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
    ),
  );
}
