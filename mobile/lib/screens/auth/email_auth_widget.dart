import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';

import 'auth_widgets.dart';

class EmailAuthWidget extends StatefulWidget {
  const EmailAuthWidget({
    super.key,
    this.emailAddress,
    required this.authProcedure,
  });
  final String? emailAddress;
  final AuthProcedure authProcedure;

  @override
  EmailAuthWidgetState createState() => EmailAuthWidgetState();
}

class EmailAuthWidgetState<T extends EmailAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool _keyboardVisible = false;
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    context.read<EmailAuthBloc>().add(
          InitializeEmailAuth(
            emailAddress: widget.emailAddress ?? '',
            authProcedure: widget.authProcedure,
          ),
        );
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
          widget: BlocBuilder<EmailAuthBloc, EmailAuthState>(
            builder: (context, state) {
              Color nextButtonColor = state.emailAddress.isValidEmail()
                  ? CustomColors.appColorBlue
                  : CustomColors.appColorDisabled;

              Widget bottomWidget = state.authProcedure == AuthProcedure.login
                  ? const LoginOptions(authMethod: AuthMethod.email)
                  : const SignUpOptions(authMethod: AuthMethod.email);

              return Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  MultiBlocListener(
                    listeners: [
                      // verification failed listener
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) {
                          _popLoadingScreen();
                          showSnackBar(context, state.errorMessage);
                        },
                        listenWhen: (previous, current) {
                          return current.status == EmailBlocStatus.error &&
                              current.error ==
                                  EmailBlocError.verificationFailed;
                        },
                      ),

                      // loading screen listeners
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) {
                          loadingScreen(context);
                        },
                        listenWhen: (previous, current) {
                          return current.status == EmailBlocStatus.processing;
                        },
                      ),

                      // verification listeners
                      BlocListener<EmailAuthBloc, EmailAuthState>(
                        listener: (context, state) async {
                          _popLoadingScreen();
                          await Navigator.pushAndRemoveUntil(
                            context,
                            bottomNavigation(
                              const EmailAuthVerificationWidget(),
                            ),
                            (r) => false,
                          );
                        },
                        listenWhen: (previous, current) {
                          return previous.status != current.status &&
                              current.status ==
                                  EmailBlocStatus.verificationCodeSent;
                        },
                      ),
                    ],
                    child: const SizedBox(
                      height: 10,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: AutoSizeText(
                      state.status == EmailBlocStatus.error &&
                              state.error == EmailBlocError.invalidEmailAddress
                          ? AuthMethod.email.invalidInputMessage
                          : AuthMethod.email.optionsText(state.authProcedure),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: CustomTextStyle.headline7(context),
                    ),
                  ),
                  VerificationCodeMessage(
                    state.status != EmailBlocStatus.error,
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  const SizedBox(
                    height: 48,
                    child: EmailInputField(),
                  ),
                  InputValidationErrorMessage(
                    message: AuthMethod.email.invalidInputErrorMessage,
                    visible: state.status == EmailBlocStatus.error &&
                        state.error == EmailBlocError.invalidEmailAddress,
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  SignUpButton(
                    authProcedure: state.authProcedure,
                    authMethod: AuthMethod.email,
                  ),
                  const Spacer(),
                  NextButton(
                    buttonColor: nextButtonColor,
                    callBack: () {
                      context
                          .read<EmailAuthBloc>()
                          .add(ValidateEmailAddress(context));
                    },
                  ),
                  Visibility(
                    visible: _keyboardVisible,
                    child: const SizedBox(
                      height: 10,
                    ),
                  ),
                  Visibility(
                    visible: !_keyboardVisible,
                    child: bottomWidget,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  void _popLoadingScreen() {
    if (Navigator.canPop(_loadingContext)) Navigator.pop(_loadingContext);
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

class EmailLoginWidget extends EmailAuthWidget {
  const EmailLoginWidget({super.key, String? emailAddress})
      : super(
          emailAddress: emailAddress,
          authProcedure: AuthProcedure.login,
        );

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends EmailAuthWidgetState<EmailLoginWidget> {}

class EmailSignUpWidget extends EmailAuthWidget {
  const EmailSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  EmailSignUpWidgetState createState() => EmailSignUpWidgetState();
}

class EmailSignUpWidgetState extends EmailAuthWidgetState<EmailSignUpWidget> {}
