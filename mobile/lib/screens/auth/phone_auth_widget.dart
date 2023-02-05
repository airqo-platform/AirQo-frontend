import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../on_boarding/on_boarding_widgets.dart';
import 'auth_widgets.dart';

class PhoneAuthWidget extends StatefulWidget {
  const PhoneAuthWidget({
    super.key,
    this.phoneNumber,
    required this.authProcedure,
  });
  final String? phoneNumber;
  final AuthProcedure authProcedure;

  @override
  PhoneAuthWidgetState createState() => PhoneAuthWidgetState();
}

class PhoneAuthWidgetState<T extends PhoneAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool _keyboardVisible = false;
  late BuildContext _loadingContext;

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
          widget: MultiBlocListener(
            listeners: [
              // verification successful
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) async {
                  _popLoadingScreen();
                  await AppService.postSignInActions(
                    context,
                    state.authProcedure,
                  );
                },
                listenWhen: (previous, current) {
                  return previous.status != current.status &&
                      current.status == PhoneBlocStatus.verificationSuccessful;
                },
              ),

              // verification failed
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  _popLoadingScreen();
                  showSnackBar(context, state.errorMessage);
                },
                listenWhen: (previous, current) {
                  return current.status == PhoneBlocStatus.error &&
                      current.error == PhoneBlocError.verificationFailed;
                },
              ),

              // loading
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (_, __) {
                  loadingScreen(_loadingContext);
                },
                listenWhen: (_, current) {
                  return current.status == PhoneBlocStatus.processing;
                },
              ),

              // auto verifying
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (_, state) {
                  loadingScreen(_loadingContext);
                },
                listenWhen: (previous, current) {
                  return current.status == PhoneBlocStatus.autoVerifying;
                },
              ),

              // code sent
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) async {
                  _popLoadingScreen();
                  await Navigator.pushAndRemoveUntil(
                    context,
                    bottomNavigation(const PhoneAuthVerificationWidget()),
                    (r) => true,
                  );
                },
                listenWhen: (previous, current) {
                  return previous.status != current.status &&
                      current.status == PhoneBlocStatus.verificationCodeSent;
                },
              ),

              // error messages
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  _popLoadingScreen();
                  showSnackBar(context, state.errorMessage);
                },
                listenWhen: (_, current) {
                  return current.status == PhoneBlocStatus.error &&
                      current.error == PhoneBlocError.noInternetConnection;
                },
              ),
            ],
            child: BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
              builder: (context, state) {
                switch (state.status) {
                  case PhoneBlocStatus.verificationSuccessful:
                    return const Center(child: Text("verification success"));
                  case PhoneBlocStatus.autoVerifying:
                    return const Center(child: Text("Auto verifying"));
                  case PhoneBlocStatus.verificationCodeSent:
                  case PhoneBlocStatus.processing:
                  case PhoneBlocStatus.initial:
                  case PhoneBlocStatus.error:
                    break;
                }

                Color nextButtonColor = state.phoneNumber.isValidPhoneNumber()
                    ? CustomColors.appColorBlue
                    : CustomColors.appColorDisabled;

                Widget bottomWidget = state.authProcedure == AuthProcedure.login
                    ? const LoginOptions(authMethod: AuthMethod.phone)
                    : const SignUpOptions(authMethod: AuthMethod.phone);

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      height: 10,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: AutoSizeText(
                        state.status == PhoneBlocStatus.error &&
                                state.error == PhoneBlocError.invalidPhoneNumber
                            ? AuthMethod.phone.invalidInputMessage
                            : AuthMethod.phone.optionsText(state.authProcedure),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: CustomTextStyle.headline7(context),
                      ),
                    ),
                    VerificationCodeMessage(
                      state.status != PhoneBlocStatus.error,
                    ),
                    const SizedBox(
                      height: 32,
                    ),
                    SizedBox(
                      height: 48,
                      child: Row(
                        children: [
                          SizedBox(
                            width: 64,
                            child: CountryCodePickerField(
                              valueChange: (code) {
                                context.read<PhoneAuthBloc>().add(
                                      UpdateCountryCode(
                                        code ?? state.countryCode,
                                      ),
                                    );
                              },
                              placeholder: state.countryCode,
                            ),
                          ),
                          const SizedBox(
                            width: 16,
                          ),
                          const Expanded(
                            child: PhoneInputField(),
                          ),
                        ],
                      ),
                    ),
                    InputValidationErrorMessage(
                      message: state.phoneNumber.inValidPhoneNumberMessage(),
                      visible: state.status == PhoneBlocStatus.error &&
                          state.error == PhoneBlocError.invalidPhoneNumber,
                    ),
                    InputValidationErrorMessage(
                      visible: state.status == PhoneBlocStatus.error &&
                          state.error == PhoneBlocError.phoneNumberTaken,
                      message: state.errorMessage,
                    ),
                    const SizedBox(
                      height: 32,
                    ),
                    SignUpButton(
                      authProcedure: state.authProcedure,
                      authMethod: AuthMethod.phone,
                    ),
                    const Spacer(),
                    NextButton(
                      buttonColor: nextButtonColor,
                      callBack: () {
                        context
                            .read<PhoneAuthBloc>()
                            .add(VerifyPhoneNumber(context));
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

class PhoneLoginWidget extends PhoneAuthWidget {
  const PhoneLoginWidget({super.key, String? phoneNumber})
      : super(
          phoneNumber: phoneNumber,
          authProcedure: AuthProcedure.login,
        );

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends PhoneAuthWidgetState<PhoneLoginWidget> {}

class PhoneSignUpWidget extends PhoneAuthWidget {
  const PhoneSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends PhoneAuthWidgetState<PhoneSignUpWidget> {}
