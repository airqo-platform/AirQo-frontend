// ignore_for_file: use_build_context_synchronously

import 'package:app/blocs/email_auth/email_auth_bloc.dart';
import 'package:app/blocs/email_verification/email_verification_bloc.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/email_auth_model.dart';
import 'package:app/models/enum_constants.dart';
import 'package:app/new_authentication/auth_details.dart';
import 'package:app/new_authentication/sign_up.dart';
import 'package:app/new_authentication/verify_code.dart';
import 'package:app/new_authentication/widgets.dart';
import 'package:app/screens/email_authentication/email_auth_widgets.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/themes/colors.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../themes/app_theme.dart';

class _EmailAuthWidget extends StatefulWidget {
  const _EmailAuthWidget({
    super.key,
    required this.authProcedure,
  });
  final AuthProcedure authProcedure;

  @override
  _EmailAuthWidgetState createState() => _EmailAuthWidgetState();
}

class _EmailAuthWidgetState<T extends _EmailAuthWidget> extends State<T> {
  DateTime? _exitTime;
  bool keyboardVisible = false;
  final _formKey = GlobalKey<FormState>();
  String emailAddress = "";
  final AirqoApiClient apiClient = AirqoApiClient();

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _pageController = PageController();
  int _currentPage = 0; // Track the current page index

  @override
  void initState() {
    super.initState();
    _firstNameController.addListener(_updateIndicator);
    _lastNameController.addListener(_updateIndicator);
    context.read<EmailAuthBloc>().add(InitializeEmailAuth(
          authProcedure: widget.authProcedure,
        ));
  }

  @override
  void dispose() {
    _firstNameController.removeListener(_updateIndicator);
    _lastNameController.removeListener(_updateIndicator);
    _firstNameController.dispose();
    _formKey.currentState?.dispose();
    _lastNameController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _updateIndicator() {
    setState(() {
      _currentPage = 0;
      if (_firstNameController.text.isNotEmpty) {
        _currentPage = 1;
      }
      if (_lastNameController.text.isNotEmpty) {
        _currentPage = 2;
      }
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
    keyboardVisible = MediaQuery.of(context).viewInsets.bottom != 0;

    return Scaffold(
      backgroundColor: const Color(0xff34373B),
      appBar: AppBar(
        backgroundColor: const Color(0xff4B4E56),
        title: Column(
          children: [
            Text(
              'Login',
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
      body: PopScope(
        onPopInvoked: ((didPop) {
          if (didPop) {
            onWillPop();
          }
        }),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: SizedBox(
              child: BlocBuilder<EmailAuthBloc, EmailAuthState>(
                buildWhen: (previous, current) {
                  return previous.status != current.status;
                },
                builder: (context, state) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Padding(
                      //   padding: const EdgeInsets.symmetric(horizontal: 20),
                      //   child: EmailEditField(
                      //     focusedBorderColor: Theme.of(context).focusColor,
                      //     fillColor:
                      //         Theme.of(context).inputDecorationTheme.focusColor,
                      //     hintText: 'Enter your email',
                      //     valueChange: (value) {},
                      //     label: 'Email',
                      //     controller: _emailController,
                      //   ),
                      // ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: 20, vertical: 8),
                            child: Text(
                              'Email',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xff4B4E56),
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: TextFormField(
                              enableSuggestions: false,
                              cursorWidth: 1,
                              cursorColor: Theme.of(context).dividerColor,
                              keyboardType: TextInputType.emailAddress,
                              style: inputTextStyle(state.status),
                              // decoration: inputDecoration(
                              //   state.status,
                              //   hintText: 'Enter your email',
                              //   suffixIconCallback: () {
                              //     _formKey.currentState?.reset();
                              //     FocusScope.of(context)
                              //         .requestFocus(FocusNode());
                              //   },
                              // ),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: Theme.of(context)
                                    .inputDecorationTheme
                                    .focusColor,
                                hintText: 'Enter your email',
                                focusedBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Theme.of(context).focusColor,
                                    width: 2.5,
                                  ),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                    color: Colors.transparent,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                                errorText:
                                    state.status == AuthenticationStatus.error
                                        ? state.errorMessage
                                        : null,
                              ),
                              validator: (value) {
                                if (value == null || !value.isValidEmail()) {
                                  return AppLocalizations.of(context)!
                                      .pleaseEnterAValidEmail;
                                }

                                return null;
                              },
                              onChanged: (value) {
                                setState(() => emailAddress = value);
                              },
                              onSaved: (value) {
                                setState(() => emailAddress = value!);
                              },
                            ),
                          ),
                        ],
                      ),
                      const EmailAuthErrorMessage(),

                      const SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: PasswordEditField(
                          focusedBorderColor: Theme.of(context).focusColor,
                          fillColor:
                              Theme.of(context).inputDecorationTheme.focusColor,
                          label: 'Password',
                          hintText: 'Enter your password',
                          valueChange: (value) {},
                          controller: _passwordController,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: NextButton(
                          textColor: Colors.white,
                          text: 'Login',
                          buttonColor: emailAddress.isValidEmail()
                              ? CustomColors.appColorBlue
                              : CustomColors.appColorDisabled,
                          callBack: () async {
                            FocusScope.of(context).requestFocus(FocusNode());

                            switch (
                                context.read<EmailAuthBloc>().state.status) {
                              case AuthenticationStatus.initial:
                              case AuthenticationStatus.error:
                                FormState? formState = _formKey.currentState;
                                if (formState == null) {
                                  return;
                                }

                                if (formState.validate()) {
                                  formState.save();
                                  await _sendAuthCode();
                                }
                                break;
                              case AuthenticationStatus.success:
                                await verifyEmailAuthCode(context);
                                break;
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child:  GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) {
                                      return const EmailSignupScreen();
                                    },
                                  ),
                                );
                              },
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Don’t have an account?",
                                textAlign: TextAlign.center,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: CustomColors.appBodyColor
                                          .withOpacity(0.6),
                                    ),
                              ),
                              Text(
                                'Create an account',
                                textAlign: TextAlign.center,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: CustomColors.appColorBlue
                                          .withOpacity(0.6),
                                    ),
                              ),
                            ],
                          ),
                        ),
                      )
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _sendAuthCode() async {
    context.read<EmailAuthBloc>().add(const SetEmailAuthStatus(
          AuthenticationStatus.initial,
        ));

    final hasConnection = await hasNetworkConnection();

    if (!mounted) {
      return;
    }

    if (!hasConnection) {
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.checkYourInternetConnection,
          ));

      return;
    }

