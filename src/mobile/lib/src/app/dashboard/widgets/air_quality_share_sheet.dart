import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_card.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_camera_screen.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_filter_card.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_sticker_frame.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/app/shared/services/clean_air_forum_submission_service.dart';
import 'package:airqo/src/app/shared/widgets/custom_switch.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pasteboard/pasteboard.dart';

Future<void> showAirQualityShareSheet(
  BuildContext context, {
  required Measurement measurement,
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
      fallbackLocationName: fallbackLocationName,
      sharePositionOrigin: sharePositionOrigin,
    ),
  );
}

enum _ShareTab { filter, card, sticker }

enum _SelfieSource { liveCamera, gallery }

/// Describes one share tab so adding a future filter/format is a single
/// entry here rather than a new copy-pasted chip + switch branch.
class _ShareTabSpec {
  final _ShareTab tab;
  final String label;

  const _ShareTabSpec({required this.tab, required this.label});
}

const List<_ShareTabSpec> _shareTabSpecs = [
  _ShareTabSpec(tab: _ShareTab.filter, label: 'Forum filter'),
  _ShareTabSpec(tab: _ShareTab.card, label: 'Card'),
  _ShareTabSpec(tab: _ShareTab.sticker, label: 'IG sticker'),
];

class AirQualityShareSheet extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  final Rect? sharePositionOrigin;

  const AirQualityShareSheet({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
    this.sharePositionOrigin,
  });

  @override
  State<AirQualityShareSheet> createState() => _AirQualityShareSheetState();
}

class _AirQualityShareSheetState extends State<AirQualityShareSheet> {
  // The Clean Air Forum is imminent, so lead with the branded filter tab.
  _ShareTab _tab = _ShareTab.filter;

  final GlobalKey _cardKey = GlobalKey();
  final GlobalKey _filterKey = GlobalKey();
  final GlobalKey _stickerKey = GlobalKey();

  final ImagePicker _picker = ImagePicker();

  File? _selfieFile;
  bool _consentToDisplay = false;

  bool _isPickingSelfie = false;
  bool _isSharingCard = false;
  bool _isSharingFilter = false;
  bool _isCopyingSticker = false;
  bool _stickerCopied = false;

  String? _inlineMessage;
  Timer? _inlineMessageTimer;

  @override
  void dispose() {
    _inlineMessageTimer?.cancel();
    super.dispose();
  }

  Future<Uint8List?> _captureBoundary(GlobalKey key) async {
    final pixelRatio =
        MediaQuery.of(context).devicePixelRatio.clamp(2.0, 3.0).toDouble();

    await Future<void>.delayed(const Duration(milliseconds: 16));

    final boundary =
        key.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary == null) return null;

