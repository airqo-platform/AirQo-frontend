import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'auth_widgets.dart';

class EmailVerificationWidget extends StatefulWidget {
  const EmailVerificationWidget({super.key});

  @override
  State<EmailVerificationWidget> createState() =>
      EmailVerificationWidgetState();
}

class EmailVerificationWidgetState extends State<EmailVerificationWidget> {

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCodeBloc, AuthCodeState>(
      builder: (context, state) {
        if (state.codeCountDown >= 5) {
          _startCodeSentCountDown();
        }
        String credentials = "";
        switch (state.authMethod) {
          case AuthMethod.phone:
            break;
          case AuthMethod.email:
            credentials = state.emailAuthModel?.emailAddress ?? "";
            break;
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            /// initial Status
            Visibility(
              visible: state.status == AuthCodeStatus.initial,
              child: const AuthTitle("Verify your account"),
            ),

            Visibility(
              visible: state.status == AuthCodeStatus.initial,
              child: AuthSubTitle(
                'Enter the 6 digits code sent to $credentials',
              ),
            ),

            /// invalid code Status
            Visibility(
              visible: state.status == AuthCodeStatus.invalidCode,
              child: const AuthTitle(
                "Oops, Something’s wrong with your code",
              ),
            ),

            Visibility(
              visible: state.status == AuthCodeStatus.invalidCode,
              child: const AuthSubTitle(
                'Sure you read it correctly? Pro Tip: Copy & Paste',
              ),
            ),

            /// success Status
            Visibility(
              visible: state.status == AuthCodeStatus.success,
              child: AuthTitle(
                "Your ${state.authMethod == AuthMethod.phone ? 'number' : 'email'} has been verified",
              ),
            ),

            Visibility(
              visible: state.status == AuthCodeStatus.success,
              child: const AuthSubTitle(
                'Pheww, almost done, hold in there.',
              ),
            ),

            /// error Status
            Visibility(
              visible: state.status == AuthCodeStatus.error,
              child: const AuthTitle(
                "Oops, looks like something wrong happened",
              ),
            ),

            Visibility(
              visible: state.status == AuthCodeStatus.error,
              child: AuthSubTitle(
                state.errorMessage,
              ),
            ),

            /// OPT field
            Padding(
              padding: const EdgeInsets.only(top: 20.0),
              child: EditOptField(
                callbackFn: (String value) {
                  context.read<AuthCodeBloc>().add(UpdateAuthCode(
                    value: value,
                  ));
                },
              ),
            ),

            // TOD create separate widgets
            /// Resend OPT
            Visibility(
              visible: state.codeCountDown > 0 &&
                  state.status != AuthCodeStatus.success,
              child: Padding(
                padding: const EdgeInsets.only(top: 10.0),
                child: Text(
                  'The code should arrive with in ${state.codeCountDown} sec',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color:
                    CustomColors.appColorBlack.withOpacity(0.5),
                  ),
                ),
              ),
            ),

            Visibility(
              visible: state.codeCountDown <= 0 &&
                  state.status != AuthCodeStatus.success,
              child: Padding(
                padding: const EdgeInsets.only(top: 10.0),
                child: InkWell(
                  onTap: () {
                    context
                        .read<AuthCodeBloc>()
                        .add(ResendEmailAuthCode(context: context));
                  },
                  child: Text(
                    'Resend code',
                    textAlign: TextAlign.center,
                    style:
                    Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
                  ),
                ),
              ),
            ),

            /// Or Separator
            Visibility(
              visible: state.status != AuthCodeStatus.success,
              child: const AuthOrSeparator(),
            ),

            /// auth options
            Visibility(
              visible: state.status != AuthCodeStatus.success,
              child: const ChangeAuthCredentials(),
            ),

            const Spacer(),

            /// Success widget
            Visibility(
              visible: state.status == AuthCodeStatus.success,
              child: const AuthSuccessWidget(),
            ),

            const Spacer(),

            /// Next button
            Visibility(
              visible: state.status != AuthCodeStatus.success,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: NextButton(
                  buttonColor: state.inputAuthCode.length >= 6
                      ? CustomColors.appColorBlue
                      : CustomColors.appColorDisabled,
                  callBack: () {
                    if (state.status == AuthCodeStatus.success) {
                      Navigator.pop(context, true);

                      return;
                    }

                    if (state.loading) {
                      return;
                    }

                    if (state.inputAuthCode.length >= 6) {
                      context
                          .read<AuthCodeBloc>()
                          .add(const VerifyAuthCode());
                    }
                  },
                ),
              ),
            ),

            MultiBlocListener(
              listeners: [
                BlocListener<AuthCodeBloc, AuthCodeState>(
                  listener: (context, state) {
                    FocusScope.of(context).requestFocus(
                      FocusNode(),
                    );
                    loadingScreen(context);
                  },
                  listenWhen: (_, current) {
                    return current.loading;
                  },
                ),
                BlocListener<AuthCodeBloc, AuthCodeState>(
                  listener: (context, state) {
                    Navigator.pop(context);
                  },
                  listenWhen: (previous, current) {
                    return !current.loading && previous.loading;
                  },
                ),
                BlocListener<AuthCodeBloc, AuthCodeState>(
                  listener: (context, state) async {
                    FocusScope.of(context).requestFocus(
                      FocusNode(),
                    );
                    if (state.loading) {
                      Navigator.pop(context);
                    }

                    if (!mounted) {
                      return;
                    }
                    switch (state.authProcedure) {
                      case AuthProcedure.login:
                      case AuthProcedure.signup:
                      case AuthProcedure.anonymousLogin:
                        await AppService.postSignInActions(context)
                            .then((_) async {
                          await Future.delayed(const Duration(seconds: 2))
                              .then((_) {
                            Navigator.pop(context, true);
                          });
                        });
                        break;
                      case AuthProcedure.deleteAccount:
                      case AuthProcedure.logout:
                        await AppService.postSignOutActions(context)
                            .then((_) {
                          Navigator.pop(context);
                          Navigator.pop(context, true);
                        });
                        break;
                    }
                  },
                  listenWhen: (previous, current) {
                    return current.status == AuthCodeStatus.success;
                  },
                ),
              ],
              child: Container(),
            ),
          ],
        );
      },
    );
  }

  void _startCodeSentCountDown() {
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
}
