import 'dart:async';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

class SunbirdTranslationService with UiLoggy {
  static final SunbirdTranslationService _instance =
      SunbirdTranslationService._();
  factory SunbirdTranslationService() => _instance;
  SunbirdTranslationService._();

  static const String _baseUrl = 'https://api.sunbird.ai';
  static const String _boxName = 'sunbirdTranslationBox';
  static const int _cacheTtlDays = 7;

  static const int _maxConcurrent = 3;
  int _activeRequests = 0;
  final List<Completer<void>> _requestQueue = [];

  static const Map<String, String> _localeToSunbird = {
    'lg': 'lug', // Luganda
    'ach': 'ach', // Acholi
    'teo': 'teo', // Ateso
    'lgg': 'lgg', // Lugbara
    'nyn': 'nyn', // Runyankole
  };

  final Map<String, String> _cache = {};

  final Map<String, Future<String>> _inFlight = {};

  Box? get _box => Hive.isBoxOpen(_boxName) ? Hive.box(_boxName) : null;

  void _loadFromDisk(String cacheKey) {
    final box = _box;
    if (box == null) return;
    final value = box.get(cacheKey) as String?;
    if (value == null) return;

    final tsKey = '$cacheKey\$ts';
    final ts = box.get(tsKey) as int?;

    // Entries with no timestamp (written before TTL was added) and genuinely
    // expired entries are both dropped so the next translate() re-fetches.
    final isExpired = ts == null ||
        DateTime.now().millisecondsSinceEpoch - ts >
            _cacheTtlDays * Duration.millisecondsPerDay;

    if (isExpired) {
      box.delete(cacheKey).ignore();
      box.delete(tsKey).ignore();
      return;
    }

    _cache[cacheKey] = value;
  }

  Future<void> _saveToDisk(String cacheKey, String value) async {
    try {
      final now = DateTime.now().millisecondsSinceEpoch;
      await _box?.put(cacheKey, value);
      await _box?.put('$cacheKey\$ts', now);
    } catch (e) {
      loggy.warning('Failed to persist Sunbird translation: $e');
    }
  }

  Future<void> _acquireSlot() async {
    if (_activeRequests < _maxConcurrent) {
      _activeRequests++;
      return;
    }
    final completer = Completer<void>();
    _requestQueue.add(completer);
    await completer.future;
    _activeRequests++;
  }

  void _releaseSlot() {
    _activeRequests--;
    if (_requestQueue.isNotEmpty) {
      _requestQueue.removeAt(0).complete();
    }
  }

  bool supportsTranslation(String localeCode) =>
      _localeToSunbird.containsKey(localeCode);

  bool isPrepared(String localeCode) {
    if (!supportsTranslation(localeCode)) return false;
    _hydrateCritical(_localeToSunbird[localeCode]!);
    return _areCriticalStringsCached(_localeToSunbird[localeCode]!);
  }

  void _hydrateCritical(String targetLang) {
    for (final s in _criticalUiStrings) {
      final key = '$targetLang:$s';
      if (!_cache.containsKey(key)) _loadFromDisk(key);
    }
  }

  bool _areCriticalStringsCached(String targetLang) =>
      _criticalUiStrings.every((s) => _cache.containsKey('$targetLang:$s'));

  Future<String> translate(
    String text, {
    required String targetLocale,
  }) async {
    if (text.isEmpty) return text;

    final targetLang = _localeToSunbird[targetLocale];
    if (targetLang == null) return text;

    final cacheKey = '$targetLang:$text';
    if (!_cache.containsKey(cacheKey)) _loadFromDisk(cacheKey);
    if (_cache.containsKey(cacheKey)) return _cache[cacheKey]!;

    if (_inFlight.containsKey(cacheKey)) return _inFlight[cacheKey]!;

    _inFlight[cacheKey] = _doTranslate(text, targetLang, cacheKey);
    try {
      return await _inFlight[cacheKey]!;
    } finally {
      _inFlight.remove(cacheKey);
    }
  }

