

import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

class AutoUpdateService with UiLoggy {
  static final AutoUpdateService _instance = AutoUpdateService._internal();
  factory AutoUpdateService() => _instance;
  AutoUpdateService._internal();

  static const String _lastUpdateCheckKey = 'last_update_check';
  static const String _updateSkippedVersionKey = 'update_skipped_version';
  
  static const Duration _updateCheckInterval = Duration(days: 3);

  GlobalKey<NavigatorState>? _navigatorKey;

  void setNavigatorKey(GlobalKey<NavigatorState> key) {
    _navigatorKey = key;
  }

  Future<bool> checkForUpdates({bool showDialog = true}) async {
    try {
      if (!await _shouldCheckForUpdates()) {
        loggy.info('Skipping update check - checked recently');
        return false;
      }

      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;
      final packageName = packageInfo.packageName;
      
      String? storeVersion;
      
      if (Platform.isAndroid) {
        storeVersion = await _getAndroidStoreVersion(packageName);
      }
      
      if (storeVersion != null && _compareVersions(storeVersion, currentVersion) > 0) {
        await _saveLastUpdateCheck();
        loggy.info('Update available: $currentVersion -> $storeVersion');
        
        if (showDialog) {
          await _showUpdateDialog(currentVersion, storeVersion, packageName);
        }
        return true;
      }
      
      await _saveLastUpdateCheck();
      loggy.info('App is up to date: $currentVersion');
      return false;
    } catch (e) {
      loggy.error('Error checking for updates: $e');
      return false;
    }
  }


  Future<String?> _getAndroidStoreVersion(String packageName) async {
    try {
      final url = 'https://play.google.com/store/apps/details?id=$packageName&hl=en';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {

        final html = response.body;
        
        final versionRegex = RegExp(r'"(\d+\.\d+\.\d+)"');
        final matches = versionRegex.allMatches(html);

        final patterns = [
          RegExp(r'Current Version[^>]*>([^<]+)<'),
          RegExp(r'softwareVersion["\s]*:["\s]*([^"]+)'),
          RegExp(r'versionName["\s]*:["\s]*([^"]+)'),
        ];
        
        for (final pattern in patterns) {
          final match = pattern.firstMatch(html);
          if (match != null) {
            final version = match.group(1)?.trim();
            if (version != null && _isValidVersion(version)) {
              loggy.info('Found Android store version: $version');
              return version;
            }
          }
        }

        if (matches.isNotEmpty) {
          final version = matches.first.group(1);
          if (version != null && _isValidVersion(version)) {
            loggy.info('Found Android store version (fallback): $version');
            return version;
          }
        }
      }
    } catch (e) {
      loggy.error('Error getting Android store version: $e');
    }
    return null;
  }



  bool _isValidVersion(String version) {
    final versionRegex = RegExp(r'^\d+\.\d+\.\d+');
    return versionRegex.hasMatch(version);
  }

  int _compareVersions(String version1, String version2) {
    try {
      List<int> v1Parts = version1.split('.').map(int.parse).toList();
      List<int> v2Parts = version2.split('.').map(int.parse).toList();
      
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
      loggy.error('Error comparing versions: $e');
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

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.blue.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.system_update, color: Colors.blue.shade700, size: 24),
            ),
            const SizedBox(width: 12),
            const Expanded(child: Text('Update Available')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Current:', style: TextStyle(fontWeight: FontWeight.w500)),
                      Text(currentVersion),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Latest:', style: TextStyle(fontWeight: FontWeight.w500)),
                      Text(latestVersion, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.star, color: Colors.blue.shade700, size: 20),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Get the latest features and improvements by updating now.',
                      style: TextStyle(fontSize: 14),
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
            child: const Text('Skip This Version'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Later'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).pop();
              _openAppStore(packageName);
            },
            icon: const Icon(Icons.download),
            label: const Text('Update'),
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
      final prefs = await SharedPreferences.getInstance();
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
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_lastUpdateCheckKey, DateTime.now().millisecondsSinceEpoch);
    } catch (e) {
      loggy.error('Error saving last update check: $e');
    }
  }

  Future<void> _skipVersion(String version) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_updateSkippedVersionKey, version);
      loggy.info('User skipped version: $version');
    } catch (e) {
      loggy.error('Error skipping version: $e');
    }
  }

  Future<bool> _isVersionSkipped(String version) async {
    try {
      final prefs = await SharedPreferences.getInstance();
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
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_lastUpdateCheckKey);
      await prefs.remove(_updateSkippedVersionKey);
      loggy.info('Cleared update preferences');
    } catch (e) {
      loggy.error('Error clearing update preferences: $e');
    }
  }
}