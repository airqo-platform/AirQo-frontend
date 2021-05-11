import 'dart:ui';

import 'package:app/constants/app_constants.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

Color pmToColor(double pm2_5) {
  if (pm2_5 >= 0 && pm2_5 <= 12) {
    //good
    return greenColor;
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return yellowColor;
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return orangeColor;
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return redColor;
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return purpleColor;
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return maroonColor;
  } else {
    return appColor;
  }
}

String pmToString(double pm2_5) {
  if (pm2_5 >= 0 && pm2_5 <= 12) {
    //good
    return 'Good';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'Moderate';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'Sensitive';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'Unhealthy';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'Very Unhealthy';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'Hazardous';
  } else {
    return '';
  }
}

String pmToImage(double pm2_5) {
  if (pm2_5 >= 0 && pm2_5 <= 12) {
    //good
    return 'assets/images/good.png';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'assets/images/moderate.png';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'assets/images/sensitive.png';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'assets/images/unhealthy.png';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'assets/images/veryUnhealthy.png';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'assets/images/hazardous.png';
  } else {
    return 'assets/images/pmDefault.png';
  }
}

String pmToEmoji(double pm2_5) {
  if (pm2_5 >= 0 && pm2_5 <= 12) {
    //good
    return 'assets/images/good-face.png';
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return 'assets/images/moderate-face.png';
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return 'assets/images/sensitive-face.png';
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return 'assets/images/unhealthy-face.png';
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return 'assets/images/very-unhealthy-face.png';
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return 'assets/images/hazardous-face.png';
  } else {
    return 'assets/images/good-face.png';
  }
}

BitmapDescriptor pmToMarkerPoint(double pm2_5) {
  if (pm2_5 >= 0 && pm2_5 <= 12) {
    //good
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
  } else if (pm2_5 >= 12.1 && pm2_5 <= 35.4) {
    //moderate
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
  } else if (pm2_5 >= 35.5 && pm2_5 <= 55.4) {
    //sensitive
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
  } else if (pm2_5 >= 55.5 && pm2_5 <= 150.4) {
    // unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
  } else if (pm2_5 >= 150.5 && pm2_5 <= 250.4) {
    // very unhealthy
    return BitmapDescriptor.defaultMarkerWithHue(285);
  } else if (pm2_5 >= 250.5) {
    // hazardous
    return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueMagenta);
  } else {
    return BitmapDescriptor.defaultMarker;
  }
}
