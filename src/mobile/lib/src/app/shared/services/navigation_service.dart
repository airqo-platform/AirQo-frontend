import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/pages/survey_detail_page.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';

/// Navigation service for context-free navigation
class NavigationService with UiLoggy {
  static final NavigationService _instance = NavigationService._internal();
  factory NavigationService() => _instance;
  NavigationService._internal();

  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  final NotificationManager _notificationManager = NotificationManager();

  NavigatorState? get _navigator => navigatorKey.currentState;
  BuildContext? get currentContext => navigatorKey.currentContext;
  bool get canNavigate => _navigator != null && currentContext != null;

  Future<void> navigateToSurvey(Survey survey) async {
    if (!canNavigate) {
      loggy.warning('Cannot navigate to survey: Navigator not available');
      return;
    }

    try {
      await _navigator!.push(
        MaterialPageRoute(
          builder: (context) => SurveyDetailPage(
            survey: survey,
            existingResponse: null,
            repository: SurveyRepository(),
          ),
        ),
      );
      
      loggy.info('Successfully navigated to survey: ${survey.title}');
    } catch (e) {
      loggy.error('Failed to navigate to survey: $e');
    }
  }
  void showSurveyNotification(
    Survey survey, {
    VoidCallback? onDismiss,
  }) {
    if (!canNavigate) {
      loggy.warning('Cannot show survey notification: Context not available');
      return;
    }

    _notificationManager.showSurveyNotification(
      currentContext!,
      survey: survey,
      onTakeSurvey: () => navigateToSurvey(survey),
      onDismiss: () {
        onDismiss?.call();
        loggy.info('User dismissed survey notification: ${survey.title}');
      },
    );
  }

  void showAirQualityAlert({
    required String message,
    required String category,
    required double pollutionLevel,
    VoidCallback? onDismiss,
    Function(bool followed)? onBehaviorResponse,
    String? alertId,
  }) {
    if (!canNavigate) {
      loggy.warning('Cannot show air quality alert: Context not available');
      return;
    }

    _notificationManager.showAirQualityAlert(
      currentContext!,
      message: message,
      category: category,
      pollutionLevel: pollutionLevel,
      alertId: alertId,
      onBehaviorResponse: onBehaviorResponse,
      onDismiss: () {
        onDismiss?.call();
        loggy.info('User dismissed air quality alert: $category');
      },
    );
  }

  Future<T?> push<T>(Route<T> route) async {
    if (!canNavigate) {
      loggy.warning('Cannot push route: Navigator not available');
      return null;
    }

    try {
      return await _navigator!.push(route);
    } catch (e) {
      loggy.error('Failed to push route: $e');
      return null;
    }
  }

  bool pop<T>([T? result]) {
    if (!canNavigate) {
      loggy.warning('Cannot pop route: Navigator not available');
      return false;
    }

    try {
      _navigator!.pop(result);
      return true;
    } catch (e) {
      loggy.error('Failed to pop route: $e');
      return false;
    }
  }

  void popUntil(RoutePredicate predicate) {
    if (!canNavigate) {
      loggy.warning('Cannot pop until: Navigator not available');
      return;
    }

    try {
      _navigator!.popUntil(predicate);
    } catch (e) {
      loggy.error('Failed to pop until: $e');
    }
  }

  bool canPop() {
    if (!canNavigate) return false;
    return _navigator!.canPop();
  }

  Future<T?> pushReplacement<T, TO>(Route<T> newRoute, {TO? result}) async {
    if (!canNavigate) {
      loggy.warning('Cannot push replacement: Navigator not available');
      return null;
    }

    try {
      return await _navigator!.pushReplacement(newRoute, result: result);
    } catch (e) {
      loggy.error('Failed to push replacement: $e');
      return null;
    }
  }

  Future<T?> pushNamed<T>(String routeName, {Object? arguments}) async {
    if (!canNavigate) {
      loggy.warning('Cannot push named route: Navigator not available');
      return null;
    }

    try {
      return await _navigator!.pushNamed(routeName, arguments: arguments);
    } catch (e) {
      loggy.error('Failed to push named route: $e');
      return null;
    }
  }
}