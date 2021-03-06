import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/utils/services/rest_api.dart';
import 'package:app/utils/ui/dialogs.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:mime/mime.dart';

class TakePicture extends StatefulWidget {
  const TakePicture({
    Key? key,
    required this.camera,
  }) : super(key: key);

  final CameraDescription camera;

  @override
  TakePictureState createState() => TakePictureState();
}

class TakePictureState extends State<TakePicture> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.medium,
    );
    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final deviceRatio = size.width / size.height;

    return Scaffold(
      appBar: AppBar(title: const Text('Take a picture')),
      body: FutureBuilder<void>(
        future: _initializeControllerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return Center(
              child: CameraPreview(_controller),
            );
            // return Center(
            //   child:Transform.scale(
            //     scale: _controller.value.aspectRatio/deviceRatio,
            //     child: AspectRatio(
            //       aspectRatio: _controller.value.aspectRatio,
            //       child: CameraPreview(_controller),
            //     ),
            //   ),);
          } else {
            return const Center(
                child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(appColor),
            ));
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: appColor,
        onPressed: () async {
          try {
            await _initializeControllerFuture;

            final image = await _controller.takePicture();

            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => DisplayPictureScreen(
                  imagePath: image.path,
                ),
              ),
            );
          } catch (e) {
            print(e);
          }
        },
        child: const Icon(Icons.camera_alt_outlined),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

class DisplayPictureScreen extends StatefulWidget {
  final String imagePath;

  const DisplayPictureScreen({Key? key, required this.imagePath})
      : super(key: key);

  @override
  _DisplayPictureScreenState createState() => _DisplayPictureScreenState();
}

class _DisplayPictureScreenState extends State<DisplayPictureScreen> {
  var isUploading = false;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final deviceRatio = size.width / size.height;

    return Scaffold(
        appBar: AppBar(title: const Text('Share Picture')),
        // body: Image.file(File(imagePath)),
        body: Stack(children: <Widget>[
          Image.file(
            File(widget.imagePath),
            fit: BoxFit.cover,
            height: double.infinity,
            width: double.infinity,
            alignment: Alignment.center,
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 10,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Colors.white70,
                      ),
                      child: TextField(
                        onChanged: (value) {
                          // setState(() {
                          //
                          // });
                        },
                        autofocus: true,
                        decoration: const InputDecoration(
                          hintStyle: TextStyle(fontSize: 13),
                          hintText: 'Add caption',
                          contentPadding: EdgeInsets.all(15),
                        ),
                      ),
                    ),
                  ),
                  Container(
                    color: Colors.white70,
                    child: IconButton(
                      iconSize: 30.0,
                      icon: const Icon(Icons.send_outlined, color: appColor),
                      onPressed: sendPicture,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUploading)
            Positioned.fill(
              child: Container(
                child: const Align(
                    alignment: Alignment.center,
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(appColor),
                    )),
              ),
            ),
        ]
        )
    );
  }

  Future<void> sendPicture() async {
    setState(() {
      isUploading = true;
    });
    var mimeType = lookupMimeType(widget.imagePath);

    mimeType ??= 'jpeg';

    await File(widget.imagePath).readAsBytes().then((value) => {
          AirqoApiClient(context)
              .imageUpload(base64Encode(value), mimeType)
              .whenComplete(() => {uploadCompeteHandler()})
              .catchError(uploadFailureHandler)
              .then((value) => uploadSuccessHandler)
        });
  }

  String base64Encode(List<int> bytes) => base64.encode(bytes);

  Future<void> uploadSuccessHandler(var value) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }

  Future<void> uploadCompeteHandler() async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }

  uploadFailureHandler(var error) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload failed, try again');

    // await Navigator.push(context,
    //     MaterialPageRoute(builder: (context) {
    //       return HomePage();
    //     })
    // );
  }
}