    final confirmation = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: emailAddress,
          authMethod: AuthMethod.email,
        );
      },
    );

    if (confirmation == null ||
        confirmation == ConfirmationAction.cancel ||
        !mounted) {
      return;
    }

    loadingScreen(context);

    final bool? exists = await apiClient.checkIfUserExists(
      emailAddress: emailAddress,
    );

    if (!mounted) {
      return;
    }

    if (exists == null) {
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

    AuthProcedure authProcedure =
        context.read<EmailAuthBloc>().state.authProcedure;
    if (!exists && authProcedure == AuthProcedure.login) {
      Navigator.pop(context);
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.emailNotFoundDidYouSignUp,
          ));

      return;
    }

    if (exists && authProcedure == AuthProcedure.signup) {
      Navigator.pop(context);
      context.read<EmailAuthBloc>().add(SetEmailAuthStatus(
            AuthenticationStatus.error,
            errorMessage:
                AppLocalizations.of(context)!.emailAlreadyRegisteredPleaseLogIn,
          ));

      return;
    }

    EmailAuthModel? emailAuthModel =
        await apiClient.sendEmailVerificationCode(emailAddress);

    if (!mounted) {
      return;
    }
    Navigator.pop(context);

    if (emailAuthModel == null) {
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext _) {
          return const AuthFailureDialog();
        },
      );

      return;
    }

    context
        .read<EmailAuthBloc>()
        .add(const SetEmailAuthStatus(AuthenticationStatus.success));
    context.read<EmailVerificationBloc>().add(InitializeEmailVerification(
          emailAuthModel: emailAuthModel,
          authProcedure: context.read<EmailAuthBloc>().state.authProcedure,
        ));
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

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );

    return Future.value(false);
  }
}

class ProceedAsGuest extends StatelessWidget {
  const ProceedAsGuest({super.key});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        await _guestSignIn(context);
      },
      child: SizedBox(
        width: double.infinity,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Continue As Guest',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: CustomColors.appBodyColor.withOpacity(0.6),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _guestSignIn(BuildContext context) async {
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        showSnackBar(
            context, AppLocalizations.of(context)!.checkYourInternetConnection);
        return;
      }

      loadingScreen(context);

      await CustomAuth.guestSignIn().then((success) async {
        if (success) {
          await AppService.postSignOutActions(context, log: false)
              .then((_) async {
            await AppService.postSignInActions(context, isGuest: true)
                .then((_) async {
              Navigator.pop(context);
              await Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) {
                  return const HomePage();
                }),
                (r) => true,
              );
            });
          });
        } else {
          Navigator.pop(context);
          showSnackBar(context, Config.guestLogInFailed);
        }
      });
    });
  }
}

class OnBoardingTopBar extends StatelessWidget implements PreferredSizeWidget {
  const OnBoardingTopBar({super.key, this.backgroundColor});

  final Color? backgroundColor;

  @override
  PreferredSizeWidget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 0,
      backgroundColor: backgroundColor ?? CustomColors.appBodyColor,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(0);
}

class EmailLoginScreen extends _EmailAuthWidget {
  const EmailLoginScreen({super.key})
      : super(authProcedure: AuthProcedure.login);

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends _EmailAuthWidgetState<EmailLoginScreen> {}

