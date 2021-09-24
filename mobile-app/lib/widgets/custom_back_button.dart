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