import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PhoneScreen extends StatefulWidget {
  @override
  PhoneScreenState createState() => PhoneScreenState();
}

class PhoneScreenState extends State<PhoneScreen> {

  @override
  void initState() {
    // initialize();
    super.initState();

  }

  @override
  Widget build(BuildContext context) {
      return Scaffold(
          body: Container(
            child: Center(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: EdgeInsets.fromLTRB(24, 42, 24, 0),
                      child: const Text('Ok! What’s your mobile\nnumber?',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 24,
                            color: Colors.black
                        ),),
                    ),
                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 4, 0, 0),
                      child:  Text('We’ll send you a verification code',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14,
                            color: Colors.black.withOpacity(0.6)
                        ),),
                    ),

                    Spacer(),
                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 0, 0, 4),
                      child:  Text('Already have an account Log in',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14,
                            color: Colors.black.withOpacity(0.6)
                        ),),
                    ),
                    Padding(
                      padding: EdgeInsets.fromLTRB(0, 0, 0, 36),
                      child:  Text('Proceed as Guest',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 14,
                            color: Colors.black.withOpacity(0.6)
                        ),),
                    ),
                  ]
              ),
            ),
          ));
    }


  void initialize() {
    Future.delayed(const Duration(seconds: 8), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
            return PhoneScreen();
          }));
    });
  }
  }

