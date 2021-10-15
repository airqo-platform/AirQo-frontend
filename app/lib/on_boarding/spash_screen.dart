import 'package:app/on_boarding/welcome_screen.dart';
import 'package:flutter/material.dart';

class LogoScreen extends StatefulWidget {
  @override
  LogoScreenState createState() => LogoScreenState();
}

class LogoScreenState extends State<LogoScreen> {
  int _widgetId = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: AnimatedSwitcher(
        duration: const Duration(seconds: 5),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return ScaleTransition(scale: animation, child: child);
        },
        child: _renderWidget(),
      ),
    );
  }

  void initialize() {
    Future.delayed(const Duration(seconds: 2), () async {
      _updateWidget();
    });

    // Future.delayed(const Duration(seconds: 5), () async {
    //   await Navigator.pushAndRemoveUntil(context,
    //       MaterialPageRoute(builder: (context) {
    //         return WelcomeScreen();
    //       }), (r) => false);
    // });

    Future.delayed(const Duration(seconds: 5), () async {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return WelcomeScreen();
      }), (r) => false);
    });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Widget logoWidget() {
    return Container(
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
    );
  }

  Widget taglineWidget() {
    return Container(
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
    );
  }

  // @override
  // Widget build(BuildContext context) {
  //   return Scaffold(
  //       backgroundColor: Colors.white,
  //       body: Container(
  //         child: Center(
  //           child: Column(
  //             mainAxisAlignment: MainAxisAlignment.center,
  //             children: [
  //               Image.asset(
  //                 'assets/icon/airqo_logo.png',
  //                 height: 150,
  //                 width: 150,
  //               ),
  //             ],
  //           ),
  //         ),
  //       ));
  // }

  Widget _renderWidget() {
    return _widgetId == 1 ? logoWidget() : taglineWidget();
  }

  void _updateWidget() {
    setState(() {
      _widgetId = _widgetId == 1 ? 2 : 1;
    });
  }
}
