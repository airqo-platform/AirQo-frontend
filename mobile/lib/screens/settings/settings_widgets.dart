import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/auth/phone_auth_widget.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class DeleteAccountButton extends StatefulWidget {
  const DeleteAccountButton({super.key});

  @override
  State<DeleteAccountButton> createState() => _DeleteAccountButtonState();
}

class _DeleteAccountButtonState extends State<DeleteAccountButton> {
  late BuildContext _loadingContext;

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        final profile = state.profile;
        if (profile == null || profile.isAQuest()) {
          return Container();
        }

        return MultiBlocListener(
          listeners: [
            BlocListener<SettingsBloc, SettingsState>(
              listener: (context, _) {
                loadingScreen(context);
              },
              listenWhen: (_, current) {
                return current.status == SettingsStatus.processing;
              },
            ),
            BlocListener<SettingsBloc, SettingsState>(
              listener: (context, state) {
                _popLoadingScreen();
                showSnackBar(context, state.errorMessage);
              },
              listenWhen: (previous, current) {
                return current.status == SettingsStatus.error;
              },
            ),
            BlocListener<SettingsBloc, SettingsState>(
              listener: (context, _) async {
                _popLoadingScreen();
                await _reAuthenticate();
              },
              listenWhen: (previous, current) {
                return current.status == SettingsStatus.loginRequired;
              },
            ),
            BlocListener<SettingsBloc, SettingsState>(
              listener: (context, _) async {
                _popLoadingScreen();
                await AppService.postSignOutActions(context);
              },
              listenWhen: (_, current) {
                return current.status ==
                    SettingsStatus.accountDeletionSuccessful;
              },
            ),
          ],
          child: OutlinedButton(
            onPressed: () async {
              await _deleteAccount();
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: CustomColors.appColorBlue,
              minimumSize: const Size.fromHeight(60),
              alignment: Alignment.centerLeft,
              elevation: 0,
              side: const BorderSide(color: Colors.transparent),
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(8),
                ),
              ),
              backgroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                vertical: 12,
                horizontal: 14,
              ),
            ),
            child: Text(
              'Delete your account',
              textAlign: TextAlign.start,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: CustomColors.appBodyColor,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        );
      },
    );
  }

  void _popLoadingScreen() {
    if (Navigator.canPop(_loadingContext)) Navigator.pop(_loadingContext);
  }

  Future<void> _reAuthenticate() async {
    ConfirmationAction? action = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const ReAuthenticationDialog(
          'Login is required to delete account',
        );
      },
    );

    if ((action == null || action != ConfirmationAction.ok) && mounted) {
      await Navigator.pushAndRemoveUntil(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) {
            return const PhoneLoginWidget();
          },
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation.drive(Tween<double>(begin: 0, end: 1)),
              child: child,
            );
          },
        ),
        (r) => false,
      );
    }
  }

  Future<void> _deleteAccount() async {
    await checkNetworkConnection(context, notifyUser: true).then((value) {
      if (value) {
        showDialog<ConfirmationAction>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return const AuthProcedureDialog(
              authProcedure: AuthProcedure.deleteAccount,
            );
          },
        ).then((action) {
          if (action != null || action == ConfirmationAction.ok) {
            context.read<SettingsBloc>().add(DeleteAccount(context));
          }
        });
      }
    });
  }
}
