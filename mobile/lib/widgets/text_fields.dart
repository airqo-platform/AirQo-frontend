import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

Widget inputField(String placeholder) {
  return TextField(
    autofocus: true,
    enableSuggestions: false,
    cursorWidth: 1,
    cursorColor: ColorConstants.appColorBlue,
    keyboardType: TextInputType.name,
    decoration: InputDecoration(
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
          gapPadding: 2.0
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
        gapPadding: 2.0
      ),
      hintText: placeholder,
      suffix: textInputCloseButton(),
    ),
  );
}

Widget emailInputField(String placeholder) {
  return TextField(
    autofocus: true,
    enableSuggestions: false,
    cursorWidth: 1,
    cursorColor: ColorConstants.appColorBlue,
    keyboardType: TextInputType.emailAddress,
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
      suffix: textInputCloseButton(),
    ),
  );
}
// background: #8D8D8D1A;

Widget titleDropdown() {
  return Container(
    height: 60,
      width: 64,
      padding: const EdgeInsets.only(left: 10, right: 10),
      decoration: BoxDecoration(
          color: ColorConstants.greyColor.withOpacity(0.2),
          borderRadius: BorderRadius.circular(10)),
    child: Center(
      child: DropdownButton<String>(
        value: 'Ms.',
        icon: const Icon(Icons.keyboard_arrow_down_sharp, color: Colors.black,),
        iconSize: 10,
        dropdownColor: ColorConstants.greyColor.withOpacity(0.2),
        elevation: 0,
        underline: const Visibility (visible:false, child: SizedBox()),
        style: const TextStyle(color: Colors.black),
        onChanged: (String? newValue) {

        },
        borderRadius: BorderRadius.circular(10.0),
        items: <String>['Ms.', 'Mr.', 'Mrs.', 'Sir']
            .map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
      ),
    )
  );
}

// Container(
// padding:
// EdgeInsets.symmetric(horizontal: 10, vertical: 5),
// decoration: BoxDecoration(
// color: Colors.white,
// borderRadius: BorderRadius.circular(10)),
//
// // dropdown below..
// child: DropdownButton<String>(
// value: dropdownValue,
// icon: Icon(Icons.arrow_drop_down),
// iconSize: 42,
// underline: SizedBox(),
// onChanged: (String newValue) {
// setState(() {
// dropdownValue = newValue;
// });
// },
// items: <String>[
// 'One',
// 'Two',
// 'Three',
// 'Four'
// ].map<DropdownMenuItem<String>>((String value) {
// return DropdownMenuItem<String>(
// value: value,
// child: Text(value),
// );
// }).toList()),
// )

Widget phoneInputField(String placeholder) {
  return TextField(
    autofocus: true,
    enableSuggestions: false,
    cursorWidth: 1,
    cursorColor: ColorConstants.appColorBlue,
    keyboardType: TextInputType.number,
    decoration: InputDecoration(
      prefixText: '+256(0) ',
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      hintText: placeholder,
      suffix: textInputCloseButton(),
    ),
  );
}

Widget textInputCloseButton(){
  return Container(
    decoration: BoxDecoration(
        color: ColorConstants.greyColor.withOpacity(0.7),
        borderRadius: const BorderRadius.all(Radius.circular(5.0))),
    height: 20,
    width: 20,
    child: const Center(
      child:  Icon(
        Icons.clear,
        size: 15,
        color: Colors.white,
      ),
    ),
  );
}

Widget optField(first, last, context) {
  return Container(
    height: 64,
    width: 64,
    alignment: Alignment.center,
      decoration: BoxDecoration(
          color: const Color(0xff8D8D8D).withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: Center(
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
        showCursor: true,
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
          filled: false,
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
          // focusedBorder: OutlineInputBorder(
          //   borderSide:
          //   BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          //   borderRadius: BorderRadius.circular(10.0),
          // ),
          // enabledBorder: OutlineInputBorder(
          //   borderSide:
          //   BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          //   borderRadius: BorderRadius.circular(10.0),
          // ),
        ),
      ),
    )
  );
}
