import 'dart:convert';
import 'dart:io';
import 'package:airqo_app/config/secret.dart';
import 'package:airqo_app/constants/api.dart';
import 'package:airqo_app/models/node.dart';
import 'package:http/http.dart' as http;

Future<Nodes> getNodes() async {

  final response = await http.post(Uri.parse(nodesURL),
      body: {'api': nodesApiKey});
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