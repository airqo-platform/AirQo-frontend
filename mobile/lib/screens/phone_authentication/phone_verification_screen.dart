import 'package:app/blocs/blocs.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/screens/phone_authentication/phone_auth_widgets.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../widgets/auth_widgets.dart';
import '../home_page.dart';
import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';

Future<void> verifyPhoneAuthCode(BuildContext context) async {
  await Navigator.of(context).push(
    PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) =>
          const _PhoneAuthVerificationWidget(),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        const curve = Curves.ease;

        var tween = Tween(
          begin: begin,
          end: end,
        ).chain(CurveTween(curve: curve));

        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
    ),
  );
}

class _PhoneAuthVerificationWidget extends StatefulWidget {
  const _PhoneAuthVerificationWidget();

  @override
  State<_PhoneAuthVerificationWidget> createState() =>
      _PhoneAuthVerificationWidgetState();
}

class _PhoneAuthVerificationWidgetState
    extends State<_PhoneAuthVerificationWidget> {
  DateTime? _exitTime;
  final _formKey = GlobalKey<FormState>();
  String _inputCode = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          horizontalPadding: 24,
          backgroundColor: Colors.white,
          child: BlocBuilder<PhoneVerificationBloc, PhoneVerificationState>(
            builder: (context, state) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const PhoneVerificationTitle(),
                  const PhoneVerificationSubTitle(),
                  const SizedBox(
                    height: 20,
                  ),
                  Form(
                    key: _formKey,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 36),
                      child: TextFormField(
                        validator: (value) {
                          String? error;
                          if (value == null) {
                            error = 'Please enter the code';
                          }

                          if (value != null && value.length < 6) {
                            error = 'Please enter all the digits';
                          }

                          if (error != null) {
                            context
                                .read<PhoneVerificationBloc>()
                                .add(const SetPhoneVerificationStatus(
                                  AuthenticationStatus.error,
                                ));
                          }

                          return error;
                        },
                        onChanged: (value) {
                          setState(() => _inputCode = value);
                        },
                        showCursor: state.codeCountDown <= 0 &&
                            state.status != AuthenticationStatus.success,
                        enabled: state.codeCountDown <= 0 &&
                            state.status != AuthenticationStatus.success,
                        textAlign: TextAlign.center,
                        maxLength: 6,
                        cursorWidth: 1,
                        keyboardType: TextInputType.number,
                        style: inputTextStyle(
                          state.status,
                          optField: true,
                        ),
                        decoration: optInputDecoration(
                          state.status,
                          codeSent: state.codeCountDown <= 0,
                        ),
                      ),
                    ),
                  ),
                  const PhoneVerificationCodeCountDown(),
                  Visibility(
                    visible: state.status != AuthenticationStatus.success,
                    child: const AuthOrSeparator(),
                  ),
                  Visibility(
                    visible: state.status != AuthenticationStatus.success,
                    child: const ChangeAuthCredentials(AuthMethod.phone),
                  ),
                  const Spacer(),
                  Visibility(
                    visible: state.status == AuthenticationStatus.success,
                    child: const AuthSuccessWidget(),
                  ),
                  const Spacer(),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: NextButton(
                      buttonColor: _inputCode.length >= 6
                          ? CustomColors.appColorBlue
                          : CustomColors.appColorDisabled,
                      callBack: () async {
                        switch (state.status) {
                          case AuthenticationStatus.success:
                            break;
                          case AuthenticationStatus.error:
                          case AuthenticationStatus.initial:
                            if (_inputCode.length < 6) {
                              return;
                            }
                            FormState? formState = _formKey.currentState;
                            if (formState == null) {
                              return;
                            }
                            if (formState.validate()) {
                              await _authenticate();
                            }
                            return;
                        }

                        if (!mounted) return;

                        if (state.authProcedure == AuthProcedure.login) {
                          await Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (context) {
                              return const HomePage();
                            }),
                            (r) => false,
                          );
                        } else {
                          await Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (context) {
                              return const ProfileSetupScreen();
                            }),
                            (r) => false,
                          );
                        }
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _authenticate() async {
    loadingScreen(context);
    final phoneAuthModel =
        context.read<PhoneVerificationBloc>().state.phoneAuthModel;

    final phoneCredential = PhoneAuthProvider.credential(
      verificationId: phoneAuthModel.verificationId ?? "",
      smsCode: _inputCode,
    );

    try {
      final bool success = await CustomAuth.firebaseSignIn(phoneCredential);
      if (!mounted) return;

      Navigator.pop(context);

      if (success) {
        context
            .read<PhoneVerificationBloc>()
            .add(const SetPhoneVerificationStatus(
              AuthenticationStatus.success,
            ));
        await AppService.postSignInActions(context);
      } else {
        await showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext _) {
            return const AuthFailureDialog();
          },
        );
      }
    } on FirebaseAuthException catch (exception, _) {
      Navigator.pop(context);
      final firebaseAuthError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      if (firebaseAuthError == FirebaseAuthError.invalidAuthCode) {
        context
            .read<PhoneVerificationBloc>()
            .add(const SetPhoneVerificationStatus(AuthenticationStatus.error));
      } else {
        await showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext _) {
            return const AuthFailureDialog();
          },
        );
      }
    } catch (exception, stackTrace) {
      Navigator.pop(context);
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext _) {
          return const AuthFailureDialog();
        },
      );
      await logException(exception, stackTrace);
    }
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to cancel!',
      );

      return Future.value(false);
    }

    Navigator.pop(context, false);

    return Future.value(false);
  }
}
