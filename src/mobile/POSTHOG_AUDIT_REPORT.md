# PostHog Analytics Audit Report - AirQo Mobile App

**Generated**: January 23, 2026
**Codebase**: AirQo Mobile v3 (Flutter)
**Analytics Platform**: PostHog

---

## Executive Summary

- **Total Required Data Points**: 56
- **Currently Tracked**: 18 (32%)
- **Partially Tracked**: 15 (27%)
- **Not Tracked**: 17 (30%)
- **Cannot Track in App**: 6 (11%)

### Key Findings

✅ **Strong Areas:**
- User authentication and profile tracking
- Survey engagement metrics (comprehensive)
- Basic app usage (navigation, screens)
- Consent models exist in codebase

⚠️ **Needs Improvement:**
- Person properties underutilized (only email tracked)
- No exposure data tracked in PostHog
- Alert delivery/response not tracked
- Retention metrics not calculated

❌ **Major Gaps:**
- Location sharing metrics not tracked
- Exposure values not sent to PostHog
- Alert interaction tracking missing
- Study metadata (cohort, arm) not tracked

---

## 1. CURRENTLY TRACKED DATA POINTS (✅) - 18 Total

### PARTICIPANT METADATA
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| 1 | Participant ID | ✅ Person property: `id` | auth_bloc.dart:45 via `setUserIdentity()` |
| 2 | Participant Name | ✅ Available from User model | Can add to person properties |
| 3 | Email Address | ✅ Person property: `email` | auth_bloc.dart:70 |

### STUDY TIMELINE
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| 6 | Device Platform | ✅ Auto-captured by PostHog | PostHog automatic |
| 7 | Onboarding Date | ✅ Available from User model | profile_response_model.dart (can infer from account creation) |

### APP USAGE & ENGAGEMENT
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| 26 | Total App Opens | ✅ Event: Auto-captured lifecycle events | main.dart:87 `captureApplicationLifecycleEvents = true` |
| 27 | Avg Session Duration | ✅ Auto-calculated by PostHog | PostHog automatic |
| 28 | Exposure Tab Views | ✅ Event: `exposure_tab_accessed` | exposure_dashboard_view.dart:218 |
| 29 | Settings Page Visits | ✅ Event: `privacy_settings_viewed` | analytics_service.dart:240 |
| 30 | Location Permission Changes | ✅ Events: `location_permission_requested/granted/denied` | analytics_service.dart:98-105 |
| 32 | Error Events Count | ✅ Event: `error_occurred` | analytics_service.dart:309 |

### RETENTION METRICS
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| 52 | Survey Completion Rate | ✅ Can calculate from `survey_started` vs `survey_completed` | survey_bloc.dart:94,247 |
| 53 | Survey Skip Rate | ✅ Event: `survey_skipped` | survey_detail_page.dart:527 |
| 54 | Weekly Active Status | ✅ Can calculate from session events | PostHog analytics dashboard |

### CONSENT & PRIVACY
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| 11 | Location Consent | ✅ Available in ResearchConsent model | research_consent_model.dart:3-9 |
| 12 | Notification Consent | ✅ Available in ResearchConsent model | research_consent_model.dart:3-9 |

### OTHER
| # | Data Point | PostHog Implementation | Location in Code |
|---|------------|------------------------|------------------|
| - | Navigation Tracking | ✅ Event: `navigation_changed` | nav_page.dart:84 |
| - | Theme Changes | ✅ Event: `theme_toggled` | theme_bloc.dart:19,22 |

---

## 2. PARTIALLY TRACKED DATA POINTS (⚠️) - 15 Total

These data points have models/infrastructure but aren't being sent to PostHog as events or person properties.

### PARTICIPANT METADATA
| # | Data Point | Current Status | What's Missing |
|---|------------|----------------|----------------|
| 4 | Recruitment Channel | ⚠️ No field in User model | Need backend field + person property |

### STUDY TIMELINE
| # | Data Point | Current Status | What's Missing |
|---|------------|----------------|----------------|
| 5 | City/Study Area | ⚠️ User preferences has location data | Need to track as person property |
| 8 | Baseline Start | ⚠️ Survey infrastructure exists | Need event when baseline survey starts |
| 9 | Intervention Start | ⚠️ No tracking | Need backend flag + event tracking |
| 10 | Endline Completion | ⚠️ Survey tracking exists | Track specific event for endline completion |

### CONSENT & PRIVACY
| # | Data Point | Current Status | What's Missing |
|---|------------|----------------|----------------|
| 13 | Location Permission Level | ⚠️ Permission events tracked | Need to capture actual permission level (Always/While Using/Never) |
| 14 | Privacy Zones Count | ⚠️ PrivacyZone model exists | Need to track count as person property |
| 15 | Study Withdrawal Date | ⚠️ `withdrawFromStudy()` method exists | Need to track event when called |
| 16 | APK Deletion Date | 🚫 **CANNOT TRACK** | Apps cannot detect uninstallation on Android |

