import 'dart:convert';
import 'dart:io';
import 'package:app/config/secret.dart';
import 'package:app/constants/api.dart';
import 'package:app/models/feedback.dart';
import 'package:app/models/node.dart';
import 'package:http/http.dart' as http;

Future<Nodes> getNodes() async {
  final response =
      await http.post(Uri.parse(nodesURL), body: {'api': nodesApiKey});
  print(response.body);
  print(response.statusCode);
  if (response.statusCode == 200) {
    return Nodes.fromJson(json.decode(response.body));
  } else {
    throw HttpException(
        'Unexpected status code ${response.statusCode}:'
        ' ${response.reasonPhrase}',
        uri: Uri.parse(nodesURL));
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
    return false;
    // throw HttpException(
    //     'Unexpected status code ${response.statusCode}:'
    //         ' ${response.reasonPhrase}',
    //     uri: Uri.parse('http://airqo.net'));
  }
}
