import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:mime/mime.dart';

class DisplayPictureScreen extends StatefulWidget {
  final String imagePath;

  const DisplayPictureScreen({Key? key, required this.imagePath})
      : super(key: key);

  @override
  _DisplayPictureScreenState createState() => _DisplayPictureScreenState();
}

class TakePicture extends StatefulWidget {
  final CameraDescription camera;

  const TakePicture({
    Key? key,
    required this.camera,
  }) : super(key: key);

  @override
  TakePictureState createState() => TakePictureState();
}

class TakePictureState extends State<TakePicture> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final phoneRatio = size.width / size.height;

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
            //     scale: _controller.value.aspectRatio/phoneRatio,
            //     child: AspectRatio(
            //       aspectRatio: _controller.value.aspectRatio,
            //       child: CameraPreview(_controller),
            //     ),
            //   ),);
          } else {
            return Center(
                child: CircularProgressIndicator(
              valueColor:
                  AlwaysStoppedAnimation<Color>(ColorConstants.appColor),
            ));
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: ColorConstants.appColor,
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
            debugPrint(e.toString());
          }
        },
        child: const Icon(Icons.camera_alt_outlined),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.medium,
    );
    _initializeControllerFuture = _controller.initialize();
  }
}

class _DisplayPictureScreenState extends State<DisplayPictureScreen> {
  var isUploading = false;

  String base64Encode(List<int> bytes) => base64.encode(bytes);

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final phoneRatio = size.width / size.height;

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
                      icon: Icon(Icons.send_outlined,
                          color: ColorConstants.appColor),
                      onPressed: sendPicture,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUploading)
            Positioned.fill(
              child: Align(
                  alignment: Alignment.center,
                  child: CircularProgressIndicator(
                    valueColor:
                        AlwaysStoppedAnimation<Color>(ColorConstants.appColor),
                  )),
            ),
        ]));
  }

  Future<void> sendPicture() async {
    setState(() {
      isUploading = true;
    });
    var mimeType = lookupMimeType(widget.imagePath);

    mimeType ??= 'jpeg';

    await File(widget.imagePath).readAsBytes().then((value) => {
          AirqoApiClient(context)
              .imageUpload(base64Encode(value), mimeType, '')
              .whenComplete(() => {uploadCompeteHandler()})
              .catchError(uploadFailureHandler)
              .then((value) => uploadSuccessHandler)
        });
  }

  Future<void> uploadCompeteHandler() async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }

  FutureOr<String> uploadFailureHandler(var error) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload failed, try again');
    return '';
  }

  Future<void> uploadSuccessHandler(var value) async {
    setState(() {
      isUploading = false;
    });
    await showSnackBar(context, 'Upload complete, thank you for sharing');

    Navigator.pop(context);
  }
}
