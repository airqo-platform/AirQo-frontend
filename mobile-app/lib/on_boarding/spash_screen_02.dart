import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/spash_screen_03.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class WelcomeScreen extends StatefulWidget {
  @override
  WelcomeScreenState createState() => WelcomeScreenState();
}

class WelcomeScreenState extends State<WelcomeScreen> {

  @override
  void initState() {
    initialize();
    super.initState();

  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
            return PhoneScreen();
          }));
    });
  }

  @override
  Widget build(BuildContext context) {
      return Scaffold(
          body: Container(
            child: Padding(
              padding: EdgeInsets.fromLTRB(24, 48, 0, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Welcome to',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 32,
                          color: Colors.black
                      ),),
                    Text('AirQo',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 32,
                          color: ColorConstants.appColor
                      ),),
                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 45, 51, 0),
                      child:  welcomeSection(),
                    ),

                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 22, 51, 0),
                      child:  welcomeSection(),
                    ),

                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 22, 51, 0),
                      child:  welcomeSection(),
                    ),

                    Spacer(),

                    Padding(
                      padding: EdgeInsets.fromLTRB(24, 0, 24, 92),
                      child:  Container(
                        color: ColorConstants.appColor,
                      ),
                    ),

                  ]
              ),
            ),
          ));
    }

    Widget welcomeSection(){

    return Expanded(

      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.blueGrey,
          ),
          Padding(
              padding: EdgeInsets.fromLTRB(20, 0, 0, 0),
              child:  Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                    Text('Lorem ipsum dolor',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.black
                      ),),
                    Text('Lorem ipsum dolor sit amet',
                      maxLines: 4,
                      softWrap: true,
                      style: TextStyle(
                          fontSize: 12,
                          color: Colors.black
                      ),),
                  ]
              )
          )

        ],
      ),
    );

    }
  }

