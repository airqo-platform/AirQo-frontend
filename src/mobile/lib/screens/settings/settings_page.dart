import 'dart:async';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/screens/offline_banner.dart';
import 'package:app/screens/settings/language_switch.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:showcaseview/showcaseview.dart';

import 'about_page.dart';
import 'delete_account_screen.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    context.read<SettingsBloc>().add(const InitializeSettings());
    _appTourShowcaseKey = GlobalKey();
    WidgetsBinding.instance.addPostFrameCallback((_) => _showcaseToggle());
  }

  late GlobalKey _appTourShowcaseKey;
  late BuildContext _showcaseContext;
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    final Size screenSize = MediaQuery.of(context).size;

    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(AppLocalizations.of(context)!.settings),
        body: AppSafeArea(
          verticalPadding: 8.0,
          horizontalPadding: 16.0,
          child: ShowCaseWidget(
            builder: (context) {
              return BlocBuilder<SettingsBloc, SettingsState>(
                builder: (context, state) {
                  _showcaseContext = context;
                  final Widget divider = Divider(
                    height: 1,
                    thickness: 0,
                    color: CustomColors.appBodyColor,
                  );
                  const ShapeBorder topBorder = RoundedRectangleBorder(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(8),
                      topRight: Radius.circular(8),
                    ),
                  );
                  const ShapeBorder bottomBorder = RoundedRectangleBorder(
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(8),
                      bottomRight: Radius.circular(8),
                    ),
                  );

                  return Column(
                    children: <Widget>[
                      Card(
                        margin: EdgeInsets.zero,
                        elevation: 0,
                        shape: topBorder,
                        child: ListTile(
                          tileColor: Colors.white,
                          shape: topBorder,
                          title: Text(
                            AppLocalizations.of(context)!.location,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          trailing: CupertinoSwitch(
                            activeColor: CustomColors.appColorBlue,
                            onChanged: (bool value) async {
                              if (value) {
                                await LocationService.requestLocation();
                              } else {
                                await LocationService.denyLocation();
                              }
                            },
                            value: state.location,
                          ),
                        ),
                      ),
                      divider,
                      Card(
                        margin: EdgeInsets.zero,
                        elevation: 0,
                        child: ListTile(
                          tileColor: Colors.white,
                          title: Text(
                            AppLocalizations.of(context)!.nortification,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          trailing: CupertinoSwitch(
                            activeColor: CustomColors.appColorBlue,
                            onChanged: (bool value) async {
                              await NotificationService.requestNotification(
                                context,
                                "settings",
                              );
                            },
                            value: state.notifications,
                          ),
                        ),
                      ),
                      divider,
                      Card(
                        margin: EdgeInsets.zero,
                        elevation: 0,
                        child: ListTile(
                          tileColor: Colors.white,
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) {
                                  return const LanguageList();
                                },
                              ),
                            );
                          },
                          title: Text(
                            AppLocalizations.of(context)!.languages,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ),
                      divider,
                      CustomShowcaseWidget(
                        showcaseKey: _appTourShowcaseKey,
                        descriptionHeight: screenSize.height * 0.1,
                        description: AppLocalizations.of(context)!
                            .youCanAlwaysRestartTheAppTourFromHereAnytime,
                        child: Card(
                          margin: EdgeInsets.zero,
                          elevation: 0,
                          child: ListTile(
                            tileColor: Colors.white,
                            onTap: () async {
                              await AppService()
                                  .setShowcase(Config.restartTourShowcase);
                              await AppService()
                                  .clearShowcase()
                                  .then((value) async {
                                await Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) {
                                      return const HomePage();
                                    },
                                  ),
                                  (r) => false,
                                );
                              });
                            },
                            title: AutoSizeText(
                              AppLocalizations.of(context)!.takeTour,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ),
                        ),
                      ),
                      divider,
                      Card(
                        margin: EdgeInsets.zero,
                        elevation: 0,
                        child: ListTile(
                          tileColor: Colors.white,
                          onTap: () async {
                            await hasNetworkConnection().then((value) async {
                              if (value) {
                                await RateService.rateApp();
                              } else {
                                showSnackBar(
                                  context,
                                  Config.connectionErrorMessage,
                                );
                              }
                            });
                          },
                          title: AutoSizeText(
                            AppLocalizations.of(context)!.rateAirQoApp,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ),
                      divider,
                      Card(
                        margin: EdgeInsets.zero,
                        elevation: 0,
                        shape: bottomBorder,
                        child: ListTile(
                          tileColor: Colors.white,
                          shape: bottomBorder,
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) {
                                  return const AboutAirQo();
                                },
                              ),
                            );
                          },
                          title: AutoSizeText(
                            AppLocalizations.of(context)!.about,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const DeleteAccountButton(),
                    ],
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        context.read<SettingsBloc>().add(const InitializeSettings());
        context
            .read<NearbyLocationBloc>()
            .add(const SearchLocationAirQuality());
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        break;
    }
  }

  Future<void> _startShowcase() async {
    final prefs = await SharedPreferencesHelper.instance;

    if (prefs.getBool(Config.restartTourShowcase) != true) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ShowCaseWidget.of(_showcaseContext).startShowCase(
          [
            _appTourShowcaseKey,
          ],
        );
      });
    }
  }

  Future<void> _showcaseToggle() async {
    final prefs = await SharedPreferencesHelper.instance;
    if (prefs.getBool(Config.settingsPageShowcase) == null) {
      WidgetsBinding.instance
          .addPostFrameCallback((_) async => await _startShowcase());
      await _appService.stopShowcase(Config.settingsPageShowcase);
    }
  }
}

