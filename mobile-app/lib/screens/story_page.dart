import 'package:app/constants/app_constants.dart';
import 'package:app/models/story.dart';
import 'package:app/utils/dialogs.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:url_launcher/url_launcher.dart';

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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        leading: BackButton(color: ColorConstants.appColor),
        title: Text(
          '${AppConfig.name}',
          style: TextStyle(
              fontWeight: FontWeight.bold, color: ColorConstants.appColor),
        ),
        actions: [],
      ),
      body: Container(
        child: ListView(children: [
          // _buildImage(),
          // const SizedBox(height: 10),
          _buildTitle(),
          const SizedBox(height: 10),
          _buildSubTitle(),
          _buildText()
        ]),
      ),
    );
  }

  Widget _buildImage() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: ColorConstants.appColor.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.network(
            widget.story.thumbnail,
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }

  Widget _buildSubTitle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.story.author,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          Text(
            widget.story.getPubDate(),
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildText() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Html(
        data: widget.story.content,
        onLinkTap: (url, _, __, ___) {
          _launchURL(url!);
        },
        onImageTap: (src, _, __, ___) {
          _displayImage(src!);
        },
        onImageError: (error, _) async {
          await showSnackBar(context, ErrorMessages.timeoutException);
        },
        onCssParseError: (_, __) {},
      ),
    );
  }

  Widget _buildTitle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Text(
        widget.story.title,
        maxLines: 6,
        textAlign: TextAlign.center,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
      ),
    );
  }

  void _displayImage(String src) {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      transitionDuration: const Duration(milliseconds: 500),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(
            scale: animation,
            child: child,
          ),
        );
      },
      pageBuilder: (context, animation, secondaryAnimation) {
        return SafeArea(
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).pop();
            },
            child: Center(
              child: Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
                padding: const EdgeInsets.all(2),
                color: Colors.transparent,
                child: Center(
                    child: ListView(
                  shrinkWrap: true,
                  children: [
                    // Image.network(src,
                    //   fit: BoxFit.cover,
                    // ),
                    CachedNetworkImage(
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const SizedBox(
                        height: 100.0,
                        width: 100.0,
                        child: Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 4,
                          ),
                        ),
                      ),
                      imageUrl: src,
                      errorWidget: (context, url, error) => Icon(
                        Icons.error_outline,
                        color: ColorConstants.red,
                      ),
                    )
                  ],
                )),
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _launchURL(String url) async {
    try {
      await canLaunch(url)
          ? await launch(url)
          : throw Exception('Could not launch $url, try opening $url');
    } catch (e) {
      print(e);
    }
  }
}
