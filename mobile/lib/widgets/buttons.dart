import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

Widget countryDropDown(String text) {
  return Container(
    padding: const EdgeInsets.all(20),
    constraints: const BoxConstraints(minWidth: 20),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: Text(
      text,
      textAlign: TextAlign.center,
      style: TextStyle(color: ColorConstants.appColorBlue, fontSize: 14),
    ),
  );
}

Widget locationIcon(height, width) {
  return Stack(
    children: [
      Image.asset(
        'assets/images/world-map.png',
        height: height,
        width: width,
      ),
      Container(
        decoration: BoxDecoration(
          color: ColorConstants.appColorBlue,
          shape: BoxShape.circle,
        ),
        child: const Padding(
          padding: EdgeInsets.all(12.0),
          child: Icon(
            Icons.map_outlined,
            size: 30,
            color: Colors.white,
          ),
        ),
      ),
    ],
  );
}

Widget nextButton(String text) {
  return Container(
    padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: ColorConstants.appColorBlue,
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: Row(
      children: [
        Expanded(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ),
        const Icon(
          Icons.arrow_forward,
          color: Colors.white,
        )
      ],
    ),
  );
}

Widget signButton(String text) {
  return Container(
    padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(Radius.circular(10.0))),
    child: Text(
      text,
      textAlign: TextAlign.center,
      style: TextStyle(color: ColorConstants.appColorBlue, fontSize: 14),
    ),
  );
}

Widget signUpOptions(context) {
  return Column(
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Already have an account',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return HomePage();
              }));
            },
            child: Text(
              'Log in',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.appColorBlue),
            ),
          )
        ],
      ),
      const SizedBox(
        height: 4,
      ),
      Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Proceed as',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
          ),
          const SizedBox(
            width: 2,
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return HomePage();
              }));
            },
            child: Text(
              'Guest',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: ColorConstants.appColorBlue),
            ),
          )
        ],
      ),
    ],
  );
}