### LOCATION & EXPOSURE DATA
| # | Data Point | Current Status | What's Missing |
|---|------------|----------------|----------------|
| 17 | Location Sharing Status | ⚠️ `exposure_tracking_enabled/disabled` events | Should be person property |
| 18 | Avg Daily Location Pings | ⚠️ LocationDataPoint model exists | Need periodic aggregation to PostHog |
| 19 | Total Location Sharing Duration | ⚠️ Can calculate from location data | Need to calculate and send as person property |

### APP USAGE & ENGAGEMENT
| # | Data Point | Current Status | What's Missing |
|---|------------|----------------|----------------|
| 31 | Data Sync Status | ⚠️ `offline_mode_activated` tracked | Need sync success/failure events |
| 33 | Total Alerts Sent | ⚠️ Alert infrastructure exists | Need to track alert sent events |

---

## 3. NOT TRACKED - NEED TO IMPLEMENT (❌) - 17 Total

These data points require new PostHog tracking implementation.

### LOCATION & EXPOSURE DATA
| # | Data Point | Why Not Tracked | Implementation Needed |
|---|------------|-----------------|----------------------|
| 20 | Avg Hourly PM2.5 Exposure | ExposureDataPoint model has pm25Value | Send as person property (daily aggregation) |
| 21 | Daily Cumulative PM2.5 | DailyExposureSummary has averagePm25 | Send as person property |
| 22 | Daily Exposure Peak Value | DailyExposureSummary has maxPm25 | Send as person property |
| 23 | Daily Exposure Peak Time | Not in current model | Add to DailyExposureSummary + track |
| 24 | Exposure Category | ExposureDataPoint has aqiCategory | Send as person property |
| 25 | Distance to Nearest Station | ExposureCalculator uses 10km radius | Calculate and send as event property |

### ALERT DELIVERY & RESPONSE
| # | Data Point | Why Not Tracked | Implementation Needed |
|---|------------|-----------------|----------------------|
| 34 | Alerts Delivered | No tracking in PushNotificationService | Add `alert_delivered` event |
| 35 | Alerts Opened | No tracking | Add `alert_opened` event with timestamp |
| 36 | Alerts Dismissed | AlertResponse has `dismissed` type | Track `alert_dismissed` event |
| 37 | Avg Time to Open Alert | No timestamp tracking | Calculate from sent → opened |
| 38 | App Opens Post-Alert | No correlation logic | Track app_open with alert_id context |
| 39 | Exposure Views Post-Alert | No correlation | Add alert_id to exposure_tab_accessed |

### SURVEY DATA (Backend/External)
| # | Data Point | Why Not Tracked | Implementation Needed |
|---|------------|-----------------|----------------------|
| 40 | Baseline: AQ Awareness Score | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 41 | Baseline: Risk Perception Score | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 42 | Baseline: Protective Behaviors | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 43 | Baseline: Willingness to Adapt | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 48 | Endline: AQ Awareness Score | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 49 | Endline: Risk Perception Score | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 50 | Endline: Protective Behaviors | Survey responses stored in backend | Need backend to calculate + send to PostHog |
| 51 | Endline: Alert Usefulness Rating | Survey responses stored in backend | Need backend to calculate + send to PostHog |

### SURVEY DATA (App-side)
| # | Data Point | Why Not Tracked | Implementation Needed |
|---|------------|-----------------|----------------------|
| 44 | Alert Seen (Yes/No) | AlertResponse model exists | Track as event when user responds |
| 45 | Behavior Changed (Yes/No) | AlertResponse has responseType | Track `behavior_changed` event |
| 46 | Action Type | AlertResponse has followedReason | Track with action_type property |
| 47 | Barriers to Change | AlertResponse has notFollowedReason | Track with barrier property |

### RETENTION METRICS
| # | Data Point | Why Not Tracked | Implementation Needed |
|---|------------|-----------------|----------------------|
| 55 | Dropout Date | No inactivity tracking | Calculate from last event (needs backend query) |
| 56 | Notification Opt-out Date | No tracking | Track when user disables notifications |

---

## 4. CANNOT TRACK IN APP (🚫) - 6 Total

These require backend systems or external data sources.

| # | Data Point | Why Cannot Track | Recommended Solution |
|---|------------|------------------|----------------------|
| 16 | APK Deletion Date | Android/iOS don't provide uninstall callbacks | Use backend inference from last_seen |
| 20-25 | PM2.5 Exposure Metrics | Requires backend calculation from location + AQ data | Backend calculates daily, sends to PostHog Server API |
| 40-43 | Baseline Survey Scores | Survey scoring logic should live on backend | Backend processes survey responses, sends scores to PostHog |
| 48-51 | Endline Survey Scores | Survey scoring logic should live on backend | Backend processes survey responses, sends scores to PostHog |
| 55 | Dropout Date | Requires analysis across all users | Backend calculates from activity patterns |

**Note**: While these CAN technically be calculated in the app, they SHOULD be calculated on the backend for:
- Consistency across platforms
- Historical data processing
- Privacy (aggregation before sharing)
- Performance (avoid heavy calculations on device)

---

## 5. IMPLEMENTATION PRIORITY

### 🔴 HIGH PRIORITY (Critical for Research Study)

