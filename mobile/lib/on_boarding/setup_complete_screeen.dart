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
  AppService? _appService;

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
                    color: Config.appColorBlue),
              ),
            ]),
      ),
    ));
  }

  Future<void> initialize() async {
    Future.delayed(const Duration(seconds: 4), () async {
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    });
    loadProfile();
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    _appService = AppService(context);
    initialize();
    super.initState();
  }

  void loadProfile() async {
    await _appService!.postLoginActions();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    if (widget.enableBackButton && mounted) {
      Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    }

    return Future.value(true);
  }

  @Deprecated('Functionality has been transferred to the backend')
  Future<void> sendWelcomeEmail() async {
    try {
      var userDetails = await _cloudStore.getProfile(_customAuth.getId());
      if (userDetails == null) {
        return;
      }
      await _airqoApiClient!.sendWelcomeMessage(userDetails);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
}
