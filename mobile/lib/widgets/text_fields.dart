import 'package:app/constants/config.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';

import 'custom_widgets.dart';

Widget countryPickerField(String placeholder, valueChange, context) {
  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: CountryListPick(
      appBar: appTopBar(context, 'Select Country'),
      theme: CountryTheme(
        isShowFlag: true,
        isShowTitle: false,
        isShowCode: false,
        isDownIcon: true,
        showEnglishName: false,
        labelColor: Config.appColorBlue,
        alphabetSelectedBackgroundColor: Config.appColorBlue,
        alphabetTextColor: Config.appColorBlue,
        alphabetSelectedTextColor: Config.appColorBlue,
      ), //show down icon on dropdown
      initialSelection: placeholder,
      onChanged: (CountryCode? code) {
        if (code != null) {
          valueChange(code.dialCode);
        }
      },
    ),
  );
}

Widget optField(position, context, callbackFn, bool codeSent) {
  return Container(
      height: 64,
      width: 240,
      alignment: Alignment.center,
      decoration: BoxDecoration(
          color: codeSent
              ? Colors.white
              : const Color(0xff8D8D8D).withOpacity(0.1),
          border: Border.all(
              color: codeSent ? Config.appColorBlue : Colors.transparent),
          borderRadius: const BorderRadius.all(Radius.circular(8.0))),
      child: Center(
        child: TextFormField(
          autofocus: true,
          textAlignVertical: TextAlignVertical.center,
          onChanged: (value) {
            callbackFn(value, position);
          },
          showCursor: codeSent,
          cursorColor: Config.appColorBlue,
          readOnly: false,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w500,
            color: Config.appColorBlue,
            letterSpacing: 10.0,
          ),
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: InputDecoration(
            counter: const Offstage(),
            fillColor: codeSent
                ? Colors.white
                : const Color(0xff8D8D8D).withOpacity(0.1),
            filled: false,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
          ),
        ),
      ));
}

Widget optFieldV2(position, context, callbackFn, bool codeSent) {
  return SizedBox(
    height: 64,
    child: TextFormField(
      onChanged: (value) {
        callbackFn(value, position);
      },
      showCursor: codeSent,
      textAlign: TextAlign.center,
      maxLength: 6,
      enableSuggestions: false,
      cursorWidth: 1,
      autofocus: true,
      cursorColor: Config.appColorBlue,
      keyboardType: TextInputType.number,
      style: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w500,
          color: Config.appColorBlue,
          letterSpacing: 16 * 0.41,
          height: 40 / 32),
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0),
        counter: const Offstage(),
        fillColor:
            codeSent ? Colors.white : const Color(0xff8D8D8D).withOpacity(0.1),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        errorStyle: const TextStyle(
          fontSize: 0,
        ),
      ),
    ),
  );
}

Widget tabLayout(String day, date, Color background, Color foreground) {
  return Container(
    width: 50,
    height: 32,
    padding: const EdgeInsets.all(1.0),
    decoration: BoxDecoration(
      color: background,
      border: Border.all(color: Config.inactiveColor.withOpacity(0.1)),
      borderRadius: const BorderRadius.all(Radius.circular(5.0)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          day,
          style: TextStyle(fontSize: 10, color: foreground),
        ),
        Text(date,
            style: TextStyle(
                fontSize: 10, fontWeight: FontWeight.bold, color: foreground))
      ],
    ),
  );
}

Widget textInputCloseButton() {
  return Padding(
    padding: const EdgeInsets.all(15),
    child: Container(
      decoration: BoxDecoration(
          color: Config.greyColor.withOpacity(0.7),
          borderRadius: const BorderRadius.all(Radius.circular(5.0))),
      height: 15,
      width: 15,
      child: const Center(
        child: Icon(
          Icons.clear,
          size: 12,
          color: Colors.white,
        ),
      ),
    ),
  );
}