    final image = await boundary.toImage(pixelRatio: pixelRatio);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);

    return byteData?.buffer.asUint8List();
  }

  /// Shows an inline banner rather than a `SnackBar` — this sheet is a
  /// modal route above the app's own Scaffold, so a SnackBar raised via
  /// `ScaffoldMessenger` renders underneath it and is never actually seen.
  void _showMessage(String message) {
    if (!mounted) return;
    _inlineMessageTimer?.cancel();
    setState(() => _inlineMessage = message);
    _inlineMessageTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _inlineMessage = null);
    });
  }

  Future<void> _shareCard() async {
    if (_isSharingCard) return;
    setState(() => _isSharingCard = true);

    try {
      final imageBytes = await _captureBoundary(_cardKey);
      if (imageBytes == null) {
        _showMessage('Could not prepare the share card. Please try again.');
        return;
      }

      await AirQualityShareService.shareMeasurementCard(
        imageBytes,
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: widget.sharePositionOrigin,
      );
    } catch (_) {
      _showMessage('Could not share the card. Please try again.');
    } finally {
      if (mounted) setState(() => _isSharingCard = false);
    }
  }

  Future<void> _pickSelfie(ImageSource source) async {
    if (_isPickingSelfie) return;
    setState(() => _isPickingSelfie = true);

    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1440,
        imageQuality: 90,
        preferredCameraDevice: CameraDevice.front,
      );
      if (picked == null) return;

      setState(() => _selfieFile = File(picked.path));
    } catch (_) {
      _showMessage('Could not access the camera/gallery. Please try again.');
    } finally {
      if (mounted) setState(() => _isPickingSelfie = false);
    }
  }

  Future<void> _showSelfieSourceSheet() async {
    final choice = await showModalBottomSheet<_SelfieSource>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        // Same flush-to-bottom treatment as the main sheet — fold the
        // safe-area inset into the content's own padding rather than
        // leaving a transparent gap below the sheet.
        final bottomSafeArea = MediaQuery.paddingOf(sheetContext).bottom;

        return DecoratedBox(
          decoration: BoxDecoration(
            color: AppSurfaceColors.sheet(sheetContext),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(LearnDesignTokens.sheetTopRadius),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LearnDesignTokens.dragHandle(sheetContext),
              Padding(
                padding: EdgeInsets.only(bottom: 8 + bottomSafeArea),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _SelfieSourceTile(
                      iconAsset: 'assets/icons/camera.svg',
                      title: 'Take photo',
                      subtitle: 'See the branding while you frame your shot',
                      onTap: () => Navigator.of(sheetContext)
                          .pop(_SelfieSource.liveCamera),
                    ),
                    _SelfieSourceTile(
                      iconAsset: 'assets/icons/gallery.svg',
                      title: 'Choose from gallery',
                      onTap: () =>
                          Navigator.of(sheetContext).pop(_SelfieSource.gallery),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );

    switch (choice) {
      case _SelfieSource.liveCamera:
        await _openLiveCamera();
        break;
      case _SelfieSource.gallery:
        await _pickSelfie(ImageSource.gallery);
        break;
      case null:
        break;
    }
  }

  Future<void> _openLiveCamera() async {
    if (_isPickingSelfie) return;
    setState(() => _isPickingSelfie = true);

    try {
      final file = await Navigator.of(context).push<File>(
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => CleanAirForumCameraScreen(
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
          ),
        ),
      );
      if (file != null) {
        setState(() => _selfieFile = file);
      }
    } catch (_) {
      _showMessage('Could not open the live camera. Please try again.');
    } finally {
      if (mounted) setState(() => _isPickingSelfie = false);
    }
  }

  Future<void> _shareFilter() async {
    if (_isSharingFilter || _selfieFile == null) return;
    setState(() => _isSharingFilter = true);

    try {
      final imageBytes = await _captureBoundary(_filterKey);
      if (imageBytes == null) {
        _showMessage('Could not prepare the filter. Please try again.');
        return;
      }

      await AirQualityShareService.shareCleanAirForumFilter(
        imageBytes,
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: widget.sharePositionOrigin,
      );

      if (_consentToDisplay) {
        unawaited(_submitToConferenceWall(imageBytes));
      }
    } catch (_) {
      _showMessage('Could not share the filter. Please try again.');
    } finally {
      if (mounted) setState(() => _isSharingFilter = false);
    }
  }

  Future<void> _submitToConferenceWall(Uint8List imageBytes) async {
    try {
      await CleanAirForumSubmissionService.instance.submitSelfie(
        imageBytes: imageBytes,
        measurement: widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
      );
      _showMessage('Sent to the Clean Air Forum screen!');
    } catch (_) {
      _showMessage(
        'Your photo shared fine, but sending it to the conference screen '
        "didn't work. Please try again.",
      );
    }
  }

  /// Copies the sticker straight to the system clipboard so it can be
  /// pasted directly into an Instagram Story (or anywhere else) without
  /// going through the share sheet or saving a file first.
  Future<void> _copySticker() async {
    if (_isCopyingSticker) return;
    setState(() => _isCopyingSticker = true);

    try {
      final imageBytes = await _captureBoundary(_stickerKey);
      if (imageBytes == null) {
        _showMessage('Could not prepare the sticker. Please try again.');
        return;
      }

      await Pasteboard.writeImage(imageBytes);
      _showMessage('Copied! Paste it into your Instagram Story.');
      if (mounted) {
        setState(() => _stickerCopied = true);
        Timer(const Duration(seconds: 2), () {
          if (mounted) setState(() => _stickerCopied = false);
        });
      }
    } catch (_) {
      _showMessage('Could not copy the sticker. Please try again.');
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
                        _InlineMessageBanner(message: _inlineMessage!),
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
        for (final spec in _shareTabSpecs) ...[
          if (spec != _shareTabSpecs.first) const SizedBox(width: 8),
          Expanded(
            child: _TabChip(
              label: spec.label,
              selected: _tab == spec.tab,
              onTap: () => setState(() => _tab = spec.tab),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTabContent() {
    switch (_tab) {
      case _ShareTab.filter:
        return _buildFilterTab();
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
        _ShareButton(
          label: _isSharingCard ? 'Preparing card...' : 'Share card',
          loading: _isSharingCard,
          onPressed: _isSharingCard ? null : _shareCard,
        ),
      ],
    );
  }

  Widget _buildFilterTab() {
    final hasSelfie = _selfieFile != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // The template is always visible — even before a selfie is picked —
        // so it stays previewable while switching between share tabs. Full
        // width (no artificial max-width cap) so it matches the Card tab's
        // size for a consistent look across all three share formats.
        RepaintBoundary(
          key: _filterKey,
          child: CleanAirForumFilterCard(
            selfieFile: _selfieFile,
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
          ),
        ),
        const SizedBox(height: 16),
        if (hasSelfie)
          OutlinedButton.icon(
            onPressed: _isPickingSelfie ? null : _showSelfieSourceSheet,
            style: learnExposureSecondaryButtonStyle(context),
            icon: SvgPicture.asset(
              'assets/icons/camera.svg',
              width: 18,
              height: 18,
              colorFilter: ColorFilter.mode(
                LearnDesignTokens.headline(context),
                BlendMode.srcIn,
              ),
            ),
            label: const Text('Change photo'),
          )
        else
          ElevatedButton.icon(
            onPressed: _isPickingSelfie ? null : _showSelfieSourceSheet,
            style: learnExposurePrimaryButtonStyle(enabled: !_isPickingSelfie),
            icon: _isPickingSelfie
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : SvgPicture.asset(
                    'assets/icons/camera.svg',
                    width: 18,
                    height: 18,
                    colorFilter: ColorFilter.mode(
                      _isPickingSelfie
                          ? AppColors.boldHeadlineColor3
                          : Colors.white,
                      BlendMode.srcIn,
                    ),
                  ),
            label: const Text('Take selfie'),
          ),
        if (hasSelfie) ...[
          const SizedBox(height: 12),
          _buildConsentSection(),
          const SizedBox(height: 16),
          _ShareButton(
            label: _isSharingFilter ? 'Preparing filter...' : 'Share filter',
            loading: _isSharingFilter,
            onPressed: _isSharingFilter ? null : _shareFilter,
          ),
        ],
      ],
    );
  }

  Widget _buildConsentSection() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Display my photo on the conference screen',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: LearnDesignTokens.headline(context),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Shown live on the Clean Air Forum wall display.',
                style: LearnDesignTokens.completionCaption(context),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        CustomSwitch(
          value: _consentToDisplay,
          onChanged: (value) => setState(() => _consentToDisplay = value),
        ),
      ],
    );
  }

  Widget _buildStickerTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _CheckerboardBackground(
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

class _InlineMessageBanner extends StatelessWidget {
  final String message;

  const _InlineMessageBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: LearnDesignTokens.nestedSurface(context),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Text(
          message,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: LearnDesignTokens.headline(context),
          ),
        ),
      ),
    );
  }
}

