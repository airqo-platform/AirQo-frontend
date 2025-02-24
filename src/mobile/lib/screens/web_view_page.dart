import 'package:app/screens/offline_banner.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';
// ignore: depend_on_referenced_packages, required by package
import 'package:webview_flutter_android/webview_flutter_android.dart';
// ignore: depend_on_referenced_packages, required by package
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

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
    return OfflineBanner(
      child: Scaffold(
        appBar: AppTopBar(
          widget.title.trimEllipsis(),
          actions: [
            IconButton(
              icon: Icon(
                Icons.replay,
                color: CustomColors.appColorBlue,
              ),
              onPressed: () {
                try {
                  _controller.loadRequest(Uri.parse(widget.url));
                } catch (e) {
                  showSnackBar(
                    context,
                    AppLocalizations.of(context)!
                        .failedToDeleteAccountTryAgainLater,
                  );
                }
              },
            ),
          ],
          centerTitle: false,
        ),
        body: AppSafeArea(
          child: BlocBuilder<WebViewLoadingCubit, int>(
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
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    _controller = controller;
    checkNetworkConnection(context, notifyUser: true);
  }
}
