import 'dart:async';
import 'dart:io';

import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';

class LoadingCubit extends Cubit<int> {
  LoadingCubit() : super(0);

  void setProgress(int progress) => emit(progress);
}

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
  final Completer<WebViewController> _controller =
      Completer<WebViewController>();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => LoadingCubit(),
      child: Scaffold(
        appBar: AppTopBar(
          widget.title.trimEllipsis(),
          actions: [
            NavigationControls(
              controller: _controller,
            ),
          ],
          centerTitle: false,
        ),
        body: BlocBuilder<LoadingCubit, int>(
          builder: (context, progress) => Stack(
            children: [
              WebView(
                backgroundColor: CustomColors.appBodyColor,
                initialUrl: widget.url,
                onWebViewCreated: _controller.complete,
                javascriptMode: JavascriptMode.unrestricted,
                onPageStarted: (_) =>
                    context.read<LoadingCubit>().setProgress(0),
                onProgress: (progress) {
                  context.read<LoadingCubit>().setProgress(progress);
                },
                onPageFinished: (_) =>
                    context.read<LoadingCubit>().setProgress(100),
              ),
              Visibility(
                visible: progress < 100,
                child: LinearProgressIndicator(
                  value: progress / 100.0,
                  color: CustomColors.appColorBlue,
                  backgroundColor: CustomColors.appColorDisabled,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    if (Platform.isAndroid) {
      WebView.platform = SurfaceAndroidWebView();
    }
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
          return Container();
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
                  showSnackBar(
                    context,
                    'No back history',
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
                  showSnackBar(
                    context,
                    'No forward history',
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
