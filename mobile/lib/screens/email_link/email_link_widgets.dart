import 'package:app/blocs/email_auth/email_auth_bloc.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/themes/app_theme.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/flutter_svg.dart';

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
                    'Your account is already linked',
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
            message = "Link your account";
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
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const HomePage(),
                    ),
                  );
                },
                child: const Text(
                  'Skip',
                  style: TextStyle(
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
            message = "Your account has been linked";
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
              ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    EmailLinkActionButton(
                      text: "link",
                    ),
                    SizedBox(
                      width: 12,
                    ),
                    EmailLinkSkipButton(
                      text: "skip",
                    ),
                  ],
                )
              : const SizedBox.shrink(),
        );
      },
    );
  }
}
