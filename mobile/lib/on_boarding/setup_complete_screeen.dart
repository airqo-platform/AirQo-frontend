import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
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
                    color: ColorConstants.appColorBlue),
              ),
            ]),
      ),
    ));
  }

  void initialize() {
    _airqoApiClient = AirqoApiClient(context);
    sendWelcomeEmail();
    if (mounted) {
      Future.delayed(const Duration(seconds: 4), () async {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const HomePage();
        }), (r) => false);
      });
    }
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    initialize();
    super.initState();
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

  Future<void> sendWelcomeEmail() async {
    var userDetails = await _cloudStore.getProfile(_customAuth.getId());
    await _airqoApiClient!.sendWelcomeMessage(userDetails);
  }
}
