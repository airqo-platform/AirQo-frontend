import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import 'auth_verification_success.dart';
import 'auth_widgets.dart';
import 'email_verification.dart';

class _EmailAuthWidget extends StatefulWidget {
  const _EmailAuthWidget({
    super.key,
    this.emailAddress,
    required this.authProcedure,
  });

  final String? emailAddress;
  final AuthProcedure authProcedure;

  @override
  _EmailAuthWidgetState createState() => _EmailAuthWidgetState();
}

class _EmailAuthWidgetState<T extends _EmailAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool _keyboardVisible = false;

  @override
  void initState() {
    super.initState();
    context.read<EmailAuthBloc>().add(InitializeEmailAuth(
          emailAddress: widget.emailAddress ?? '',
          authProcedure: widget.authProcedure,
        ));
  }

  @override
  Widget build(BuildContext context) {
    _keyboardVisible = MediaQuery.of(context).viewInsets.bottom != 0;

    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          backgroundColor: Colors.white,
          horizontalPadding: 24,
          child: BlocBuilder<EmailAuthBloc, EmailAuthState>(
            builder: (context, state) {
              switch (state.status) {
                case EmailAuthStatus.authCodeSent:
                case EmailAuthStatus.invalidAuthCode:
                  return const EmailVerificationWidget();
                case EmailAuthStatus.success:
                  return AuthVerificationSuccessWidget(
                    authProcedure: state.authProcedure,
                    authMethod: AuthMethod.email,
                    code: state.emailAuthModel.validToken.toString(),
                  );
                case EmailAuthStatus.initial:
                case EmailAuthStatus.invalidEmailAddress:
                case EmailAuthStatus.emailAddressDoesNotExist:
                case EmailAuthStatus.emailAddressTaken:
                  break;
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AuthTitle(
                    AuthMethod.email.optionsText(state.authProcedure),
                  ),

                  const AuthSubTitle(
                    'We’ll send you a verification code',
                  ),

                  /// Invalid Email Status
                  Visibility(
                    visible:
                        state.status == EmailAuthStatus.emailAddressTaken ||
                            state.status ==
                                EmailAuthStatus.emailAddressDoesNotExist ||
                            state.status == EmailAuthStatus.invalidEmailAddress,
                    child: const AuthTitle(
                      "Oops, Something’s wrong with your email",
                    ),
                  ),

                  /// Email Input field
                  const Padding(
                    padding: EdgeInsets.only(top: 32.0),
                    child: SizedBox(
                      height: 48,
                      child: EmailInputField(),
                    ),
                  ),

                  /// Error message
                  Visibility(
                    visible: state.errorMessage.isNotEmpty,
                    child: AuthErrorMessage(state.errorMessage),
                  ),

                  /// Switch signup options
                  Visibility(
                    visible: state.status != EmailAuthStatus.success,
                    child: AuthSignUpButton(
                      authProcedure: state.authProcedure,
                      authMethod: AuthMethod.email,
                    ),
                  ),

                  const Spacer(),

                  /// Next button
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: NextButton(
                      buttonColor: state.emailAddress.isValidEmail()
                          ? CustomColors.appColorBlue
                          : CustomColors.appColorDisabled,
                      callBack: () async {
                        if (state.emailAddress.isValidEmail()) {
                          await _sendAuthToken();
                        }
                      },
                    ),
                  ),

                  /// login options
                  Visibility(
                    visible: !_keyboardVisible &&
                        state.status != EmailAuthStatus.success,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: state.authProcedure == AuthProcedure.login
                          ? const LoginOptions(authMethod: AuthMethod.email)
                          : const SignUpOptions(authMethod: AuthMethod.email),
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

  Future<AuthStepResult> _confirmEmailAddress() async {
    final confirmation = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: context.read<EmailAuthBloc>().state.emailAddress,
          authMethod: AuthMethod.email,
        );
      },
    );
    if (confirmation == ConfirmationAction.ok) {
      return AuthStepResult.success;
    }
    return AuthStepResult.fail;
  }

  Future<AuthStepResult> _emailAddressExistsChecks() async {
    EmailAuthState state = context.read<EmailAuthBloc>().state;
    AuthProcedure authProcedure = state.authProcedure;
    AuthStepResult result = AuthStepResult.success;
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        context.read<EmailAuthBloc>().add(const UpdateEmailAuthErrorMessage(
              'Check your internet connection',
            ));

        return AuthStepResult.fail;
      } else {
        loadingScreen(context);

        await AirqoApiClient()
            .checkIfUserExists(
          emailAddress: state.emailAddress,
        )
            .then((exists) async {
          Navigator.pop(context);

          if (exists == null) {
            result = AuthStepResult.error;
          } else {
            if (exists && authProcedure == AuthProcedure.signup) {
              context.read<EmailAuthBloc>().add(const UpdateEmailAuthStatus(
                  EmailAuthStatus.emailAddressTaken));
              result = AuthStepResult.fail;
            }
            if (!exists && authProcedure == AuthProcedure.login) {
              context.read<EmailAuthBloc>().add(const UpdateEmailAuthStatus(
                  EmailAuthStatus.emailAddressDoesNotExist));
              result = AuthStepResult.fail;
            }
          }
        });
      }
    });

    return result;
  }

  Future<void> _sendAuthToken() async {
    AuthStepResult stepResult = await _confirmEmailAddress();

    if (!mounted) return;
    switch (stepResult) {
      case AuthStepResult.success:
        break;
      case AuthStepResult.fail:
        return;
      case AuthStepResult.error:
        await showDialog<ConfirmationAction>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return const AuthFailureDialog();
          },
        );
        return;
    }

    stepResult = await _emailAddressExistsChecks();
    if (!mounted) return;
    switch (stepResult) {
      case AuthStepResult.success:
        break;
      case AuthStepResult.fail:
        return;
      case AuthStepResult.error:
        await showDialog<ConfirmationAction>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return const AuthFailureDialog();
          },
        );
        return;
    }

    if (!mounted) return;

    EmailAuthState state = context.read<EmailAuthBloc>().state;

    loadingScreen(context);

    await AirqoApiClient()
        .sendEmailVerificationCode(state.emailAddress)
        .then((emailAuthModel) async {
      if (emailAuthModel == null) {
        await showDialog<ConfirmationAction>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return const AuthFailureDialog();
          },
        );
      } else {
        context.read<EmailAuthBloc>().add(UpdateEmailAuthModel(emailAuthModel));
        context
            .read<EmailAuthBloc>()
            .add(const UpdateEmailAuthStatus(EmailAuthStatus.authCodeSent));
      }
    });
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to cancel !',
      );

      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }
}

class EmailLoginWidget extends _EmailAuthWidget {
  const EmailLoginWidget({super.key, String? emailAddress})
      : super(
          emailAddress: emailAddress,
          authProcedure: AuthProcedure.login,
        );

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends _EmailAuthWidgetState<EmailLoginWidget> {}

class EmailSignUpWidget extends _EmailAuthWidget {
  const EmailSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  EmailSignUpWidgetState createState() => EmailSignUpWidgetState();
}

class EmailSignUpWidgetState extends _EmailAuthWidgetState<EmailSignUpWidget> {}
