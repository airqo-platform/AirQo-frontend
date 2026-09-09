import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Loads the first bundled env file that exists.
///
/// Production and CI ship `.env.prod`. A fresh local clone only has
/// `.env.example` until `tool/setup_local.sh` copies it.
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
    'No env file found. From src/mobile run: bash tool/setup_local.sh. '
    'Last error: $lastError',
  );
}
