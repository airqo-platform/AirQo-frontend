import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../other/language/bloc/language_bloc.dart';
import '../../profile/bloc/user_bloc.dart';
import '../../shared/widgets/page_padding.dart';
import '../../shared/widgets/translated_text.dart';
import '../../surveys/bloc/survey_bloc.dart';
import '../../surveys/services/survey_notification_service.dart';
import '../../learn/pages/kya_page.dart';
import '../../shared/pages/nav_page.dart';

class DashboardHeader extends StatefulWidget {
  const DashboardHeader({super.key});

  @override
  State<DashboardHeader> createState() => _DashboardHeaderState();
}

class _DashboardHeaderState extends State<DashboardHeader> {
  final SurveyNotificationService _notificationService = SurveyNotificationService();
  int _incompleteSurveysCount = 0;
  bool _showAlert = false;

  @override
  void initState() {
    super.initState();
    _checkSurveys();
  }

  void _checkSurveys() {
    if (SurveyNotificationService.hasShownSessionAlert) return;

    // We need to wait for SurveyBloc to have data
    // We can check current state
    final state = context.read<SurveyBloc>().state;
    if (state is SurveysLoaded) {
      _processSurveys(state);
    }
  }

  Future<void> _processSurveys(SurveysLoaded state) async {
    if (SurveyNotificationService.hasShownSessionAlert) return;

    final count = await _notificationService.getNewSurveysCount(
      state.surveys,
      state.userResponses,
    );

    if (count > 0 && mounted) {
      setState(() {
        _incompleteSurveysCount = count;
        _showAlert = true;
      });
      // Mark as shown so it doesn't appear again this session
      SurveyNotificationService.hasShownSessionAlert = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SurveyBloc, SurveyState>(
      listener: (context, state) {
        if (state is SurveysLoaded && !SurveyNotificationService.hasShownSessionAlert) {
          _processSurveys(state);
        }
      },
      child: PagePadding(
        padding: 16,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(height: 16),
          _buildGreeting(context),
          BlocBuilder<LanguageBloc, LanguageState>(
            builder: (context, langState) {
              final locale =
                  langState is LanguageLoaded ? langState.languageCode : 'en';
              // intl supports fr and sw; fall back to en for lg and others
              final dateLocale =
                  ['en', 'fr', 'sw'].contains(locale) ? locale : 'en';
              final formattedDate =
                  DateFormat.MMMMd(dateLocale).format(DateTime.now());
              final textStyle = TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.secondaryHeadlineColor2
                    : AppColors.secondaryHeadlineColor4,
              );
              return Row(
                children: [
                  TranslatedText(
                    "Today's Air Quality",
                    style: textStyle,
                  ),
                  Text(
                    " • $formattedDate",
                    style: textStyle,
                  ),
                ],
              );
            },
          ),
          if (_showAlert) ...[
            SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                // Navigate to surveys by switching tabs
                final navState = context.findAncestorStateOfType<NavPageState>();
                if (navState != null) {
                  // First tell KyaPage to switch to Surveys tab
                  KyaPage.tabIndexNotifier.value = 1;
                  // Then switch main tab to Learn
                  navState.changeCurrentIndex(3);
                }
                
                // Hide alert after tap
                setState(() {
                  _showAlert = false;
                });
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.primaryColor.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 20,
                      color: AppColors.primaryColor,
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        "You have $_incompleteSurveysCount new surveys available",
                        style: TextStyle(
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 14,
                      color: AppColors.primaryColor,
                    ),
                  ],
                ),
              ),
            ),
          ],
          SizedBox(height: 16)
        ]),
      ),
    );
  }

  Widget _buildGreeting(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        if (authState is AuthLoading) {
          return _buildDefaultGreeting(context);
        }

        if (authState is GuestUser) {
          return _buildDefaultGreeting(context);
        }

        if (authState is AuthLoaded) {
          return _buildUserGreeting(context);
        }

        // Handle error state
        if (authState is AuthLoadingError) {
          return _buildDefaultGreeting(context);
        }

        // Default fallback
        return _buildDefaultGreeting(context);
      },
    );
  }

  Widget _buildDefaultGreeting(BuildContext context) {
    return TranslatedText(
      "Hi, 👋",
      style: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: Theme.of(context).textTheme.headlineLarge?.color,
      ),
    );
  }

  Widget _buildUserGreeting(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, userState) {
        if (userState is UserLoaded) {
          final greetingStyle = TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.boldHeadlineColor2
                : AppColors.boldHeadlineColor5,
          );
          return Row(
            children: [
              TranslatedText("Hi", style: greetingStyle),
              Flexible(
                child: Text(
                  " ${userState.model.users[0].firstName} 👋",
                  style: greetingStyle,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          );
        } else if (userState is UserLoadingError) {
          if (userState.retryCount == 0) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              context.read<UserBloc>().add(LoadUserWithRetry());
            });
          }
          return TranslatedText(
            "Hi 👋",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.boldHeadlineColor2
                  : AppColors.boldHeadlineColor5,
            ),
          );
        }
        return _buildDefaultGreeting(context);
      },
    );
  }
}
