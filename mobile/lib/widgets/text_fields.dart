import 'package:app/constants/app_constants.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

Widget tabLayout(String day, date, Color background){
  return Container(
    width: 50,
    height: 32,
    padding: const EdgeInsets.all(1.0),
    decoration: BoxDecoration(
      color: background,
      border: Border.all(color:
      ColorConstants.inactiveColor.withOpacity(0.1)),
      borderRadius: const BorderRadius.all(Radius.circular(5.0)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(day, style: TextStyle(
            fontSize: 10,
            color: ColorConstants.inactiveColor
        ),),
        Text(date, style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: ColorConstants.inactiveColor
        ))
      ],
    ),

  );
}

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
      suffixIcon: textInputCloseButton(),
    ),
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

Widget signupInputFieldIcon(){
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
      suffixIcon: textInputCloseButton(),
    ),
  );
}

Widget textInputCloseButton(){
  return Padding(
    padding: EdgeInsets.all(10),
    child: Container(
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

Widget profilePicRow() {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.center,
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Stack(
        alignment: AlignmentDirectional.center,
        children: [
          RotationTransition(
            turns: AlwaysStoppedAnimation(-5 / 360),
            child: Container(
              padding: EdgeInsets.all(2.0),
              decoration: BoxDecoration(
                  color: ColorConstants.appPicColor,
                  shape: BoxShape.rectangle,
                  borderRadius: BorderRadius.all(Radius.circular(35.0))),
              child: Container(
                height: 88,
                width: 88,
                color: Colors.transparent,
              ),
            ),
          ),
          const Text(
            'NG',
            style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 30),
          ),
          Positioned(
            bottom: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(2.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white),
                    color: ColorConstants.appColorBlue,
                    shape: BoxShape.circle,),
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

Widget profilePic(double height, double width, double iconSize,
    double textSize, radius) {
  return Stack(
    alignment: AlignmentDirectional.center,
    children: [
      RotationTransition(
        turns: AlwaysStoppedAnimation(-5 / 360),
        child: Container(
          padding: EdgeInsets.all(2.0),
          decoration: BoxDecoration(
              color: ColorConstants.appPicColor,
              shape: BoxShape.rectangle,
              borderRadius: BorderRadius.all(Radius.circular(radius))),
          child: Container(
            height: height,
            width: width,
            color: Colors.transparent,
          ),
        ),
      ),
      Text(
        'NG',
        style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
            fontSize: textSize),
      ),
      Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(2.0),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white),
              color: ColorConstants.appColorBlue,
              shape: BoxShape.circle,),
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