class DeleteAccountButton extends StatelessWidget {
  const DeleteAccountButton({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, Profile>(
      builder: (context, state) {
        if (state.isAnonymous || !state.isSignedIn) {
          return const SizedBox.shrink();
        }

        return Card(
          margin: EdgeInsets.zero,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          child: ListTile(
            tileColor: Colors.white,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8)),
            ),
            onTap: () => _deleteAccount(context),
            title: Text(
              AppLocalizations.of(context)!.deleteAccount,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: CustomColors.appColorBlack.withOpacity(0.6),
                  ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _deleteAccount(BuildContext context) async {
    await checkNetworkConnection(
      context,
      notifyUser: true,
    ).then((hasConnection) async {
      if (hasConnection) {
        await showDialog<ConfirmationAction>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return const AuthProcedureDialog(
              authProcedure: AuthProcedure.deleteAccount,
            );
          },
        ).then((confirmation) async {
          if (confirmation == ConfirmationAction.ok) {
            Profile profile = context.read<ProfileBloc>().state;
            loadingScreen(context);
            if (profile.emailAddress.isNotEmpty) {
              await AirqoApiClient()
                  .sendEmailReAuthenticationCode(profile.emailAddress)
                  .then((emailAuthModel) async {
                Navigator.pop(context);
                if (emailAuthModel == null) {
                  showSnackBar(
                    context,
                    AppLocalizations.of(context)!.unableDeleteAccount,
                  );

                  return;
                }
                await openDeleteAccountScreen(
                  context,
                  emailAuthModel: emailAuthModel,
                );
              });
            } else {
              loadingScreen(context);
              await FirebaseAuth.instance.verifyPhoneNumber(
                phoneNumber: profile.phoneNumber,
                verificationCompleted:
                    (PhoneAuthCredential phoneAuthCredential) {
                  debugPrint(phoneAuthCredential.smsCode);
                },
                verificationFailed: (FirebaseAuthException exception) async {
                  Navigator.pop(context);
                  final firebaseAuthError =
                      CustomAuth.getFirebaseErrorCodeMessage(
                    exception.code,
                  );

                  if (firebaseAuthError ==
                      FirebaseAuthError.invalidPhoneNumber) {
                    context.read<PhoneAuthBloc>().add(const SetPhoneAuthStatus(
                          AuthenticationStatus.error,
                          errorMessage: "Invalid Phone number",
                        ));
                  } else {
                    await showDialog<void>(
                      context: context,
                      barrierDismissible: false,
                      builder: (BuildContext _) {
                        return const AuthFailureDialog();
                      },
                    );
                  }
                },
                codeSent: (String verificationId, int? resendToken) async {
                  PhoneAuthModel phoneAuthModel = PhoneAuthModel(
                    profile.phoneNumber,
                    verificationId: verificationId,
                  );
                  await openDeleteAccountScreen(
                    context,
                    phoneAuthModel: phoneAuthModel,
                  );
                },
                codeAutoRetrievalTimeout: (String code) {
                  debugPrint(code);
                },
                timeout: const Duration(seconds: 15),
              );
            }
          }
        });
      }
    });
  }
}
