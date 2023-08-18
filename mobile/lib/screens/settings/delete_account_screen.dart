import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../home_page.dart';
import '../on_boarding/on_boarding_widgets.dart';
import 'account_deletion_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<void> openDeleteAccountScreen(
  BuildContext context, {
  EmailAuthModel? emailAuthModel,
  PhoneAuthModel? phoneAuthModel,
}) async {
  await Navigator.of(context).push(
    PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) =>
          _DeleteAccountWidget(
        emailAuthModel: emailAuthModel,
        phoneAuthModel: phoneAuthModel,
      ),
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        const curve = Curves.ease;

        var tween = Tween(
          begin: begin,
          end: end,
        ).chain(CurveTween(curve: curve));

        return SlideTransition(
          position: animation.drive(tween),
          child: child,
        );
      },
    ),
  );
}

class _DeleteAccountWidget extends StatefulWidget {
  const _DeleteAccountWidget({
    this.emailAuthModel,
    this.phoneAuthModel,
  });
  final EmailAuthModel? emailAuthModel;
  final PhoneAuthModel? phoneAuthModel;

  @override
  State<_DeleteAccountWidget> createState() => _DeleteAccountWidgetState();
}

class _DeleteAccountWidgetState extends State<_DeleteAccountWidget> {
  final _formKey = GlobalKey<FormState>();
  String _inputCode = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const OnBoardingTopBar(backgroundColor: Colors.white),
      body: AppSafeArea(
        horizontalPadding: 24,
        backgroundColor: Colors.white,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AccountDeletionTitle(),
            const AccountDeletionSubTitle(),
            const SizedBox(
              height: 20,
            ),
            Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 36),
                child: TextFormField(
                  validator: (value) {
                    if (value == null) {
                      return AppLocalizations.of(context)!.pleaseEnterTheCode;
                    }

                    if (value.length < 6) {
                      return AppLocalizations.of(context)!
                          .pleaseEnterAllTheDigits;
                    }

                    if (widget.emailAuthModel != null) {
                      if (widget.emailAuthModel?.token.toString() != value) {
                        return AppLocalizations.of(context)!.invalidCode;
                      }
                    }

                    return null;
                  },
                  onChanged: (value) {
                    setState(() => _inputCode = value);
                  },
                  textAlign: TextAlign.center,
                  maxLength: 6,
                  cursorWidth: 1,
                  keyboardType: TextInputType.number,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontSize: 32,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 16 * 0.41,
                        height: 40 / 32,
                      ),
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 10,
                      horizontal: 0,
                    ),
                    filled: true,
                    counter: Offstage(),
                    errorStyle: TextStyle(
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ),
            const Spacer(),
            NextButton(
              text: "Confirm",
              showIcon: false,
              buttonColor: _inputCode.length >= 6
                  ? CustomColors.appColorInvalid
                  : CustomColors.appColorInvalid.withOpacity(0.5),
              callBack: () async {
                FormState? formState = _formKey.currentState;
                if (formState == null) {
                  return;
                }
                if (formState.validate()) {
                  await _deleteAccount();
                }
              },
            ),
            const SizedBox(
              height: 10,
            ),
            NextButton(
              text: AppLocalizations.of(context)!.cancel,
              showIcon: false,
              buttonColor: CustomColors.appColorBlue,
              callBack: () async {
                await Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) {
                    return const HomePage();
                  }),
                  (r) => false,
                );
              },
            ),
            const SizedBox(
              height: 12,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteAccount() async {
    loadingScreen(context);
    AuthCredential? authCredential;
    if (widget.emailAuthModel != null) {
      authCredential = EmailAuthProvider.credentialWithLink(
        emailLink: widget.emailAuthModel!.reAuthenticationLink,
        email: widget.emailAuthModel!.emailAddress,
      );
    } else if (widget.phoneAuthModel != null) {
      authCredential = PhoneAuthProvider.credential(
        verificationId: widget.phoneAuthModel?.verificationId ?? "",
        smsCode: _inputCode,
      );
    }

    if (authCredential == null) {
      showSnackBar(context,
          AppLocalizations.of(context)!.failedToDeleteAccountTryAgainLater);

      return;
    }

    try {
      await CustomAuth.reAuthenticate(authCredential).then((success) async {
        if (!success) {
          showSnackBar(context,
              AppLocalizations.of(context)!.failedToDeleteAccountTryAgainLater);
          return;
        }
        await CustomAuth.deleteAccount().then((success) async {
          if (!success) {
            showSnackBar(
                context,
                AppLocalizations.of(context)!
                    .failedToDeleteAccountTryAgainLater);
          } else {
            await AppService.postSignOutActions(context).then((_) async {
              await Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) {
                  return const HomePage();
                }),
                (r) => false,
              );
            });
          }
        });
      });
    } on FirebaseAuthException catch (exception, _) {
      Navigator.pop(context);
      final firebaseAuthError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);

      if (firebaseAuthError == FirebaseAuthError.invalidAuthCode) {
        showSnackBar(context, AppLocalizations.of(context)!.invalidCode);
      } else if (firebaseAuthError == FirebaseAuthError.authSessionTimeout) {
        showSnackBar(
            context, AppLocalizations.of(context)!.codeExpiredTryAgainLater);
      } else {
        await showDialog<void>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext _) {
            return const AuthFailureDialog();
          },
        );
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
  }
}
