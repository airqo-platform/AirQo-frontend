import 'package:app/constants/config.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';

import 'custom_widgets.dart';

Widget countryPickerField(String placeholder, valueChange, context) {
  return Container(
    // padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: CountryListPick(
      appBar: AppBar(
        backgroundColor: Config.appBodyColor,
        elevation: 0.0,
        iconTheme: IconThemeData(
          color: Config.appColorBlue,
        ),
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(top: 6.5, bottom: 6.5, left: 16),
          child: backButton(context),
        ),
        title: const Text(
          'Select Country',
          style: TextStyle(color: Colors.black),
        ),
      ),
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

Widget profilePicWidget(double height, double width, double iconSize,
    double textSize, radius, photoUrl, imageRadius, showIcon) {
  return Stack(
    alignment: AlignmentDirectional.center,
    children: [
      if (photoUrl == '')
        RotationTransition(
          turns: const AlwaysStoppedAnimation(-5 / 360),
          child: Container(
            padding: const EdgeInsets.all(2.0),
            decoration: BoxDecoration(
                color: photoUrl == '' ? Config.appPicColor : Colors.transparent,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(radius))),
            child: Container(
              height: height,
              width: width,
              color: Colors.transparent,
            ),
          ),
        ),
      if (photoUrl == '')
        Text(
          'A',
          style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
              fontSize: textSize),
        ),
      if (photoUrl != '')
        CircleAvatar(
          radius: imageRadius,
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.transparent,
          backgroundImage: CachedNetworkImageProvider(
            photoUrl,
          ),
        ),
      if (showIcon)
        Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white),
                color: Config.appColorBlue,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.add,
                size: iconSize,
                color: Colors.white,
              ),
              // child: const FaIcon(
              //   FontAwesomeIcons.plus,
              //   size: 18,
              //   color: Colors.white,
              // ),
            ))
    ],
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
