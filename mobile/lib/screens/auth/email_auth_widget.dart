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
import '../on_boarding/profile_setup_screen.dart';
import 'auth_verification.dart';
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
  late BuildContext _loadingContext;
  bool _keyboardVisible = false;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
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
              return Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  /// initial Status
                  Visibility(
                    visible: state.status == EmailAuthStatus.initial ||
                        state.status == EmailAuthStatus.codeSent,
                    child: AuthTitle(
                      AuthMethod.email.optionsText(state.authProcedure),
                    ),
                  ),

                  Visibility(
                    visible: state.status == EmailAuthStatus.initial ||
                        state.status == EmailAuthStatus.codeSent,
                    child: const AuthSubTitle(
                      'We’ll send you a verification code',
                    ),
                  ),

                  /// Success Status
                  Visibility(
                    visible: state.status == EmailAuthStatus.success,
                    child: const AuthTitle(
                      "Success",
                    ),
                  ),

                  Visibility(
                    visible: state.status == EmailAuthStatus.success,
                    child: const AuthSubTitle(
                      'Great, few more steps before you can breathe',
                    ),
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

                  /// Custom Error
                  Visibility(
                    visible: state.status == EmailAuthStatus.serverError,
                    child: const AuthTitle(
                      "Oops, Something wrong happened",
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

                  /// listeners
                  MultiBlocListener(
                    listeners: [
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) {
                          FocusScope.of(context).requestFocus(
                            FocusNode(),
                          );
                          loadingScreen(_loadingContext);
                        },
                        listenWhen: (_, current) {
                          return current.loading;
                        },
                      ),
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) {
                          Navigator.pop(_loadingContext);
                        },
                        listenWhen: (previous, current) {
                          return !current.loading && previous.loading;
                        },
                      ),
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) async {
                          context
                              .read<AuthCodeBloc>()
                              .add(InitializeAuthCodeState(
                                emailAuthModel: state.emailAuthModel,
                                authProcedure: state.authProcedure,
                                authMethod: AuthMethod.email,
                              ));

                          Widget nextScreen;
                          switch (state.authProcedure) {
                            case AuthProcedure.deleteAccount:
                            case AuthProcedure.anonymousLogin:
                            case AuthProcedure.logout:
                            case AuthProcedure.login:
                              nextScreen = const HomePage();
                              break;
                            case AuthProcedure.signup:
                              nextScreen = const ProfileSetupScreen();
                              break;
                          }

                          await verifyAuthCode(context).then((success) async {
                            if (success) {
                              loadingScreen(_loadingContext);
                              await Navigator.pushAndRemoveUntil(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => nextScreen,
                                ),
                                (r) => false,
                              );
                            } else {
                              context.read<EmailAuthBloc>().add(
                                    InitializeEmailAuth(
                                      emailAddress: state.emailAddress,
                                      authProcedure: state.authProcedure,
                                    ),
                                  );
                            }
                            if (mounted) {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(InitializeAuthCodeState(
                                    authMethod: AuthMethod.email,
                                    authProcedure: state.authProcedure,
                                  ));
                            }
                          });
                        },
                        listenWhen: (previous, current) {
                          return current.status ==
                              EmailAuthStatus.codeSent;
                        },
                      ),
                    ],
                    child: Container(),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }


  Future<bool> _confirmEmailAddress() async {
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

    return confirmation != null || confirmation != ConfirmationAction.cancel;
  }

  Future<bool> _emailAddressExistsChecks() async {
    EmailAuthState state = context.read<EmailAuthBloc>().state;
    AuthProcedure authProcedure = state.authProcedure;
    bool success = true;
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        context.read<PhoneAuthBloc>().add(const UpdateStatus(
          status: PhoneAuthStatus.error,
          errorMessage: 'Check your internet connection',
        ));

        return false;
      } else {
        loadingScreen(context);

        await AirqoApiClient()
            .checkIfUserExists(
          emailAddress: state.emailAddress,
        )
            .then((exists) {

          Navigator.pop(context);

          if (exists == null) {
            context.read<PhoneAuthBloc>().add(const UpdateStatus(
              status: PhoneAuthStatus.error,
              errorMessage:
              "Failed to validate email address. Try again later",
            ));

            success = false;
          } else {
            if (exists && authProcedure == AuthProcedure.signup) {
              context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.phoneNumberDoesNotExist,
                errorMessage:
                'An account already exists with this email address.',
              ));

              success = false;
            }
            if (!exists && authProcedure == AuthProcedure.login) {
              context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.phoneNumberDoesNotExist,
                errorMessage: 'This email address is not linked to any account.',
              ));

              success = false;
            }
          }
        });
      }
    });

    return success;
  }

  Future<void> _sendAuthToken() async {
    bool success = await _confirmEmailAddress();
    if (!mounted || !success) return;

    success = await _emailAddressExistsChecks();
    if (!mounted || !success) return;

    EmailAuthState state = context.read<EmailAuthBloc>().state;

    loadingScreen(context);

    await AirqoApiClient()
        .requestEmailVerificationCode(state.emailAddress, false)
        .then((emailAuthModel) {
      if (emailAuthModel == null) {
        // return emit(state.copyWith(
        //   status: EmailAuthStatus.error,
        //   errorMessage: "Failed to send verification code. Try again later",
        // ));
      } else{
        // return emit(state.copyWith(
        //   status: EmailAuthStatus.verificationCodeSent,
        //   emailAuthModel: emailAuthModel,
        // ));
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
