import 'dart:async';

import 'package:airqo/src/app/exposure/widgets/exposure_launch_pixel_scene.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';
import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

/// One shell's claim on the home forecast tour.
///
/// Login can replace [NavPage] while the previous shell is still starting.
/// Each shell keeps its own hold so the old one cannot open the new gate.
class HomeTourHold {
  final Completer<void> _done = Completer<void>();

  Future<void> get future => _done.future;

  bool get isCompleted => _done.isCompleted;

  void release() {
    if (!_done.isCompleted) _done.complete();
  }
}

/// One-time launch announcement for the Exposure tab (per app version).
class ExposureLaunchAnnouncement {
  /// The hold the current shell created. The home tour waits on this one.
  static HomeTourHold? _activeHold;

  static Future<void> get homeTourGate {
    final hold = _activeHold;
    if (hold == null || hold.isCompleted) return Future<void>.value();
    return hold.future;
  }

  /// Call before the first frame of the shell that shows both prompts.
  static HomeTourHold holdHomeTour() {
    final hold = HomeTourHold();
    _activeHold = hold;
    return hold;
  }

  static void releaseHomeTour([HomeTourHold? hold]) {
    (hold ?? _activeHold)?.release();
  }

  static Future<String> _preferenceKey() async {
    final info = await PackageInfo.fromPlatform();
    return 'exposure_launch_modal_seen_${info.version}_v7';
  }

  static Future<void> showIfNeeded(
    BuildContext context, {
    required bool exposureEnabled,
    required String primaryLabel,
    required VoidCallback onPrimary,
    HomeTourHold? hold,
  }) async {
    try {
      if (!exposureEnabled) return;

      final prefs = await SharedPreferences.getInstance();
      final key = await _preferenceKey();
      if (prefs.getBool(key) == true) return;
      await prefs.setBool(key, true);
      if (!context.mounted) return;

      unawaited(AnalyticsService().trackExposureLaunchAnnouncementShown());

      var handledByButton = false;
      final sheetLeft = Completer<void>();
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        useRootNavigator: true,
        barrierColor: Colors.black.withValues(alpha: 0.55),
        backgroundColor: Colors.transparent,
        builder: (sheetContext) {
          _completeWhenSheetLeaves(sheetContext, sheetLeft);
          return _ExposureLaunchSheet(
            primaryLabel: primaryLabel,
            onPrimary: () {
              handledByButton = true;
              unawaited(
                AnalyticsService().trackExposureLaunchAnnouncementExplored(),
              );
              Navigator.of(sheetContext).pop();
              onPrimary();
            },
            onDismiss: () {
              handledByButton = true;
              unawaited(
                AnalyticsService().trackExposureLaunchAnnouncementDismissed(
                  source: 'maybe_later',
                ),
              );
              Navigator.of(sheetContext).pop();
            },
          );
        },
      );
      if (!sheetLeft.isCompleted) await sheetLeft.future;

      if (!handledByButton) {
        // Drag-down / barrier dismiss — not Explore or Maybe later.
        unawaited(
          AnalyticsService().trackExposureLaunchAnnouncementDismissed(
            source: 'sheet_dismiss',
          ),
        );
      }
    } finally {
      releaseHomeTour(hold);
    }
  }

  /// The sheet future completes when pop starts, while the route is still
  /// painting its way out. The home tour uses that same root overlay.
  static void _completeWhenSheetLeaves(
    BuildContext context,
    Completer<void> done,
  ) {
    void finish() {
      if (!done.isCompleted) done.complete();
    }

    final animation = ModalRoute.of(context)?.animation;
    if (animation == null) {
      finish();
      return;
    }
    // The route starts dismissed, then plays in. Only a dismissal after
    // that opening counts as the sheet leaving the overlay.
    var opened = animation.status == AnimationStatus.forward ||
        animation.status == AnimationStatus.completed;
    animation.addStatusListener((status) {
      if (status == AnimationStatus.forward ||
          status == AnimationStatus.completed) {
        opened = true;
      }
      if (opened && status == AnimationStatus.dismissed) finish();
    });
  }
}