#### 1. Alert Delivery & Response Tracking
**Impact**: Core research outcome - measuring behavior change from alerts

```dart
// In PushNotificationService
Future<void> _handleMessage(RemoteMessage message) async {
  // Track alert delivered
  await AnalyticsService().trackEvent('alert_delivered', properties: {
    'alert_id': message.messageId,
    'alert_type': message.data['type'],
    'pm25_level': message.data['pm25'],
    'timestamp': DateTime.now().toIso8601String(),
  });

  // ... existing notification handling
}

// When user taps notification
Future<void> _onNotificationTapped(RemoteMessage message) async {
  final deliveredTime = DateTime.parse(message.data['sent_at']);
  final openedTime = DateTime.now();
  final timeToOpen = openedTime.difference(deliveredTime).inMinutes;

  await AnalyticsService().trackEvent('alert_opened', properties: {
    'alert_id': message.messageId,
    'time_to_open_minutes': timeToOpen,
    'timestamp': openedTime.toIso8601String(),
  });
}

// When user dismisses
Future<void> trackAlertDismissed(String alertId) async {
  await AnalyticsService().trackEvent('alert_dismissed', properties: {
    'alert_id': alertId,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

**Files to modify**:
- `lib/src/app/shared/services/push_notification_service.dart`
- `lib/src/app/shared/services/notification_manager.dart`

---

#### 2. Enhanced Person Properties (User Metadata)
**Impact**: Essential for cohort analysis and filtering

```dart
// In auth_bloc.dart after successful login/registration
Future<void> _setEnhancedUserIdentity(User user) async {
  await AnalyticsService().setUserIdentity(
    userId: user.id,
    userProperties: {
      'email': user.email,
      'name': '${user.firstName} ${user.lastName}',
      'city': user.city, // Need to add to User model
      'cohort_id': user.cohortId, // Need to add to User model
      'study_arm': user.studyArm, // Need to add to User model (intervention/control)
      'enrollment_date': user.createdAt.toIso8601String(),
      'location_sharing_enabled': false, // Update when user enables
      'notification_consent': false, // From ResearchConsent
      'privacy_zones_count': 0, // From PrivacyRepository
    },
  );
}

// Update person properties when consent changes
Future<void> trackConsentChanged(ConsentType type, ConsentStatus status) async {
  await AnalyticsService().trackEvent('consent_changed', properties: {
    'consent_type': type.toString(),
    'consent_status': status.toString(),
    'timestamp': DateTime.now().toIso8601String(),
  });

  // Update person property
  await Posthog().identify(
    userId: await AuthHelper.getCurrentUserId(),
    userProperties: {
      '${type.toString()}_consent': status == ConsentStatus.granted,
    },
  );
}
```

**Files to modify**:
- `lib/src/app/auth/bloc/auth_bloc.dart`
- `lib/src/app/research/repository/research_consent_repository.dart`

---

#### 3. Location & Exposure Aggregation
**Impact**: Core data for exposure-behavior research

```dart
// Create new service: exposure_analytics_service.dart
class ExposureAnalyticsService {
  /// Send daily exposure summary to PostHog
  Future<void> sendDailyExposureSummary(DailyExposureSummary summary) async {
    await AnalyticsService().trackEvent('daily_exposure_summary', properties: {
      'date': summary.date.toIso8601String(),
      'avg_pm25': summary.averagePm25,
      'max_pm25': summary.maxPm25,
      'dominant_aqi_category': summary.dominantAqiCategory,
      'total_outdoor_time_hours': summary.totalOutdoorTime.inHours,
      'location_ping_count': summary.dataPoints.length,
      'exposure_score': summary.totalExposureScore,
    });

    // Also update person properties for latest values
    await Posthog().identify(
      userId: await AuthHelper.getCurrentUserId(),
      userProperties: {
        'latest_daily_avg_pm25': summary.averagePm25,
        'latest_exposure_category': summary.dominantAqiCategory,
        'avg_daily_location_pings': summary.dataPoints.length,
      },
    );
  }

  /// Track location sharing status changes
  Future<void> trackLocationSharingChanged(bool enabled) async {
    await AnalyticsService().trackEvent(
      enabled ? 'location_sharing_enabled' : 'location_sharing_disabled',
      properties: {'timestamp': DateTime.now().toIso8601String()},
    );

    await Posthog().identify(
      userId: await AuthHelper.getCurrentUserId(),
      userProperties: {'location_sharing_enabled': enabled},
    );
  }
}
```

**Files to create**:
- `lib/src/app/exposure/services/exposure_analytics_service.dart`

**Files to modify**:
- `lib/src/app/exposure/services/exposure_calculator.dart` (call after calculating summaries)

---

### 🟡 MEDIUM PRIORITY (Important for Complete Analysis)

#### 4. Survey Milestone Tracking
**Impact**: Track research study phases

```dart
// Add to analytics_service.dart
Future<void> trackBaselineStarted() =>
  trackEvent('baseline_survey_started', properties: {
    'timestamp': DateTime.now().toIso8601String(),
  });

