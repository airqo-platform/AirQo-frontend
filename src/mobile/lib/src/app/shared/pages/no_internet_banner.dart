import 'dart:async';

import 'package:airqo/src/app/shared/bloc/connectivity_bloc.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Connectivity status card, shown floating under the status bar.
///
/// Follows the offline pattern used by Google apps, YouTube and WhatsApp and
/// Material's snackbar guidance: a compact, calm card that says what still
/// works ("Showing your saved air quality") rather than a full-width alarm,
/// plus a brief "Back online" confirmation that hides itself once the
/// connection returns. Neutral colours only, in line with AirQo's positive
/// messaging; no red or amber.
class NoInternetBanner extends StatefulWidget {
  final VoidCallback? onClose;

  /// How long the "Back online" confirmation stays up.
  final Duration backOnlineDuration;

  const NoInternetBanner({
    super.key,
    this.onClose,
    this.backOnlineDuration = const Duration(seconds: 3),
  });

  @override
  State<NoInternetBanner> createState() => _NoInternetBannerState();
}

enum _BannerMode { hidden, offline, backOnline }

class _NoInternetBannerState extends State<NoInternetBanner> {
  bool _wasOffline = false;
  bool _showBackOnline = false;
  Timer? _backOnlineTimer;

  @override
  void initState() {
    super.initState();
    _wasOffline = context.read<ConnectivityBloc>().state is ConnectivityOffline;
  }

  @override
  void dispose() {
    _backOnlineTimer?.cancel();
    super.dispose();
  }

  void _onConnectivityChanged(BuildContext context, ConnectivityState state) {
    if (state is ConnectivityOffline) {
      _backOnlineTimer?.cancel();
      setState(() {
        _wasOffline = true;
        _showBackOnline = false;
      });
    } else if (state is ConnectivityOnline && _wasOffline) {
      // Only confirm a reconnection, never a normal app start.
      setState(() {
        _wasOffline = false;
        _showBackOnline = true;
      });
      _backOnlineTimer?.cancel();
      _backOnlineTimer = Timer(widget.backOnlineDuration, () {
        if (mounted) setState(() => _showBackOnline = false);
      });
    }
  }

  _BannerMode _modeFor(ConnectivityState state) {
    if (state is ConnectivityOffline) {
      return state.isDismissed ? _BannerMode.hidden : _BannerMode.offline;
    }
    return _showBackOnline ? _BannerMode.backOnline : _BannerMode.hidden;
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;

    return BlocConsumer<ConnectivityBloc, ConnectivityState>(
      listenWhen: (previous, current) =>
          previous.runtimeType != current.runtimeType,
      listener: _onConnectivityChanged,
      builder: (context, state) {
        final mode = _modeFor(state);
        return AnimatedSwitcher(
          duration:
              reduceMotion ? Duration.zero : const Duration(milliseconds: 250),
          switchInCurve: Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          transitionBuilder: (child, animation) => FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, -0.4),
                end: Offset.zero,
              ).animate(animation),
              child: child,
            ),
          ),
          child: switch (mode) {
            _BannerMode.hidden =>
              const SizedBox.shrink(key: ValueKey('hidden')),
            _BannerMode.offline => _StatusCard(
                key: const ValueKey('offline'),
                kind: _StatusKind.offline,
                onDismiss: () {
                  context
                      .read<ConnectivityBloc>()
                      .add(ConnectivityBannerDismissed());
                  widget.onClose?.call();
                },
              ),
            _BannerMode.backOnline => const _StatusCard(
                key: ValueKey('backOnline'),
                kind: _StatusKind.backOnline,
              ),
          },
        );
      },
    );
  }
}

enum _StatusKind { offline, backOnline }

class _StatusCard extends StatelessWidget {
  final _StatusKind kind;
  final VoidCallback? onDismiss;

  const _StatusCard({super.key, required this.kind, this.onDismiss});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isOffline = kind == _StatusKind.offline;

    // Offline: reversed neutral surface, like a Material snackbar.
    // Back online: AirQo brand blue.
    final background = isOffline
        ? (isDark ? AppColors.highlightColor2 : AppColors.boldHeadlineColor4)
        : AppColors.primaryColor;
    final foreground =
        isOffline && isDark ? AppColors.boldHeadlineColor4 : Colors.white;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
        child: Semantics(
          container: true,
          liveRegion: true,
          // Material ancestor gives the text a proper style; without it,
          // Flutter draws debug yellow underlines.
          child: Material(
            color: background,
            elevation: 6,
            shadowColor: Colors.black.withValues(alpha: 0.25),
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding:
                  EdgeInsets.fromLTRB(16, 12, onDismiss == null ? 16 : 4, 12),
              child: Row(
                children: [
                  Icon(
                    isOffline
                        ? Icons.cloud_off_rounded
                        : Icons.cloud_done_rounded,
                    color: foreground,
                    size: 22,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TranslatedText(
                          isOffline ? "You're offline" : 'Back online',
                          style: TextStyle(
                            color: foreground,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (isOffline) ...[
                          const SizedBox(height: 2),
                          TranslatedText(
                            "Showing your saved air quality. We'll refresh when you're back online.",
                            style: TextStyle(
                              color: foreground.withValues(alpha: 0.8),
                              fontSize: 13,
                              height: 1.3,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (onDismiss != null)
                    IconButton(
                      tooltip: 'Dismiss',
                      constraints:
                          const BoxConstraints(minWidth: 48, minHeight: 48),
                      icon: Icon(Icons.close_rounded,
                          color: foreground.withValues(alpha: 0.8), size: 20),
                      onPressed: onDismiss,
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
