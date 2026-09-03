import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/debug/debug_api_override.dart';
import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/map/bloc/map_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void showDebugApiOverrideSheet(BuildContext context) {
  if (!kDebugMode) return;

  showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheetContext) {
      return ListenableBuilder(
        listenable: DebugApiOverride.instance,
        builder: (context, _) {
          final override = DebugApiOverride.instance;
          return SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const TranslatedText(
                      'Debug API overrides',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const TranslatedText(
                      'Simulate empty or failed APIs. Turn off and Try Again to restore live data.',
                      style: TextStyle(fontSize: 13),
                    ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Empty air quality readings'),
                    subtitle: const TranslatedText(
                      'Home + Search map: 200 with measurements: []',
                    ),
                    value: override.forceEmptyAirQuality,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceEmptyAirQuality(value);
                      context
                          .read<DashboardBloc>()
                          .add(LoadDashboard(forceRefresh: true));
                      context.read<MapBloc>().add(LoadMap(forceRefresh: true));
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Fail air quality API'),
                    subtitle: const TranslatedText(
                      'Home + Search map: request fails (Unable to load map data)',
                    ),
                    value: override.forceFailAirQuality,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceFailAirQuality(value);
                      context
                          .read<DashboardBloc>()
                          .add(LoadDashboard(forceRefresh: true));
                      context.read<MapBloc>().add(LoadMap(forceRefresh: true));
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Empty Learn catalog'),
                    subtitle: const TranslatedText(
                      'Learn tab: 200 with courses: []',
                    ),
                    value: override.forceEmptyLearn,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceEmptyLearn(value);
                      context
                          .read<KyaBloc>()
                          .add(const LoadLessons(forceRefresh: true));
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Empty surveys'),
                    subtitle: const TranslatedText(
                      'Learn → Surveys: 200 with surveys: []',
                    ),
                    value: override.forceEmptySurveys,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceEmptySurveys(value);
                      context
                          .read<SurveyBloc>()
                          .add(const LoadSurveys(forceRefresh: true));
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Empty saved places'),
                    subtitle: const TranslatedText(
                      'User has not added places yet: 200 with selected_sites: []',
                    ),
                    value: override.forceEmptyPlaces,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceEmptyPlaces(value);
                      context.read<DashboardBloc>().add(
                            const LoadUserPreferences(forceRefresh: true),
                          );
                    },
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const TranslatedText('Fail saved places API'),
                    subtitle: const TranslatedText(
                      'Exposure + Favorites: preferences request fails',
                    ),
                    value: override.forceFailPlaces,
                    activeColor: AppColors.primaryColor,
                    onChanged: (value) {
                      override.setForceFailPlaces(value);
                      context.read<DashboardBloc>().add(
                            const LoadUserPreferences(forceRefresh: true),
                          );
                    },
                  ),
                ],
              ),
            ),
            ),
          );
        },
      );
    },
  );
}
