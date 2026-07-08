import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/token_refresher.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:loggy/loggy.dart';

/// Handles opt-in submissions of a user's Clean Air Forum selfie filter
/// image to the conference "wall" display screen, via the AirQo backend's
/// `POST /api/v2/users/selfies` endpoint.
///
/// Submissions work anonymously — the backend generates a display name and
/// avatar when none is supplied. When the user is logged in, their JWT is
/// attached so the wall shows their real name instead of a generated one.
class CleanAirForumSubmissionService with UiLoggy {
  /// Injected refresher — defaults to [DefaultTokenRefresher].
  /// Swap out in tests without touching production code (DIP).
  final TokenRefresher _tokenRefresher;

  CleanAirForumSubmissionService({TokenRefresher? tokenRefresher})
      : _tokenRefresher = tokenRefresher ?? const DefaultTokenRefresher();

  static final CleanAirForumSubmissionService instance =
      CleanAirForumSubmissionService();

  /// The forum edition submissions are grouped under — must match the
  /// `eventId` the conference wall queries, or submissions never appear.
  static String get defaultEventId =>
      dotenv.env['CLEAN_AIR_FORUM_EVENT_ID'] ?? 'clean-air-forum-2026';

  /// Uploads [imageBytes] (the composited filter card PNG) to Cloudinary,
  /// then posts it (plus AQI metadata) to the conference wall submissions
  /// endpoint.
  ///
  /// This is a best-effort background action: callers should catch errors
  /// and surface a soft warning without blocking the user's personal share
  /// action, which must always succeed independently of this call.
  Future<void> submitSelfie({
    required Uint8List imageBytes,
    required Measurement measurement,
    String? fallbackLocationName,
    String? displayName,
    String? eventId,
  }) async {
    final imageUrl = await _uploadToCloudinary(imageBytes);

    final uri = Uri.parse('${ApiUtils.baseUrl}/api/v2/users/selfies');
    final locationName = measurement.siteDetails?.searchName ??
        measurement.siteDetails?.name ??
        fallbackLocationName;
    // Only attach a token the refresher considers valid — a stale one would
    // 401 the whole request, whereas an anonymous submission always works.
    final userToken = await _tokenRefresher.refreshTokenIfNeeded();

    final response = await http
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'User-Agent': ApiUtils.mobileUserAgent,
            if (userToken != null) 'Authorization': 'JWT $userToken',
          },
          // Optional fields are omitted rather than sent as null — the API
          // treats them as "leave out if unknown", not nullable.
          body: jsonEncode({
            'eventId': eventId ?? defaultEventId,
            'imageUrl': imageUrl,
            if (locationName != null) 'locationName': locationName,
            if (measurement.pm25?.value != null)
              'pm25Value': measurement.pm25?.value,
            if (measurement.aqiCategory != null)
              'aqiCategory': measurement.aqiCategory,
            if (displayName != null && displayName.trim().isNotEmpty)
              'displayName': displayName.trim(),
          }),
        )
        .timeout(const Duration(seconds: 30));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Clean Air Forum submission failed: '
        '${response.statusCode} ${response.body}',
      );
    }

    loggy.info('Submitted selfie to Clean Air Forum wall: $imageUrl');
  }

  Future<String> _uploadToCloudinary(Uint8List imageBytes) async {
    final cloudName = dotenv.env['NEXT_PUBLIC_CLOUDINARY_NAME'] ?? '';
    final uploadPreset = dotenv.env['NEXT_PUBLIC_CLOUDINARY_PRESET'] ?? '';
    final cloudinaryUrl =
        'https://api.cloudinary.com/v1_1/$cloudName/image/upload';

    final request = http.MultipartRequest('POST', Uri.parse(cloudinaryUrl))
      ..fields['upload_preset'] = uploadPreset
      ..fields['folder'] = 'clean_air_forum_selfies'
      ..files.add(
        http.MultipartFile.fromBytes(
          'file',
          imageBytes,
          filename: 'clean-air-forum-selfie.png',
          contentType: MediaType('image', 'png'),
        ),
      );

    final streamedResponse = await request.send().timeout(
          const Duration(seconds: 60),
          onTimeout: () => throw TimeoutException('Image upload timed out'),
        );
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode != 200) {
      throw Exception(
        'Cloudinary upload failed: ${response.statusCode}, ${response.body}',
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final url = data['secure_url'] as String?;
    if (url == null) {
      throw Exception('Cloudinary response did not include a secure_url');
    }

    return url;
  }
}
