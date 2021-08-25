import 'dart:io';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class FaqsPage extends StatefulWidget {
  @override
  FaqsPageState createState() => FaqsPageState();
}

class FaqsPageState extends State<FaqsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Faqs'),
      ),
      body: Container(
        child: const WebView(
          initialUrl: 'https://www.airqo.net/faqs',
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    if (Platform.isAndroid) WebView.platform = SurfaceAndroidWebView();
  }
}
