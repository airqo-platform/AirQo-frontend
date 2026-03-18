import 'dart:async';
import 'package:google_mlkit_translation/google_mlkit_translation.dart';
import 'package:loggy/loggy.dart';

class MlKitTranslationService with UiLoggy {
  static final MlKitTranslationService _instance =
      MlKitTranslationService._();
  factory MlKitTranslationService() => _instance;
  MlKitTranslationService._();

  // Maps Flutter locale codes to ML Kit language codes
  static const Map<String, TranslateLanguage> _localeToMlKit = {
    'sw': TranslateLanguage.swahili,
    'fr': TranslateLanguage.french,
  };

  final Map<String, OnDeviceTranslator> _translators = {};
  final Map<String, String> _cache = {};
  final Map<String, Future<String>> _inFlight = {};
  final Set<String> _downloadedModels = {};

  bool supportsTranslation(String localeCode) =>
      _localeToMlKit.containsKey(localeCode);

  Future<String> translate(String text, {required String targetLocale}) async {
    if (text.isEmpty) return text;

    final targetLang = _localeToMlKit[targetLocale];
    if (targetLang == null) return text;

    final cacheKey = '$targetLocale:$text';
    if (_cache.containsKey(cacheKey)) return _cache[cacheKey]!;

    if (_inFlight.containsKey(cacheKey)) return _inFlight[cacheKey]!;

    _inFlight[cacheKey] = _doTranslate(text, targetLocale, targetLang, cacheKey);
    try {
      return await _inFlight[cacheKey]!;
    } finally {
      _inFlight.remove(cacheKey);
    }
  }

  Future<String> _doTranslate(
    String text,
    String targetLocale,
    TranslateLanguage targetLang,
    String cacheKey,
  ) async {
    try {
      final translator = _getTranslator(targetLang);

      // Download model on first use for this language
      if (!_downloadedModels.contains(targetLocale)) {
        await _ensureModelDownloaded(targetLang, targetLocale);
      }

      final translated = await translator.translateText(text);
      _cache[cacheKey] = translated;
      loggy.info('ML Kit translated "$text" → "$translated" [$targetLocale]');
      return translated;
    } catch (e) {
      loggy.warning('ML Kit translation failed for "$text": $e');
      return text;
    }
  }

  OnDeviceTranslator _getTranslator(TranslateLanguage targetLang) {
    final key = targetLang.bcpCode;
    return _translators.putIfAbsent(
      key,
      () => OnDeviceTranslator(
        sourceLanguage: TranslateLanguage.english,
        targetLanguage: targetLang,
      ),
    );
  }

  Future<void> _ensureModelDownloaded(
      TranslateLanguage lang, String localeCode) async {
    final modelManager = OnDeviceTranslatorModelManager();
    final isDownloaded =
        await modelManager.isModelDownloaded(lang.bcpCode);

    if (!isDownloaded) {
      loggy.info('Downloading ML Kit model for $localeCode...');
      await modelManager.downloadModel(lang.bcpCode, isWifiRequired: false);
      loggy.info('ML Kit model downloaded for $localeCode');
    }

    _downloadedModels.add(localeCode);
  }

  void dispose() {
    for (final translator in _translators.values) {
      translator.close();
    }
    _translators.clear();
  }

  void clearCache() => _cache.clear();
}
