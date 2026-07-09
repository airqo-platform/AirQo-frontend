import 'dart:async';
import 'dart:io';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_card.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_filter_tab.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_sticker_frame.dart';
import 'package:airqo/src/app/dashboard/widgets/share_sheet_widgets.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/clean_air_forum_submission_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:pasteboard/pasteboard.dart';
import 'package:share_plus/share_plus.dart';

Future<void> showAirQualityShareSheet(
  BuildContext context, {
  required Measurement measurement,
  required String source,
  String? fallbackLocationName,
  Rect? sharePositionOrigin,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => AirQualityShareSheet(
      measurement: measurement,
      source: source,
      fallbackLocationName: fallbackLocationName,
      sharePositionOrigin: sharePositionOrigin,
    ),
  );
}

/// One entry per share tab — adding a future filter/format is a single line
/// here rather than a new copy-pasted chip + switch branch. [analyticsName]
/// is the stable `tab` property on share_tab_selected and the `format` on
/// share_completed; don't rename shipped values.
enum _ShareTab {
  filter(label: 'Forum filter', analyticsName: 'forum_filter'),
  card(label: 'Card', analyticsName: 'card'),
  sticker(label: 'IG sticker', analyticsName: 'ig_sticker');

  final String label;
  final String analyticsName;

  const _ShareTab({required this.label, required this.analyticsName});
}

class AirQualityShareSheet extends StatefulWidget {
  final Measurement measurement;

  /// Where the sheet was opened from (e.g. 'dashboard', 'forecast') —
  /// reported as the `source` property on share_sheet_opened.
  final String source;
  final String? fallbackLocationName;
  final Rect? sharePositionOrigin;

  /// Injected for tests — defaults to the app-wide
  /// [CleanAirForumSubmissionService.instance] (DIP).
  final CleanAirForumSubmissionService? submissionService;

  const AirQualityShareSheet({
    super.key,
    required this.measurement,
    required this.source,
    this.fallbackLocationName,
    this.sharePositionOrigin,
    this.submissionService,
  });

  @override
  State<AirQualityShareSheet> createState() => _AirQualityShareSheetState();
}

class _AirQualityShareSheetState extends State<AirQualityShareSheet> {
  // The Clean Air Forum is imminent, so lead with the branded filter tab.
  _ShareTab _tab = _ShareTab.filter;

  final GlobalKey _cardKey = GlobalKey();
  final GlobalKey _stickerKey = GlobalKey();

  // Lifted from the filter tab: its subtree is unmounted on tab switch, so
  // the picked selfie and consent choice live here to survive switching.
  File? _selfieFile;
  bool _consentToDisplay = false;

  bool _isSharingCard = false;
  bool _isCopyingSticker = false;
  bool _stickerCopied = false;

  String? _inlineMessage;
  bool _inlineIsError = false;
  String? _inlineActionLabel;
  VoidCallback? _inlineOnAction;
  Timer? _inlineMessageTimer;

  /// Captured while mounted so late results (the background wall
  /// submission) can still surface after the sheet is closed.
  ScaffoldMessengerState? _rootMessenger;

  bool _cafFilterTabTracked = false;

  @override
  void initState() {
    super.initState();
    AnalyticsService().trackShareSheetOpened(source: widget.source);
    if (_tab == _ShareTab.filter) _trackCafFilterTabOpened();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _rootMessenger = ScaffoldMessenger.maybeOf(context);
  }

  /// caf_filter_tab_opened confirms discovery of the forum filter, so it
  /// fires once per sheet open — whether the tab was the default or tapped.
  void _trackCafFilterTabOpened() {
    if (_cafFilterTabTracked) return;
    _cafFilterTabTracked = true;
    AnalyticsService().trackCafFilterTabOpened();
  }

  void _selectTab(_ShareTab tab) {
    if (_tab == tab) return;
    setState(() => _tab = tab);
    AnalyticsService().trackShareTabSelected(tab: tab.analyticsName);
    if (tab == _ShareTab.filter) _trackCafFilterTabOpened();
  }

  @override
  void dispose() {
    _inlineMessageTimer?.cancel();
    super.dispose();
  }

