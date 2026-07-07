import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:loggy/loggy.dart';

/// Handles opt-in submissions of a user's Clean Air Forum selfie filter
/// image to the conference "wall" display screen.
///
/// This currently talks to a **temporary mock API hosted in the AirQo
/// website app** (`src/website/src/app/api/clean-air-forum/selfies`), built
/// so the feature is fully demoable end-to-end before the real AirQo
/// backend has equivalent endpoints. Swapping to the real backend later
/// should only require changing [_baseUrl] (and the path, if different) —
/// the request contract is designed to stay stable across that swap.
class CleanAirForumSubmissionService with UiLoggy {
  CleanAirForumSubmissionService._();

  static final CleanAirForumSubmissionService instance =
      CleanAirForumSubmissionService._();

  static String get _baseUrl =>
      (dotenv.env['CLEAN_AIR_FORUM_API_URL'] ?? 'https://airqo.net')
          .trim()
          .replaceAll(RegExp(r'/+$'), '');

  /// The forum edition submissions are grouped under. Kept in sync with the
  /// website wall page's "current event" config.
  static String get defaultEventId =>
      dotenv.env['CLEAN_AIR_FORUM_EVENT_ID'] ?? 'clean-air-forum';

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

    final uri = Uri.parse('$_baseUrl/api/clean-air-forum/selfies');
    final locationName = measurement.siteDetails?.searchName ??
        measurement.siteDetails?.name ??
        fallbackLocationName;
    final submissionSecret = dotenv.env['CLEAN_AIR_FORUM_API_SECRET'];

    final response = await http
        .post(
          uri,
          headers: {
            'Content-Type': 'application/json',
            // Lets the wall's API tell this app's submissions apart from
            // anyone who finds the endpoint — must match the website's
            // CLEAN_AIR_FORUM_SUBMISSION_SECRET.
            if (submissionSecret != null && submissionSecret.isNotEmpty)
              'x-clean-air-forum-secret': submissionSecret,
          },
          body: jsonEncode({
            'eventId': eventId ?? defaultEventId,
            'imageUrl': imageUrl,
            'locationName': locationName,
            'pm25Value': measurement.pm25?.value,
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
