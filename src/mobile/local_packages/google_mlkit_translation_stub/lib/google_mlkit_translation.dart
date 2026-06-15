// This stub keeps simulator builds moving while we investigate auth.
// It intentionally preserves the tiny API surface used by the app and makes
// translation a no-op so the iOS MLKit native dependency is not loaded.
enum TranslateLanguage {
  english('en'),
  swahili('sw'),
  french('fr');

  const TranslateLanguage(this.bcpCode);

  final String bcpCode;
}

class OnDeviceTranslator {
  OnDeviceTranslator({
    required this.sourceLanguage,
    required this.targetLanguage,
  });

  final TranslateLanguage sourceLanguage;
  final TranslateLanguage targetLanguage;

  Future<String> translateText(String text) async => text;

  void close() {}
}

class OnDeviceTranslatorModelManager {
  Future<bool> isModelDownloaded(String languageCode) async => true;

  Future<void> downloadModel(
    String languageCode, {
    required bool isWifiRequired,
  }) async {}
}