  /// Shows an inline banner rather than a `SnackBar` — this sheet is a
  /// modal route above the app's own Scaffold, so a SnackBar raised via
  /// `ScaffoldMessenger` renders underneath it and is never actually seen.
  ///
  /// If the sheet has already been closed (the background wall submission
  /// can finish after dismissal), the result falls back to a root SnackBar
  /// instead of being silently dropped.
  void _showMessage(
    String message, {
    bool isError = false,
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    if (!mounted) {
      _rootMessenger?.showSnackBar(
        SnackBar(
          content: Text(message),
          action: actionLabel == null || onAction == null
              ? null
              : SnackBarAction(label: actionLabel, onPressed: onAction),
        ),
      );
      return;
    }

    // The banner self-dismisses, so screen-reader users would miss it
    // entirely without an explicit announcement.
    unawaited(SemanticsService.sendAnnouncement(
      View.of(context),
      message,
      Directionality.of(context),
    ));

    _inlineMessageTimer?.cancel();
    setState(() {
      _inlineMessage = message;
      _inlineIsError = isError;
      _inlineActionLabel = actionLabel;
      _inlineOnAction = onAction;
    });
    // Errors and longer messages linger; short confirmations clear fast.
    final duration = Duration(
      milliseconds: (2500 + message.length * 35).clamp(3000, 6500),
    );
    _inlineMessageTimer = Timer(duration, () {
      if (mounted) setState(() => _inlineMessage = null);
    });
  }

  Future<void> _shareCard() async {
    if (_isSharingCard) return;
    setState(() => _isSharingCard = true);

    try {
      final imageBytes = await captureShareBoundary(context, _cardKey);
      if (imageBytes == null) {
        _showMessage("Couldn't share the card. Try again.", isError: true);
        return;
      }

      final result = await AirQualityShareService.shareMeasurementCard(
        imageBytes,
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: widget.sharePositionOrigin,
      );
      if (result.status == ShareResultStatus.success) {
        AnalyticsService().trackShareCompleted(
          format: _ShareTab.card.analyticsName,
          method: 'share_sheet',
        );
      }
    } catch (_) {
      _showMessage("Couldn't share the card. Try again.", isError: true);
    } finally {
      if (mounted) setState(() => _isSharingCard = false);
    }
  }

  /// Copies the sticker straight to the system clipboard so it can be
  /// pasted directly into an Instagram Story (or anywhere else) without
  /// going through the share sheet or saving a file first.
  Future<void> _copySticker() async {
    if (_isCopyingSticker) return;
    setState(() => _isCopyingSticker = true);

    try {
      final imageBytes = await captureShareBoundary(context, _stickerKey);
      if (imageBytes == null) {
        _showMessage("Couldn't copy the sticker. Try again.", isError: true);
        return;
      }

      await Pasteboard.writeImage(imageBytes);

      // writeImage resolves successfully on iOS even when the image failed
      // to decode there (UIPasteboard.general.image just gets set to nil) —
      // read the clipboard back to confirm something was actually written
      // before declaring success.
      final clipboardImage = await Pasteboard.image;
      if (clipboardImage == null || clipboardImage.isEmpty) {
        _showMessage("Couldn't copy the sticker. Try again.", isError: true);
        return;
      }

      AnalyticsService().trackShareCompleted(
        format: _ShareTab.sticker.analyticsName,
        method: 'clipboard_copy',
      );
      _showMessage('Copied! Paste it into your Story.');
      if (mounted) {
        setState(() => _stickerCopied = true);
        Timer(const Duration(seconds: 2), () {
          if (mounted) setState(() => _stickerCopied = false);
        });
      }
    } catch (_) {
      _showMessage("Couldn't copy the sticker. Try again.", isError: true);
    } finally {
      if (mounted) setState(() => _isCopyingSticker = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // showModalBottomSheet does not resize its content for the keyboard on
    // its own — without this, the keyboard simply overlays the bottom of
    // the sheet (hiding the name field) instead of the sheet shrinking to
    // make room above it.
    final keyboardInset = MediaQuery.viewInsetsOf(context).bottom;
    final maxHeight = MediaQuery.sizeOf(context).height * 0.92;
    // Extend the sheet's own background flush to the bottom of the screen
    // (per request) instead of leaving a transparent gap below it — the
    // safe-area inset is folded into the *content's* bottom padding instead.
    final bottomSafeArea = MediaQuery.paddingOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: keyboardInset),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AppSurfaceColors.sheet(context),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(LearnDesignTokens.sheetTopRadius),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LearnDesignTokens.dragHandle(context),
              // `Flexible` (not `Expanded`) so short tabs (Card, Sticker)
              // hug their content instead of stretching, while tall content
              // (Filter tab + keyboard open) is properly bounded and
              // becomes scrollable rather than overflowing past the sheet.
              Flexible(
                child: SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(20, 0, 20, 24 + bottomSafeArea),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Share',
                          style: LearnDesignTokens.completionTitle(context)),
                      const SizedBox(height: 4),
                      Text(
                        _subtitleForTab(_tab),
                        style: LearnDesignTokens.completionSubtitle(context),
                      ),
                      const SizedBox(height: 12),
                      _buildTabSelector(),
                      if (_inlineMessage != null) ...[
                        const SizedBox(height: 12),
                        InlineMessageBanner(
                          message: _inlineMessage!,
                          isError: _inlineIsError,
                          actionLabel: _inlineActionLabel,
                          onAction: _inlineOnAction == null
                              ? null
                              : () {
                                  final action = _inlineOnAction!;
                                  setState(() => _inlineMessage = null);
                                  action();
                                },
                        ),
                      ],
                      const SizedBox(height: 20),
                      _buildTabContent(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _subtitleForTab(_ShareTab tab) {
    switch (tab) {
      case _ShareTab.filter:
        return 'Add a selfie for a Clean Air Forum branded filter.';
      case _ShareTab.card:
        return 'Preview the card before sending it.';
      case _ShareTab.sticker:
        return 'A transparent sticker for your Instagram Story.';
    }
  }

  Widget _buildTabSelector() {
    return Row(
      children: [
        for (final tab in _ShareTab.values) ...[
          if (tab != _ShareTab.values.first) const SizedBox(width: 8),
          Expanded(
            child: ShareTabChip(
              label: tab.label,
              selected: _tab == tab,
              onTap: () => _selectTab(tab),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTabContent() {
    switch (_tab) {
      case _ShareTab.filter:
        return CleanAirForumFilterTab(
          measurement: widget.measurement,
          fallbackLocationName: widget.fallbackLocationName,
          sharePositionOrigin: widget.sharePositionOrigin,
          analyticsFormat: _ShareTab.filter.analyticsName,
          selfieFile: _selfieFile,
          onSelfieChanged: (file) => setState(() => _selfieFile = file),
          consentToDisplay: _consentToDisplay,
          onConsentChanged: (value) =>
              setState(() => _consentToDisplay = value),
          onMessage: _showMessage,
          submissionService: widget.submissionService,
        );
      case _ShareTab.card:
        return _buildCardTab();
      case _ShareTab.sticker:
        return _buildStickerTab();
    }
  }

  Widget _buildCardTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RepaintBoundary(
          key: _cardKey,
          child: AirQualityShareCard(
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
          ),
        ),
        const SizedBox(height: 16),
        ShareActionButton(
          label: _isSharingCard ? 'Preparing card...' : 'Share card',
          loading: _isSharingCard,
          onPressed: _isSharingCard ? null : _shareCard,
        ),
      ],
    );
  }

  Widget _buildStickerTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        CheckerboardBackground(
          borderRadius: 26,
          child: RepaintBoundary(
            key: _stickerKey,
            child: CleanAirForumStickerFrame(
              measurement: widget.measurement,
              fallbackLocationName: widget.fallbackLocationName,
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Copy it and paste it straight into your Instagram Story or any photo.',
          textAlign: TextAlign.center,
          style: LearnDesignTokens.completionCaption(context),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _isCopyingSticker ? null : _copySticker,
          style: _stickerCopied
              ? ElevatedButton.styleFrom(
                  backgroundColor: LearnDesignTokens.success,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 48),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(learnPrimaryButtonRadius),
                  ),
                  textStyle: learnPrimaryButtonTextStyle,
                )
              : learnExposurePrimaryButtonStyle(enabled: !_isCopyingSticker),
          icon: _isCopyingSticker
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : SvgPicture.asset(
                  _stickerCopied
                      ? 'assets/icons/check-circle.svg'
                      : 'assets/icons/copy.svg',
                  width: 18,
                  height: 18,
                  colorFilter:
                      const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                ),
          label: Text(
            _isCopyingSticker
                ? 'Copying...'
                : _stickerCopied
                    ? 'Copied!'
                    : 'Copy sticker',
          ),
        ),
      ],
    );
  }
}
