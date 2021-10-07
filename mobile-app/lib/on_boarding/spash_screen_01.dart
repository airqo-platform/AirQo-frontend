import 'package:app/screens/home_page.dart';
import 'package:flutter/material.dart';

class TagLineScreen extends StatefulWidget {
  @override
  TagLineScreenState createState() => TagLineScreenState();
}

class TagLineScreenState extends State<TagLineScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      child: Center(
        child: Stack(alignment: AlignmentDirectional.center, children: [
          Image.asset(
            'assets/images/splash-image.png',
            fit: BoxFit.cover,
            height: double.infinity,
            width: double.infinity,
            alignment: Alignment.center,
          ),
          const Text(
            'Breathe\nClean.',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 48, color: Colors.white),
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
