import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/utils/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ResourcesPageV1 extends StatefulWidget {
  @override
  _ResourcesPageV1State createState() => _ResourcesPageV1State();
}

class _ResourcesPageV1State extends State<ResourcesPageV1> {
  bool isLoading = true;
  int loadingValue = 0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        WebView(
          onProgress: (value) {
            setState(() {
              if (value > 15) {
                setState(() {
                  isLoading = false;
                });
              }
              loadingValue = value;
            });
          },
          onPageFinished: (finish) {
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: webResourceErrorHandler,
          javascriptMode: JavascriptMode.unrestricted,
          initialUrl: Links.blogUrl,
        ),
        isLoading
            ? Center(
                child: CircularProgressIndicator(
                  color: ColorConstants.appColor,
                ),
              )
            : Stack(),
      ],
    );
  }

  @override
  void initState() {
    if (Platform.isAndroid) WebView.platform = SurfaceAndroidWebView();
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
