import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

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
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
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
  final ValueChanged<String> onMessage;

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
    } catch (_) {
      widget.onMessage('Could not access the camera/gallery. Please try again.');
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
      }
    } catch (_) {
      widget.onMessage('Could not open the live camera. Please try again.');
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
        widget.onMessage('Could not prepare the filter. Please try again.');
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

      if (widget.consentToDisplay) {
        unawaited(_submitToConferenceWall(imageBytes));
      }
    } catch (_) {
      widget.onMessage('Could not share the filter. Please try again.');
    } finally {
      if (mounted) setState(() => _isSharingFilter = false);
    }
  }

  Future<void> _submitToConferenceWall(Uint8List imageBytes) async {
    try {
      await _submissionService.submitSelfie(
        imageBytes: imageBytes,
        measurement: widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
      );
      AnalyticsService().trackCafWallSubmissionSent();
      widget.onMessage('Sent to the Clean Air Forum screen!');
    } catch (e) {
      // Report only the exception type — raw messages can carry API
      // response details that don't belong in analytics.
      AnalyticsService()
          .trackCafWallSubmissionFailed(error: e.runtimeType.toString());
      widget.onMessage(
        'Your photo shared fine, but sending it to the conference screen '
        "didn't work. Please try again.",
      );
    }
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
            if (value) AnalyticsService().trackCafWallConsentGiven();
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