class _SelfieSourceTile extends StatelessWidget {
  final String iconAsset;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _SelfieSourceTile({
    required this.iconAsset,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: LearnDesignTokens.iconBg(context),
        child: SvgPicture.asset(
          iconAsset,
          width: 20,
          height: 20,
          colorFilter: ColorFilter.mode(
            LearnDesignTokens.headline(context),
            BlendMode.srcIn,
          ),
        ),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: LearnDesignTokens.headline(context),
        ),
      ),
      subtitle: subtitle == null
          ? null
          : Text(subtitle!,
              style: LearnDesignTokens.completionCaption(context)),
    );
  }
}

/// Matches the pill-shaped view/country selector used on the dashboard, map,
/// and learn tab (see `ViewSelector._buildViewButton`).
class _TabChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TabChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primaryColor
              : (isDark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight),
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: selected
                ? Colors.white
                : (isDark ? Colors.white : Colors.black87),
          ),
        ),
      ),
    );
  }
}

class _ShareButton extends StatelessWidget {
  final String label;
  final bool loading;
  final VoidCallback? onPressed;

  const _ShareButton({
    required this.label,
    required this.loading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: learnExposurePrimaryButtonStyle(enabled: onPressed != null),
      icon: loading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : SvgPicture.asset(
              'assets/icons/share-icon.svg',
              width: 18,
              height: 18,
              colorFilter:
                  const ColorFilter.mode(Colors.white, BlendMode.srcIn),
            ),
      label: Text(label),
    );
  }
}

/// Simple checkerboard backdrop shown only in-app (not part of the captured
/// image) so users can see the sticker preview really is transparent.
class _CheckerboardBackground extends StatelessWidget {
  final Widget child;
  final double borderRadius;

  const _CheckerboardBackground({required this.child, this.borderRadius = 0});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: CustomPaint(
        painter: _CheckerboardPainter(),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );
  }
}

class _CheckerboardPainter extends CustomPainter {
  static const double _tile = 10;

  @override
  void paint(Canvas canvas, Size size) {
    final light = Paint()..color = const Color(0xFFEDEDED);
    final dark = Paint()..color = const Color(0xFFD8D8D8);

    canvas.drawRect(Offset.zero & size, light);

    for (double y = 0; y < size.height; y += _tile) {
      for (double x = 0; x < size.width; x += _tile) {
        final isDark = ((x / _tile).floor() + (y / _tile).floor()) % 2 == 0;
        if (isDark) {
          canvas.drawRect(Rect.fromLTWH(x, y, _tile, _tile), dark);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
