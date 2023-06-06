import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import 'auth_widgets.dart';

class EmailVerificationWidget extends StatefulWidget {
  const EmailVerificationWidget({super.key});

  @override
  State<EmailVerificationWidget> createState() =>
      EmailVerificationWidgetState();
}

class EmailVerificationWidgetState extends State<EmailVerificationWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: AppSafeArea(
        backgroundColor: Colors.white,
        horizontalPadding: 24,
        child: BlocBuilder<EmailAuthBloc, EmailAuthState>(
          builder: (context, state) {
            if (state.codeCountDown >= 5) {
              _startCodeSentCountDown();
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                /// initial Status
                Visibility(
                  visible: state.status != EmailAuthStatus.invalidAuthCode,
                  child: const AuthTitle("Verify your account"),
                ),

                Visibility(
                  visible: state.status != EmailAuthStatus.invalidAuthCode,
                  child: AuthSubTitle(
                    'Enter the 6 digits code sent to ${state.emailAuthModel.emailAddress}',
                  ),
                ),

                /// invalid code Status
                Visibility(
                  visible: state.status == EmailAuthStatus.invalidAuthCode,
                  child: const AuthTitle(
                    "Oops, Something’s wrong with your code",
                  ),
                ),

                Visibility(
                  visible: state.status == EmailAuthStatus.invalidAuthCode,
                  child: const AuthSubTitle(
                    'Sure you read it correctly? Pro Tip: Copy & Paste',
                  ),
                ),

                Visibility(
                  visible: state.status == EmailAuthStatus.invalidAuthCode,
                  child: const AuthSubTitle(
                    'Invalid Auth code',
                  ),
                ),

                /// OPT field
                Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: EditOptField(
                    callbackFn: (String value) {
                      context
                          .read<EmailAuthBloc>()
                          .add(UpdateEmailInputCode(int.parse(value)));
                    },
                  ),
                ),

                /// Resend OPT
                Visibility(
                  visible: state.codeCountDown > 0,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 10.0),
                    child: Text(
                      'The code should arrive with in ${state.codeCountDown} sec',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.5),
                      ),
                    ),
                  ),
                ),

                Visibility(
                  visible: state.codeCountDown <= 0,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 10.0),
                    child: InkWell(
                      onTap: () {
                        context
                            .read<AuthCodeBloc>()
                            .add(ResendEmailAuthCode(context: context));
                      },
                      child: Text(
                        'Resend code',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: CustomColors.appColorBlue,
                        ),
                      ),
                    ),
                  ),
                ),

                const AuthOrSeparator(),

                const ChangeAuthCredentials(),

                const Spacer(),

                Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: NextButton(
                    buttonColor:
                    state.emailAuthModel.inputToken.toString().length >= 6
                        ? CustomColors.appColorBlue
                        : CustomColors.appColorDisabled,
                    callBack: () {
                      if (state.emailAuthModel.inputToken.toString().length >= 6) {
                        _logInUser();
                      }
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _logInUser() async {
    EmailAuthState state = context.read<EmailAuthBloc>().state;
    if (!state.emailAuthModel.isValidInputToken()) {
      context
          .read<EmailAuthBloc>()
          .add(const UpdateEmailAuthStatus(EmailAuthStatus.invalidAuthCode));
      return;
    }

    String emailLink = "";
    switch (state.authProcedure) {
      case AuthProcedure.login:
      case AuthProcedure.signup:
        emailLink = state.emailAuthModel.signInLink;
        break;
      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
        emailLink = state.emailAuthModel.reAuthenticationLink;
        break;
      case AuthProcedure.logout:
        break;
    }

    AuthCredential emailCredential = EmailAuthProvider.credentialWithLink(
      emailLink: emailLink,
      email: state.emailAuthModel.emailAddress,
    );

    final bool success = await CustomAuth.firebaseSignIn(emailCredential);

    if (success) {
      if (!mounted) return;
      context
          .read<EmailAuthBloc>()
          .add(const UpdateEmailAuthStatus(EmailAuthStatus.success));
    } else {
      if (!mounted) return;
      await showDialog<ConfirmationAction>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const AuthFailureDialog();
        },
      );
    }
  }

  void _startCodeSentCountDown() {
    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (mounted) {
          final newCount = context.read<AuthCodeBloc>().state.codeCountDown - 1;
          context.read<EmailAuthBloc>().add(UpdateEmailAuthCountDown(newCount));
          if (newCount == 0) {
            setState(() => timer.cancel());
          }
        }
      },
    );
  }
}
