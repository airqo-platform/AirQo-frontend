import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';

import '../home_page.dart';
import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'auth_widgets.dart';

class AuthVerificationSuccessWidget extends StatefulWidget {
  const AuthVerificationSuccessWidget({
    super.key,
    required this.authProcedure,
    required this.authMethod,
    required this.code,
  });
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;
  final String code;

  @override
  State<AuthVerificationSuccessWidget> createState() =>
      _AuthVerificationSuccessWidgetState();
}

class _AuthVerificationSuccessWidgetState
    extends State<AuthVerificationSuccessWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: WillPopScope(
        onWillPop: _onWillPop,
        child: AppSafeArea(
          horizontalPadding: 24,
          backgroundColor: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AuthTitle(
                "Your ${widget.authMethod == AuthMethod.phone ? 'number' : 'email'} has been verified",
              ),
              const AuthSubTitle(
                'Pheww, almost done, hold in there.',
              ),
              Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: ValidOptField(widget.code),
              ),
              const Spacer(),
              const AuthSuccessWidget(),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _initialize() async {
    await _goToNextPage();
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<bool> _onWillPop() {
    return Future.value(false);
  }

  Future<void> _goToNextPage() async {
    switch (widget.authProcedure) {
      case AuthProcedure.signup:
        await AppService.postSignInActions(context).then((_) async {
          await Future.delayed(const Duration(seconds: 2)).then((_) async {
            await Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(
                builder: (context) => const ProfileSetupScreen(),
              ),
              (r) => false,
            );
          });
        });
        break;
      case AuthProcedure.login:
      case AuthProcedure.anonymousLogin:
        await AppService.postSignInActions(context).then((_) async {
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) => const HomePage(),
            ),
            (r) => false,
          );
        });
        break;
      case AuthProcedure.deleteAccount:
      case AuthProcedure.logout:
        await AppService.postSignOutActions(context).then((_) {
          Navigator.pop(context, true);
        });
        break;
    }
  }
}
