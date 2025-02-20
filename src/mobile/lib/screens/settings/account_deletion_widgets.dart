import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AccountDeletionTitle extends StatelessWidget {
  const AccountDeletionTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 10),
      child: AutoSizeText(
        AppLocalizations.of(context)!.enterCodeToDeleteAccount,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline7(context),
      ),
    );
  }
}

class AccountDeletionSubTitle extends StatelessWidget {
  const AccountDeletionSubTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, state) {
        String credentials = state.emailAddress;
        if (state.emailAddress.isEmpty) {
          credentials = state.phoneNumber;
        }

        return Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
          child: AutoSizeText(
            AppLocalizations.of(context)!
                .enterThe6DigitsCodeSentTo(credentials),
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
