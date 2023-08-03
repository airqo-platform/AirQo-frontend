import 'dart:async';
import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../../widgets/auth_widgets.dart';
import '../email_authentication/email_auth_screen.dart';
import 'phone_auth_screen.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class PhoneAuthErrorMessage extends StatelessWidget {
  const PhoneAuthErrorMessage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
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
                  child: Text(
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

class PhoneAuthSwitchButton extends StatelessWidget {
  const PhoneAuthSwitchButton({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success) {
          return const SizedBox.shrink();
        }

        return AuthSignUpButton(
          authProcedure: state.authProcedure,
          authMethod: AuthMethod.phone,
        );
      },
    );
  }
}

class PhoneAuthButtons extends StatelessWidget {
  const PhoneAuthButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: context.read<PhoneAuthBloc>().state.authProcedure ==
                  AuthProcedure.login
              ? const LoginOptions(authMethod: AuthMethod.phone)
              : const SignUpOptions(authMethod: AuthMethod.phone),
        );
      },
    );
  }
}

class PhoneAuthSubTitle extends StatelessWidget {
  const PhoneAuthSubTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
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

class PhoneAuthTitle extends StatelessWidget {
  const PhoneAuthTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneAuthBloc, PhoneAuthState>(
      builder: (context, state) {
        String message;
        switch (state.status) {
          case AuthenticationStatus.initial:
            message =
                AuthMethod.phone.optionsText(state.authProcedure, context);
            break;
          case AuthenticationStatus.error:
            message =
                AppLocalizations.of(context)!.oopsSomethingsWrongWithYourNumber;
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

class PhoneVerificationTitle extends StatelessWidget {
  const PhoneVerificationTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneVerificationBloc, PhoneVerificationState>(
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
                : AppLocalizations.of(context)!.yourPhoneNumberHasBeenVerified;
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

class PhoneVerificationSubTitle extends StatelessWidget {
  const PhoneVerificationSubTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneVerificationBloc, PhoneVerificationState>(
      builder: (context, state) {
        String subtitle;
        switch (state.status) {
          case AuthenticationStatus.initial:
            subtitle = AppLocalizations.of(context)!
                .enterThe6DigitsCodeSentTo(state.phoneAuthModel.phoneNumber);
            break;
          case AuthenticationStatus.error:
            subtitle = AppLocalizations.of(context)!
                .sureYouReadItCorrectlyProTipCopyPaste;
            break;
          case AuthenticationStatus.success:
            subtitle = AppLocalizations.of(context)!.phewwAlmostDoneHoldInThere;
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

class PhoneVerificationCodeCountDown extends StatefulWidget {
  const PhoneVerificationCodeCountDown({super.key});

  @override
  State<PhoneVerificationCodeCountDown> createState() =>
      _PhoneVerificationCodeCountDownState();
}

class _PhoneVerificationCodeCountDownState
    extends State<PhoneVerificationCodeCountDown> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PhoneVerificationBloc, PhoneVerificationState>(
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
          child: Text(
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
    context.read<PhoneVerificationBloc>().add(const SetPhoneVerificationStatus(
          AuthenticationStatus.initial,
        ));

    final hasConnection = await hasNetworkConnection();

    if (!mounted) {
      return;
    }

    if (!hasConnection) {
      showSnackBar(context, AppLocalizations.of(context)!.noInternetConnection);
      return;
    }
    final phoneAuthModel =
        context.read<PhoneVerificationBloc>().state.phoneAuthModel;

    loadingScreen(context);

    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: phoneAuthModel.phoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) async {
        try {
          final bool success = await CustomAuth.firebaseSignIn(credential);
          if (!mounted) return;
          Navigator.pop(context);
          if (success) {
            context
                .read<PhoneVerificationBloc>()
                .add(const SetPhoneVerificationStatus(
                  AuthenticationStatus.success,
                ));
            await AppService.postSignInActions(context);
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
      },
      verificationFailed: (FirebaseAuthException exception) async {
        Navigator.pop(context);
        await showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext _) {
            return const AuthFailureDialog();
          },
        );
      },
      codeSent: (String verificationId, int? resendToken) {
        PhoneAuthModel phoneAuthModel =
            context.read<PhoneVerificationBloc>().state.phoneAuthModel;
        phoneAuthModel = phoneAuthModel.copyWith(
          verificationId: verificationId,
          resendToken: resendToken,
        );
        context.read<PhoneVerificationBloc>().add(InitializePhoneVerification(
              phoneAuthModel: phoneAuthModel,
              authProcedure:
                  context.read<PhoneVerificationBloc>().state.authProcedure,
            ));
        _startCodeSentCountDown();
        if (!Platform.isAndroid) {
          Navigator.pop(context);
        }
      },
      codeAutoRetrievalTimeout: (String _) {
        Navigator.pop(context);
      },
      timeout: const Duration(seconds: 5),
      forceResendingToken: context
          .read<PhoneVerificationBloc>()
          .state
          .phoneAuthModel
          .resendToken,
    );
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
              context.read<PhoneVerificationBloc>().state.codeCountDown - 1;
          context
              .read<PhoneVerificationBloc>()
              .add(UpdatePhoneVerificationCountDown(newCount));
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
