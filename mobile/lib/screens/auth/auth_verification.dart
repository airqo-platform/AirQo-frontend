import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/buttons.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';
import '../../widgets/text_fields.dart';
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
            listener: (context, state) {},
            buildWhen: (previous, current) {
              return current.authStatus != AuthStatus.error ||
                  current.authStatus != AuthStatus.success ||
                  current.authStatus != AuthStatus.processing;
            },
            builder: (context, state) {
              final authOption = state.authMethod == AuthMethod.email
                  ? state.emailAddress
                  : state.phoneNumber;
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
                              return current.authStatus ==
                                  AuthStatus.processing;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              Navigator.pop(_loadingContext);
                            },
                            listenWhen: (previous, current) {
                              return previous.authStatus ==
                                  AuthStatus.processing;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              showSnackBar(context, state.error.message);
                            },
                            listenWhen: (previous, current) {
                              return current.authStatus == AuthStatus.error &&
                                  current.error != AuthenticationError.none;
                            },
                          ),
                          BlocListener<AuthCodeBloc, AuthCodeState>(
                            listener: (context, state) {
                              late Widget nextPage;
                              switch (state.authProcedure) {
                                case AuthProcedure.anonymousLogin:
                                case AuthProcedure.login:
                                  nextPage = const HomePage();
                                  break;
                                case AuthProcedure.signup:
                                  nextPage = const ProfileSetupScreen();
                                  break;
                                case AuthProcedure.deleteAccount:
                                  nextPage = const PhoneSignUpWidget();
                                  break;
                                case AuthProcedure.logout:
                                  nextPage = const PhoneLoginWidget();
                                  break;
                              }

                              Navigator.pushAndRemoveUntil(context,
                                  MaterialPageRoute(
                                builder: (context) {
                                  return nextPage;
                                },
                              ), (r) => false);
                            },
                            listenWhen: (previous, current) {
                              return current.authStatus == AuthStatus.success;
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
                        height: 8,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: AutoSizeText(
                          '${state.authMethod.codeVerificationText}\n$authOption',
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
                      const SizedBox(
                        height: 32,
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
                                  .add(const VerifySmsCode());
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
                          'The code should arrive with in ${state.codeCountDown} sec(s)',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.caption?.copyWith(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.5),
                              ),
                        ),
                      ),
                      Visibility(
                        visible: state.codeCountDown <= 0,
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
                      const SizedBox(
                        height: 19,
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 36),
                        child: Stack(
                          alignment: AlignmentDirectional.center,
                          children: [
                            Container(
                              height: 1.09,
                              color: Colors.black.withOpacity(0.05),
                            ),
                            Container(
                              color: Colors.white,
                              padding: const EdgeInsets.only(left: 5, right: 5),
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
                      const SizedBox(
                        height: 19,
                      ),
                      GestureDetector(
                        onTap: () {
                          context
                              .read<AuthCodeBloc>()
                              .add(const InitializeAuthCodeState());
                          Navigator.pop(context);
                        },
                        child: Text(
                          state.authMethod.editEntryText,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.caption?.copyWith(
                                color: CustomColors.appColorBlue,
                              ),
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: () async {
                          if (state.inputAuthCode.length >= 6) {
                            context
                                .read<AuthCodeBloc>()
                                .add(const VerifySmsCode());
                          }
                        },
                        child: NextButton(
                            buttonColor: state.inputAuthCode.length >= 6
                                ? CustomColors.appColorBlue
                                : CustomColors.appColorDisabled),
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
        final newCount = context.read<AuthCodeBloc>().state.codeCountDown - 1;
        context.read<AuthCodeBloc>().add(UpdateCountDown(newCount));

        if (newCount == 0) {
          setState(() => timer.cancel());
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