Future<void> trackBaselineCompleted() =>
  trackEvent('baseline_survey_completed', properties: {
    'timestamp': DateTime.now().toIso8601String(),
  });

Future<void> trackEndlineStarted() =>
  trackEvent('endline_survey_started', properties: {
    'timestamp': DateTime.now().toIso8601String(),
  });

Future<void> trackEndlineCompleted() =>
  trackEvent('endline_survey_completed', properties: {
    'timestamp': DateTime.now().toIso8601String(),
  });

// Call these when user starts/completes baseline/endline surveys
// Requires survey metadata to identify survey type
```

**Files to modify**:
- `lib/src/app/shared/services/analytics_service.dart`
- `lib/src/app/surveys/bloc/survey_bloc.dart`

---

#### 5. Alert Response Details
**Impact**: Understand what actions users take

```dart
// In notification_manager.dart or survey_bloc.dart
Future<void> trackAlertResponse({
  required String alertId,
  required bool behaviorChanged,
  String? actionType,
  String? barrier,
}) async {
  await AnalyticsService().trackEvent('alert_response_submitted', properties: {
    'alert_id': alertId,
    'behavior_changed': behaviorChanged,
    if (actionType != null) 'action_type': actionType,
    if (barrier != null) 'barrier': barrier,
    'timestamp': DateTime.now().toIso8601String(),
  });
}
```

**Files to modify**:
- `lib/src/app/shared/services/notification_manager.dart`
- `lib/src/app/surveys/repository/survey_repository.dart`

---

#### 6. Study Withdrawal Tracking
**Impact**: Understand attrition

```dart
// In research_consent_repository.dart
Future<void> withdrawFromStudy(String reason) async {
  await AnalyticsService().trackEvent('study_withdrawn', properties: {
    'reason': reason,
    'timestamp': DateTime.now().toIso8601String(),
  });

  await Posthog().identify(
    userId: await AuthHelper.getCurrentUserId(),
    userProperties: {
      'study_withdrawn': true,
      'withdrawal_date': DateTime.now().toIso8601String(),
    },
  );

  // ... existing withdrawal logic
}
```

**Files to modify**:
- `lib/src/app/research/repository/research_consent_repository.dart`

---

### 🟢 LOW PRIORITY (Nice to Have)

#### 7. Privacy Zone Tracking
```dart
Future<void> trackPrivacyZoneCreated() async {
  final zones = await _privacyRepository.getPrivacyZones();

  await AnalyticsService().trackEvent('privacy_zone_created');

  await Posthog().identify(
    userId: await AuthHelper.getCurrentUserId(),
    userProperties: {'privacy_zones_count': zones.length},
  );
}
```

#### 8. Notification Opt-out Tracking
```dart
Future<void> trackNotificationSettingsChanged(bool enabled) async {
  await AnalyticsService().trackEvent('notification_settings_changed', properties: {
    'enabled': enabled,
    'timestamp': DateTime.now().toIso8601String(),
  });

  if (!enabled) {
    await Posthog().identify(
      userId: await AuthHelper.getCurrentUserId(),
      userProperties: {'notification_opt_out_date': DateTime.now().toIso8601String()},
    );
  }
}
```

---

## 6. RECOMMENDED CODE CHANGES

### File: `lib/src/app/shared/services/analytics_service.dart`

Add these new tracking methods:

```dart
/// Track alert events
Future<void> trackAlertDelivered({
  required String alertId,
  required String alertType,
  double? pm25Level,
}) => trackEvent('alert_delivered', properties: {
  'alert_id': alertId,
  'alert_type': alertType,
  if (pm25Level != null) 'pm25_level': pm25Level,
});

Future<void> trackAlertOpened({
  required String alertId,
  required int timeToOpenMinutes,
}) => trackEvent('alert_opened', properties: {
  'alert_id': alertId,
  'time_to_open_minutes': timeToOpenMinutes,
});

Future<void> trackAlertDismissed({
  required String alertId,
}) => trackEvent('alert_dismissed', properties: {
  'alert_id': alertId,
});

Future<void> trackAlertResponseSubmitted({
  required String alertId,
  required bool behaviorChanged,
  String? actionType,
  String? barrier,
}) => trackEvent('alert_response_submitted', properties: {
  'alert_id': alertId,
  'behavior_changed': behaviorChanged,
  if (actionType != null) 'action_type': actionType,
  if (barrier != null) 'barrier': barrier,
});

/// Track exposure summaries
Future<void> trackDailyExposureSummary({
  required DateTime date,
  required double avgPm25,
  required double maxPm25,
  required String dominantCategory,
  required int locationPingCount,
  required int outdoorTimeHours,
}) => trackEvent('daily_exposure_summary', properties: {
  'date': date.toIso8601String().split('T')[0], // YYYY-MM-DD only
  'avg_pm25': avgPm25,
  'max_pm25': maxPm25,
  'dominant_aqi_category': dominantCategory,
  'location_ping_count': locationPingCount,
  'outdoor_time_hours': outdoorTimeHours,
});

/// Track consent changes
Future<void> trackConsentChanged({
  required String consentType,
  required String consentStatus,
}) => trackEvent('consent_changed', properties: {
  'consent_type': consentType,
  'consent_status': consentStatus,
});

