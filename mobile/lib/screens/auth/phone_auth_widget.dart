import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'auth_verification.dart';
import 'auth_widgets.dart';

class _PhoneAuthWidget extends StatefulWidget {
  const _PhoneAuthWidget({
    super.key,
    this.phoneNumber,
    required this.authProcedure,
  });
  final String? phoneNumber;
  final AuthProcedure authProcedure;

  @override
  _PhoneAuthWidgetState createState() => _PhoneAuthWidgetState();
}

class _PhoneAuthWidgetState<T extends _PhoneAuthWidget> extends State<T> {
  DateTime? _exitTime;
  late BuildContext _loadingContext;
  bool _keyboardVisible = false;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    context.read<PhoneAuthBloc>().add(InitializePhoneAuth(
          phoneNumber: widget.phoneNumber ?? '',
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
          child: BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
            builder: (context, state) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  /// initial Status
                  Visibility(
                    visible: state.status == PhoneAuthStatus.initial ||
                        state.status == PhoneAuthStatus.verificationCodeSent,
                    child: AuthTitle(
                      AuthMethod.phone.optionsText(state.authProcedure),
                    ),
                  ),

                  Visibility(
                    visible: state.status == PhoneAuthStatus.initial ||
                        state.status == PhoneAuthStatus.verificationCodeSent,
                    child: const AuthSubTitle(
                      'We’ll send you a verification code',
                    ),
                  ),

                  /// Success Status
                  Visibility(
                    visible: state.status == PhoneAuthStatus.success,
                    child: const AuthTitle(
                      "Success",
                    ),
                  ),

                  Visibility(
                    visible: state.status == PhoneAuthStatus.success,
                    child: const AuthSubTitle(
                      'Great, few more steps before you can breathe',
                    ),
                  ),

                  /// Invalid Phone Status
                  Visibility(
                    visible: state.status == PhoneAuthStatus.phoneNumberTaken ||
                        state.status ==
                            PhoneAuthStatus.phoneNumberDoesNotExist ||
                        state.status == PhoneAuthStatus.invalidPhoneNumber,
                    child: const AuthTitle(
                      "Oops, Something’s wrong with your number",
                    ),
                  ),

                  /// Custom Error
                  Visibility(
                    visible: state.status == PhoneAuthStatus.error,
                    child: const AuthTitle(
                      "Oops, Something wrong happened",
                    ),
                  ),

                  /// Phone Input field
                  const Padding(
                    padding: EdgeInsets.only(top: 32.0),
                    child: SizedBox(
                      height: 48,
                      child: PhoneInputField(),
                    ),
                  ),

                  /// Error message
                  Visibility(
                    visible: state.errorMessage.isNotEmpty,
                    child: AuthErrorMessage(state.errorMessage),
                  ),

                  /// Switch signup options
                  Visibility(
                    visible: state.status != PhoneAuthStatus.success,
                    child: AuthSignUpButton(
                      authProcedure: state.authProcedure,
                      authMethod: AuthMethod.phone,
                    ),
                  ),

                  const Spacer(),

                  /// Next button
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: NextButton(
                      buttonColor: state.phoneNumber.isValidPhoneNumber()
                          ? CustomColors.appColorBlue
                          : CustomColors.appColorDisabled,
                      callBack: () async {
                        if (state.phoneNumber.isValidPhoneNumber()) {
                          await _validatePhoneNumber();
                        }
                      },
                    ),
                  ),

                  /// login options
                  Visibility(
                    visible: !_keyboardVisible &&
                        state.status != PhoneAuthStatus.success,
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: state.authProcedure == AuthProcedure.login
                          ? const LoginOptions(authMethod: AuthMethod.phone)
                          : const SignUpOptions(authMethod: AuthMethod.phone),
                    ),
                  ),

