import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import '../offline_banner.dart';
import 'notification_widgets.dart';

class NotificationPage extends StatelessWidget {
  const NotificationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(
          AppLocalizations.of(context)!.notifications,
        ),
        body: AppSafeArea(
          child: BlocBuilder<NotificationBloc, List<AppNotification>>(
            builder: (context, state) {
              if (state.isEmpty) {
                context.read<NotificationBloc>().add(const SyncNotifications());

                return const EmptyNotifications();
              }

              return AppRefreshIndicator(
                sliverChildDelegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return AnimatedPadding(
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeIn,
                      padding:
                          EdgeInsets.fromLTRB(16, index == 0 ? 24.0 : 4, 16, 4),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return NotificationView(
                                  appNotification: state[index],
                                );
                              },
                            ),
                          );
                        },
                        child: NotificationCard(
                          appNotification: state[index],
                        ),
                      ),
                    );
                  },
                  childCount: state.length,
                ),
                onRefresh: () {
                  _refresh(context);

                  return Future(() => null);
                },
              );
            },
          ),
        ),
      ),
    );
  }

  void _refresh(BuildContext context) {
    context.read<NotificationBloc>().add(const SyncNotifications());
  }
}
