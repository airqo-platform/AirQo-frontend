import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

Widget backButton(context){

  return Container(
    padding: EdgeInsets.all(2.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))
    ),
    child: IconButton(
      icon:Icon(Icons.arrow_back, color: Colors.black,),
      onPressed: () {Navigator.pop(context);},
    ),
  );
}

Widget customInputField(context, text){

  return Container(
    constraints: const BoxConstraints(minWidth: double.infinity),
    padding: EdgeInsets.only(left: 16.0, right: 8.0),
    decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(Radius.circular(10.0))
    ),
    child: Row(
      children: [
        Text('$text'),
        Spacer(),
        IconButton(
          icon:Icon(Icons.edit, color: ColorConstants.appColorBlue,),
          onPressed: () { },
        )
      ],
    ),
  );
}