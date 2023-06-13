import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import 'email_auth_widgets.dart';
import 'email_verification_screen.dart';

class _EmailAuthWidget extends StatefulWidget {
  const _EmailAuthWidget({
    super.key,
    required this.authProcedure,
  });

  final AuthProcedure authProcedure;

  @override
  _EmailAuthWidgetState createState() => _EmailAuthWidgetState();
}

class _EmailAuthWidgetState<T extends _EmailAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool _keyboardVisible = false;
  final _formKey = GlobalKey<FormState>();
  String emailAddress = "";
  final AirqoApiClient apiClient = AirqoApiClient();

  @override
  void initState() {
    super.initState();
    context.read<EmailAuthBloc>().add(InitializeEmailAuth(
          authProcedure: widget.authProcedure,
        ));
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
              const EmailAuthTitle(),

              const EmailAuthSubTitle(),

              const SizedBox(height: 32),
              // const Padding(
              //   padding: EdgeInsets.only(top: 32.0),
              //   child: SizedBox(
              //     height: 48,
              //     child: EmailInputField(),
              //   ),
              // ),

              Form(
                key: _formKey,
                child: SizedBox(
                  height: 48,
                  child: BlocBuilder<EmailAuthBloc, EmailAuthState>(
                    buildWhen: (previous, current) {
                      return previous.status != current.status;
                    },
                    builder: (context, state) {
                      return TextFormField(
                        initialValue: emailAddress,
                        validator: (value) {
                          if (value == null || !value.isValidEmail()) {
                            return 'Please enter a valid email';
                          }
                          return null;
                        },
                        onChanged: (value) {
                          setState(() => emailAddress = value);
                        },
                        onSaved: (value) {
                          setState(() => emailAddress = value!);
                        },
                        style: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(color: CustomColors.appColorBlack),
                        enableSuggestions: true,
                        cursorWidth: 1,
                        autofocus: false,
                        enabled: state.status != AuthenticationStatus.success,
                        keyboardType: TextInputType.emailAddress,
                      );
                    },
                  ),
                ),
              ),

              const EmailAuthErrorMessage(),

              const EmailAuthSwitchButton(),

              const Spacer(),

              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: NextButton(
                  buttonColor: emailAddress.isValidEmail()
                      ? CustomColors.appColorBlue
                      : CustomColors.appColorDisabled,
                  callBack: () async {
                    FocusScope.of(context).requestFocus(FocusNode());

                    switch (context.read<EmailAuthBloc>().state.status) {
                      case AuthenticationStatus.initial:
                      case AuthenticationStatus.error:
                        FormState? formState = _formKey.currentState;
                        if (formState == null) {
                          return;
                        }

                        if (formState.validate()) {
                          formState.save();
                          await _sendAuthCode();
                        }
                        break;
                      case AuthenticationStatus.success:
                        await verifyEmailAuthCode(context);
                        break;
                    }
                  },
                ),
              ),

              Visibility(
                visible: !_keyboardVisible,
                child: const EmailAuthButtons(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _sendAuthCode() async {
    FocusScope.of(context).requestFocus(FocusNode());
    context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
          AuthenticationStatus.initial,
        ));

    final hasConnection = await hasNetworkConnection();

    if (!mounted) {
      return;
    }

    if (!hasConnection) {
      context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage: 'Check your internet connection',
          ));
      return;
    }

    final confirmation = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: emailAddress,
          authMethod: AuthMethod.email,
        );
      },
    );

    if (confirmation == null || confirmation == ConfirmationAction.cancel) {
      return;
    }

    if (!mounted) {
      return;
    }

    loadingScreen(context);

    final bool? exists = await apiClient.checkIfUserExists(
      emailAddress: emailAddress,
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
        context.read<EmailAuthBloc>().state.authProcedure;
    if (!exists && authProcedure == AuthProcedure.login) {
      Navigator.pop(context);
      context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage: 'Email not found. Did you sign up?',
          ));
      return;
    }

    if (exists && authProcedure == AuthProcedure.signup) {
      Navigator.pop(context);
      context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage: 'Email already registered. Please log in',
          ));
      return;
    }

    EmailAuthModel? emailAuthModel =
        await apiClient.sendEmailVerificationCode(emailAddress);

    if (!mounted) {
      return;
    }
    Navigator.pop(context);

    if (emailAuthModel == null) {
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext _) {
          return const AuthFailureDialog();
        },
      );
      return;
    }

    context
        .read<EmailAuthBloc>()
        .add(const SetEmailAuthStatus(AuthenticationStatus.success));
    context.read<EmailVerificationBloc>().add(InitializeEmailVerification(
          emailAuthModel: emailAuthModel,
          authProcedure: context.read<EmailAuthBloc>().state.authProcedure,
        ));
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

class EmailLoginScreen extends _EmailAuthWidget {
  const EmailLoginScreen({super.key})
      : super(authProcedure: AuthProcedure.login);

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends _EmailAuthWidgetState<EmailLoginScreen> {}

class EmailSignUpScreen extends _EmailAuthWidget {
  const EmailSignUpScreen({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  EmailSignUpWidgetState createState() => EmailSignUpWidgetState();
}

class EmailSignUpWidgetState extends _EmailAuthWidgetState<EmailSignUpScreen> {}
