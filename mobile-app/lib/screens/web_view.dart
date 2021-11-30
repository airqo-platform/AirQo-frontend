import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void openUrl(url) {
  final browser = Browser();
  var options = InAppBrowserClassOptions(
      crossPlatform: InAppBrowserOptions(hideUrlBar: false),
      inAppWebViewGroupOptions: InAppWebViewGroupOptions(
          crossPlatform: InAppWebViewOptions(javaScriptEnabled: true)));

  browser.openUrlRequest(
      urlRequest: URLRequest(url: Uri.parse(url)), options: options);
}

class Browser extends InAppBrowser {
  @override
  void onLoadError(url, code, message) {
    print("Can't load $url.. Error: $message");
  }
}
