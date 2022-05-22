import 'package:app/constants/config.dart';
import 'package:app/models/kya.dart';
import 'package:app/services/app_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../themes/app_theme.dart';

class KyaFinalPage extends StatefulWidget {
  final Kya kya;

  const KyaFinalPage({Key? key, required this.kya}) : super(key: key);

  @override
  _KyaFinalPageState createState() => _KyaFinalPageState();
}

class _KyaFinalPageState extends State<KyaFinalPage> {
  final AppService _appService = AppService();
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
                        style: CustomTextStyle.headline11(context),
                      ),
                    ),
                    const SizedBox(
                      height: 8.0,
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 60, right: 60),
                      child: Text(widget.kya.completionMessage,
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .subtitle1
                              ?.copyWith(
                                  color:
                                      Config.appColorBlack.withOpacity(0.5))),
                    ),
                  ]),
            )),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    kya = widget.kya
      ..progress = widget.kya.progress == -1 ? -1 : widget.kya.lessons.length;
    _initialize();
  }

  Future<void> _initialize() async {
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.pop(context);
    });
    await _appService.updateKya(kya, context);
  }

  Future<bool> _onWillPop() {
    return Future.value(false);
  }
}
