import 'dart:async';
import 'dart:io';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/clean_air_forum_branding.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_camera_screen.dart';
import 'package:airqo/src/app/dashboard/widgets/clean_air_forum_filter_card.dart';
import 'package:airqo/src/app/dashboard/widgets/share_sheet_widgets.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/shared/services/clean_air_forum_submission_service.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/widgets/custom_switch.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';

enum _SelfieSource { liveCamera, gallery }

/// The "Selfie filter" tab of the share sheet: selfie acquisition (live
/// camera or gallery), filter preview, save/share actions, and the opt-in
/// submission to the conference wall display (when enabled).
///
/// The selfie, consent, and scrim color values are lifted to the parent
/// sheet — this widget is unmounted when the user switches share tabs, so
/// holding them here would lose them on every switch.
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
  final FilterScrimColor scrimColor;
  final ValueChanged<FilterScrimColor> onScrimColorChanged;

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
    required this.scrimColor,
    required this.onScrimColorChanged,
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
  bool _isSavingFilter = false;
  bool _isSharingFilter = false;
  bool _isSendingToWall = false;
  DateTime? _capturedAt;

  bool get _conferenceWallEnabled =>
      FeatureFlagService.instance.isEnabled(AppFeatureFlag.conferenceWall);

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
      if (_conferenceWallEnabled && widget.consentToDisplay) {
        unawaited(_submitCurrentSelfieToWall());
      }
    } on PlatformException catch (e) {
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
                      subtitle: 'See the overlay while you frame your shot',
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
            scrimColor: widget.scrimColor,
          ),
        ),
      );
      if (file != null && mounted) {
        widget.onSelfieChanged(file);
        AnalyticsService().trackCafSelfieCaptured();
        if (_conferenceWallEnabled && widget.consentToDisplay) {
          unawaited(_submitCurrentSelfieToWall());
        }
      }
    } catch (_) {
      widget.onMessage("Couldn't open the camera.", isError: true);
    } finally {
      if (mounted) setState(() => _isPickingSelfie = false);
    }
  }

  Future<Uint8List?> _captureFilterImage() async {
    final capturedAt = DateTime.now();
    setState(() => _capturedAt = capturedAt);
    await WidgetsBinding.instance.endOfFrame;
    if (!mounted) return null;
    return captureShareBoundary(context, _filterKey);
  }

  Future<void> _saveFilter() async {
    if (_isSavingFilter || widget.selfieFile == null) return;
    setState(() => _isSavingFilter = true);

    try {
      final imageBytes = await _captureFilterImage();
      if (imageBytes == null) {
        widget.onMessage("Couldn't save the filter. Try again.", isError: true);
        return;
      }

      await AirQualityShareService.saveFilterToGallery(imageBytes);
      widget.onMessage('Saved to your photos!');
    } on GallerySaveException catch (e) {
      if (e.kind == GallerySaveFailure.permissionDenied) {
        widget.onMessage(
          'Photo library access is off.',
          isError: true,
          actionLabel: 'Settings',
          onAction: openAppSettings,
        );
      } else {
        widget.onMessage("Couldn't save the filter. Try again.", isError: true);
      }
    } catch (_) {
      widget.onMessage("Couldn't save the filter. Try again.", isError: true);
    } finally {
      if (mounted) setState(() => _isSavingFilter = false);
    }
  }

  Future<void> _shareFilter() async {
    if (_isSharingFilter || widget.selfieFile == null) return;
    setState(() => _isSharingFilter = true);

    try {
      final imageBytes = await _captureFilterImage();
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

  Future<void> _submitCurrentSelfieToWall() async {
    if (!_conferenceWallEnabled) return;
    if (widget.selfieFile == null) return;
    if (_isSendingToWall) return;
    final imageBytes = await _captureFilterImage();
    if (imageBytes == null) {
      widget.onMessage("Couldn't prepare the filter. Try again.",
          isError: true);
      return;
    }
    await _submitToConferenceWall(imageBytes);
  }

  Future<void> _submitToConferenceWall(Uint8List imageBytes) async {
    if (_isSendingToWall) return;
    _isSendingToWall = true;
    widget.onMessage('Sending to the wall…', loading: true);
    try {
      await _submissionService.submitSelfie(
        imageBytes: imageBytes,
        measurement: widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
      );
      AnalyticsService().trackCafWallSubmissionSent();
      widget.onMessage("You're on the conference wall!");
    } catch (e) {
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
    final isBusy = _isSavingFilter || _isSharingFilter;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RepaintBoundary(
          key: _filterKey,
          child: CleanAirForumFilterCard(
            selfieFile: widget.selfieFile,
            measurement: widget.measurement,
            fallbackLocationName: widget.fallbackLocationName,
            scrimColor: widget.scrimColor,
            capturedAt: _capturedAt,
          ),
        ),
        const SizedBox(height: 12),
        FilterScrimColorPicker(
          selected: widget.scrimColor,
          onSelected: widget.onScrimColorChanged,
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
          if (_conferenceWallEnabled) ...[
            const SizedBox(height: 12),
            _buildConsentSection(),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ShareActionButton(
                  label: _isSavingFilter ? 'Saving...' : 'Save to photos',
                  loading: _isSavingFilter,
                  onPressed: isBusy ? null : _saveFilter,
                  icon: SvgPicture.asset(
                    'assets/icons/download-01.svg',
                    width: 18,
                    height: 18,
                    colorFilter:
                        const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: isBusy ? null : _shareFilter,
                  style: learnExposureSecondaryButtonStyle(context),
                  icon: _isSharingFilter
                      ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: LearnDesignTokens.headline(context),
                          ),
                        )
                      : SvgPicture.asset(
                          'assets/icons/share-icon.svg',
                          width: 18,
                          height: 18,
                          colorFilter: ColorFilter.mode(
                            LearnDesignTokens.headline(context),
                            BlendMode.srcIn,
                          ),
                        ),
                  label: Text(
                    _isSharingFilter ? 'Preparing...' : 'Share',
                  ),
                ),
              ),
            ],
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
                'Shown live on the conference wall display.',
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
