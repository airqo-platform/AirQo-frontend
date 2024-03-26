import 'package:app/blocs/email_auth/email_auth_bloc.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EmailLinkActionButton extends StatelessWidget {
  const EmailLinkActionButton({
    super.key,
    required this.text,
  });
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 39.94,
      width: 159.66,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              letterSpacing: 16 * -0.022,
            ),
          ),
          const SizedBox(
            width: 6,
          ),
        ],
      ),
    );
  }
}

class EmailLinkSkipButton extends StatelessWidget {
  const EmailLinkSkipButton({
    super.key,
    required this.text,
  });
  final String text;

  @override
  Widget build(BuildContext context) {
    return IntrinsicWidth(
      child: Container(
        height: 39.94,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: const BoxDecoration(
          color: Color.fromARGB(0, 0, 0, 0),
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text,
              style: const TextStyle(
                color: Color.fromARGB(197, 0, 0, 0),
                fontSize: 14,
                letterSpacing: 16 * -0.022,
              ),
            ),
            const SizedBox(
              width: 6,
            ),
          ],
        ),
      ),
    );
  }
}

class EmailLinkErrorMessage extends StatelessWidget {
  const EmailLinkErrorMessage({super.key});

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
                    AppLocalizations.of(context)!.yourEmailIsAlreadyRegistered,
                    maxLines: 1,
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

class EmailLinkTitle extends StatelessWidget {
  const EmailLinkTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        String message;
        switch (state.status) {
          case AuthenticationStatus.initial:
            message = AppLocalizations.of(context)!.addYourEmail;
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

class SkipLinkButtons extends StatelessWidget {
  const SkipLinkButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EmailAuthBloc, EmailAuthState>(
      builder: (context, state) {
        if (state.status == AuthenticationStatus.success ||
            context.read<EmailAuthBloc>().state.authProcedure !=
                AuthProcedure.signup) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Column(
            children: [
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () async {
                  SharedPreferences prefs =
                      await SharedPreferences.getInstance();
                  prefs.setInt(
                    'remindMeLaterTimestamp',
                    DateTime.now().millisecondsSinceEpoch,
                  );
                  Navigator.pop(context);
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) {
                      return const HomePage();
                    }),
                    (r) => true,
                  );
                },
                child: Text(
                  AppLocalizations.of(context)!.skip,
                  style: const TextStyle(
                    color: Colors.blue, // Customize the color as needed
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class EmailLinkSubTitle extends StatelessWidget {
  const EmailLinkSubTitle({super.key});

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
            message = "Your Email has been added";
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

class LinkAuthButtons extends StatelessWidget {
  const LinkAuthButtons({super.key});

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
                  AuthProcedure.signup
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    EmailLinkActionButton(
                      text: AppLocalizations.of(context)!.add,
                    ),
                    const SizedBox(
                      width: 12,
                    ),
                    EmailLinkSkipButton(
                      text: AppLocalizations.of(context)!.skip,
                    ),
                  ],
                )
              : const SizedBox.shrink(),
        );
      },
    );
  }
}

class LinkFailureDialog extends StatelessWidget {
  const LinkFailureDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: Text(
        AppLocalizations.of(context)!.oopsSomethingWentWrongPleaseTryAgainLater,
        textAlign: TextAlign.center,
        style: CustomTextStyle.headline8(context),
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () async {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const HomePage(),
              ),
            );
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            AppLocalizations.of(context)!.tryAgainLater,
            style: CustomTextStyle.button2(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }
}
