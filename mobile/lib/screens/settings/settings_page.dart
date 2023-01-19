import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Settings'),
      body: AppSafeArea(
        verticalPadding: 8.0,
        horizontalPadding: 16.0,
        widget: BlocBuilder<SettingsBloc, SettingsState>(
          builder: (context, state) {
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
                      style: Theme.of(context).textTheme.bodyText1,
                    ),
                    trailing: CupertinoSwitch(
                      activeColor: CustomColors.appColorBlue,
                      onChanged: (bool value) async {
                        await LocationService.requestLocation(context, value);
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
                      style: Theme.of(context).textTheme.bodyText1,
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
                      style: Theme.of(context).textTheme.bodyText1,
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
                          showSnackBar(context, Config.connectionErrorMessage);
                        }
                      });
                    },
                    title: Text(
                      'Rate the AirQo App',
                      style: Theme.of(context).textTheme.bodyText1,
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
                      style: Theme.of(context).textTheme.bodyText1,
                    ),
                  ),
                ),
                const Spacer(),
                BlocBuilder<AccountBloc, AccountState>(
                  builder: (context, state) {
                    final profile = state.profile;
                    if (profile == null || profile.isAQuest()) {
                      return Container();
                    }

                    return MultiBlocListener(
                      listeners: [
                        BlocListener<AccountBloc, AccountState>(
                          listener: (context, state) {
                            loadingScreen(context);
                          },
                          listenWhen: (previous, current) {
                            return current.blocStatus == BlocStatus.processing;
                          },
                        ),
                        BlocListener<AccountBloc, AccountState>(
                          listener: (context, state) {
                            Navigator.pop(context);
                          },
                          listenWhen: (previous, current) {
                            return previous.blocStatus == BlocStatus.processing;
                          },
                        ),
                        BlocListener<AccountBloc, AccountState>(
                          listener: (context, state) {
                            showSnackBar(context, state.blocError.message);
                          },
                          listenWhen: (previous, current) {
                            return current.blocStatus == BlocStatus.error &&
                                current.blocError != AuthenticationError.none;
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
                      child: OutlinedButton(
                        onPressed: () {
                          // TODO implement this functionality
                          context
                              .read<AccountBloc>()
                              .add(DeleteAccount(context: context));
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: CustomColors.aqiRed,
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
                          style: Theme.of(context)
                              .textTheme
                              .bodyText2
                              ?.copyWith(
                                  color: CustomColors.aqiRed,
                                  fontWeight: FontWeight.w500),
                        ),
                      ),
                    );
                  },
                ),
              ],
            );
          },
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
}
