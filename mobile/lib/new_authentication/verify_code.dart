// ignore_for_file: use_build_context_synchronously

import 'package:app/blocs/email_verification/email_verification_bloc.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/screens/email_authentication/email_auth_widgets.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/on_boarding/profile_setup_screen.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/colors.dart';
import 'package:app/utils/exception.dart';
import 'package:app/widgets/auth_widgets.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:pinput/pinput.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

Future<void> verifyEmailAuthCode(BuildContext context) async {
  await Navigator.of(context).push(
    PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) =>
          const _EmailAuthVerificationWidget(),
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

class _EmailAuthVerificationWidget extends StatefulWidget {
  const _EmailAuthVerificationWidget();

  @override
  State<_EmailAuthVerificationWidget> createState() =>
      _EmailAuthVerificationWidgetState();
}

class _EmailAuthVerificationWidgetState
    extends State<_EmailAuthVerificationWidget> {
  final _formKey = GlobalKey<FormState>();
  final pinController = TextEditingController();
  final focusNode = FocusNode();
  String _inputCode = '';
  DateTime? _exitTime;

  final _pageController = PageController();
  int _currentPage = 0;

  bool showError = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pageController.dispose();
    pinController.dispose();
    focusNode.dispose();
    super.dispose();
  }

  void _updateIndicator() {
    setState(() {
      _currentPage = 0;
    });
    _pageController.animateToPage(
      _currentPage - 1,
      duration: const Duration(milliseconds: 500),
      curve: Curves.ease,
    );
  }

  Color _getIndicatorColor(int index) {
    if (index == _currentPage - 1) {
      return CustomColors.appColorBlue;
    } else {
      return Theme.of(context).unselectedWidgetColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    const length = 6;
    const focusedBorderColor = Color.fromRGBO(23, 171, 144, 1);
    const fillColor = Color.fromRGBO(243, 246, 249, 0.233);
    const borderColor = Color.fromRGBO(23, 171, 144, 0.4);
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: GoogleFonts.poppins(
        fontSize: 22,
        color: Colors.white,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
        color: fillColor,
      ),
    );

    return PopScope(
      onPopInvoked: ((didPop) {
        if (didPop) {
          onWillPop();
        }
      }),
      child: Scaffold(
        backgroundColor: const Color(0xff34373B),
        appBar: AppBar(
          backgroundColor: const Color(0xff34373B),
          title: Column(
            children: [
              Text(
                'Create Account',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 5),
              SmoothPageIndicator(
                controller: _pageController,
                count: 3,
                effect: WormEffect(
                  dotWidth: 40,
                  dotHeight: 6,
                  activeDotColor: _getIndicatorColor(0),
                  dotColor: _getIndicatorColor(1),
                ),
              ),
            ],
          ),
          centerTitle: true,
          titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back,
              color: Theme.of(context).textTheme.bodyLarge?.color,
            ),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ),
        body: BlocBuilder<EmailVerificationBloc, EmailVerificationState>(
          builder: (context, state) {
            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 15, vertical: 0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(
                              height: 30,
                            ),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  child: AutoSizeText(
                                    'We just sent you a code ',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.color,
                                      fontFamily: 'Inter',
                                      fontSize: 20,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  child: AutoSizeText(
                                    'Enter the verification code sent to Gmail(------@gmail.com)',
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .textTheme
                                          .bodyMedium
                                          ?.color,
                                      fontFamily: 'Inter',
                                      fontSize: 16,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Form(
                                  key: _formKey,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Directionality(
                                        textDirection: TextDirection.ltr,
                                        child: Pinput(
                                          length: length,
                                          controller: pinController,
                                          focusNode: focusNode,
                                          keyboardType: TextInputType.number,
                                          listenForMultipleSmsOnAndroid: true,
                                          defaultPinTheme: defaultPinTheme,
                                          androidSmsAutofillMethod:
                                              AndroidSmsAutofillMethod.none,
                                          separatorBuilder: (index) =>
                                              const SizedBox(width: 8),
                                          validator: (value) {
                                            String? error;
                                            if (value == null) {
                                              error =
                                                  AppLocalizations.of(context)!
                                                      .pleaseEnterTheCode;
                                            }

                                            if (value != null &&
                                                value.length < 6) {
                                              error =
                                                  AppLocalizations.of(context)!
                                                      .pleaseEnterAllTheDigits;
                                            }

                                            if (value !=
                                                state.emailAuthModel.token
                                                    .toString()) {
                                              error =
                                                  AppLocalizations.of(context)!
                                                      .pleaseEnterAllTheDigits;
                                            }

                                            if (error != null) {
                                              context
                                                  .read<EmailVerificationBloc>()
                                                  .add(
                                                      const SetEmailVerificationStatus(
                                                    AuthenticationStatus.error,
                                                  ));
                                            }

                                            return error;
                                          },
                                          hapticFeedbackType:
                                              HapticFeedbackType.lightImpact,
                                          onChanged: (value) {
                                            setState(() => _inputCode = value);
                                          },
                                          showCursor: state.codeCountDown <=
                                                  0 &&
                                              state.status !=
                                                  AuthenticationStatus.success,
                                          cursor: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.end,
                                            children: [
                                              Container(
                                                margin: const EdgeInsets.only(
                                                    bottom: 9),
                                                width: 22,
                                                height: 1,
                                                color: focusedBorderColor,
                                              ),
                                            ],
                                          ),
                                          focusedPinTheme:
                                              defaultPinTheme.copyWith(
                                            decoration: defaultPinTheme
                                                .decoration!
                                                .copyWith(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              color: Colors.transparent,
                                              border: Border.all(
                                                color: focusedBorderColor,
                                              ),
                                            ),
                                          ),
                                          submittedPinTheme:
                                              defaultPinTheme.copyWith(
                                            decoration: defaultPinTheme
                                                .decoration!
                                                .copyWith(
                                              color: fillColor,
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                              border: Border.all(
                                                  color: focusedBorderColor),
                                            ),
                                          ),
                                          errorPinTheme:
                                              defaultPinTheme.copyBorderWith(
                                            border: Border.all(
                                                color: Colors.redAccent),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 20),
                                      const EmailVerificationCodeCountDown(),
                                      const SizedBox(height: 20),
                                      // Visibility(
                                      //   visible: state.status !=
                                      //       AuthenticationStatus.success,
                                      //   child: const AuthOrSeparator(),
                                      // ),
                                      Visibility(
                                        visible: state.status ==
                                            AuthenticationStatus.success,
                                        child: const AuthSuccessWidget(),
                                      ),
                                      const SizedBox(height: 30),
                                      NextButton(
                                        buttonColor: _inputCode.length >= 6
                                            ? CustomColors.appColorBlue
                                            : CustomColors.appColorDisabled,
                                        callBack: () async {
                                          switch (state.status) {
                                            case AuthenticationStatus.success:
                                              break;
                                            case AuthenticationStatus.error:
                                            case AuthenticationStatus.initial:
                                              if (_inputCode.length < 6) {
                                                return;
                                              }
                                              FormState? formState =
                                                  _formKey.currentState;
                                              if (formState == null) {
                                                return;
                                              }
                                              if (formState.validate()) {
                                                await _authenticate();
                                              }
                                              return;
                                          }

                                          if (!mounted) return;

                                          if (state.authProcedure ==
                                              AuthProcedure.login) {
                                            await Navigator.pushAndRemoveUntil(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) {
                                                return const HomePage();
                                              }),
                                              (r) => false,
                                            );
                                          } else {
                                            await Navigator.pushAndRemoveUntil(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) {
                                                return const ProfileSetupScreen();
                                              }),
                                              (r) => false,
                                            );
                                          }
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 20),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Future<bool> onWillPop() {
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        AppLocalizations.of(context)!.tapAgainToCancel,
      );

      return Future.value(false);
    }

    Navigator.pop(context, false);

    return Future.value(false);
  }

  Future<void> _authenticate() async {
    loadingScreen(context);

    final emailAuthModel =
        context.read<EmailVerificationBloc>().state.emailAuthModel;
    final emailCredential = EmailAuthProvider.credentialWithLink(
      emailLink: emailAuthModel.signInLink,
      email: emailAuthModel.emailAddress,
    );

    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        Navigator.pop(context);

        await _linkAccountWithEmailCredential(currentUser, emailCredential);

        await AirqoApiClient().syncPlatformAccount();
      } else {
        //TODO -  replace with sign in auth
        final bool authenticationSuccessful =
            await CustomAuth.firebaseSignIn(emailCredential);
        if (!mounted) return;

        if (!authenticationSuccessful) {
          Navigator.pop(context);
          await showDialog<void>(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext _) {
              return const AuthFailureDialog();
            },
          );
          return;
        }

        context.read<EmailVerificationBloc>().add(
            const SetEmailVerificationStatus(AuthenticationStatus.success));

        Navigator.pop(context);
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
  }

  Future<void> _linkAccountWithEmailCredential(
      User currentUser, AuthCredential emailCredential) async {
    await currentUser.linkWithCredential(emailCredential);
  }
}
