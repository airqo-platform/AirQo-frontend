import 'dart:convert';

import 'package:app/models/story.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class StoryPage extends StatefulWidget {
  Story story;

  StoryPage({Key? key, required this.story}) : super(key: key);

  @override
  _StoryPageState createState() => _StoryPageState();
}

class _StoryPageState extends State<StoryPage> {
  String contentBase64 = '';

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text('Offline view'),
          Expanded(
              child: WebView(
            onWebResourceError: webResourceErrorHandler,
            javascriptMode: JavascriptMode.disabled,
            initialUrl: 'data:text/html;base64,$contentBase64',
          )),
        ],
      ),
    );
  }

  void initialize() {
    setState(() {
      contentBase64 =
          base64Encode(const Utf8Encoder().convert(widget.story.link));
    });
  }

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void webResourceErrorHandler(error) {
    showDialog<void>(
      context: context,
      builder: (_) => ShowErrorDialog(
          message: 'Oops! Something went wrong, try again later'),
    );
  }
}