  Future<String> _doTranslate(
      String text, String targetLang, String cacheKey) async {
    final apiKey = dotenv.env['SUNBIRD_API_KEY'];
    if (apiKey == null || apiKey == 'your_sunbird_api_key_here') {
      loggy.warning('SUNBIRD_API_KEY not configured');
      return text;
    }

    await _acquireSlot();
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/tasks/translate'),
            headers: {
              'Authorization': 'Bearer $apiKey',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({
              'source_language': 'eng',
              'target_language': targetLang,
              'text': text,
            }),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final translated =
            data['output']?['translated_text'] as String? ?? text;
        _cache[cacheKey] = translated;
        await _saveToDisk(cacheKey, translated);
        loggy.info('Translated "$text" → "$translated" [$targetLang]');
        return translated;
      } else {
        loggy.warning(
            'Sunbird API ${response.statusCode} for "$text": ${response.body}');
        return text;
      }
    } catch (e) {
      loggy.warning('Translation failed for "$text": $e');
      return text;
    } finally {
      _releaseSlot();
    }
  }

  static const List<String> _knownUiStrings = [
    'Hello',
    'Hello 👋',
    'Hello, 👋',
    'Home',
    'Search',
    'Exposure',
    'Near You',
    'Favorites',
    "Today's Air Quality",
    'Today',
    'Forecast not available',
    "Today's health tip",
    'Health tip not available for this air quality level.',
    'Try Again',
    'Refresh',
    'Retry',
    'Open Location Settings',
    'Please enable location services and return to the app',
    'Please log in to access this feature.',
    'Login Required',
    'No locations available',
    'All',
    'Please log in to save your locations',
    'Good',
    'Moderate',
    'Unhealthy for Sensitive Groups',
    'Unhealthy',
    'Very Unhealthy',
    'Hazardous',
    'Unknown',
    'View air quality in locations closest to you',
    'Save your most relevant locations in one place',
    'Sign in or create an account',
    'View your profile',
    'Sign in to access your profile',
    'Air Quality is Good',
    'Air Quality is Moderate',
    'Air Quality is Unhealthy for Sensitive Groups',
    'Air Quality is Unhealthy',
    'Air Quality is Very Unhealthy',
    'Air Quality is Hazardous',
    'Air Quality is Unknown',
    'Uploading...',
    'Save changes',
    'Login',
    'Cancel',
    'Verify Now',
    'Submit',
    'Continue',
    'Resend',
    'Reset Password',
    'Please verify your email address',
    'Email Verification Required',
    'Your account has not been verified yet.',
    'Please check your email for a verification code or request a new one.',
    "Don't have an account?",
    'Create Account',
    'Forgot password?',
    'Verify account',
    'Enter your email address and we will send you a code to reset your password.',
    "Please enter your new password below. Make sure it's something secure that you can remember.",
    'We just sent you a Password Reset Code to your email',
    "Didn't receive the code?",
    'Your password has been reset successfully!',
    'You can now log in to your account using your new password.',
    'Already have an account?',
    'No, Thanks',
    'Learn',
    'Explore lessons to understand air quality, or take surveys to help us learn about your experience.',
    'Lessons',
    'Surveys',
    'Lesson',
    'New',
    'Completed',
    'In Progress',
    'Unable to load surveys',
    'No surveys available',
    'Check back later for new research surveys.',
    '👋🏼 Great Job !',
    'Loading know your air content...',
    'Already Submitted',
    'OK',
    'Previous',
    'AirQo map',
    'Open Settings',
    'Close',
    'Delete',
    'Remove',
    'Discard',
    'Confirm',
    'Withdraw',
    'Done',
    'Save',
    'Share',
    'Private',
    'Share All',
    'Make All Private',
    'Show All Data',
    'View Details',
    'View Data',
    'Delete Range',
    'Add Zone',
    'Manage Sharing Preferences',
    'Edit your profile',
    'Loading your profile...',
    'Settings',
    'Edit your profile details here',
    'Update your information to keep your account current',
    'Discard Changes?',
    'You have unsaved changes. Are you sure you want to go back?',
    'Choose from library',
    'Take photo',
    'This is where you\'ll manage your AirQo devices.',
    'Location & Privacy',
    'Data Management',
    'Location History',
    'Data Sharing',
    'Research Contribution',
    'Help improve air quality research by sharing anonymous location data with researchers',
    'Remove Privacy Zone',
    'Are you sure you want to remove this privacy zone?',
    'Location Details',
    'My Location Data',
    'Research Settings',
    'Research Consent',
    'Manage your research participation preferences',
    'Manage Consent',
    'Not enrolled in research study',
    'Join Research Study',
    'Your responses help researchers understand how effective air quality alerts are at changing behavior.',
    'Data Handling & Withdrawal',
    'Understand how your data is used and withdrawal options',
    'Data Protection & Your Rights',
    'Complete Study Withdrawal',
    'You can withdraw from the study at any time. Your data will be deleted within 30 days and no further data will be collected.',
    'Withdraw from Study',
    'Are you sure you want to completely withdraw from the research study?',
    'This action will:',
    'Reason for Withdrawal (Optional)',
    'Help us improve future studies:',
    'Study Progress',
    'Research Study',
    'Thank you for joining our research study!',
    '👋 Welcome to AirQo!',
    'Clean Air for all African Cities.',
    '🌿 Breathe Clean',
    'Track and monitor the quality of air you breathe',
    '✨ Know Your Air',
    'Learn and reduce air pollution in your community',
    'Add places you love',
    'Start by adding locations you care about.',
    '+Add Location',
    'Cannot Remove Default Location',
    'You need to have at least one location in My Places. Add another location before removing this one.',
    'Select Locations',
    'Search Villages, Cities or Countries',
    'Swipe left to remove location',
    'Unknown location',
    'PM2.5',
    'Low Cost Sensor',
    'Reference Monitor',
    'You can select up to',
    'Location added to favorites',
    'Location removed from favorites',
    'Locations saved successfully',
    'Maximum of',
    'favorite locations reached',
    'Your session has expired. Please log in again.',
    'Authentication issue detected. Please log in again.',
    'Clear All',
    'Enjoy outdoor activities in good air quality',
    'Air quality is acceptable for most people',
    'Sensitive groups should limit outdoor exertion',
    'Everyone should reduce prolonged outdoor activities',
    'Everyone should avoid outdoor activities',
    'Everyone should avoid all outdoor activities',
    'Stay informed about air quality',
    'Guest User',
    'No Notifications',
    "Here you'll find all updates on our Air Quality network",
    "You're all cleared up",
    'You deserve some ice cream!',
    'The app is currently under maintenance',
    "We're having issues with our network\nno worries, we'll be back up soon.",
    'Image selected. Save to upload.',
    'First name cannot be empty',
    'Last name cannot be empty',
    'Email cannot be empty',
    'Please enter a valid email address',
    'Profile image successfully added',
    'Profile updated successfully',
    'Unable to update profile. Please try again.',
    'Check your internet connection and try again.',
    'Something went wrong. Please try again later.',
    'Please enable location services in settings.',
    'Location permission denied.',
    'Location permission permanently denied. Please enable it in settings.',
    'An unexpected error occurred during logout',
    'An Error Occurred',
    'Skip This Version',
    'Later',
    'Update',
    'Notifications Blocked',
    'Enable Notifications',
    'Not Now',
    'Enable',
    'Location Permission Required',
    'Location Services Disabled',
    'Location permission was denied. Please try again.',
    'Location', 'Languages', 'Log out', 'Log Out', 'Delete Account',
  ];

  // MAINTENANCE: matched by exact string value as cache keys — update here if any UI string changes.
  static const List<String> _criticalUiStrings = [
    'Home', 'Search', 'Exposure', 'Learn',
    'Near You', 'Favorites', "Today's Air Quality", 'Settings',
    'Good', 'Moderate', 'Unhealthy for Sensitive Groups',
    'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Unknown',
    // Settings screen
    'Location', 'Languages', 'Log out', 'Log Out', 'Delete Account',
  ];

  Future<void> prepare({required String targetLocale}) async {
    if (!supportsTranslation(targetLocale)) return;

    final targetLang = _localeToSunbird[targetLocale]!;
    _hydrateCritical(targetLang);

    if (_areCriticalStringsCached(targetLang)) {
      prewarm(targetLocale: targetLocale);
      return;
    }

    final results = await Future.wait(
      _criticalUiStrings.map((s) => translate(s, targetLocale: targetLocale)),
    );

    final allFailed = results.asMap().entries.every(
      (e) => e.value == _criticalUiStrings[e.key],
    );
    if (allFailed) {
      throw Exception('Sunbird translation unavailable for $targetLocale');
    }

    prewarm(targetLocale: targetLocale);
  }

  void prewarm({required String targetLocale}) {
    if (!supportsTranslation(targetLocale)) return;
    for (final s in _knownUiStrings) {
      translate(s, targetLocale: targetLocale);
    }
    loggy.info(
        'Sunbird prewarm started for $targetLocale (${_knownUiStrings.length} strings)');
  }

  Future<void> clearCache() async {
    _cache.clear();
    await _box?.clear();
  }
}
