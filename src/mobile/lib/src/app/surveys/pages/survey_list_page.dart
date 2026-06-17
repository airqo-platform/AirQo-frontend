import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/widgets/survey_list_content.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SurveyListPage extends StatefulWidget {
  const SurveyListPage({super.key});

  @override
  State<SurveyListPage> createState() => _SurveyListPageState();
}

class _SurveyListPageState extends State<SurveyListPage> {
  @override
  void initState() {
    super.initState();
    AnalyticsService().trackSurveyListViewed();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Research Surveys',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: theme.brightness == Brightness.dark
                ? Colors.white
                : AppColors.boldHeadlineColor4,
            fontFamily: 'Inter',
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleSpacing: 16,
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh,
              color: theme.brightness == Brightness.dark
                  ? Colors.white
                  : AppColors.boldHeadlineColor4,
            ),
            onPressed: () {
              context
                  .read<SurveyBloc>()
                  .add(const LoadSurveys(forceRefresh: true));
            },
            tooltip: 'Refresh surveys',
          ),
        ],
      ),
      body: const SurveyListContent(),
    );
  }
}