class _CarouselSlide {
  const _CarouselSlide({
    required this.icon,
    required this.title,
    required this.body,
  });

  final Widget icon;
  final String title;
  final String body;
}

class _ExposureLaunchSheet extends StatefulWidget {
  const _ExposureLaunchSheet({
    required this.primaryLabel,
    required this.onPrimary,
    required this.onDismiss,
  });

  final String primaryLabel;
  final VoidCallback onPrimary;
  final VoidCallback onDismiss;

  @override
  State<_ExposureLaunchSheet> createState() => _ExposureLaunchSheetState();
}

class _ExposureLaunchSheetState extends State<_ExposureLaunchSheet> {
  final PageController _pageController = PageController();
  int _page = 0;
  Timer? _autoAdvance;
  bool _userHasSwiped = false;

  static const _slides = <_CarouselSlide>[
    _CarouselSlide(
      icon: AqRoute(size: 20, color: Color(0xff145FFF)),
      title: 'Walks, runs and the road',
      body:
          'See the air on your everyday hustle — the boda weave, the matatu crush, the danfo, the taxi, the dusty stretch home.',
    ),
    _CarouselSlide(
      icon: AqMarkerPin01(size: 20, color: Color(0xff145FFF)),
      title: 'Places you keep close',
      body:
          'Pin home, work, school, the stage. Keep tabs on the air where your people are, hour by hour.',
    ),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context) || _userHasSwiped) {
      _stopAutoAdvance();
      return;
    }
    _startAutoAdvance();
  }

  void _startAutoAdvance() {
    if (_autoAdvance != null) return;
    _autoAdvance = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted || !_pageController.hasClients) return;
      final next = (_page + 1) % _slides.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 380),
        curve: Curves.easeOutCubic,
      );
    });
  }

  void _stopAutoAdvance() {
    _autoAdvance?.cancel();
    _autoAdvance = null;
  }

  @override
  void dispose() {
    _stopAutoAdvance();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    return Material(
      color: Colors.transparent,
      child: Container(
        decoration: AppSurfaceColors.sheetDecoration(context, topRadius: 24),
        child: SafeArea(
          top: false,
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.sizeOf(context).height * 0.92,
            ),
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.fromLTRB(0, 10, 0, 12 + bottomInset),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: bodyColor.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: const SizedBox(
                      height: 148,
                      width: double.infinity,
                      child: ExposureLaunchPixelScene(),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryColor.withValues(alpha: 0.16),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'NEW · EXPOSURE',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                            color: AppColors.primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'See the air you move through',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          height: 1.15,
                          color: titleColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'From the boda ride to home, Exposure shows how clean or dusty the air is along your day.',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          height: 1.5,
                          color: bodyColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 108,
                  child: NotificationListener<ScrollNotification>(
                    onNotification: (notification) {
                      if (notification is ScrollStartNotification &&
                          notification.dragDetails != null) {
                        _userHasSwiped = true;
                        _stopAutoAdvance();
                      }
                      return false;
                    },
                    child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) => setState(() => _page = index),
                    itemCount: _slides.length,
                    itemBuilder: (context, index) {
                      final slide = _slides[index];
                      return Padding(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                        child: _ValuePropRow(
                          icon: slide.icon,
                          title: slide.title,
                          body: slide.body,
                        ),
                      );
                    },
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                SmoothPageIndicator(
                  controller: _pageController,
                  count: _slides.length,
                  effect: ExpandingDotsEffect(
                    dotWidth: 7,
                    dotHeight: 7,
                    radius: 7,
                    spacing: 6,
                    dotColor: bodyColor.withValues(alpha: 0.35),
                    activeDotColor: AppColors.primaryColor,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: widget.onPrimary,
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            widget.primaryLabel,
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: widget.onDismiss,
                        child: Text(
                          'Maybe later',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: bodyColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ValuePropRow extends StatelessWidget {
  const _ValuePropRow({
    required this.icon,
    required this.title,
    required this.body,
  });

  final Widget icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final titleColor = AppTextColors.headline(context);
    final bodyColor = AppTextColors.muted(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(child: icon),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: titleColor,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                body,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  height: 1.45,
                  color: bodyColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
