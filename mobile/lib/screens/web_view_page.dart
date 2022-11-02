import 'dart:async';

import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({
    super.key,
    required this.url,
    required this.title,
  });
  final String url;
  final String title;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  final controller = Completer<WebViewController>();
  int loadingPercentage = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppTopBar(
        widget.title.trimEllipsis(),
        actions: [
          NavigationControls(
            controller: controller,
          ),
        ],
        centerTitle: false,
      ),
      body: Stack(
        children: [
          WebView(
            backgroundColor: CustomColors.appBodyColor,
            initialUrl: widget.url,
            onWebViewCreated: controller.complete,
            javascriptMode: JavascriptMode.unrestricted,
            onPageStarted: (url) {
              setState(
                () {
                  loadingPercentage = 0;
                },
              );
            },
            onProgress: (progress) {
              setState(
                () {
                  loadingPercentage = progress;
                },
              );
            },
            onPageFinished: (url) {
              setState(
                () {
                  loadingPercentage = 100;
                },
              );
            },
          ),
          if (loadingPercentage < 100)
            LinearProgressIndicator(
              value: loadingPercentage / 100.0,
              color: CustomColors.appColorBlue,
              backgroundColor: CustomColors.appColorDisabled,
            ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    checkNetworkConnection(context, notifyUser: true);
  }
}

class NavigationControls extends StatelessWidget {
  const NavigationControls({
    required this.controller,
    super.key,
  });

  final Completer<WebViewController> controller;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<WebViewController>(
      future: controller.future,
      builder: (context, snapshot) {
        final controller = snapshot.data;
        if (snapshot.connectionState != ConnectionState.done ||
            controller == null) {
          return Row(
            children: <Widget>[
              Icon(
                Icons.arrow_back_ios,
                color: CustomColors.appColorBlue,
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: CustomColors.appColorBlue,
              ),
              Icon(
                Icons.replay,
                color: CustomColors.appColorBlue,
              ),
            ],
          );
        }

        return Row(
          children: <Widget>[
            IconButton(
              icon: Icon(
                Icons.arrow_back_ios,
                color: CustomColors.appColorBlue,
              ),
              onPressed: () async {
                if (await controller.canGoBack()) {
                  await controller.goBack();
                } else {
                  await showSnackBar(
                    context,
                    'No back history item',
                  );

                  return;
                }
              },
            ),
            IconButton(
              icon: Icon(
                Icons.arrow_forward_ios,
                color: CustomColors.appColorBlue,
              ),
              onPressed: () async {
                if (await controller.canGoForward()) {
                  await controller.goForward();
                } else {
                  await showSnackBar(
                    context,
                    'No forward history item',
                  );

                  return;
                }
              },
            ),
            IconButton(
              icon: Icon(
                Icons.replay,
                color: CustomColors.appColorBlue,
              ),
              onPressed: controller.reload,
            ),
          ],
        );
      },
    );
  }
}
