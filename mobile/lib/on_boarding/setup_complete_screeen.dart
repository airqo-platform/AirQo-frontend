import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

class SetUpCompleteScreen extends StatefulWidget {
  bool enableBackButton;

  SetUpCompleteScreen(this.enableBackButton, {Key? key}) : super(key: key);

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  DateTime? exitTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
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
      ),
    ));
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return HomePage();
      }), (r) => false);
    });
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    if (widget.enableBackButton) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }
}
