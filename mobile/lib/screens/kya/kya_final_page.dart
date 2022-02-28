import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/services/app_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../home_page.dart';

class KyaFinalPage extends StatefulWidget {
  final Kya kya;

  KyaFinalPage({Key? key, required this.kya}) : super(key: key);

  @override
  _KyaFinalPageState createState() => _KyaFinalPageState();
}

class _KyaFinalPageState extends State<KyaFinalPage> {
  late AppService _appService;
  late Kya kya;

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          toolbarHeight: 0,
          backgroundColor: Config.appBodyColor,
        ),
        body: Container(
            color: Config.appBodyColor,
            child: Center(
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SvgPicture.asset(
                      'assets/icon/learn_complete.svg',
                      height: 133,
                      width: 221,
                    ),
                    const SizedBox(
                      height: 33.61,
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 40, right: 40),
                      child: Text(
                        'Congrats!',
                        style: TextStyle(
                            color: Config.appColorBlack,
                            fontSize: 28,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(
                      height: 8.0,
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 60, right: 60),
                      child: Text(
                        widget.kya.completionMessage,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Config.appColorBlack.withOpacity(0.5),
                            fontSize: 16),
                      ),
                    ),
                  ]),
            )),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    kya = widget.kya..progress = -1;
    _initialize();
  }

  Future<void> _initialize() async {
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    });
    await _appService.updateKya(kya);
  }

  Future<bool> _onWillPop() {
    return Future.value(false);
  }
}