                  /// listeners
                  MultiBlocListener(
                    listeners: [
                      BlocListener<PhoneAuthBloc, PhoneAuthState>(
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
                      BlocListener<PhoneAuthBloc, PhoneAuthState>(
                        listener: (context, state) {
                          Navigator.pop(_loadingContext);
                        },
                        listenWhen: (previous, current) {
                          return !current.loading && previous.loading;
                        },
                      ),
                      BlocListener<PhoneAuthBloc, PhoneAuthState>(
                        listener: (context, state) async {
                          context
                              .read<AuthCodeBloc>()
                              .add(InitializeAuthCodeState(
                                phoneAuthModel: state.phoneAuthModel,
                                authProcedure: state.authProcedure,
                                authMethod: AuthMethod.phone,
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
                              context.read<PhoneAuthBloc>().add(
                                    InitializePhoneAuth(
                                      phoneNumber: state.phoneNumber,
                                      authProcedure: state.authProcedure,
                                    ),
                                  );
                            }
                            if (mounted) {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(InitializeAuthCodeState(
                                    authMethod: AuthMethod.phone,
                                    authProcedure: state.authProcedure,
                                  ));
                            }
                          });
                        },
                        listenWhen: (previous, current) {
                          return current.status ==
                              PhoneAuthStatus.verificationCodeSent;
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

  Future<void> _validatePhoneNumber() async {
    FocusScope.of(context).requestFocus(FocusNode());
    String phoneNumber =
        "${context.read<PhoneAuthBloc>().state.countryCode} ${context.read<PhoneAuthBloc>().state.phoneNumber}";

    final confirmation = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: phoneNumber,
          authMethod: AuthMethod.phone,
        );
      },
    );

    if (confirmation == null || confirmation == ConfirmationAction.cancel) {
      return;
    }

    if (!mounted) return;

    phoneNumber =
        "${context.read<PhoneAuthBloc>().state.countryCode} ${context.read<PhoneAuthBloc>().state.phoneNumber}"
            .replaceAll(" ", "");

    context.read<PhoneAuthBloc>().add(const UpdateStatus(loading: true));
    if (phoneNumber.isEmpty) {
      context.read<PhoneAuthBloc>().add(const UpdateStatus(
            status: PhoneAuthStatus.invalidPhoneNumber,
            errorMessage: 'Phone number can\'t be blank',
          ));

      return;
    }

    if (!phoneNumber.isValidPhoneNumber()) {
      context.read<PhoneAuthBloc>().add(const UpdateStatus(
            status: PhoneAuthStatus.invalidPhoneNumber,
            errorMessage: 'Invalid Phone number',
          ));

      return;
    }

    final hasConnection = await hasNetworkConnection();

    if (!mounted) return;

    if (!hasConnection) {
      context.read<PhoneAuthBloc>().add(const UpdateStatus(
            status: PhoneAuthStatus.error,
            errorMessage: 'Check your internet connection',
          ));

      return;
    }

    AuthProcedure authProcedure =
        context.read<PhoneAuthBloc>().state.authProcedure;
    final bool? exists = await AirqoApiClient().checkIfUserExists(
      phoneNumber: phoneNumber,
    );

    switch (authProcedure) {
      case AuthProcedure.login:
        if (!mounted) return;
        if (exists == null) {
          context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.error,
                errorMessage: "Failed to send code. Try again later",
              ));

          return;
        }

        if (!exists) {
          context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.phoneNumberDoesNotExist,
                errorMessage: 'This number is not linked to any account.',
              ));

