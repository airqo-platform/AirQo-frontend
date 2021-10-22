import 'package:app/constants/app_constants.dart';
import 'package:app/utils/dialogs.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

Widget countryPickerField(String placeholder, valueChange) {
  return Container(
    // padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: CountryListPick(
      theme: CountryTheme(
        isShowFlag: true,
        isShowTitle: false,
        isShowCode: false,
        isDownIcon: true,
        showEnglishName: false,
        labelColor: ColorConstants.appColorBlue,
        alphabetSelectedBackgroundColor: ColorConstants.appColorBlue,
        alphabetTextColor: ColorConstants.appColorBlue,
        alphabetSelectedTextColor: ColorConstants.appColorBlue,
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

// Widget nameInputField(String placeholder, maxLength, callbackFn) {
//   var controller = TextEditingController();
//   return TextFormField(
//     autofocus: true,
//     enableSuggestions: false,
//     cursorWidth: 1,
//     cursorColor: ColorConstants.appColorBlue,
//     keyboardType: TextInputType.name,
//     onChanged: (value) {
//       callbackFn(value);
//     },
//     validator: (value) {
//       if (value == null || value.isEmpty) {
//         return 'Please enter your name';
//       }
//
//       if (value.length > maxLength) {
//         return 'Maximum number of characters is 15';
//       }
//       return null;
//     },
//     decoration: InputDecoration(
//       focusedBorder: OutlineInputBorder(
//           borderSide:
//               BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
//           borderRadius: BorderRadius.circular(10.0),
//           gapPadding: 2.0),
//       enabledBorder: OutlineInputBorder(
//           borderSide:
//               BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
//           borderRadius: BorderRadius.circular(10.0),
//           gapPadding: 2.0),
//       hintText: placeholder,
//       suffixIcon: GestureDetector(
//         onTap: () {
//           controller.text = '';
//         },
//         child: textInputCloseButton(),
//       ),
//     ),
//   );
// }

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
      suffixIcon: textInputCloseButton(),
    ),
  );
}

Widget optField(position, context, callbackFn) {
  return Container(
      height: 45,
      width: 45,
      alignment: Alignment.center,
      decoration: BoxDecoration(
          color: const Color(0xff8D8D8D).withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(10.0))),
      child: Center(
        child: TextFormField(
          autofocus: true,
          textAlignVertical: TextAlignVertical.center,
          onChanged: (value) {
            callbackFn(value, position);
            if (value.length == 1 && position != 5) {
              FocusScope.of(context).nextFocus();
            }
            if (value.isEmpty && position != 0) {
              FocusScope.of(context).previousFocus();
            }
          },
          showCursor: true,
          readOnly: false,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 17,
          ),
          keyboardType: TextInputType.number,
          maxLength: 1,
          decoration: InputDecoration(
            counter: const Offstage(),
            fillColor: const Color(0xff8D8D8D).withOpacity(0.1),
            filled: false,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
          ),
        ),
      ));
}

Widget phoneInputField(String placeholder, valueChangeCallBackFn, String prefix,
    clearCallBackFn, controller, context) {
  return Container(
      alignment: Alignment.center,
      padding: const EdgeInsets.only(left: 15),
      decoration: BoxDecoration(
          borderRadius: const BorderRadius.all(Radius.circular(10.0)),
          border: Border.all(color: ColorConstants.appColorBlue)),
      child: Center(
          child: TextFormField(
        controller: controller,
        autofocus: true,
        enableSuggestions: false,
        cursorWidth: 1,
        cursorColor: ColorConstants.appColorBlue,
        keyboardType: TextInputType.number,
        onChanged: (text) {
          valueChangeCallBackFn(text);
        },
        validator: (value) {
          if (value == null || value.isEmpty) {
            showSnackBar(context, 'Please enter your phone number');
          }
          return null;
        },
        decoration: InputDecoration(
          prefixText: prefix,
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
          // focusedBorder: OutlineInputBorder(
          //   borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          //   borderRadius: BorderRadius.circular(10.0),
          // ),
          // enabledBorder: OutlineInputBorder(
          //   borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
          //   borderRadius: BorderRadius.circular(10.0),
          // ),
          hintText: placeholder,
          suffixIcon: GestureDetector(
            onTap: clearCallBackFn,
            child: textInputCloseButton(),
          ),
        ),
      )));
}

Widget profilePicRow() {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Stack(
        alignment: AlignmentDirectional.center,
        children: [
          RotationTransition(
            turns: const AlwaysStoppedAnimation(-5 / 360),
            child: Container(
              padding: const EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                  color: ColorConstants.appPicColor,
                  shape: BoxShape.rectangle,
                  borderRadius: const BorderRadius.all(Radius.circular(35.0))),
              child: Container(
                height: 88,
                width: 88,
                color: Colors.transparent,
              ),
            ),
          ),
          const Text(
            '',
            style: TextStyle(
                fontWeight: FontWeight.bold, color: Colors.white, fontSize: 30),
          ),
          Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                  color: ColorConstants.appColorBlue,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.add,
                  size: 22,
                  color: Colors.white,
                ),
                // child: const FaIcon(
                //   FontAwesomeIcons.plus,
                //   size: 18,
                //   color: Colors.white,
                // ),
              ))
        ],
      ),
    ],
  );
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
                color: photoUrl == ''
                    ? ColorConstants.appPicColor
                    : Colors.transparent,
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
                color: ColorConstants.appColorBlue,
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

Widget signupInputField(String placeholder) {
  return TextField(
    autofocus: true,
    enableSuggestions: false,
    cursorWidth: 1,
    cursorColor: ColorConstants.appColorBlue,
    keyboardType: TextInputType.name,
    decoration: InputDecoration(
      filled: true,
      fillColor: Colors.white,
      hintText: placeholder,
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent, width: 1.0),
        borderRadius: BorderRadius.circular(10.0),
      ),
      suffixIcon: Icon(
        Icons.edit,
        size: 20.0,
        color: ColorConstants.appColorBlue,
      ),
    ),
  );
}

Widget signupInputFieldIcon() {
  return Container(
    decoration: BoxDecoration(
        color: ColorConstants.greyColor.withOpacity(0.7),
        borderRadius: const BorderRadius.all(Radius.circular(5.0))),
    height: 20,
    width: 20,
    child: const Center(
      child: Icon(
        Icons.clear,
        size: 15,
        color: Colors.white,
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
      border: Border.all(color: ColorConstants.inactiveColor.withOpacity(0.1)),
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
          color: ColorConstants.greyColor.withOpacity(0.7),
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
          icon: const Icon(
            Icons.keyboard_arrow_down_sharp,
            color: Colors.black,
          ),
          iconSize: 10,
          dropdownColor: ColorConstants.greyColor.withOpacity(0.2),
          elevation: 0,
          underline: const Visibility(visible: false, child: SizedBox()),
          style: const TextStyle(color: Colors.black),
          onChanged: (String? newValue) {},
          borderRadius: BorderRadius.circular(10.0),
          items: <String>['Ms.', 'Mr.', 'Mrs.', 'Sir']
              .map<DropdownMenuItem<String>>((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
        ),
      ));
}
