
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/shared/bloc/connectivity_bloc.dart';
import 'package:loggy/loggy.dart';

class NoInternetBanner extends StatelessWidget {
  final VoidCallback? onClose;
  final String message;

  const NoInternetBanner({
    Key? key,
    this.onClose,
    this.message = 'Internet Connection Lost',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ConnectivityBloc, ConnectivityState>(
      builder: (context, state) {
        final isOffline = state is ConnectivityOffline;
        final isDismissed = state is ConnectivityOffline && state.isDismissed;
        final reappeared = state is ConnectivityOffline && state.reappeared;

        return AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          transitionBuilder: (child, animation) => SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, -1),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
          child: isOffline && !isDismissed
              ? AnimatedContainer(
                  key: const ValueKey('banner'),
                  duration: const Duration(milliseconds: 1000),
                  curve: Curves.easeInOut,
                  decoration: BoxDecoration(
                    color: reappeared
                        ? const Color.fromARGB(255, 162, 51, 45)
                        : Theme.of(context).colorScheme.error,
                    boxShadow: reappeared
                        ? [
                            BoxShadow(
                              color: const Color.fromARGB(255, 169, 52, 52).withOpacity(0.5),
                              blurRadius: 10,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                  padding: EdgeInsets.symmetric(
                    horizontal: MediaQuery.of(context).size.width * 0.04,
                    vertical: MediaQuery.of(context).size.height * 0.01,
                  ),
                  child: SafeArea(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Semantics(
                            label: 'No internet connection warning',
                            child: Text(
                              reappeared ? 'Still Offline: $message' : message,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge
                                  ?.copyWith(
                                    color: Theme.of(context).colorScheme.onError,
                                    fontWeight: FontWeight.bold,
                                  ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.refresh, color: Colors.white),
                          tooltip: 'Retry',
                          onPressed: () {
                            logInfo('User tapped Retry button');
                            context
                                .read<ConnectivityBloc>()
                                .add(ConnectivityCheckRequested());
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          tooltip: 'Dismiss',
                          onPressed: () {
                            logInfo('User tapped Dismiss button');
                            context
                                .read<ConnectivityBloc>()
                                .add(ConnectivityBannerDismissed());
                            onClose?.call();
                          },
                        ),
                      ],
                    ),
                  ),
                )
              : const SizedBox.shrink(key: ValueKey('empty')),
        );
      },
    );
  }
}