          return;
        }
        break;

      case AuthProcedure.signup:
        if (!mounted) return;
        if (exists == null) {
          context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.error,
                errorMessage: "Failed to send code. Try again later",
              ));

          return;
        }
        if (!mounted) return;

        if (exists) {
          context.read<PhoneAuthBloc>().add(const UpdateStatus(
                status: PhoneAuthStatus.phoneNumberTaken,
                errorMessage:
                    "An account already exists with this phone number",
              ));

          return;
        }
        break;

      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
      case AuthProcedure.logout:
        break;
    }

    if (!mounted) return;

    PhoneAuthState state = context.read<PhoneAuthBloc>().state;
    switch (authProcedure) {
      case AuthProcedure.login:
      case AuthProcedure.signup:
        await FirebaseAuth.instance.verifyPhoneNumber(
          phoneNumber: phoneNumber,
          verificationCompleted: (PhoneAuthCredential credential) {
            PhoneAuthModel phoneAuthModel = PhoneAuthModel(
              phoneAuthCredential: credential,
              verificationId: state.phoneAuthModel?.verificationId,
              resendToken: state.phoneAuthModel?.resendToken,
            );
            context.read<PhoneAuthBloc>().add(UpdatePhoneAuthModel(
                  phoneAuthModel,
                ));
            context.read<AuthCodeBloc>().add(const UpdateAuthCodeStatus(
                  status: AuthCodeStatus.success,
                ));
          },
          verificationFailed: (FirebaseAuthException exception) {
            if (!mounted) return;
            final firebaseAuthError = CustomAuth.getFirebaseErrorCodeMessage(
              exception.code,
            );

            switch (firebaseAuthError) {
              case FirebaseAuthError.noInternetConnection:
                context.read<PhoneAuthBloc>().add(const UpdateStatus(
                      status: PhoneAuthStatus.error,
                      errorMessage: "Check your internet connection",
                    ));
                break;
              case FirebaseAuthError.invalidPhoneNumber:
                context.read<PhoneAuthBloc>().add(const UpdateStatus(
                      status: PhoneAuthStatus.invalidPhoneNumber,
                      errorMessage: 'Invalid phone number',
                    ));
                break;
              case FirebaseAuthError.authFailure:
              case FirebaseAuthError.logInRequired:
              case FirebaseAuthError.phoneNumberTaken:
              case FirebaseAuthError.accountTaken:
              case FirebaseAuthError.accountInvalid:
                context.read<PhoneAuthBloc>().add(const UpdateStatus(
                      status: PhoneAuthStatus.error,
                      errorMessage: 'Failed to send code. Try again later',
                    ));
                break;
              case FirebaseAuthError.authSessionTimeout:
              case FirebaseAuthError.invalidEmailAddress:
              case FirebaseAuthError.emailTaken:
              case FirebaseAuthError.invalidAuthCode:
                break;
            }
          },
          codeSent: (String verificationId, int? resendToken) {
            if (!mounted) return;

            PhoneAuthModel phoneAuthModel = PhoneAuthModel(
              phoneAuthCredential: state.phoneAuthModel?.phoneAuthCredential,
              verificationId: verificationId,
              resendToken: resendToken,
            );
            context.read<PhoneAuthBloc>().add(UpdatePhoneAuthModel(
                  phoneAuthModel,
                ));
            context.read<PhoneAuthBloc>().add(const UpdateStatus(
                  status: PhoneAuthStatus.verificationCodeSent,
                ));
          },
          codeAutoRetrievalTimeout: (String verificationId) {
            if (!mounted) return;
          },
          timeout: const Duration(seconds: 30),
        );
        break;
      case AuthProcedure.anonymousLogin:
      case AuthProcedure.deleteAccount:
      case AuthProcedure.logout:
        break;
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

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const HomePage();
        },
      ),
      (r) => false,
    );

    return Future.value(false);
  }
}

class PhoneLoginWidget extends _PhoneAuthWidget {
  const PhoneLoginWidget({super.key, String? phoneNumber})
      : super(
          phoneNumber: phoneNumber,
          authProcedure: AuthProcedure.login,
        );

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends _PhoneAuthWidgetState<PhoneLoginWidget> {}

class PhoneSignUpWidget extends _PhoneAuthWidget {
  const PhoneSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends _PhoneAuthWidgetState<PhoneSignUpWidget> {}
