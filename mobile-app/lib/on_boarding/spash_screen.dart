import 'package:app/on_boarding/spash_screen_01.dart';
import 'package:flutter/material.dart';

class LogoScreen extends StatefulWidget {
  @override
  LogoScreenState createState() => LogoScreenState();
}

class LogoScreenState extends State<LogoScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        body: Container(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/icon/airqo_logo.png',
                  height: 150,
                  width: 150,
                ),
              ],
            ),
          ),
        ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return TagLineScreen();
      }));
    });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }
}
