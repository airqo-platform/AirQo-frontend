import 'dart:async';

import 'package:airqo/src/app/dashboard/widgets/dashboard_app_bar.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/pages/learn_surveys_page.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:airqo/src/app/learn/widgets/learn_course_portrait_card.dart';
import 'package:airqo/src/app/learn/widgets/learn_dashboard_header.dart';
import 'package:airqo/src/app/learn/widgets/learn_level_summary_card.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';

class KyaPage extends StatefulWidget {
  final int initialIndex;

  static final ValueNotifier<int> tabIndexNotifier = ValueNotifier(0);

  const KyaPage({super.key, this.initialIndex = 0});

  @override
  State<KyaPage> createState() => _KyaPageState();
}

class _KyaPageState extends State<KyaPage> with UiLoggy {
  KyaBloc? kyaBloc;
  bool _isRetrying = false;
  late int _selectedIndex;
  final _progress = LearnProgressService.instance;
  String? _lastSeedFingerprint;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    KyaPage.tabIndexNotifier.addListener(_onExternalTabChange);
    kyaBloc = context.read<KyaBloc>()..add(LoadLessons());
    _progress.ensureInitialized();
  }

  @override
  void dispose() {
    KyaPage.tabIndexNotifier.removeListener(_onExternalTabChange);
    super.dispose();
  }

  void _onExternalTabChange() {
    if (mounted) {
      setState(() => _selectedIndex = KyaPage.tabIndexNotifier.value);
    }
  }

  void _retryLoading() {
    setState(() => _isRetrying = true);
    kyaBloc?.add(LoadLessons(forceRefresh: true));
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isRetrying = false);
    });
  }

  Future<void> _refreshLessons(LearnV2CatalogResponse? currentModel) async {
    final bloc = kyaBloc;
    if (bloc == null) return;

    final done = bloc.stream.firstWhere(
      (state) => state is LessonsLoaded || state is LessonsLoadingError,
    );

    bloc.add(RefreshLessons(currentModel: currentModel));

    try {
      await done.timeout(const Duration(seconds: 30));
    } on TimeoutException {
      loggy.warning('Learn catalog refresh timed out');
    }
  }

  void _onLessonsReady(List<LearnCourseViewModel> courses) {
    final fingerprint = courses.map((c) => c.id).join('|');
    if (_lastSeedFingerprint == fingerprint) return;
    _lastSeedFingerprint = fingerprint;

    _progress.clearPilotSeedIfNeeded();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: const DashboardAppBar(),
      body: ValueListenableBuilder<int>(
        valueListenable: _progress.revision,
        builder: (context, _, __) {
          if (_selectedIndex == 0) {
            return _buildCoursesContent();
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const LearnDashboardHeader(),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: _buildTabSelector(),
              ),
              const Expanded(child: LearnSurveysPage()),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTabSelector() {
    return Row(
      children: [
        _pill('Courses',
            selected: _selectedIndex == 0,
            onTap: () => setState(() => _selectedIndex = 0)),
        const SizedBox(width: 8),
        _pill('Surveys',
            selected: _selectedIndex == 1,
            onTap: () => setState(() => _selectedIndex = 1)),
      ],
    );
  }

  Widget _pill(String label, {required bool selected, VoidCallback? onTap}) {
    final isDark = LearnDesignTokens.isDark(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(LearnDesignTokens.tabPillRadius),
          color: selected
              ? AppColors.primaryColor
              : (isDark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight),
        ),
        alignment: Alignment.center,
        child: TranslatedText(
          label,
          style: TextStyle(
            color: selected
                ? Colors.white
                : (isDark ? Colors.white : Colors.black87),
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  List<Widget> _headerSlivers() {
    return [
      const SliverToBoxAdapter(child: LearnDashboardHeader()),
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: _buildTabSelector(),
        ),
      ),
    ];
  }

  Widget _buildCoursesContent() {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state is LessonsLoading ||
            state is KyaInitial ||
            _isRetrying) {
          return CustomScrollView(
            slivers: [
              ..._headerSlivers(),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate(const [
                    ShimmerContainer(
                        height: 120, borderRadius: 12, width: double.infinity),
                    SizedBox(height: 16),
                    ShimmerContainer(
                        height: 200, borderRadius: 12, width: double.infinity),
                  ]),
                ),
              ),
            ],
          );
        }

        final LearnV2CatalogResponse? catalog = switch (state) {
          LessonsLoaded s => s.model,
          LessonsLoadingError s => s.cachedModel,
          LessonsRefreshing s => s.currentModel,
          _ => null,
        };

        if (state is LessonsLoadingError && catalog == null) {
          return _buildErrorState(state);
        }

        if (catalog != null) LearnCatalog.applyCatalogMeta(catalog);
        final courses = catalog != null
            ? LearnCatalog.buildFromV2Catalog(catalog.courses)
            : const <LearnCourseViewModel>[];

        if (state is LessonsLoaded || catalog != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _onLessonsReady(courses);
          });
        }

        if (courses.isEmpty) {
          return RefreshIndicator(
            onRefresh: () => _refreshLessons(catalog),
            color: AppColors.primaryColor,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                ..._headerSlivers(),
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: EmptyStateView(
                    icon: SystemGlyph.emptyLearn(context),
                    title: 'No courses available',
                    message:
                        "We couldn't find any courses right now. Please try again.",
                    actionLabel: 'Try Again',
                    onAction: _retryLoading,
                  ),
                ),
              ],
            ),
          );
        }

        final stage = LearnCatalog.currentStage(courses, _progress);
        final completed =
            LearnCatalog.catalogCompletedLessons(courses, _progress);
        final total = LearnCatalog.catalogTotalLessons(courses);
        final points = _progress.totalPoints(courses);
        final maxPoints = LearnCatalog.maxPoints(courses, _progress);

        return RefreshIndicator(
          onRefresh: () => _refreshLessons(catalog),
          color: AppColors.primaryColor,
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              ..._headerSlivers(),
              SliverToBoxAdapter(
                child: LearnLevelSummaryCard(
                  stage: stage,
                  completedLessons: completed,
                  totalLessons: total,
                  earnedPoints: points,
                  maxPoints: maxPoints,
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: TranslatedText(
                    'COURSES FOR YOU',
                    style: LearnDesignTokens.slbl(context),
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.72,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final course = courses[index];
                      final locked = !LearnCatalog.isCourseUnlocked(
                        courses,
                        index,
                        _progress,
                      );
                      return LearnCoursePortraitCard(
                        course: course,
                        locked: locked,
                        coverImageUrl: course.coverImageUrl,
                        onTap: () => LearnBottomSheets.showCourseDetail(
                          context,
                          course: course,
                          allCourses: courses,
                        ),
                      );
                    },
                    childCount: courses.length,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildErrorState(LessonsLoadingError state) {
    return RefreshIndicator(
      onRefresh: () async {
        final bloc = kyaBloc;
        if (bloc == null) return;

        final done = bloc.stream.firstWhere(
          (s) => s is LessonsLoaded || s is LessonsLoadingError,
        );

        _retryLoading();

        try {
          await done.timeout(const Duration(seconds: 30));
        } on TimeoutException {
          loggy.warning('Learn catalog retry timed out');
        }
      },
      color: AppColors.primaryColor,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const LearnDashboardHeader(),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: _buildTabSelector(),
          ),
          const SizedBox(height: 60),
          Center(
            child: EmptyStateView(
              icon: state.isOffline
                  ? SystemGlyph.offline(context, size: 64)
                  : SystemGlyph.error(context, size: 64),
              title: 'Unable to load content',
              message: state.isOffline
                  ? 'Please check your connection and try again'
                  : 'Something went wrong. Please try again later',
              actionLabel: 'Try Again',
              onAction: _retryLoading,
            ),
          ),
        ],
      ),
    );
  }
}
