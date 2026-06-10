import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

abstract class OAuthService {
  Future<String> authenticate(String provider);
}

class OAuthServiceImpl implements OAuthService {
  static const _callbackScheme = 'airqo';

  @override
  Future<String> authenticate(String provider) async {
    final baseUrl = dotenv.env['AIRQO_API_URL'];
    if (baseUrl == null || baseUrl.isEmpty) {
      throw Exception('AIRQO_API_URL is not configured. Check your .env file.');
    }
    final authUrl = '$baseUrl/api/v2/users/auth/$provider?tenant=airqo';

    final String result;
    try {
      result = await FlutterWebAuth2.authenticate(
        url: authUrl,
        callbackUrlScheme: _callbackScheme,
      );
    } on PlatformException catch (e) {
      if (e.code == 'CANCELED' || e.code == 'UserCanceled') {
        throw const OAuthCancelledException();
      }
      rethrow;
    }

    final uri = Uri.parse(result);

    if (uri.host == 'oauth' && uri.path == '/failure') {
      throw Exception('Sign-in failed. Please try again.');
    }

    final token = uri.queryParameters['token'];
    if (token == null || token.isEmpty) {
      throw Exception(
        'Sign-in incomplete — authentication token not received. '
        'Please contact support if this persists.',
      );
    }

    return token;
  }
}

class OAuthCancelledException implements Exception {
  const OAuthCancelledException();
}
