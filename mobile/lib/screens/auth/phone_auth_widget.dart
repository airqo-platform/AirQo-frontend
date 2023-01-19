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

  @override
  void initState() {
    super.initState();
    context.read<PhoneAuthBloc>().add(
          InitializePhoneAuth(
            phoneNumber: widget.phoneNumber ?? '',
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
          widget: MultiBlocListener(
            listeners: [
              // verification success listener
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) async {
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

              // verification failed listener
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  showSnackBar(context, state.errorMessage);
                },
                listenWhen: (previous, current) {
                  return current.status == PhoneBlocStatus.error &&
                      current.error == PhoneBlocError.verificationFailed;
                },
              ),

              // loading screen listeners
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  loadingScreen(context);
                },
                listenWhen: (previous, current) {
                  return current.status == PhoneBlocStatus.processing;
                },
              ),
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  Navigator.pop(context);
                },
                listenWhen: (previous, current) {
                  return previous.status == PhoneBlocStatus.processing;
                },
              ),

              // auto verification listeners
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  loadingScreen(context);
                },
                listenWhen: (previous, current) {
                  return current.status == PhoneBlocStatus.autoVerifying;
                },
              ),
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  Navigator.pop(context);
                },
                listenWhen: (previous, current) {
                  return previous.status == PhoneBlocStatus.autoVerifying;
                },
              ),
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) async {
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

              // snack bar listener
              BlocListener<PhoneAuthBloc, PhoneAuthState>(
                listener: (context, state) {
                  showSnackBar(context, state.errorMessage);
                },
                listenWhen: (_, current) {
                  return current.status == PhoneBlocStatus.error &&
                      current.error == PhoneBlocError.noInternetConnection;
                },
              ),

              // BlocListener<PhoneAuthBloc, PhoneAuthState>(
              //   listener: (context, state) {
              //     context
              //         .read<AuthCodeBloc>()
              //         .add(InitializeAuthCodeState(
              //       phoneNumber:
              //       '${state.countryCode} ${state.phoneNumber}',
              //       authProcedure: state.authProcedure,
              //       authMethod: AuthMethod.phone,
              //     ));
              //
              //     Navigator.push(
              //       context,
              //       MaterialPageRoute(builder: (context) {
              //         return const AuthVerificationWidget();
              //       }),
              //     );
              //   },
              //   listenWhen: (previous, current) {
              //     return current.status == PhoneBlocStatus.success;
              //   },
              // ),
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
                        state.status != PhoneBlocStatus.error),
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

  // void _startCodeSentCountDown() {
  //   context.read<CodeCountDownCubit>().initiate();
  //
  //   Timer.periodic(
  //     const Duration(milliseconds: 1200),
  //         (Timer timer) {
  //       if (mounted) {
  //         context.read<CodeCountDownCubit>().decrement();
  //         final newCount = context.read<CodeCountDownCubit>().state;
  //         if (newCount == 0) {
  //           setState(() => timer.cancel());
  //         }
  //       }
  //     },
  //   );
  // }

  // void _openAuthCode() {
  //   Future<dynamic> future = showModalBottomSheet(
  //     isDismissible: false,
  //     isScrollControlled:true,
  //     enableDrag: false,
  //     elevation: 0.0,
  //     context: context,
  //     builder: (BuildContext context) {
  //       return AppSafeArea(
  //         verticalPadding: 24,
  //         backgroundColor: Colors.white,
  //         widget: BlocBuilder<CodeCountDownCubit, int>(
  //           builder: (context, count) {
  //
  //             PhoneAuthState state = context.read<PhoneAuthBloc>().state;
  //             final authOption = "${state.countryCode} ${state.phoneNumber}";
  //             final String cancelText = AuthMethod.phone.editEntryText;
  //
  //             return Column(
  //               crossAxisAlignment: CrossAxisAlignment.center,
  //               mainAxisAlignment: MainAxisAlignment.center,
  //               children: [
  //                 MultiBlocListener(
  //                   listeners: [
  //                     BlocListener<PhoneAuthBloc, PhoneAuthState>(
  //                       listener: (context, state) {
  //                         showSnackBar(context, state.errorMessage);
  //                       },
  //                       listenWhen: (_, current) {
  //                         return current.status == PhoneBlocStatus.error && current.errorMessage.isNotEmpty;
  //                       },
  //                     ),
  //
  //                     BlocListener<AuthCodeBloc, AuthCodeState>(
  //                       listener: (context, state) {
  //                         loadingScreen(context);
  //                       },
  //                       listenWhen: (previous, current) {
  //                         return current.blocStatus == BlocStatus.processing;
  //                       },
  //                     ),
  //                     BlocListener<AuthCodeBloc, AuthCodeState>(
  //                       listener: (context, state) {
  //                         Navigator.pop(context);
  //                       },
  //                       listenWhen: (previous, current) {
  //                         return previous.blocStatus == BlocStatus.processing;
  //                       },
  //                     ),
  //                     BlocListener<AuthCodeBloc, AuthCodeState>(
  //                       listener: (context, state) {
  //                         showSnackBar(context, state.error.message);
  //                       },
  //                       listenWhen: (previous, current) {
  //                         return current.blocStatus == BlocStatus.error &&
  //                             current.error != AuthenticationError.none &&
  //                             current.error !=
  //                                 AuthenticationError.invalidAuthCode;
  //                       },
  //                     ),
  //                     BlocListener<AuthCodeBloc, AuthCodeState>(
  //                       listener: (context, state) {
  //                         switch (state.authProcedure) {
  //                           case AuthProcedure.login:
  //                           case AuthProcedure.anonymousLogin:
  //                           case AuthProcedure.signup:
  //                             AppService.postSignInActions(context, state.authProcedure);
  //                             break;
  //                           case AuthProcedure.logout:
  //                           case AuthProcedure.deleteAccount:
  //                             AppService.postSignOutActions(context);
  //                             break;
  //                           case AuthProcedure.none:
  //                             break;
  //                         }
  //                         Future.delayed(
  //                           const Duration(seconds: 2),
  //                               () {
  //                             context
  //                                 .read<AuthCodeBloc>()
  //                                 .add(const ClearAuthCodeState());
  //                             Navigator.pushAndRemoveUntil(context,
  //                                 MaterialPageRoute(builder: (context) {
  //                                   switch (state.authProcedure) {
  //                                     case AuthProcedure.anonymousLogin:
  //                                     case AuthProcedure.login:
  //                                       return const HomePage();
  //                                     case AuthProcedure.signup:
  //                                       return const ProfileSetupScreen();
  //                                     case AuthProcedure.deleteAccount:
  //                                       return const PhoneSignUpWidget();
  //                                     case AuthProcedure.none:
  //                                     case AuthProcedure.logout:
  //                                       return const PhoneLoginWidget();
  //                                   }
  //                                 }), (r) => true);
  //                           },
  //                         );
  //                       },
  //                       listenWhen: (previous, current) {
  //                         return current.blocStatus == BlocStatus.success;
  //                       },
  //                     ),
  //                   ],
  //                   child: const SizedBox(height: 10),
  //                 ),
  //                 AutoSizeText(
  //                   'Verify your account',
  //                   textAlign: TextAlign.center,
  //                   maxLines: 1,
  //                   overflow: TextOverflow.ellipsis,
  //                   style: CustomTextStyle.headline7(context),
  //                 ),
  //                 const SizedBox(
  //                   height: 14,
  //                 ),
  //                 Padding(
  //                   padding: const EdgeInsets.symmetric(horizontal: 16),
  //                   child: AutoSizeText(
  //                     AuthMethod.phone.codeVerificationText,
  //                     textAlign: TextAlign.center,
  //                     maxLines: 2,
  //                     overflow: TextOverflow.ellipsis,
  //                     style: Theme.of(context).textTheme.bodyText2?.copyWith(
  //                       color: CustomColors.appColorBlack.withOpacity(0.6),
  //                     ),
  //                   ),
  //                 ),
  //                 Padding(
  //                   padding: const EdgeInsets.symmetric(horizontal: 16),
  //                   child: AutoSizeText(
  //                     authOption,
  //                     textAlign: TextAlign.center,
  //                     maxLines: 1,
  //                     overflow: TextOverflow.ellipsis,
  //                     style: Theme.of(context).textTheme.bodyText2?.copyWith(
  //                       fontSize: 18.0,
  //                       color: CustomColors.appColorBlue,
  //                     ),
  //                   ),
  //                 ),
  //                 const SizedBox(
  //                   height: 15,
  //                 ),
  //                 // Padding(
  //                 //   padding: const EdgeInsets.symmetric(horizontal: 36),
  //                 //   child: PhoneOptField(
  //                 //     callbackFn: (String value) {
  //                 //       context.read<PhoneAuthBloc>().add(UpdatePhoneAuthCode(value,));
  //                 //       if (value.length >= 6) {
  //                 //         // context
  //                 //         //     .read<PhoneAuthBloc>()
  //                 //         //     .add(const VerifyPhoneAuthCode());
  //                 //       }
  //                 //     }, state: '', codeCountDown: count,
  //                 //   ),
  //                 // ),
  //                 const SizedBox(
  //                   height: 16,
  //                 ),
  //                 BlocBuilder<CodeCountDownCubit, int>(
  //                   builder: (context, count) => Visibility(
  //                     visible: count > 0,
  //                     child: Text(
  //                       'The code should arrive with in $count sec',
  //                       textAlign: TextAlign.center,
  //                       style: Theme.of(context).textTheme.caption?.copyWith(
  //                         color: CustomColors.appColorBlack.withOpacity(0.5),
  //                       ),
  //                     ),
  //                   ),
  //                 ),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: GestureDetector(
  //                     onTap: () {
  //                       FocusManager.instance.primaryFocus?.unfocus();
  //                       Navigator.pop(context, true);
  //                     },
  //                     child: Text(
  //                       'Resend code',
  //                       textAlign: TextAlign.center,
  //                       style: Theme.of(context).textTheme.caption?.copyWith(
  //                         color: CustomColors.appColorBlue,
  //                       ),
  //                     ),
  //                   ),
  //                 ),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: Padding(
  //                     padding: const EdgeInsets.only(
  //                       left: 36,
  //                       right: 36,
  //                       top: 19,
  //                     ),
  //                     child: Stack(
  //                       alignment: AlignmentDirectional.center,
  //                       children: [
  //                         Container(
  //                           height: 1.09,
  //                           color: Colors.black.withOpacity(0.05),
  //                         ),
  //                         Container(
  //                           color: Colors.white,
  //                           padding: const EdgeInsets.symmetric(horizontal: 5),
  //                           child: Text(
  //                             'Or',
  //                             style:
  //                             Theme.of(context).textTheme.caption?.copyWith(
  //                               color: const Color(0xffD1D3D9),
  //                             ),
  //                           ),
  //                         ),
  //                       ],
  //                     ),
  //                   ),
  //                 ),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: Padding(
  //                     padding: const EdgeInsets.only(top: 19),
  //                     child: GestureDetector(
  //                       onTap: () {
  //                         FocusManager.instance.primaryFocus?.unfocus();
  //                         Navigator.pop(context);
  //                       },
  //                       child: Text(
  //                         cancelText,
  //                         textAlign: TextAlign.center,
  //                         style: Theme.of(context).textTheme.caption?.copyWith(
  //                           color: CustomColors.appColorBlue,
  //                         ),
  //                       ),
  //                     ),
  //                   ),
  //                 ),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: const Spacer(),
  //                 ),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: Center(
  //                     child: Container(
  //                       height: 151,
  //                       width: 151,
  //                       padding: const EdgeInsets.all(25),
  //                       decoration: BoxDecoration(
  //                         color: CustomColors.appColorValid.withOpacity(0.1),
  //                         borderRadius: const BorderRadius.all(
  //                           Radius.circular(15.0),
  //                         ),
  //                       ),
  //                       child: SvgPicture.asset(
  //                         'assets/icon/valid_input_icon.svg',
  //                       ),
  //                     ),
  //                   ),
  //                 ),
  //                 const Spacer(),
  //                 Visibility(
  //                   visible: count <= 0,
  //                   child: NextButton(
  //                     buttonColor: state.inputAuthCode.length >= 6
  //                         ? CustomColors.appColorBlue
  //                         : CustomColors.appColorDisabled,
  //                     callBack: () {
  //                       if (state.inputAuthCode.length >= 6) {
  //                         context
  //                             .read<PhoneAuthBloc>()
  //                             .add(const VerifyPhoneAuthCode());
  //                       }
  //                     },
  //                   ),
  //                 ),
  //                 const SizedBox(
  //                   height: 12,
  //                 ),
  //               ],
  //             );
  //           },
  //         ),
  //       );
  //     },
  //   );
  //
  //   future.then((dynamic returnValue) {
  //     try {
  //       if(returnValue == true){
  //          context.read<PhoneAuthBloc>().add(VerifyPhoneNumber(context));
  //       }
  //     } catch (_) {}
  //     FocusManager.instance.primaryFocus?.unfocus();
  //     context
  //         .read<PhoneAuthBloc>()
  //         .add(const ClearPhoneAuthCode());
  //   });
  // }

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
