import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/pages/learn_surveys_page.dart';
import 'package:airqo/src/app/learn/widgets/kya_lesson_container.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';

class KyaPage extends StatefulWidget {
  final int initialIndex;

  // Static notifier to control the active tab externally (e.g. from survey banner)
  static final ValueNotifier<int> tabIndexNotifier = ValueNotifier(0);

  const KyaPage({super.key, this.initialIndex = 0});

  @override
  State<KyaPage> createState() => _KyaPageState();
}

class _KyaPageState extends State<KyaPage> with UiLoggy {
  KyaBloc? kyaBloc;
  bool _isRetrying = false;
  late int _selectedIndex;

  bool get _surveysEnabled =>
      FeatureFlagService.instance.isEnabled(AppFeatureFlag.surveys);

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    KyaPage.tabIndexNotifier.addListener(_onExternalTabChange);
    kyaBloc = context.read<KyaBloc>()..add(LoadLessons());
  }

  @override
  void dispose() {
    KyaPage.tabIndexNotifier.removeListener(_onExternalTabChange);
    super.dispose();
  }

  void _onExternalTabChange() {
    if (mounted) {
      setState(() {
        _selectedIndex = KyaPage.tabIndexNotifier.value;
      });
    }
  }

  void _retryLoading() {
    setState(() {
      _isRetrying = true;
    });
    kyaBloc?.add(LoadLessons(forceRefresh: true));
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isRetrying = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              TranslatedText(
                "Know Your Air",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: AppColors.boldHeadlineColor,
                ),
              ),
              const SizedBox(height: 8),
              TranslatedText(
                "👋 Welcome! to \"Know Your Air,\" you'll learn about AirQo and air quality.",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Color(0xff7A7F87),
                ),
              ),
              const SizedBox(height: 16),
              _buildTabSelector(),
              const SizedBox(height: 16),
              Expanded(
                child: _selectedIndex == 0
                    ? _buildLessonsContent()
                    : const LearnSurveysPage(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabSelector() {
    if (!_surveysEnabled) {
      // No tab selector needed — just show the Lessons pill as before
      return Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            height: 38,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(40),
              color: AppColors.primaryColor,
            ),
            child: const Center(
              child: TranslatedText(
                "Lessons",
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      );
    }

    return Row(
      children: [
        _buildTab("Lessons", 0),
        const SizedBox(width: 8),
        _buildTab("Surveys", 1),
      ],
    );
  }

  Widget _buildTab(String label, int index) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        height: 38,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(40),
          color: isSelected ? AppColors.primaryColor : Colors.transparent,
          border: isSelected
              ? null
              : Border.all(color: AppColors.primaryColor, width: 1),
        ),
        child: Center(
          child: TranslatedText(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.primaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLessonsContent() {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state is LessonsLoading || _isRetrying) {
          return Column(children: [
            ShimmerContainer(height: 200, borderRadius: 8, width: double.infinity),
            const SizedBox(height: 16),
            ShimmerContainer(height: 200, borderRadius: 8, width: double.infinity),
          ]);
        } else if (state is LessonsLoaded) {
          return SingleChildScrollView(
            child: Column(
              children: state.model.kyaLessons
                  .map((lesson) => KyaLessonContainer(lesson))
                  .toList(),
            ),
          );
        } else if (state is LessonsLoadingError) {
          if (state.cachedModel != null) {
            return SingleChildScrollView(
              child: Column(
                children: state.cachedModel!.kyaLessons
                    .map((lesson) => KyaLessonContainer(lesson))
                    .toList(),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _retryLoading(),
            child: ListView(
              children: [
                const SizedBox(height: 100),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.cloud_off, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      TranslatedText(
                        "Unable to load content",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).textTheme.headlineMedium?.color,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32.0),
                        child: TranslatedText(
                          "Please check your connection and try again",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Theme.of(context).textTheme.bodyMedium?.color,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _retryLoading,
                        icon: const Icon(Icons.refresh),
                        label: const TranslatedText('Try Again'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryColor,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }
        return const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              TranslatedText("Loading know your air content..."),
            ],
          ),
        );
      },
    );
  }
}
