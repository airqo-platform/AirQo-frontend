import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class AutoUpdateService with UiLoggy {
  static final AutoUpdateService _instance = AutoUpdateService._internal();
  factory AutoUpdateService() => _instance;
  AutoUpdateService._internal() : _httpClient = null, _packageInfo = null, _sharedPreferences = null;

  final http.Client? _httpClient;
  final PackageInfo? _packageInfo;
  final SharedPreferences? _sharedPreferences;

  AutoUpdateService.test({
    http.Client? httpClient,
    PackageInfo? packageInfo,
    SharedPreferences? sharedPreferences,
  })  : _httpClient = httpClient,
        _packageInfo = packageInfo,
        _sharedPreferences = sharedPreferences;

  static const String _lastUpdateCheckKey = 'last_update_check';
  static const String _updateSkippedVersionKey = 'update_skipped_version';
  static const String _lastKnownVersionKey = 'last_known_version';
  
  static const Duration _updateCheckInterval = Duration(days: 3);
  static const Duration _requestTimeout = Duration(seconds: 15);

  GlobalKey<NavigatorState>? _navigatorKey;

  void setNavigatorKey(GlobalKey<NavigatorState> key) {
    _navigatorKey = key;
  }

  Future<PackageInfo> _getPackageInfo() async {
    return _packageInfo ?? await PackageInfo.fromPlatform();
  }

  Future<SharedPreferences> _getSharedPreferences() async {
    return _sharedPreferences ?? await SharedPreferences.getInstance();
  }

  Future<http.Response> _makeHttpGet(Uri uri, Map<String, String> headers) async {
    return _httpClient != null
        ? await _httpClient.get(uri, headers: headers)
        : await http.get(uri, headers: headers);
  }

  Future<bool> checkForUpdates({bool showDialog = true}) async {
    try {
      if (!await _shouldCheckForUpdates()) {
        loggy.info('Skipping update check - checked recently');
        return false;
      }

      final packageInfo = await _getPackageInfo();
      final currentVersion = packageInfo.version;
      final packageName = packageInfo.packageName;
      
      String? storeVersion;
      
      if (Platform.isAndroid) {
        storeVersion = await _getAndroidStoreVersion(packageName);
      }
      
      if (storeVersion != null && _compareVersions(storeVersion, currentVersion) > 0) {
        await _saveLastUpdateCheck();
        await _saveLastKnownVersion(storeVersion);
        loggy.info('Update available: $currentVersion -> $storeVersion');
        
        if (showDialog) {
          await _showUpdateDialog(currentVersion, storeVersion, packageName);
        }
        return true;
      }
      
      await _saveLastUpdateCheck();
      if (storeVersion != null) {
        await _saveLastKnownVersion(storeVersion);
      }
      loggy.info('App is up to date: $currentVersion');
      return false;
    } catch (e) {
      loggy.error('Error checking for updates: $e');
      return false;
    }
  }

  Future<String?> _getAndroidStoreVersion(String packageName) async {
    loggy.info('Fetching Android store version for package: $packageName');
    
    final strategies = [
      _VersionStrategy('Play Store HTML Scraping', () => _getVersionFromPlayStoreHTML(packageName)),
      _VersionStrategy('Cached Version Fallback', () => _getCachedVersion()),
    ];

    for (int i = 0; i < strategies.length; i++) {
      final strategy = strategies[i];
      try {
        loggy.info('Trying strategy ${i + 1}: ${strategy.name}');
        
        final version = await strategy.fetch().timeout(_requestTimeout);
        if (version != null && _isValidVersion(version)) {
          loggy.info('Strategy ${i + 1} (${strategy.name}) succeeded: $version');
          return version;
        } else if (version != null) {
          loggy.warning('Strategy ${i + 1} found invalid version: $version');
        }
      } on TimeoutException catch (e) {
        loggy.warning('Strategy ${i + 1} (${strategy.name}) timed out: $e');
      } catch (e) {
        loggy.warning('Strategy ${i + 1} (${strategy.name}) failed: $e');
      }
    }

    loggy.error('All version fetch strategies failed for package: $packageName');
    return null;
  }

  Future<String?> _getVersionFromPlayStoreHTML(String packageName) async {
    try {
      final url = 'https://play.google.com/store/apps/details?id=$packageName&hl=en';
      
      final response = await _makeHttpGet(
        Uri.parse(url),
        {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      );

      if (response.statusCode != 200) {
        loggy.error('Play Store request failed with status: ${response.statusCode}');
        return null;
      }

      final html = response.body;
      loggy.info('Successfully fetched Play Store page (${html.length} characters)');

      final version = _extractVersionFromHTML(html);
      
      if (version != null) {
        loggy.info('Successfully extracted version: $version');
        return version;
      }

      loggy.warning('All HTML extraction patterns failed');
      _logDebuggingInfo(html, packageName);
      return null;

    } on SocketException catch (e) {
      loggy.error('Network error while fetching Play Store page: $e');
      return null;
    } catch (e) {
      loggy.error('Unexpected error fetching Play Store HTML: $e');
      return null;
    }
  }

  String? _extractVersionFromHTML(String html) {
    final extractionMethods = [
      _ExtractionMethod('JSON Data Pattern', () => _extractFromJsonData(html)),
      _ExtractionMethod('Current Version Pattern', () => _extractFromCurrentVersion(html)),
      _ExtractionMethod('Meta Tag Pattern', () => _extractFromMetaTags(html)),
      _ExtractionMethod('Script Content Pattern', () => _extractFromScriptContent(html)),
      _ExtractionMethod('General Version Pattern', () => _extractFromGeneralPattern(html)),
    ];

    for (int i = 0; i < extractionMethods.length; i++) {
      final method = extractionMethods[i];
      try {
        loggy.debug('Trying extraction method ${i + 1}: ${method.name}');
        
        final version = method.extract();
        if (version != null && _isValidVersion(version)) {
          loggy.info('Extraction method ${i + 1} (${method.name}) succeeded: $version');
          return version;
        }
      } catch (e) {
        loggy.debug('Extraction method ${i + 1} (${method.name}) failed: $e');
      }
    }

    return null;
  }

  String? _extractFromJsonData(String html) {
    final patterns = [
      RegExp(r'"versionName"\s*:\s*"([^"]+)"'),
      RegExp(r'"softwareVersion"\s*:\s*"([^"]+)"'),
      RegExp(r'"version"\s*:\s*"([^"]+)"'),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(html);
      if (match != null) {
        return match.group(1)?.trim();
      }
    }
    return null;
  }

  String? _extractFromCurrentVersion(String html) {
    final patterns = [
      RegExp(r'Current Version</span>.*?<span[^>]*>([^<]+)</span>', dotAll: true),
      RegExp(r'Current Version[^>]*>([^<]+)<'),
      RegExp(r'>Current Version<.*?>([^<]+)<', dotAll: true),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(html);
      if (match != null) {
        return match.group(1)?.trim();
      }
    }
    return null;
  }

  String? _extractFromMetaTags(String html) {
    final patterns = [
      RegExp(r'<meta[^>]*name="version"[^>]*content="([^"]+)"', caseSensitive: false),
      RegExp(r'<meta[^>]*property="app:version"[^>]*content="([^"]+)"', caseSensitive: false),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(html);
      if (match != null) {
        return match.group(1)?.trim();
      }
    }
    return null;
  }

  String? _extractFromScriptContent(String html) {
    final scriptPattern = RegExp(r'<script[^>]*>(.*?)</script>', dotAll: true);
    final scripts = scriptPattern.allMatches(html);
    
    final versionPatterns = [
      RegExp(r'version["\s]*:["\s]*"([^"]+)"'),
      RegExp(r'appVersion["\s]*:["\s]*"([^"]+)"'),
      RegExp(r'currentVersion["\s]*:["\s]*"([^"]+)"'),
    ];
    
    for (final script in scripts) {
      final content = script.group(1);
      if (content != null) {
        for (final versionPattern in versionPatterns) {
          final match = versionPattern.firstMatch(content);
          if (match != null) {
            final version = match.group(1)?.trim();
            if (version != null && version.isNotEmpty) {
              return version;
            }
          }
        }
      }
    }
    return null;
  }

  String? _extractFromGeneralPattern(String html) {
    final versionRegex = RegExp(r'(\d+\.\d+\.\d+(?:\.\d+)?)');
    final matches = versionRegex.allMatches(html);

    for (final match in matches) {
      final version = match.group(1);
      if (version != null) {
        final parts = version.split('.');
        if (parts.length >= 3 && parts.length <= 4) {
          final majorVersion = int.tryParse(parts[0]);
          if (majorVersion != null && majorVersion >= 1 && majorVersion <= 99) {
            return version;
          }
        }
      }
    }
    return null;
  }

  Future<String?> _getCachedVersion() async {
    try {
      final prefs = await _getSharedPreferences();
      final cachedVersion = prefs.getString(_lastKnownVersionKey);
      
      if (cachedVersion != null) {
        loggy.info('Using cached version: $cachedVersion');
        return cachedVersion;
      }
    } catch (e) {
      loggy.warning('Failed to get cached version: $e');
    }
    
    return null;
  }

  void _logDebuggingInfo(String html, String packageName) {
    final sample = html.length > 1000 ? html.substring(0, 1000) : html;
    loggy.debug('HTML sample for debugging: $sample...');
    
    final versionLikePatterns = RegExp(r'\d+\.\d+\.\d+').allMatches(html);
    final versions = versionLikePatterns.map((m) => m.group(0)).take(10).toList();
    loggy.debug('Found version-like patterns: $versions');
  }

  Future<void> _saveLastKnownVersion(String version) async {
    try {
      final prefs = await _getSharedPreferences();
      await prefs.setString(_lastKnownVersionKey, version);
      loggy.info('Saved last known version: $version');
    } catch (e) {
      loggy.error('Error saving last known version: $e');
    }
  }

  bool _isValidVersion(String version) {
    if (version.isEmpty) return false;
    
    final versionRegex = RegExp(r'^\d+\.\d+\.\d+(\.\d+)?$');
    final isValid = versionRegex.hasMatch(version.trim());
    
    if (!isValid) {
      loggy.debug('Invalid version format: "$version"');
    }
    
    return isValid;
  }

  int _compareVersions(String version1, String version2) {
    try {
      version1 = version1.trim();
      version2 = version2.trim();
      
      List<int> v1Parts = version1.split('.').map((part) {
        final parsed = int.tryParse(part.trim());
        if (parsed == null) {
          loggy.warning('Invalid version part: "$part" in version "$version1"');
          return 0;
        }
        return parsed;
      }).toList();
      
      List<int> v2Parts = version2.split('.').map((part) {
        final parsed = int.tryParse(part.trim());
        if (parsed == null) {
          loggy.warning('Invalid version part: "$part" in version "$version2"');
          return 0;
        }
        return parsed;
      }).toList();
      
      int maxLength = [v1Parts.length, v2Parts.length].reduce((a, b) => a > b ? a : b);
      
      while (v1Parts.length < maxLength) {
        v1Parts.add(0);
      }
      while (v2Parts.length < maxLength) {
        v2Parts.add(0);
      }
      
      for (int i = 0; i < maxLength; i++) {
        if (v1Parts[i] > v2Parts[i]) return 1;
        if (v1Parts[i] < v2Parts[i]) return -1;
      }
      return 0;
    } catch (e) {
      loggy.error('Error comparing versions "$version1" and "$version2": $e');
      return 0;
    }
  }

  Future<void> _showUpdateDialog(String currentVersion, String latestVersion, String packageName) async {
    final context = _getCurrentContext();
    if (context == null) {
      loggy.warning('Cannot show update dialog: no context available');
      return;
    }

    if (await _isVersionSkipped(latestVersion)) {
      loggy.info('User previously skipped version $latestVersion');
      return;
    }

    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDarkMode 
            ? AppColors.darkHighlight 
            : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.system_update, 
                color: AppColors.primaryColor, 
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Update Available',
                style: TextStyle(
                  color: isDarkMode 
                      ? Colors.white 
                      : AppColors.boldHeadlineColor4,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDarkMode 
                    ? AppColors.dividerColordark 
                    : AppColors.lightHighlight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Current:', 
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                      Text(
                        currentVersion,
                        style: TextStyle(
                          color: isDarkMode 
                              ? Colors.white 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Latest:', 
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                      Text(
                        latestVersion, 
                        style: const TextStyle(
                          color: Colors.green, 
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.primaryColor.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.star, 
                    color: AppColors.primaryColor, 
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Get the latest features and improvements by updating now.',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDarkMode 
                            ? Colors.white 
                            : AppColors.boldHeadlineColor4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _skipVersion(latestVersion);
            },
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode 
                  ? AppColors.secondaryHeadlineColor2 
                  : AppColors.secondaryHeadlineColor,
            ),
            child: const Text('Skip This Version'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode 
                  ? AppColors.secondaryHeadlineColor2 
                  : AppColors.secondaryHeadlineColor,
            ),
            child: const Text('Later'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).pop();
              _openAppStore(packageName);
            },
            icon: const Icon(Icons.download),
            label: const Text('Update'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openAppStore(String packageName) async {
    try {
      String url;
      if (Platform.isAndroid) {
        url = 'https://play.google.com/store/apps/details?id=$packageName';
      } else {
        throw UnsupportedError('Platform not supported');
      }
      
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        loggy.info('Opened app store for update');
      } else {
        loggy.error('Could not launch app store URL: $url');
      }
    } catch (e) {
      loggy.error('Error opening app store: $e');
    }
  }

  BuildContext? _getCurrentContext() {
    return _navigatorKey?.currentContext;
  }

  Future<bool> _shouldCheckForUpdates() async {
    try {
      final prefs = await _getSharedPreferences();
      final lastCheck = prefs.getInt(_lastUpdateCheckKey);
      if (lastCheck == null) return true;
      
      final lastCheckTime = DateTime.fromMillisecondsSinceEpoch(lastCheck);
      return DateTime.now().difference(lastCheckTime) >= _updateCheckInterval;
    } catch (e) {
      return true;
    }
  }

  Future<void> _saveLastUpdateCheck() async {
    try {
      final prefs = await _getSharedPreferences();
      await prefs.setInt(_lastUpdateCheckKey, DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      loggy.error('Error saving last update check: $e');
    }
  }

  Future<void> _skipVersion(String version) async {
    try {
      final prefs = await _getSharedPreferences();
      await prefs.setString(_updateSkippedVersionKey, version);
      loggy.info('User skipped version: $version');
    } catch (e) {
      loggy.error('Error skipping version: $e');
    }
  }

  Future<bool> _isVersionSkipped(String version) async {
    try {
      final prefs = await _getSharedPreferences();
      return prefs.getString(_updateSkippedVersionKey) == version;
    } catch (e) {
      return false;
    }
  }

  void initialize(GlobalKey<NavigatorState> navigatorKey) {
    setNavigatorKey(navigatorKey);
    
    Timer(const Duration(seconds: 5), () {
      checkForUpdates();
    });
  }

  Future<bool> manualUpdateCheck() async {
    return await checkForUpdates(showDialog: true);
  }

  Future<void> clearUpdatePreferences() async {
    try {
      final prefs = await _getSharedPreferences();
      await prefs.remove(_lastUpdateCheckKey);
      await prefs.remove(_updateSkippedVersionKey);
      await prefs.remove(_lastKnownVersionKey);
      loggy.info('Cleared update preferences');
    } catch (e) {
      loggy.error('Error clearing update preferences: $e');
    }
  }

  Future<Map<String, dynamic>> getUpdateAnalytics() async {
    try {
      final prefs = await _getSharedPreferences();
      final lastCheck = prefs.getInt(_lastUpdateCheckKey);
      final skippedVersion = prefs.getString(_updateSkippedVersionKey);
      final lastKnownVersion = prefs.getString(_lastKnownVersionKey);
      
      return {
        'lastCheck': lastCheck != null ? DateTime.fromMillisecondsSinceEpoch(lastCheck) : null,
        'skippedVersion': skippedVersion,
        'lastKnownVersion': lastKnownVersion,
        'daysSinceLastCheck': lastCheck != null 
          ? DateTime.now().difference(DateTime.fromMillisecondsSinceEpoch(lastCheck)).inDays 
          : null,
      };
    } catch (e) {
      loggy.error('Error getting update analytics: $e');
      return {};
    }
  }
}

class _VersionStrategy {
  final String name;
  final Future<String?> Function() fetch;

  _VersionStrategy(this.name, this.fetch);
}

class _ExtractionMethod {
  final String name;
  final String? Function() extract;

  _ExtractionMethod(this.name, this.extract);
}