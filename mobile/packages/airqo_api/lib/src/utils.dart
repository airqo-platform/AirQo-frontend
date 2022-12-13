import 'dart:convert';

import 'package:sentry/sentry.dart';

String addQueryParameters(Map<String, dynamic> queryParams, String url) {
  if (queryParams.isNotEmpty) {
    url = '$url?';
    queryParams.forEach(
      (key, value) {
        url = queryParams.keys.elementAt(0).compareTo(key) == 0
            ? '$url$key=$value'
            : '$url&$key=$value';
      },
    );
  }

  return url;
}

Future<dynamic> performGetRequest({
  required Map<String, dynamic> queryParams,
  required String url,
  required SentryHttpClient httpClient,
  required Map<String, String> headers,
}) async {
  try {
    url = addQueryParameters(queryParams, url);

    final response = await httpClient.get(
      Uri.parse(url),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
  } catch (exception, _) {
    // TODO create utils package
    // await logException(
    //   exception,
    //   stackTrace,
    // );
  }

  return null;
}
