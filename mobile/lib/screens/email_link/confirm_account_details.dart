import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/email_link/email_link_widgets.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../on_boarding/on_boarding_widgets.dart';
import '../email_authentication/email_verification_screen.dart';

class _EmailVerifyWidget extends StatefulWidget {
  const _EmailVerifyWidget({
    super.key,
    required this.authProcedure,
  });

  final AuthProcedure authProcedure;

  @override
  _EmailAuthWidgetState createState() => _EmailAuthWidgetState();
}

class _EmailAuthWidgetState<T extends _EmailVerifyWidget> extends State<T> {
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

    return OfflineBanner(
      child: Scaffold(
        appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
        body: PopScope(
          onPopInvoked: ((didPop) {
            if (didPop) {
              onWillPop();
            }
          }),
          child: AppSafeArea(
            backgroundColor: Colors.white,
            horizontalPadding: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const EmailLinkTitle(),
                const EmailLinkSubTitle(),
                const SizedBox(height: 32),
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
                          validator: (value) {
                            if (value == null || !value.isValidEmail()) {
                              return AppLocalizations.of(context)!
                                  .pleaseEnterAValidEmail;
                            }

                            return null;
                          },
                          onChanged: (value) {
                            setState(() => emailAddress = value);
                          },
                          onSaved: (value) {
                            setState(() => emailAddress = value!);
                          },
                          style: inputTextStyle(state.status),
                          enableSuggestions: true,
                          cursorWidth: 1,
                          autofocus: false,
                          enabled: state.status != AuthenticationStatus.success,
                          keyboardType: TextInputType.emailAddress,
                          decoration: inputDecoration(
                            state.status,
                            hintText: 'me@company.com',
                            suffixIconCallback: () {
                              _formKey.currentState?.reset();
                              FocusScope.of(context).requestFocus(FocusNode());
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const EmailLinkErrorMessage(),
                const Spacer(),
                NextButton(
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
                const SizedBox(
                  height: 16,
                ),
                Visibility(
                  visible: !_keyboardVisible,
                  child: const SkipLinkButtons(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _sendAuthCode() async {
    context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
          AuthenticationStatus.initial,
        ));

    final hasConnection = await hasNetworkConnection();

    if (!mounted) {
      return;
    }

    if (!hasConnection) {
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
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
          credentials: emailAddress,
          authMethod: AuthMethod.email,
        );
      },
    );

    if (confirmation == null ||
        confirmation == ConfirmationAction.cancel ||
        !mounted) {
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
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.emailNotFoundDidYouSignUp,
          ));

      return;
    }

    if (exists && authProcedure == AuthProcedure.signup ||
        authProcedure == AuthProcedure.linkAccount) {
      Navigator.pop(context);
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.emailAlreadyRegisteredPleaseLogIn,
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
        AppLocalizations.of(context)!.tapAgainToCancel,
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

class EmailLinkScreen extends _EmailVerifyWidget {
  const EmailLinkScreen({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  EmailLinkScreenWidgetState createState() => EmailLinkScreenWidgetState();
}

class EmailLinkScreenWidgetState
    extends _EmailAuthWidgetState<EmailLinkScreen> {}
