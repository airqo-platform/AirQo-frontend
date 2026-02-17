import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/widgets/kya_lesson_container.dart';
import 'package:airqo/src/app/learn/pages/learn_surveys_page.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';

class KyaPage extends StatefulWidget {
  final int initialIndex;
  
  // Static notifier to control tab index externally
  static final ValueNotifier<int> tabIndexNotifier = ValueNotifier(0);
  
  const KyaPage({
    super.key,
    this.initialIndex = 0,
  });

  @override
  State<KyaPage> createState() => _KyaPageState();
}

class _KyaPageState extends State<KyaPage> with UiLoggy {
  KyaBloc? kyaBloc;
  bool _isRetrying = false;
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    
    // Listen to external tab changes
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
    Future.delayed(Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isRetrying = false;
        });
      }
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
              SizedBox(height: 16),
              Text(
                "Learn",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.boldHeadlineColor2
                      : AppColors.boldHeadlineColor5,
                ),
              ),
              SizedBox(height: 8),
              Text(
                "Explore lessons to understand air quality, or take surveys to help us learn about your experience.",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor4,
                ),
              ),
              SizedBox(height: 16),
              // Custom toggle similar to ViewSelector
              Container(
                height: 44,
                margin: const EdgeInsets.only(bottom: 16),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildViewButton(
                      context,
                      label: "Lessons",
                      isSelected: _selectedIndex == 0,
                      onTap: () => setState(() => _selectedIndex = 0),
                    ),
                    SizedBox(width: 8),
                    _buildViewButton(
                      context,
                      label: "Surveys",
                      isSelected: _selectedIndex == 1,
                      onTap: () => setState(() => _selectedIndex = 1),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: _selectedIndex == 0 
                    ? _buildLessonsTab() 
                    : const LearnSurveysPage(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildViewButton(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryColor
              : Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.dividerColorlight,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildLessonsTab() {
    return BlocBuilder<KyaBloc, KyaState>(
      builder: (context, state) {
        if (state is LessonsLoading || _isRetrying) {
          return Column(children: [
            ShimmerContainer(
                height: 200,
                borderRadius: 8,
                width: double.infinity),
            SizedBox(height: 16),
            ShimmerContainer(
                height: 200,
                borderRadius: 8,
                width: double.infinity)
          ]);
        } else if (state is LessonsLoaded) {
          return SingleChildScrollView(
            child: Column(
                children: state.model.kyaLessons.map((lesson) {
              return KyaLessonContainer(lesson);
            }).toList()),
          );
        } else if (state is LessonsLoadingError) {
          // Check if we have cached data to show
          if (state.cachedModel != null) {
            // Silently use cached data without indicator
            return SingleChildScrollView(
              child: Column(
                children: state.cachedModel!.kyaLessons.map((lesson) {
                  return KyaLessonContainer(lesson);
                }).toList(),
              ),
            );
          } else {
            // No cached data, show error
            return RefreshIndicator(
              onRefresh: () async => _retryLoading(),
              child: ListView(
                children: [
                  SizedBox(height: 100),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.cloud_off,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          "Unable to load content",
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).textTheme.headlineMedium?.color,
                          ),
                        ),
                        SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 32.0),
                          child: Text(
                            "Please check your connection and try again",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 16,
                              color: Theme.of(context).textTheme.bodyMedium?.color,
                            ),
                          ),
                        ),
                        SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _retryLoading,
                          icon: Icon(Icons.refresh),
                          label: Text('Try Again'),
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
        }
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text("Loading know your air content...")
            ],
          ),
        );
      },
    );
  }
}