import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:showcaseview/showcaseview.dart';

import '../auth/auth_verification.dart';
import '../feedback/feedback_page.dart';
import 'about_page.dart';

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
    return Scaffold(
      appBar: const AppTopBar('Settings'),
      body: AppSafeArea(
        verticalPadding: 8.0,
        horizontalPadding: 16.0,
        child: ShowCaseWidget(
          builder: Builder(
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
                            'Location',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          trailing: CupertinoSwitch(
                            activeColor: CustomColors.appColorBlue,
                            onChanged: (bool value) async {
                              await LocationService.requestLocation(
                                context,
                                value,
                              );
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
                            'Notification',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          trailing: CupertinoSwitch(
                            activeColor: CustomColors.appColorBlue,
                            onChanged: (bool value) async {
                              await NotificationService.requestNotification(
                                context,
                                value,
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
                                  return const FeedbackPage();
                                },
                              ),
                            );
                          },
                          title: Text(
                            'Send feedback',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ),
                      divider,
                      CustomShowcaseWidget(
                        showcaseKey: _appTourShowcaseKey,
                        descriptionHeight: 120,
                        description:
                            "You can always restart the App Tour from here anytime.",
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
                            title: Text(
                              'Take a tour of the App',
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
                          title: Text(
                            'Rate the AirQo App',
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
                          title: Text(
                            'About',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ),
                      const Spacer(),
                      BlocBuilder<AccountBloc, AccountState>(
                        buildWhen: (previous, current) {
                          return previous.guestUser != current.guestUser;
                        },
                        builder: (context, state) {
                          if (state.guestUser) {
                            return Container();
                          }

                          return MultiBlocListener(
                            listeners: [
                              BlocListener<AccountBloc, AccountState>(
                                listener: (context, state) {
                                  loadingScreen(context);
                                },
                                listenWhen: (previous, current) {
                                  return current.blocStatus ==
                                      BlocStatus.processing;
                                },
                              ),
                              BlocListener<AccountBloc, AccountState>(
                                listener: (context, state) {
                                  Navigator.pop(context);
                                },
                                listenWhen: (previous, current) {
                                  return previous.blocStatus ==
                                      BlocStatus.processing;
                                },
                              ),
                              BlocListener<AccountBloc, AccountState>(
                                listener: (
                                  context,
                                  state,
                                ) {
                                  showSnackBar(
                                    context,
                                    state.blocError.message,
                                  );
                                },
                                listenWhen: (previous, current) {
                                  return current.blocStatus ==
                                          BlocStatus.error &&
                                      current.blocError !=
                                          AuthenticationError.none;
                                },
                              ),
                              BlocListener<AccountBloc, AccountState>(
                                listener: (context, state) {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) {
                                      return const AuthVerificationWidget();
                                    }),
                                  );
                                },
                                listenWhen: (previous, current) {
                                  return current.blocStatus ==
                                      BlocStatus.accountDeletionCheckSuccess;
                                },
                              ),
                            ],
                            child: Card(
                              margin: EdgeInsets.zero,
                              elevation: 0,
                              shape: const RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.all(Radius.circular(8)),
                              ),
                              child: ListTile(
                                tileColor: Colors.white,
                                shape: const RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(8)),
                                ),
                                onTap: () {
                                  _deleteAccount();
                                },
                                title: Text(
                                  'Delete your account',
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        color: CustomColors.appColorBlack
                                            .withOpacity(0.6),
                                      ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
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
        break;
    }
  }

  void _deleteAccount() {
    context.read<AccountBloc>().add(DeleteAccount(context: context));
  }

  void _startShowcase() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ShowCaseWidget.of(_showcaseContext).startShowCase(
        [
          _appTourShowcaseKey,
        ],
      );
    });
  }

  Future<void> _showcaseToggle() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(Config.settingsPageShowcase) == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _startShowcase());
      _appService.stopShowcase(Config.settingsPageShowcase);
    }
  }
}
