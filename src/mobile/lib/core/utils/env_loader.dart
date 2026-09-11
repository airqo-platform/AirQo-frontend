import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Loads bundled env files. `.env.prod` is committed as a placeholder so a
/// clean clone always has a file for Flutter to package.
Future<void> loadAppEnv() async {
  const candidates = ['.env.prod', '.env.dev', '.env.example'];
  Object? lastError;
  for (final name in candidates) {
    try {
      await dotenv.load(fileName: name);
      return;
    } catch (e) {
      lastError = e;
    }
  }
  throw StateError(
    'No env file found. Expected src/mobile/.env.prod. Last error: $lastError',
  );
}
