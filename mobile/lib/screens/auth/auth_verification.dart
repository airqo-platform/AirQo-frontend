import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../home_page.dart';
import '../on_boarding/on_boarding_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';

class AuthVerificationWidget extends StatefulWidget {
  const AuthVerificationWidget({super.key});

  @override
  State<AuthVerificationWidget> createState() => _AuthVerificationWidgetState();
}

class _AuthVerificationWidgetState extends State<AuthVerificationWidget> {
  DateTime? _exitTime;
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    _startCodeSentCountDown();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: WillPopScope(
        onWillPop: onWillPop,
        child: AppSafeArea(
          backgroundColor: Colors.white,
          widget: BlocConsumer<AuthCodeBloc, AuthCodeState>(
            listener: (context, state) {
              return;
            },
            buildWhen: (previous, current) {
              return current.blocStatus != BlocStatus.error ||
                  current.blocStatus != BlocStatus.success ||
                  current.blocStatus != BlocStatus.processing;
            },
            builder: (context, state) {
              final authOption = state.authMethod == AuthMethod.email
                  ? state.emailAddress
                  : state.phoneNumber;
              String cancelText = 'Cancel';
              switch (state.authProcedure) {
                case AuthProcedure.login:
                case AuthProcedure.signup:
                  cancelText = state.authMethod.editEntryText;
                  break;
                case AuthProcedure.anonymousLogin:
                case AuthProcedure.deleteAccount:
                case AuthProcedure.logout:
                case AuthProcedure.none:
                  break;
              }

              return Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      MultiBlocListener(
                        listeners: [
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              loadingScreen(_loadingContext);
                            },
                            listenWhen: (previous, current) {
                              return current.blocStatus ==
                                  BlocStatus.processing;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              Navigator.pop(_loadingContext);
                            },
                            listenWhen: (previous, current) {
                              return previous.blocStatus ==
                                  BlocStatus.processing;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              showSnackBar(context, state.error.message);
                            },
                            listenWhen: (previous, current) {
                              return current.blocStatus == BlocStatus.error &&
                                  current.error != AuthenticationError.none &&
                                  current.error !=
                                      AuthenticationError.invalidAuthCode;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              context
                                  .read<AccountBloc>()
                                  .add(const FetchAccountInfo());
                              Future.delayed(
                                const Duration(seconds: 2),
                                () {
                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(builder: (context) {
                                      switch (state.authProcedure) {
                                        case AuthProcedure.anonymousLogin:
                                        case AuthProcedure.login:
                                          return const HomePage();
                                        case AuthProcedure.signup:
                                          return const ProfileSetupScreen();
                                        case AuthProcedure.deleteAccount:
                                          return const PhoneSignUpWidget();
                                        case AuthProcedure.none:
                                        case AuthProcedure.logout:
                                          return const PhoneLoginWidget();
                                      }
                                    }),
                                    (r) => false,
                                  );
                                },
                              );
                            },
                            listenWhen: (previous, current) {
                              return current.blocStatus == BlocStatus.success;
                            },
                          ),
                        ],
                        child: Container(),
                      ),
                      AutoSizeText(
                        'Verify your account',
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: CustomTextStyle.headline7(context),
                      ),
                      const SizedBox(
                        height: 14,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: AutoSizeText(
                          state.authMethod.codeVerificationText,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context)
                              .textTheme
                              .bodyText2
                              ?.copyWith(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.6),
                              ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: AutoSizeText(
                          authOption,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style:
                              Theme.of(context).textTheme.bodyText2?.copyWith(
                                    fontSize: 18.0,
                                    color: CustomColors.appColorBlue,
                                  ),
                        ),
                      ),
                      const SizedBox(
                        height: 15,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 36),
                        child: OptField(
                          callbackFn: (String value) {
                            context.read<AuthCodeBloc>().add(UpdateAuthCode(
                                  value: value,
                                ));
                            if (value.length >= 6) {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(const VerifyAuthCode());
                            }
                          },
                        ),
                      ),
                      const SizedBox(
                        height: 16,
                      ),
                      Visibility(
                        visible: state.codeCountDown > 0,
                        child: Text(
                          'The code should arrive with in ${state.codeCountDown} sec',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.caption?.copyWith(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.5),
                              ),
                        ),
                      ),
                      Visibility(
                        visible: state.codeCountDown <= 0 &&
                            state.blocStatus != BlocStatus.success,
                        child: GestureDetector(
                          onTap: () async {
                            context
                                .read<AuthCodeBloc>()
                                .add(ResendAuthCode(context: context));
                            _startCodeSentCountDown();
                          },
                          child: Text(
                            'Resend code',
                            textAlign: TextAlign.center,
                            style:
                                Theme.of(context).textTheme.caption?.copyWith(
                                      color: CustomColors.appColorBlue,
                                    ),
                          ),
                        ),
                      ),
                      Visibility(
                        visible: state.blocStatus != BlocStatus.success,
                        child: Padding(
                          padding: const EdgeInsets.only(
                            left: 36,
                            right: 36,
                            top: 19,
                          ),
                          child: Stack(
                            alignment: AlignmentDirectional.center,
                            children: [
                              Container(
                                height: 1.09,
                                color: Colors.black.withOpacity(0.05),
                              ),
                              Container(
                                color: Colors.white,
                                padding:
                                    const EdgeInsets.only(left: 5, right: 5),
                                child: Text(
                                  'Or',
                                  style: Theme.of(context)
                                      .textTheme
                                      .caption
                                      ?.copyWith(
                                        color: const Color(0xffD1D3D9),
                                      ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Visibility(
                        visible: state.blocStatus != BlocStatus.success,
                        child: Padding(
                          padding: const EdgeInsets.only(top: 19),
                          child: GestureDetector(
                            onTap: () {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(const ClearAuthCodeState());
                              FocusManager.instance.primaryFocus?.unfocus();
                              Navigator.pop(context);
                            },
                            child: Text(
                              cancelText,
                              textAlign: TextAlign.center,
                              style:
                                  Theme.of(context).textTheme.caption?.copyWith(
                                        color: CustomColors.appColorBlue,
                                      ),
                            ),
                          ),
                        ),
                      ),
                      Visibility(
                        visible: state.blocStatus == BlocStatus.success,
                        child: const Spacer(),
                      ),
                      Visibility(
                        visible: state.blocStatus == BlocStatus.success,
                        child: Center(
                          child: Container(
                            height: 151,
                            width: 151,
                            padding: const EdgeInsets.all(25),
                            decoration: BoxDecoration(
                              color:
                                  CustomColors.appColorValid.withOpacity(0.1),
                              borderRadius: const BorderRadius.all(
                                Radius.circular(15.0),
                              ),
                            ),
                            child: SvgPicture.asset(
                              'assets/icon/valid_input_icon.svg',
                            ),
                          ),
                        ),
                      ),
                      const Spacer(),
                      Visibility(
                        visible: state.blocStatus != BlocStatus.success,
                        child: GestureDetector(
                          onTap: () async {
                            if (state.blocStatus == BlocStatus.success ||
                                state.blocStatus == BlocStatus.processing) {
                              return;
                            }

                            if (state.inputAuthCode.length >= 6) {
                              context
                                  .read<AuthCodeBloc>()
                                  .add(const VerifyAuthCode());
                            }
                          },
                          child: NextButton(
                            buttonColor: state.inputAuthCode.length >= 6
                                ? CustomColors.appColorBlue
                                : CustomColors.appColorDisabled,
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 12,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  void _startCodeSentCountDown() {
    context.read<AuthCodeBloc>().add(const UpdateCountDown(5));

    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (mounted) {
          final newCount = context.read<AuthCodeBloc>().state.codeCountDown - 1;
          context.read<AuthCodeBloc>().add(UpdateCountDown(newCount));
          if (newCount == 0) {
            setState(() => timer.cancel());
          }
        }
      },
    );
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

    Navigator.pop(context);

    return Future.value(false);
  }
}