/// Track study milestones
Future<void> trackBaselineStarted() => trackEvent('baseline_survey_started');
Future<void> trackBaselineCompleted() => trackEvent('baseline_survey_completed');
Future<void> trackInterventionStarted() => trackEvent('intervention_started');
Future<void> trackEndlineStarted() => trackEvent('endline_survey_started');
Future<void> trackEndlineCompleted() => trackEvent('endline_survey_completed');

/// Track withdrawal
Future<void> trackStudyWithdrawn({
  required String reason,
}) => trackEvent('study_withdrawn', properties: {
  'reason': reason,
});

/// Track notification settings
Future<void> trackNotificationSettingsChanged({
  required bool enabled,
}) => trackEvent('notification_settings_changed', properties: {
  'enabled': enabled,
});

/// Update person properties helper
Future<void> updatePersonProperty(String key, dynamic value) async {
  try {
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId != null) {
      await Posthog().identify(
        userId: userId,
        userProperties: {key: value},
      );
    }
  } catch (e, stackTrace) {
    logError('Failed to update person property: $key', e, stackTrace);
  }
}
```

---

### File: `lib/src/app/auth/bloc/auth_bloc.dart`

Enhance user identification with more person properties:

```dart
Future<void> _setUserIdentityWithProperties(User user) async {
  // Get additional data
  final consentRepo = ResearchConsentRepository();
  final consent = await consentRepo.getConsent();

  final privacyRepo = PrivacyRepository();
  final privacyZones = await privacyRepo.getPrivacyZones();

  await AnalyticsService().setUserIdentity(
    userId: user.id,
    userProperties: {
      'email': user.email,
      'name': '${user.firstName} ${user.lastName}',
      'verified': user.verified,
      'privilege': user.privilege,
      'enrollment_date': user.createdAt?.toIso8601String() ?? '',

      // Consent status
      'location_consent': consent?.hasGrantedConsent(ConsentType.locationTracking) ?? false,
      'notification_consent': consent?.hasGrantedConsent(ConsentType.researchCommunication) ?? false,
      'survey_consent': consent?.hasGrantedConsent(ConsentType.surveyParticipation) ?? false,

      // Privacy
      'privacy_zones_count': privacyZones.length,

      // Study metadata (TODO: add these fields to User model on backend)
      // 'city': user.city,
      // 'cohort_id': user.cohortId,
      // 'study_arm': user.studyArm,
    },
  );
}
```

---

### File: `lib/src/app/research/repository/research_consent_repository.dart`

Track consent changes:

```dart
Future<void> updateConsentType(ConsentType type, ConsentStatus status) async {
  // ... existing update logic

  // Track in PostHog
  await AnalyticsService().trackConsentChanged(
    consentType: type.toString(),
    consentStatus: status.toString(),
  );

  // Update person property
  await AnalyticsService().updatePersonProperty(
    '${type.toString()}_consent',
    status == ConsentStatus.granted,
  );
}

Future<void> withdrawFromStudy(String reason) async {
  // Track withdrawal
  await AnalyticsService().trackStudyWithdrawn(reason: reason);

  // Update person properties
  await AnalyticsService().updatePersonProperty('study_withdrawn', true);
  await AnalyticsService().updatePersonProperty(
    'withdrawal_date',
    DateTime.now().toIso8601String(),
  );

  // ... existing withdrawal logic
}
```

---

### File: `lib/src/app/shared/services/push_notification_service.dart`

Track alert delivery and interactions:

```dart
Future<void> _handleBackgroundMessage(RemoteMessage message) async {
  // Track alert delivered
  final alertType = message.data['type'] ?? 'unknown';
  final pm25 = message.data['pm25'] != null
    ? double.tryParse(message.data['pm25'].toString())
    : null;

  await AnalyticsService().trackAlertDelivered(
    alertId: message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
    alertType: alertType,
    pm25Level: pm25,
  );

  // ... existing notification logic
}

Future<void> _onNotificationTapped(RemoteMessage message) async {
  // Calculate time to open
  final sentAt = message.data['sent_at'];
  int? timeToOpen;
  if (sentAt != null) {
    final sentTime = DateTime.parse(sentAt);
    timeToOpen = DateTime.now().difference(sentTime).inMinutes;
  }

  // Track alert opened
  await AnalyticsService().trackAlertOpened(
    alertId: message.messageId ?? 'unknown',
    timeToOpenMinutes: timeToOpen ?? 0,
  );

  // ... existing navigation logic
}
```

---

### NEW File: `lib/src/app/exposure/services/exposure_analytics_service.dart`

Create dedicated service for exposure analytics:

```dart
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';

