
import 'package:app/widgets/help/aqi_index.dart';
import 'package:flutter/material.dart';
import 'package:app/constants/app_constants.dart';

Widget getHelpPage(String name){
  if(name.toLowerCase() == '${PollutantConstants.pm2_5.toLowerCase()}'){
    return AQI_Dialog();
  }
  else{
    return AQI_Dialog();
  }
}
