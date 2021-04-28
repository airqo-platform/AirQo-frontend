import 'dart:convert';
import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/event.dart';
import 'package:app/models/measurement.dart';
import 'package:http/http.dart' as http;

Future<List<Measurement>> getMeasurements() async {
  final response =
      await http.get(Uri.parse(getLatestEvents));

  print(response.statusCode);
  if (response.statusCode == 200) {

    print(response.body);

    Event event = Event.fromJson(json.decode(response.body));
    List<Measurement> measurements = event.measurements;

    return measurements;
  } else {
    print('Unexpected status code ${response.statusCode}:'
        ' ${response.reasonPhrase}');
    throw HttpException(
        'Unexpected status code ${response.statusCode}:'
        ' ${response.reasonPhrase}',
        uri: Uri.parse(getLatestEvents));
  }
}

Future<bool> sendFeedback(Feedback feedback) async {
  final response =
      await http.post(Uri.parse('http://airqo.net'), body: feedback.toJson());
  print(response.body);
  print(response.statusCode);

  if (response.statusCode == 200) {
    return true;
  } else {
    print('Unexpected status code ${response.statusCode}:'
        ' ${response.reasonPhrase}');
    // return false;
    throw HttpException(
        'Unexpected status code ${response.statusCode}:'
            ' ${response.reasonPhrase}',
        uri: Uri.parse('http://airqo.net'));
  }
}
