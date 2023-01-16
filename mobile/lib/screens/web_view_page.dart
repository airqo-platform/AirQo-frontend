import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'package:webview_flutter/webview_flutter.dart';

class WebViewLoadingCubit extends Cubit<int> {
  WebViewLoadingCubit() : super(0);

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
  late final WebViewController _controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppTopBar(
        widget.title.trimEllipsis(),
        actions: [NavigationControls(_controller)],
        centerTitle: false,
      ),
      body: AppSafeArea(
        widget: BlocBuilder<WebViewLoadingCubit, int>(
          builder: (context, progress) => Stack(
            children: [
              WebViewWidget(controller: _controller),
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

    PlatformWebViewControllerCreationParams params =
        WebViewPlatform.instance is WebKitWebViewPlatform
            ? WebKitWebViewControllerCreationParams(
                allowsInlineMediaPlayback: true,
                mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
              )
            : const PlatformWebViewControllerCreationParams();

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params)
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..setBackgroundColor(CustomColors.appBodyColor)
          ..platform
          ..setNavigationDelegate(
            NavigationDelegate(
              onProgress: (progress) {
                context.read<WebViewLoadingCubit>().setProgress(progress);
              },
              onPageStarted: (_) =>
                  context.read<WebViewLoadingCubit>().setProgress(0),
              onPageFinished: (_) =>
                  context.read<WebViewLoadingCubit>().setProgress(100),
              onNavigationRequest: (NavigationRequest request) {
                return NavigationDecision.navigate;
              },
            ),
          )
          ..loadRequest(Uri.parse(widget.url));

    if (controller.platform is AndroidWebViewController) {
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    _controller = controller;
    checkNetworkConnection(context, notifyUser: true);
  }
}

class NavigationControls extends StatelessWidget {
  const NavigationControls(
    this.controller, {
    super.key,
  });

  final WebViewController controller;

  @override
  Widget build(BuildContext context) {
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
          onPressed: () => controller.reload(),
        ),
      ],
    );
  }
}
