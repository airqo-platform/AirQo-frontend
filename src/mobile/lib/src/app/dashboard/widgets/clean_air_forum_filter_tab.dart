import 'dart:async';
import 'dart:io';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_camera_screen.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_filter_card.dart';
import 'package:airqo/src/app/dashboard/widgets/share_sheet_widgets.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/clean_air_forum_submission_service.dart';
import 'package:airqo/src/app/shared/widgets/custom_switch.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';

enum _SelfieSource { liveCamera, gallery }

/// The "Forum filter" tab of the share sheet: selfie acquisition (live
/// camera or gallery), branded filter preview, the share action, and the
/// opt-in submission to the conference wall display.
///
/// The selfie and consent values are lifted to the parent sheet — this
/// widget is unmounted when the user switches share tabs, so holding them
/// here would lose them on every switch.
class CleanAirForumFilterTab extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  final Rect? sharePositionOrigin;

  /// Stable `format` value reported on share_completed; owned by the parent
  /// sheet's tab definitions so all tabs stay consistent.
  final String analyticsFormat;

  final File? selfieFile;
  final ValueChanged<File> onSelfieChanged;
  final bool consentToDisplay;
  final ValueChanged<bool> onConsentChanged;

  /// Surfaces status/error text in the sheet's inline banner.
  final ShareSheetMessenger onMessage;

  /// Injected for tests — defaults to the app-wide
  /// [CleanAirForumSubmissionService.instance] (DIP).
  final CleanAirForumSubmissionService? submissionService;

  const CleanAirForumFilterTab({
    super.key,
    required this.measurement,
    required this.analyticsFormat,
    required this.selfieFile,
    required this.onSelfieChanged,
    required this.consentToDisplay,
    required this.onConsentChanged,
    required this.onMessage,
    this.fallbackLocationName,
    this.sharePositionOrigin,
    this.submissionService,
  });

  @override
  State<CleanAirForumFilterTab> createState() => _CleanAirForumFilterTabState();
}

class _CleanAirForumFilterTabState extends State<CleanAirForumFilterTab> {
  final GlobalKey _filterKey = GlobalKey();
  final ImagePicker _picker = ImagePicker();

  bool _isPickingSelfie = false;
  bool _isSharingFilter = false;
  bool _isSendingToWall = false;

  CleanAirForumSubmissionService get _submissionService =>
      widget.submissionService ?? CleanAirForumSubmissionService.instance;

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
      if (!mounted) return;

