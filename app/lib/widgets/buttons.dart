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

Widget nextButton(String text, Color buttonColor) {
  return Container(
    padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
    constraints: const BoxConstraints(minWidth: double.infinity),
    decoration: BoxDecoration(
        color: buttonColor,
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

Widget notificationIcon(height, width) {
  return Stack(
    alignment: Alignment.center,
    children: [
      Padding(
        padding: const EdgeInsets.all(20),
        child: Container(
          height: 145,
          width: 145,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: ColorConstants.appColorBlue.withOpacity(0.3),
          ),
        ),
      ),
      Positioned(
        right: 0,
        child: Container(
          height: 37,
          width: 120,
          padding: const EdgeInsets.only(left: 10),
          decoration: BoxDecoration(
              color: ColorConstants.appColorBlue,
              borderRadius: const BorderRadius.all(Radius.circular(20.0))),
          child: Row(
            children: [
              const Icon(
                Icons.notifications,
                size: 20,
                color: Colors.white,
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        height: 6,
                        width: 23,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Container(
                        height: 6,
                        width: 12,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Container(
                        height: 6,
                        width: 39,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      )
                    ],
                  ),
                  const SizedBox(
                    height: 2,
                  ),
                  Row(
                    children: [
                      Container(
                        height: 6,
                        width: 14,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Container(
                        height: 6,
                        width: 8,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      ),
                      const SizedBox(
                        width: 2,
                      ),
                      Container(
                        height: 6,
                        width: 24,
                        decoration: const BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(20.0))),
                      )
                    ],
                  )
                ],
              )
            ],
          ),
        ),
      ),
    ],
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
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return HomePage();
              }), (r) => false);
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
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return HomePage();
              }), (r) => false);
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
