import 'dart:ui';

import 'package:app/constants/app_constants.dart';

Color getPmColor(double pm2_5){
  if(pm2_5 >= 0 && pm2_5 <= 12){ //good
    return greenColor;
  }
  else if(pm2_5 >= 12.1 && pm2_5 <= 35.4){ //moderate
    return yellowColor;
  }
  else if(pm2_5 >= 35.5 && pm2_5 <= 55.4){ //sensitive
    return orangeColor;
  }
  else if(pm2_5 >= 55.5 && pm2_5 <= 150.4){ // unhealthy
    return redColor;
  }
  else if(pm2_5 >= 150.5 && pm2_5 <= 250.4){ // very unhealthy
    return purpleColor;
  }
  else if(pm2_5 >= 250.5){ // hazardous
    return maroonColor;
  }
  else{
    return appColor;
  }
}