      widget.onSelfieChanged(File(picked.path));
      if (widget.consentToDisplay) unawaited(_submitCurrentSelfieToWall());
    } on PlatformException catch (e) {
      // "Try again" is wrong advice when access is denied — the fix lives
      // in system settings, so link straight there.
      if (e.code.contains('denied')) {
        widget.onMessage(
          source == ImageSource.camera
              ? 'Camera access is off.'
              : 'Photo access is off.',
          isError: true,
          actionLabel: 'Settings',
          onAction: openAppSettings,
        );
      } else {
        widget.onMessage(
          source == ImageSource.camera
              ? "Couldn't open the camera."
              : "Couldn't open the gallery.",
          isError: true,
        );
      }
    } catch (_) {
      widget.onMessage(
        source == ImageSource.camera
            ? "Couldn't open the camera."
            : "Couldn't open the gallery.",
        isError: true,
      );
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
        AnalyticsService().trackCafSelfieSourceSelected(source: 'live_camera');
        await _openLiveCamera();
        break;
      case _SelfieSource.gallery:
        AnalyticsService().trackCafSelfieSourceSelected(source: 'gallery');
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
          settings: const RouteSettings(name: 'clean_air_forum_camera'),
          fullscreenDialog: true,
          builder: (_) => CleanAirForumCameraScreen(
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
          ),
        ),
      );
      if (file != null && mounted) {
        widget.onSelfieChanged(file);
        AnalyticsService().trackCafSelfieCaptured();
        if (widget.consentToDisplay) unawaited(_submitCurrentSelfieToWall());
      }
    } catch (_) {
      widget.onMessage("Couldn't open the camera.", isError: true);
    } finally {
      if (mounted) setState(() => _isPickingSelfie = false);
    }
  }

  Future<void> _shareFilter() async {
    if (_isSharingFilter || widget.selfieFile == null) return;
    setState(() => _isSharingFilter = true);

    try {
      final imageBytes = await captureShareBoundary(context, _filterKey);
      if (imageBytes == null) {
        widget.onMessage("Couldn't share the filter. Try again.",
            isError: true);
        return;
      }

      final result = await AirQualityShareService.shareCleanAirForumFilter(
        imageBytes,
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: widget.sharePositionOrigin,
      );
      if (result.status == ShareResultStatus.success) {
        AnalyticsService().trackCafFilterShared();
        AnalyticsService().trackShareCompleted(
          format: widget.analyticsFormat,
          method: 'share_sheet',
        );
      }
    } catch (_) {
      widget.onMessage("Couldn't share the filter. Try again.", isError: true);
    } finally {
      if (mounted) setState(() => _isSharingFilter = false);
    }
  }

  /// Captures the current filter card and sends it to the wall — triggered
  /// the moment consent is given (or a new/changed photo is picked while
  /// already consented), rather than being bundled into the personal
  /// "Share" action. Piggybacking on share made consent look like it should
  /// be enough on its own, but nothing was actually sent to the wall until
  /// the user *also* shared the filter externally.
  Future<void> _submitCurrentSelfieToWall() async {
    if (widget.selfieFile == null) return;
    if (_isSendingToWall) return;
    final imageBytes = await captureShareBoundary(context, _filterKey);
    if (imageBytes == null) {
      widget.onMessage("Couldn't prepare the filter. Try again.",
          isError: true);
      return;
    }
    await _submitToConferenceWall(imageBytes);
  }

  Future<void> _submitToConferenceWall(Uint8List imageBytes) async {
    // Retry (which can fire from the root SnackBar even after dismissal)
    // and repeated shares must not enqueue duplicate wall submissions.
    // Not rendered directly — the sheet's inline banner (via onMessage's
    // `loading: true`) is the only visible sign of progress now.
    if (_isSendingToWall) return;
    _isSendingToWall = true;
    widget.onMessage('Sending to the wall…', loading: true);
    try {
      // The API's displayName can be the user's email when they're logged
      // in — never surface it here, since the wall itself hides identity.
      await _submissionService.submitSelfie(
        imageBytes: imageBytes,
        measurement: widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
      );
      AnalyticsService().trackCafWallSubmissionSent();
      widget.onMessage("You're on the forum wall!");
    } catch (e) {
      // Report only the failure category — raw messages can carry API
      // response details that don't belong in analytics.
      AnalyticsService().trackCafWallSubmissionFailed(
        error: e is SelfieSubmissionException
            ? e.kind.name
            : e.runtimeType.toString(),
      );
      widget.onMessage(
        _wallFailureMessage(e),
        isError: true,
        actionLabel: 'Retry',
        onAction: () => _submitToConferenceWall(imageBytes),
      );
    } finally {
      _isSendingToWall = false;
    }
  }

  String _wallFailureMessage(Object e) {
    if (e is SelfieSubmissionException) {
      switch (e.kind) {
        case SelfieSubmissionFailure.offline:
          return "You're offline — couldn't reach the wall.";
        case SelfieSubmissionFailure.timeout:
          return "Slow connection — couldn't reach the wall.";
        case SelfieSubmissionFailure.server:
          break;
      }
    }
    return "Couldn't send to the wall.";
  }

  @override
  Widget build(BuildContext context) {
    final hasSelfie = widget.selfieFile != null;

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
            selfieFile: widget.selfieFile,
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
          ShareActionButton(
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
          value: widget.consentToDisplay,
          onChanged: (value) {
            widget.onConsentChanged(value);
            if (value) {
              AnalyticsService().trackCafWallConsentGiven();
              unawaited(_submitCurrentSelfieToWall());
            }
          },
        ),
      ],
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
