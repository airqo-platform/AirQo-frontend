import 'dart:async';
import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'phone_auth_widgets.dart';
import 'phone_verification_screen.dart';

class _PhoneAuthWidget extends StatefulWidget {
  const _PhoneAuthWidget({
    super.key,
    required this.authProcedure,
  });

  final AuthProcedure authProcedure;

  @override
  _PhoneAuthWidgetState createState() => _PhoneAuthWidgetState();
}

class _PhoneAuthWidgetState<T extends _PhoneAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool _keyboardVisible = false;
  final _formKey = GlobalKey<FormState>();
  List<String> phoneNumber = ["+256", ""];
  final AirqoApiClient apiClient = AirqoApiClient();
  PhoneAuthModel phoneAuthModel = PhoneAuthModel("");

  @override
  void initState() {
    super.initState();
    context
        .read<PhoneAuthBloc>()
        .add(InitializePhoneAuth(widget.authProcedure));
  }

  @override
  void dispose() {
    _formKey.currentState?.dispose();
    super.dispose();
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const PhoneAuthTitle(),
              const PhoneAuthSubTitle(),
              const SizedBox(height: 32),
              Form(
                key: _formKey,
                child: SizedBox(
                  height: 48,
                  child: BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
                    builder: (context, state) {
                      return Row(
                        children: [
                          SizedBox(
                            width: 64,
                            child: CountryCodePickerField(
                              valueChange: (code) {
                                setState(() => phoneNumber.first =
                                    code ?? phoneNumber.first);
                              },
                              placeholder: phoneNumber.first,
                              status: state.status,
                            ),
                          ),
                          const SizedBox(
                            width: 16,
                          ),
                          Expanded(
                            child: TextFormField(
                              validator: (_) {
                                if (!phoneNumber.join().isValidPhoneNumber()) {
                                  context
                                      .read<PhoneAuthBloc>()
                                      .add(SetPhoneAuthStatus(
                                        AuthenticationStatus.error,
                                        errorMessage:
                                            AppLocalizations.of(context)!
                                                .invalidPhoneNumber,
                                      ));

                                  return '';
                                }

                                return null;
                              },
                              onChanged: (value) {
                                setState(() => phoneNumber[1] = value);
                              },
                              onSaved: (value) {
                                setState(() => phoneNumber[1] = value!);
                              },
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                  RegExp(r'\d'),
                                ),
                                PhoneNumberInputFormatter(),
                              ],
                              style: inputTextStyle(state.status),
                              cursorWidth: 1,
                              autofocus: false,
                              enabled:
                                  state.status != AuthenticationStatus.success,
                              keyboardType: TextInputType.number,
                              decoration: inputDecoration(
                                state.status,
                                hintText: '700 000 000',
                                prefixText: phoneNumber.first,
                                suffixIconCallback: () {
                                  _formKey.currentState?.reset();
                                  FocusScope.of(context)
                                      .requestFocus(FocusNode());
                                },
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
              const PhoneAuthErrorMessage(),
              const PhoneAuthSwitchButton(),
              const Spacer(),
              NextButton(
                buttonColor: phoneNumber.join().isValidPhoneNumber()
                    ? CustomColors.appColorBlue
                    : CustomColors.appColorDisabled,
                callBack: () async {
                  FocusScope.of(context).requestFocus(FocusNode());

                  switch (context.read<PhoneAuthBloc>().state.status) {
                    case AuthenticationStatus.initial:
                    case AuthenticationStatus.error:
                      FormState? formState = _formKey.currentState;
                      if (formState == null) {
                        return;
                      }

                      if (formState.validate()) {
                        await _sendAuthCode();
                      }
                      break;
                    case AuthenticationStatus.success:
                      if (phoneAuthModel.phoneAuthCredential == null) {
                        context
                            .read<PhoneVerificationBloc>()
                            .add(InitializePhoneVerification(
                              phoneAuthModel: phoneAuthModel,
                              authProcedure: context
                                  .read<PhoneAuthBloc>()
                                  .state
                                  .authProcedure,
                            ));
                        await verifyPhoneAuthCode(context);
                      } else {
                        final AuthProcedure authProcedure =
                            context.read<PhoneAuthBloc>().state.authProcedure;
                        if (authProcedure == AuthProcedure.login) {
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
                      }
                  }
                },
              ),
              const SizedBox(
                height: 16,
              ),
              Visibility(
                visible: !_keyboardVisible,
                child: const PhoneAuthButtons(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _authenticate() async {
    try {
      final bool success =
          await CustomAuth.firebaseSignIn(phoneAuthModel.phoneAuthCredential);
      if (!mounted) return;

      Navigator.pop(context);

      if (success) {
        context
            .read<PhoneAuthBloc>()
            .add(const SetPhoneAuthStatus(AuthenticationStatus.success));
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

  Future<void> _sendAuthCode() async {
    context.read<PhoneAuthBloc>().add(const SetPhoneAuthStatus(
          AuthenticationStatus.initial,
        ));

    final hasConnection = await hasNetworkConnection();

    if (!mounted) {
      return;
    }

    if (!hasConnection) {
      context.read<PhoneAuthBloc>().add(SetPhoneAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.checkYourInternetConnection,
          ));

      return;
    }

    final confirmation = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: phoneNumber.join(" "),
          authMethod: AuthMethod.phone,
        );
      },
    );

    if (confirmation == null ||
        confirmation == ConfirmationAction.cancel ||
        !mounted) {
      return;
    }

    loadingScreen(context);
    final String fullPhoneNumber = phoneNumber.join().replaceAll(" ", "");

    final bool? exists = await apiClient.checkIfUserExists(
      phoneNumber: fullPhoneNumber,
    );

    if (!mounted) {
      return;
    }

    if (exists == null) {
      Navigator.pop(context);
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext _) {
          return const AuthFailureDialog();
        },
      );

      return;
    }

    AuthProcedure authProcedure =
        context.read<PhoneAuthBloc>().state.authProcedure;
    if (!exists && authProcedure == AuthProcedure.login) {
      Navigator.pop(context);
      context.read<PhoneAuthBloc>().add(SetPhoneAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.phoneNumberNotFoundDidYouSignUp,
          ));

      return;
    }

    if (exists && authProcedure == AuthProcedure.signup) {
      Navigator.pop(context);
      context.read<PhoneAuthBloc>().add(SetPhoneAuthStatus(
            AuthenticationStatus.error,
            errorMessage: AppLocalizations.of(context)!
                .phoneNumberAlreadyRegisteredPleaseLogIn,
          ));

      return;
    }

    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: fullPhoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) {
        if (Platform.isAndroid) {
          setState(() => phoneAuthModel = phoneAuthModel.copyWith(
                phoneAuthCredential: credential,
                phoneNumber: fullPhoneNumber,
              ));
          _authenticate();
        }
      },
      verificationFailed: (FirebaseAuthException exception) async {
        Navigator.pop(context);
        final firebaseAuthError = CustomAuth.getFirebaseErrorCodeMessage(
          exception.code,
        );

        if (firebaseAuthError == FirebaseAuthError.invalidPhoneNumber) {
          context.read<PhoneAuthBloc>().add(SetPhoneAuthStatus(
                AuthenticationStatus.error,
                errorMessage: AppLocalizations.of(context)!.invalidPhoneNumber,
              ));
        } else {
          await showDialog<void>(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext _) {
              return const AuthFailureDialog();
            },
          );
          await logException(exception, null);
        }
      },
      codeSent: (String verificationId, int? resendToken) {
        setState(() => phoneAuthModel = phoneAuthModel.copyWith(
              verificationId: verificationId,
              phoneNumber: fullPhoneNumber,
              resendToken: resendToken,
            ));

        if (!Platform.isAndroid) {
          Navigator.pop(context);
          context
              .read<PhoneAuthBloc>()
              .add(const SetPhoneAuthStatus(AuthenticationStatus.success));
        }
      },
      codeAutoRetrievalTimeout: (String verificationId) {
        if (Platform.isAndroid) {
          Navigator.pop(context);
          setState(() => phoneAuthModel = phoneAuthModel.copyWith(
                verificationId: verificationId,
                phoneNumber: fullPhoneNumber,
              ));
          context
              .read<PhoneAuthBloc>()
              .add(const SetPhoneAuthStatus(AuthenticationStatus.success));
        }
      },
      timeout: const Duration(seconds: 15),
    );
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, AppLocalizations.of(context)!.tapAgainToCancel);

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

class PhoneLoginScreen extends _PhoneAuthWidget {
  const PhoneLoginScreen({super.key})
      : super(authProcedure: AuthProcedure.login);

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends _PhoneAuthWidgetState<PhoneLoginScreen> {}

class PhoneSignUpScreen extends _PhoneAuthWidget {
  const PhoneSignUpScreen({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends _PhoneAuthWidgetState<PhoneSignUpScreen> {}
