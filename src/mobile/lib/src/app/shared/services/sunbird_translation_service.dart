import 'dart:async';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

class SunbirdTranslationService with UiLoggy {
  static final SunbirdTranslationService _instance =
      SunbirdTranslationService._();
  factory SunbirdTranslationService() => _instance;
  SunbirdTranslationService._();

  static const String _baseUrl = 'https://api.sunbird.ai';

  // Maps Flutter locale codes to Sunbird language codes
  static const Map<String, String> _localeToSunbird = {
    'lg': 'lug', // Luganda
    'ach': 'ach', // Acholi
    'teo': 'teo', // Ateso
    'lgg': 'lgg', // Lugbara
    'nyn': 'nyn', // Runyankole
  };

  final Map<String, String> _cache = {};

  // Deduplicates in-flight requests: same text+lang shares one API call
  final Map<String, Future<String>> _inFlight = {};

  bool supportsTranslation(String localeCode) =>
      _localeToSunbird.containsKey(localeCode);

  Future<String> translate(
    String text, {
    required String targetLocale,
  }) async {
    if (text.isEmpty) return text;

    final targetLang = _localeToSunbird[targetLocale];
    if (targetLang == null) return text;

    final cacheKey = '$targetLang:$text';
    if (_cache.containsKey(cacheKey)) return _cache[cacheKey]!;

    // Reuse any in-flight request for the same text
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
    }
  }

  void clearCache() => _cache.clear();
}