class ExposureAnalyticsService {
  /// Send daily exposure summary to PostHog
  static Future<void> sendDailyExposureSummary(DailyExposureSummary summary) async {
    await AnalyticsService().trackDailyExposureSummary(
      date: summary.date,
      avgPm25: summary.averagePm25 ?? 0,
      maxPm25: summary.maxPm25 ?? 0,
      dominantCategory: summary.dominantAqiCategory ?? 'unknown',
      locationPingCount: summary.dataPoints.length,
      outdoorTimeHours: summary.totalOutdoorTime?.inHours ?? 0,
    );

    // Update person properties for latest exposure metrics
    await AnalyticsService().updatePersonProperty(
      'latest_daily_avg_pm25',
      summary.averagePm25,
    );
    await AnalyticsService().updatePersonProperty(
      'latest_exposure_category',
      summary.dominantAqiCategory,
    );
    await AnalyticsService().updatePersonProperty(
      'avg_daily_location_pings',
      summary.dataPoints.length,
    );
  }

  /// Track when user enables/disables location sharing
  static Future<void> trackLocationSharingChanged(bool enabled) async {
    if (enabled) {
      await AnalyticsService().trackExposureTrackingEnabled();
    } else {
      await AnalyticsService().trackExposureTrackingDisabled();
    }

    await AnalyticsService().updatePersonProperty(
      'location_sharing_enabled',
      enabled,
    );
  }
}
```

Call this service from `exposure_calculator.dart` after generating daily summaries.

---

## 7. DATA CLEANUP RECOMMENDATIONS

### Events Currently Tracked NOT in Required List

| Event Name | Recommendation | Rationale |
|------------|----------------|-----------|
| `learn_section_viewed` | ✅ **KEEP** | Useful for understanding engagement beyond core research |
| `lesson_viewed` | ✅ **KEEP** | Educational engagement is valuable context |
| `lesson_completed` | ✅ **KEEP** | Shows user commitment |
| `research_study_viewed` | ✅ **KEEP** | Important for funnel analysis |
| `research_consent_accepted` | ✅ **KEEP** | Critical milestone |
| `theme_toggled` | ⚠️ **OPTIONAL** | Not research-critical, but minimal data |
| `data_refresh_started` | ⚠️ **OPTIONAL** | Useful for debugging performance |
| `data_refresh_completed` | ⚠️ **OPTIONAL** | Useful for debugging performance |
| `data_refresh_failed` | ✅ **KEEP** | Important for identifying technical issues |
| `api_call_failed` | ✅ **KEEP** | Critical for debugging |
| `connectivity_changed` | ✅ **KEEP** | Context for data gaps |
| `screen_viewed` | ⚠️ **CONSIDER REMOVING** | Redundant if PostHog auto-screen tracking is enabled |

### Recommendation
Keep all current events. The data volume is not problematic, and additional context is valuable for:
- Debugging technical issues
- Understanding user engagement beyond core research metrics
- Identifying confounding factors

---

## 8. BACKEND INTEGRATION REQUIREMENTS

The following data points **MUST** be calculated and sent from the backend using PostHog Server API:

### Backend → PostHog Person Properties

```python
# Example Python (backend)
import posthog

def update_user_exposure_metrics(user_id, date):
    # Calculate from database
    exposure_data = calculate_daily_exposure(user_id, date)

    posthog.identify(
        distinct_id=user_id,
        properties={
            'avg_hourly_pm25_exposure': exposure_data['avg_hourly_pm25'],
            'daily_cumulative_pm25': exposure_data['daily_cumulative_pm25'],
            'daily_exposure_peak_value': exposure_data['peak_value'],
            'daily_exposure_peak_time': exposure_data['peak_time'].isoformat(),
            'exposure_category': exposure_data['aqi_category'],
            'distance_to_nearest_station_km': exposure_data['nearest_station_km'],
        }
    )

def update_survey_scores(user_id, survey_type):
    # Calculate scores from survey responses
    scores = calculate_survey_scores(user_id, survey_type)

    prefix = 'baseline' if survey_type == 'baseline' else 'endline'

    posthog.identify(
        distinct_id=user_id,
        properties={
            f'{prefix}_aq_awareness_score': scores['awareness'],
            f'{prefix}_risk_perception_score': scores['risk_perception'],
            f'{prefix}_protective_behaviors_score': scores['protective_behaviors'],
            f'{prefix}_willingness_to_adapt_score': scores['willingness'],
            f'{prefix}_completion_date': datetime.now().isoformat(),
        }
    )
