import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:flutter/material.dart';

class SetUpCompleteScreen extends StatefulWidget {
  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      child: Center(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                'All Set!',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 48,
                    color: Colors.black),
              ),
              Text(
                'Breathe',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 48,
                    color: ColorConstants.appColorBlue),
              ),
            ]),
      ),
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (context) {
        return HomePage();
      }));
    });
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }
}
