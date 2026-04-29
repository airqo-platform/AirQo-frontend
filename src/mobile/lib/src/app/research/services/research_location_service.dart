import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

import 'package:airqo/src/app/shared/services/analytics_service.dart';

/// Handles the two World Bank pilot location events:
///   • `app_opened_with_location` — fired on every app open / foreground resume
///   • `location_ping`            — fired every 20 min via a native Android
///                                  foreground service (fires while backgrounded)
///
/// The foreground service shows a persistent notification so it can keep running
/// through commutes without needing ACCESS_BACKGROUND_LOCATION.
class ResearchLocationService with UiLoggy {
  static final ResearchLocationService _instance =
      ResearchLocationService._internal();
  factory ResearchLocationService() => _instance;
  ResearchLocationService._internal();

  static const _channel = MethodChannel('com.airqo.app/location_service');
  // Keys are read from .env.prod at runtime — never hardcoded in source
  static String get _apiKey => dotenv.env['POSTHOG_API_KEY'] ?? '';
  static String get _host   => dotenv.env['POSTHOG_HOST'] ?? 'https://us.i.posthog.com';

  Timer? _pingTimer;

  // ── Public API ────────────────────────────────────────────────────────────

  /// Fires `app_opened_with_location`. Call on every app open and resume.
  Future<void> onAppOpen() async {
    final position = await _resolvePosition(context: 'app_open');
    await AnalyticsService().trackAppOpenedWithLocation(
      latitude:  position?.latitude,
      longitude: position?.longitude,
    );
  }

  /// Starts the native foreground service.
  /// The service runs a 20-min ping loop and survives app backgrounding.
  Future<void> startForegroundService() async {
    try {
      final distinctId = await Posthog().getDistinctId();
      await _channel.invokeMethod<void>('start', {
        'distinctId': distinctId,
        'apiKey':     _apiKey,
        'host':       _host,
      });
      loggy.info('[ResearchLocation] foreground service started');
    } catch (e) {
      loggy.warning('[ResearchLocation] could not start foreground service: $e');
    }
  }

  /// Starts a foreground-only 20-min ping timer (Dart layer).
  /// Fires while the app is visible; cancelled when the app backgrounds.
  /// Complements the native service which handles background pings.
  void startPeriodicPing() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(minutes: 20), (_) async {
      final position = await _resolvePosition(context: 'periodic_ping');
      if (position == null) return;
      await AnalyticsService().trackLocationPing(
        latitude:  position.latitude,
        longitude: position.longitude,
      );
    });
    loggy.info('[ResearchLocation] foreground ping timer started (20 min)');
  }

  /// Cancels the foreground ping timer. Call when the app backgrounds.
  void stopPeriodicPing() {
    _pingTimer?.cancel();
    _pingTimer = null;
    loggy.info('[ResearchLocation] foreground ping timer stopped');
  }

  /// Stops the foreground service. Call when the app is fully detached.
  Future<void> stopForegroundService() async {
    try {
      await _channel.invokeMethod<void>('stop');
      loggy.info('[ResearchLocation] foreground service stopped');
    } catch (e) {
      loggy.warning('[ResearchLocation] could not stop foreground service: $e');
    }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  Future<Position?> _resolvePosition({required String context}) async {
    final permStatus = await _checkPermission();
    if (permStatus != null) {
      loggy.warning(
        '[ResearchLocation] $context — no location ($permStatus); '
        'event will be sent without coordinates.',
      );
      return null;
    }

    try {
      final last = await Geolocator.getLastKnownPosition();
      if (last != null) return last;
    } catch (e) {
      loggy.warning('[ResearchLocation] $context — getLastKnownPosition: $e');
    }

    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 15));
    } on TimeoutException {
      loggy.warning('[ResearchLocation] $context — position fix timed out');
    } catch (e) {
      loggy.warning('[ResearchLocation] $context — getCurrentPosition: $e');
    }

    return null;
  }

  Future<String?> _checkPermission() async {
    bool serviceEnabled;
    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
    } catch (_) {
      return 'service check failed';
    }
    if (!serviceEnabled) return 'location services disabled';

    LocationPermission permission;
    try {
      permission = await Geolocator.checkPermission();
    } catch (_) {
      return 'permission check failed';
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return 'permission $permission';
    }
    return null;
  }
}
