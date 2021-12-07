import 'package:app/constants/config.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void openUrl(url) {
  final browser = Browser();
  var options = InAppBrowserClassOptions(
      crossPlatform:
          InAppBrowserOptions(toolbarTopBackgroundColor: Config.appBodyColor),
      inAppWebViewGroupOptions: InAppWebViewGroupOptions(
          crossPlatform: InAppWebViewOptions(
              transparentBackground: false, javaScriptEnabled: true)));

  browser.openUrlRequest(
      urlRequest: URLRequest(url: Uri.parse(url)), options: options);
}

class Browser extends InAppBrowser {
  @override
  void onLoadError(url, code, message) {
    debugPrint("Can't load $url.. Error: $message");
  }
}
