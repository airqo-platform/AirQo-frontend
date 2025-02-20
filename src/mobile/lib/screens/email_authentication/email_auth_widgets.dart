import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../../widgets/auth_widgets.dart';
import '../phone_authentication/phone_auth_screen.dart';
import 'email_auth_screen.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class EmailAuthErrorMessage extends StatelessWidget {
  const EmailAuthErrorMessage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        if (state.errorMessage.isEmpty) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 16),
          child: SizedBox(
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/icon/error_info_icon.svg',
                ),
                const SizedBox(
                  width: 5,
                ),
                Expanded(
                  child: AutoSizeText(
                    state.errorMessage,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: CustomColors.appColorInvalid,
                          fontSize: 14,
                        ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class EmailAuthSwitchButton extends StatelessWidget {
  const EmailAuthSwitchButton({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success) {
          return const SizedBox.shrink();
        }

        return AuthSignUpButton(
          authProcedure: state.authProcedure,
          authMethod: AuthMethod.email,
        );
      },
    );
  }
}

class EmailAuthButtons extends StatelessWidget {
  const EmailAuthButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: context.read<EmailAuthBloc>().state.authProcedure ==
                  AuthProcedure.login
              ? const LoginOptions(authMethod: AuthMethod.email)
              : const SignUpOptions(authMethod: AuthMethod.email),
        );
      },
    );
  }
}

class EmailAuthSubTitle extends StatelessWidget {
  const EmailAuthSubTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        String message;
        switch (state.status) {
          case AuthenticationStatus.error:
            return const SizedBox.shrink();
          case AuthenticationStatus.initial:
            message =
                AppLocalizations.of(context)!.wellSendYouAVerificationCode;

            break;
          case AuthenticationStatus.success:
            message = AppLocalizations.of(context)!
                .greatFewMoreStepsBeforeYouCanBreathe;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
          child: AutoSizeText(
            message,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.6),
                ),
          ),
        );
      },
    );
  }
}

class EmailAuthTitle extends StatelessWidget {
  const EmailAuthTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        String message;
        switch (state.status) {
          case AuthenticationStatus.initial:
            message =
                AuthMethod.email.getOptionsText(state.authProcedure, context);
            break;
          case AuthenticationStatus.error:
            message =
                AppLocalizations.of(context)!.oopsSomethingsWrongWithYourEmail;
            break;
          case AuthenticationStatus.success:
            message = AppLocalizations.of(context)!.success;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 10),
          child: AutoSizeText(
            message,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.headline7(context),
          ),
        );
      },
    );
  }
}

class EmailVerificationTitle extends StatelessWidget {
  const EmailVerificationTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailVerificationBloc, EmailVerificationState>(
      builder: (context, state) {
        String title;
        switch (state.status) {
          case AuthenticationStatus.initial:
            title = state.authProcedure == AuthProcedure.login
                ? AppLocalizations.of(context)!.enterCodeToLogin
                : AppLocalizations.of(context)!.verifyYourAccount;
            break;
          case AuthenticationStatus.error:
            title =
                AppLocalizations.of(context)!.oopsSomethingsWrongWithYourCode;
            break;
          case AuthenticationStatus.success:
            title = state.authProcedure == AuthProcedure.login
                ? AppLocalizations.of(context)!.loginSuccessful
                : AppLocalizations.of(context)!.yourEmailHasBeenVerified;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 10),
          child: AutoSizeText(
            title,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: CustomTextStyle.headline7(context),
          ),
        );
      },
    );
  }
}

class EmailVerificationSubTitle extends StatelessWidget {
  const EmailVerificationSubTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailVerificationBloc, EmailVerificationState>(
      builder: (context, state) {
        String subtitle;
        switch (state.status) {
          case AuthenticationStatus.initial:
            subtitle = AppLocalizations.of(context)!
                .enterThe6DigitsCodeSentTo(state.emailAuthModel.emailAddress);
            break;
          case AuthenticationStatus.error:
            subtitle = AppLocalizations.of(context)!
                .sureYouReadItCorrectlyProTipCopyPaste;
            break;
          case AuthenticationStatus.success:
            subtitle = AppLocalizations.of(context)!.phewwAlmostDoneHangInThere;
            break;
        }

        return Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
          child: AutoSizeText(
            subtitle,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.6),
                ),
          ),
        );
      },
    );
  }
}

