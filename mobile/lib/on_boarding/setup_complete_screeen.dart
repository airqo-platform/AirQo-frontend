import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';

class SetUpCompleteScreen extends StatefulWidget {
  final bool enableBackButton;

  const SetUpCompleteScreen(this.enableBackButton, {Key? key})
      : super(key: key);

  @override
  SetUpCompleteScreenState createState() => SetUpCompleteScreenState();
}

class SetUpCompleteScreenState extends State<SetUpCompleteScreen> {
  DateTime? _exitTime;
  AirqoApiClient? _airqoApiClient;
  final CustomAuth _customAuth = CustomAuth();
  final CloudStore _cloudStore = CloudStore();
  late AppService _appService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Center(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'All Set!',
                textAlign: TextAlign.center,
                style: _textStyle(),
              ),
              Text(
                'Breathe',
                textAlign: TextAlign.center,
                style: _textStyle()?.copyWith(color: Config.appColorBlue),
              ),
            ]),
      ),
    ));
  }

  Future<void> initialize() async {
    Future.delayed(const Duration(seconds: 4), () {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        updateOnBoardingPage('home');
        return const HomePage();
      }), (r) => false);
    });
  }

  @override
  void initState() {
    super.initState();
    _airqoApiClient = AirqoApiClient(context);
    _appService = AppService(context);
    updateOnBoardingPage('complete');
    initialize();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    // if (widget.enableBackButton && mounted) {
    //   Navigator.pushAndRemoveUntil(context,
    //       MaterialPageRoute(builder: (context) {
    //     return const HomePage();
    //   }), (r) => false);
    // }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeEmail() async {
    try {
      var userDetails = await _cloudStore.getProfile(_customAuth.getUserId());
      if (userDetails == null) {
        return;
      }
      await _airqoApiClient!.sendWelcomeMessage(userDetails);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  void updateOnBoardingPage(String page) async {
    await _appService.preferencesHelper.updateOnBoardingPage(page);
  }

  TextStyle? _textStyle() {
    return Theme.of(context).textTheme.bodyText1?.copyWith(
        fontWeight: FontWeight.bold,
        fontStyle: FontStyle.normal,
        fontSize: 48,
        height: 56 / 48,
        letterSpacing: 16 * -0.022);
  }
}