```

### Backend Fields to Add to User Model

```json
{
  "city": "Kampala",
  "cohort_id": "cohort_001",
  "study_arm": "intervention",
  "recruitment_channel": "community_outreach",
  "intervention_start_date": "2026-02-01T00:00:00Z"
}
```

---

## 9. POSTHOG PERSON PROPERTIES SCHEMA (Recommended)

Here's the complete schema for person properties to enable robust analysis:

```javascript
{
  // Participant Metadata
  "id": "user_12345",
  "email": "user@example.com",
  "name": "John Doe",
  "city": "Kampala",
  "cohort_id": "cohort_001",
  "study_arm": "intervention", // or "control"
  "recruitment_channel": "community_outreach",
  "enrollment_date": "2026-01-15T10:30:00Z",

  // Consent & Privacy
  "location_consent": true,
  "notification_consent": true,
  "survey_consent": true,
  "location_permission_level": "always", // always, whileUsing, never
  "privacy_zones_count": 2,
  "study_withdrawn": false,
  "withdrawal_date": null,

  // Location & Exposure (Updated Daily by Backend)
  "location_sharing_enabled": true,
  "avg_daily_location_pings": 287,
  "total_location_sharing_duration_hours": 156,
  "latest_daily_avg_pm25": 35.2,
  "daily_cumulative_pm25": 845.6,
  "latest_exposure_category": "Moderate",
  "distance_to_nearest_station_km": 2.3,

  // Survey Scores (Set by Backend after Survey Completion)
  "baseline_aq_awareness_score": 72,
  "baseline_risk_perception_score": 68,
  "baseline_protective_behaviors_score": 45,
  "baseline_willingness_to_adapt_score": 80,
  "baseline_completion_date": "2026-01-20T14:22:00Z",

  "endline_aq_awareness_score": 88,
  "endline_risk_perception_score": 92,
  "endline_protective_behaviors_score": 75,
  "endline_alert_usefulness_rating": 4.2,
  "endline_completion_date": "2026-03-20T09:15:00Z",

  // Study Timeline
  "baseline_start_date": "2026-01-20T14:22:00Z",
  "intervention_start_date": "2026-02-01T00:00:00Z",
  "endline_completion_date": "2026-03-20T09:15:00Z",

  // Retention Metrics
  "last_active_date": "2026-03-19T18:45:00Z",
  "is_dropout": false,
  "dropout_date": null,
  "notification_opt_out_date": null,

  // Device Info (Auto-captured)
  "$device_type": "mobile",
  "$os": "Android",
  "$os_version": "13"
}
```

---

## 10. POSTHOG QUERIES FOR REQUIRED METRICS

Once data is tracked, use these PostHog queries/insights to derive the required metrics:

### Survey Completion Rate
```
Events: survey_started vs survey_completed
Formula: (count(survey_completed) / count(survey_started)) * 100
```

### Survey Skip Rate
```
Events: survey_presented vs survey_skipped
Formula: (count(survey_skipped) / count(survey_presented)) * 100
```

### Avg Time to Open Alert
```
Event: alert_opened
Property: time_to_open_minutes
Aggregation: Average
```

### Weekly Active Users
```
Filter: Any event in last 7 days
Unique users count
Group by: cohort_id, study_arm
```

### Dropout Detection
```
Person property: last_active_date
Filter: last_active_date < (today - 14 days)
Count distinct users
```

---

## 11. NEXT STEPS

### Immediate Actions (This Sprint)
1. ✅ Review this audit with research team
2. ✅ Prioritize implementation based on study timeline
3. ✅ Create backend tickets for:
   - Add study metadata fields to User model
   - Implement daily exposure calculation job
   - Implement survey scoring logic
   - PostHog Server API integration

### Sprint 1 (High Priority Implementation)
1. Implement alert delivery & response tracking
2. Enhance person properties in authentication flow
3. Add consent change tracking
4. Create exposure analytics service

### Sprint 2 (Medium Priority)
1. Add survey milestone tracking
2. Implement alert response detail tracking
3. Add study withdrawal tracking
4. Backend exposure metric calculation

### Sprint 3 (Low Priority + Polish)
1. Privacy zone tracking
2. Notification opt-out tracking
3. Data quality validation
4. PostHog dashboard creation

---

## 12. DATA QUALITY CONSIDERATIONS

### Privacy & Compliance
- ✅ No raw GPS coordinates sent to PostHog (only aggregated metrics)
- ✅ Email addresses encrypted in transit (PostHog uses HTTPS)
- ⚠️ Consider anonymizing person IDs for EU users (GDPR)
- ✅ Consent tracking implemented before data collection

### Performance Impact
- ⚠️ Daily exposure summaries should be calculated on backend, not real-time
- ✅ PostHog maxBatchSize=1 ensures real-time delivery (good for research, may impact performance)
- ⚠️ Consider batching person property updates to reduce API calls

### Data Accuracy
- ⚠️ Location ping counts depend on device battery optimization settings
- ⚠️ Exposure calculations require accurate timestamp matching
- ✅ Survey responses stored in backend (source of truth)

---

## APPENDIX A: Complete Event Catalog

### Currently Implemented Events

| Event Name | Properties | Tracked In |
|------------|-----------|------------|
| `user_registered` | method | auth_bloc.dart:95 |
| `user_logged_in` | method | auth_bloc.dart:63 |
| `user_logged_out` | - | auth_bloc.dart:141 |
| `email_verified` | - | auth_bloc.dart:120 |
| `guest_mode_accessed` | - | auth_bloc.dart:29 |
| `dashboard_viewed` | - | dashboard_bloc.dart:124 |
| `dashboard_refreshed` | - | dashboard_bloc.dart:176 |
| `map_viewed` | - | map_bloc.dart:30 |
| `exposure_tab_accessed` | - | exposure_dashboard_view.dart:218 |
| `exposure_tracking_enabled` | - | exposure_dashboard_view.dart:218 |
| `exposure_tracking_disabled` | - | exposure_dashboard_view.dart:227 |
| `exposure_data_loaded` | - | exposure_dashboard_view.dart:265 |
| `exposure_level_viewed` | level | exposure_dashboard_view.dart:266 |
| `location_permission_requested` | - | analytics_service.dart:98 |
| `location_permission_granted` | - | analytics_service.dart:101 |
| `location_permission_denied` | - | analytics_service.dart:104 |
| `survey_list_viewed` | - | survey_list_page.dart:27 |
| `survey_detail_viewed` | survey_id | survey_detail_page.dart:68 |
| `survey_presented` | survey_id | survey_bloc.dart:43 |
| `survey_started` | survey_id | survey_bloc.dart:94 |
| `survey_question_viewed` | survey_id, question_id, question_number | survey_bloc.dart:99 |
| `survey_question_answered` | survey_id, question_id | survey_bloc.dart:147 |
| `survey_completed` | survey_id, response_time | survey_bloc.dart:247 |
| `survey_abandoned` | survey_id, question_number | analytics_service.dart:163 |
| `survey_skipped` | survey_id, question_number | survey_detail_page.dart:527 |
| `survey_results_viewed` | survey_id | survey_detail_page.dart:509 |
| `profile_opened` | - | user_bloc.dart:29 |
| `profile_edited` | fields_changed | user_bloc.dart:128 |
| `privacy_settings_viewed` | - | analytics_service.dart:240 |
| `theme_toggled` | theme | theme_bloc.dart:19,22 |
| `navigation_changed` | tab_index, tab_name | nav_page.dart:84 |
| `error_occurred` | error_type, error_message, stack_trace | analytics_service.dart:309 |
| `learn_section_viewed` | - | kya_bloc.dart:27 |

### Events to Implement (High Priority)

| Event Name | Properties | Where to Add |
|------------|-----------|--------------|
| `alert_delivered` | alert_id, alert_type, pm25_level | PushNotificationService |
| `alert_opened` | alert_id, time_to_open_minutes | PushNotificationService |
| `alert_dismissed` | alert_id | NotificationManager |
| `alert_response_submitted` | alert_id, behavior_changed, action_type, barrier | SurveyRepository |
| `daily_exposure_summary` | date, avg_pm25, max_pm25, dominant_category, ping_count | ExposureCalculator |
| `consent_changed` | consent_type, consent_status | ResearchConsentRepository |
| `baseline_survey_started` | - | SurveyBloc |
| `baseline_survey_completed` | - | SurveyBloc |
| `endline_survey_started` | - | SurveyBloc |
| `endline_survey_completed` | - | SurveyBloc |
| `study_withdrawn` | reason | ResearchConsentRepository |
| `notification_settings_changed` | enabled | Settings page |

---

## APPENDIX B: Backend API Requirements

### 1. User Model Enhancements

Add these fields to the User model:

```json
{
  "city": "string",
  "cohort_id": "string",
  "study_arm": "intervention | control",
  "recruitment_channel": "string",
  "intervention_start_date": "datetime",
  "baseline_start_date": "datetime",
  "endline_completion_date": "datetime"
}
```

### 2. PostHog Server API Integration

Create a scheduled job (runs daily) to calculate and send:

```python
# Pseudocode
def daily_posthog_sync():
    for user in active_research_participants:
        # Calculate exposure metrics
        exposure = calculate_daily_exposure(user.id, yesterday)

        # Update PostHog person properties
        posthog.identify(
            distinct_id=user.id,
            properties={
                'avg_hourly_pm25_exposure': exposure.avg_hourly,
                'daily_cumulative_pm25': exposure.cumulative,
                'daily_exposure_peak_value': exposure.peak_value,
                'daily_exposure_peak_time': exposure.peak_time,
                'exposure_category': exposure.category,
                'distance_to_nearest_station_km': exposure.nearest_station_distance,
                'avg_daily_location_pings': exposure.ping_count,
                'total_location_sharing_duration_hours': user.total_sharing_hours,
            }
        )

        # If user completed survey, calculate scores
        if user.has_completed_baseline:
            scores = calculate_survey_scores(user.id, 'baseline')
            posthog.identify(distinct_id=user.id, properties=scores)
```

### 3. Survey Scoring Logic

Implement scoring algorithms for:
- Air Quality Awareness Score (0-100)
- Risk Perception Score (0-100)
- Protective Behaviors Score (0-100)
- Willingness to Adapt Score (0-100)
- Alert Usefulness Rating (1-5)

---

## CONCLUSION

This audit reveals that the AirQo mobile app has a **solid foundation** for analytics tracking with PostHog, but requires **targeted enhancements** to fully capture the 56 required research data points.

**Current State**: 32% fully tracked, 27% partially tracked
**Target State**: 98% trackable (55/56 data points)

**Critical Path**:
1. Implement alert tracking (HIGH impact, HIGH priority)
2. Enhance person properties (HIGH impact, MEDIUM effort)
3. Add exposure aggregation (HIGH impact, requires backend)
4. Backend integration for calculated metrics

With the recommended implementations, you'll have comprehensive tracking for the World Bank research study while maintaining user privacy and app performance.

---

**Report End**