class EmailVerificationCodeCountDown extends StatefulWidget {
  const EmailVerificationCodeCountDown({super.key});

  @override
  State<EmailVerificationCodeCountDown> createState() =>
      _EmailVerificationCodeCountDownState();
}

class _EmailVerificationCodeCountDownState
    extends State<EmailVerificationCodeCountDown> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailVerificationBloc, EmailVerificationState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success) {
          return const SizedBox.shrink();
        }

        if (state.codeCountDown < 1) {
          return Padding(
            padding: const EdgeInsets.only(top: 10.0),
            child: InkWell(
              onTap: () async {
                await _resendAuthCode();
              },
              child: Text(
                AppLocalizations.of(context)!.resendCode,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.only(top: 10.0),
          child: AutoSizeText(
            AppLocalizations.of(context)!
                .theCodeShouldArrive(state.codeCountDown),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.5),
                ),
          ),
        );
      },
    );
  }

  Future<void> _resendAuthCode() async {
    final hasConnection = await hasNetworkConnection();
    if (!mounted) return;

    if (!hasConnection) {
      showSnackBar(
          context, AppLocalizations.of(context)!.checkYourInternetConnection);
      return;
    }
    loadingScreen(context);

    try {
      EmailAuthModel emailAuthModel =
          context.read<EmailVerificationBloc>().state.emailAuthModel;

      await AirqoApiClient()
          .sendEmailVerificationCode(emailAuthModel.emailAddress)
          .then((emailAuthModel) async {
        Navigator.pop(context);
        if (emailAuthModel == null) {
          await showDialog<void>(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext _) {
              return const AuthFailureDialog();
            },
          );
        } else {
          context.read<EmailVerificationBloc>().add(InitializeEmailVerification(
                emailAuthModel: emailAuthModel,
                authProcedure:
                    context.read<EmailVerificationBloc>().state.authProcedure,
              ));
          _startCodeSentCountDown();
        }
      });
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

  @override
  void initState() {
    super.initState();
    _startCodeSentCountDown();
  }

  void _startCodeSentCountDown() {
    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (mounted) {
          final newCount =
              context.read<EmailVerificationBloc>().state.codeCountDown - 1;
          context
              .read<EmailVerificationBloc>()
              .add(UpdateEmailVerificationCountDown(newCount));
          if (newCount == 0) {
            setState(() => timer.cancel());
          }
        }
      },
    );
  }
}

class SignUpOptions extends StatelessWidget {
  const SignUpOptions({super.key, required this.authMethod});

  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    final tween = Tween<double>(begin: 0, end: 1);

    return Column(
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) {
                  switch (authMethod) {
                    case AuthMethod.phone:
                      return const PhoneLoginScreen();
                    case AuthMethod.email:
                      return const EmailLoginScreen();
                  }
                },
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false,
            );
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                AppLocalizations.of(context)!.alreadyHaveAnAccount,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.6),
                    ),
              ),
              const SizedBox(
                width: 2,
              ),
              Text(
                AppLocalizations.of(context)!.logIn,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        const ProceedAsGuest(),
      ],
    );
  }
}

class LoginOptions extends StatelessWidget {
  const LoginOptions({super.key, required this.authMethod});

  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    final tween = Tween<double>(begin: 0, end: 1);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        GestureDetector(
          onTap: () {
            Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) {
                  switch (authMethod) {
                    case AuthMethod.phone:
                      return const PhoneSignUpScreen();
                    case AuthMethod.email:
                      return const EmailSignUpScreen();
                  }
                },
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(tween),
                    child: child,
                  );
                },
              ),
              (r) => false,
            );
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                AppLocalizations.of(context)!.dontHaveAnAccount,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlack.withOpacity(0.6),
                    ),
              ),
              const SizedBox(
                width: 2,
              ),
              Text(
                AppLocalizations.of(context)!.signUp,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
              ),
            ],
          ),
        ),
        const SizedBox(
          height: 8,
        ),
        const ProceedAsGuest(),
      ],
    );
  }
}
