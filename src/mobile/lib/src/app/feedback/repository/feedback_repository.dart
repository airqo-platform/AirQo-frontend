import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:loggy/loggy.dart';

class FeedbackRepository extends BaseRepository with UiLoggy {
  static const String _endpoint =
      '/api/v2/users/feedback/submit?tenant=airqo';

  Future<void> submitFeedback({
    required String email,
    required String subject,
    required String message,
    int? rating,
    String category = 'general',
    Map<String, dynamic>? metadata,
  }) async {
    final data = <String, dynamic>{
      'email': email,
      'subject': subject,
      'message': message,
      'category': category,
      'platform': 'mobile',
    };

    if (rating != null) data['rating'] = rating;
    if (metadata != null) data['metadata'] = metadata;

    loggy.info('Submitting feedback: subject="$subject", category=$category');

    final response = await createUnauthenticatedPostRequest(
      path: _endpoint,
      data: data,
    );

    final body = json.decode(utf8.decode(response.bodyBytes));
    if (body['success'] != true) {
      throw Exception(body['message'] ?? 'Feedback submission failed');
    }

    loggy.info('Feedback submitted successfully');
  }
}
